function Relay(options, validate) {
  this.addrmin = 1 // 地址最小
  this.addrmax = 100 // 地址最大
  this.validate = validate
  this.button = [0, 1, 2, 3]
  this.options = options // options.defaulttest  options.defaultbutton
  var _this = this
  _this.checksAddress = []
  options.defaultCheck.forEach(function(test) {
    _this['analysis' + test.address] = test.analysis// test.analysis 解析函数
    _this.checksAddress.push(test.address)
  })
}
/**
     * 搜索设备
     * 回调 [addr] 返回搜索到的设备的地址
     */
Relay.prototype.find = function(startAddr, endAddr) {
  if (startAddr && typeof startAddr === 'string')startAddr = parseInt(startAddr)
  if (endAddr && typeof endAddr === 'string')endAddr = parseInt(endAddr)
  var addr = startAddr || this.addrmin
  var end = endAddr || this.addrmax
  var commond = ''
  while (addr <= end) {
    var addrS = addr.toString(16)
    while (addrS.length < 2) {
      addrS = '0' + addrS
    }
    commond += this.validate.crc16(addrS + '0301000001') + ','
    addr++
  }
  var validate = this.validate
  var devicename = this.options.name
  var defaultCheck = this.options.defaultCheck
  var attribute = []
  if (this.options.attribute !== undefined) {
    attribute = this.options.attribute
  }
  return {
    cmd: commond.substr(0, commond.length - 1),
    resolve: function(result, success, error) {
      if (result.length < 14) {
        return error(400)
      }
      var data = result.substr(0, result.length - 4)
      var validatedata = validate.crc16(data)
      if (validatedata !== result) {
        return error(401)
      }
      var func = result.substr(2, 2)
      if (func !== '03') {
        return error(402)
      }
      var address = result.substr(0, 2)
      var json = {
        shortAddress: address,
        name: devicename + address,
        checks: defaultCheck,
        attribute: attribute
      }
      return success(json)
    },
    changeAddr: true // 改变地址
  }
}
/**
     * 改变设备地址
     * 回调 【addr】  返回
     */
Relay.prototype.changeAddr = function(options) {
  if (typeof options.shortAddress === 'number')options.shortAddress = options.shortAddress.toString(16)
  while (options.shortAddress.length < 2) {
    options.shortAddress = '0' + options.shortAddress
  }
  if (typeof options.oldAddr === 'number')options.oldAddr = options.oldAddr.toString(16)
  while (options.oldAddr.length < 2) {
    options.oldAddr = '0' + options.oldAddr
  }
  var commond = options.oldAddr + '06010000' + options.shortAddress;
  commond = this.validate.crc16(commond)
  var validate = this.validate
  var devicename = this.options.name
  var defaultCheck = this.options.defaultCheck
  var attribute = []
  if (this.options.attribute !== undefined) {
    attribute = this.options.attribute
  }
  return {
    cmd: commond,
    resolve: function(result, success, error) {
      if (result.length < 16) {
        return error(400)
      }
      var data = result.substr(0, result.length - 4)
      var validatedata = validate.crc16(data)
      if (validatedata.toUpperCase() !== result.toUpperCase()) {
        return error(401)
      }
      var func = result.substr(2, 2)
      if(func!='06'){
          return error(402);
      }
      var json = {
        shortAddress: options.shortAddress,
        name: devicename + options.shortAddress,
        checks: defaultCheck,
        attribute: attribute
      }
      return success(json)
    }
  }
}

/**
     * 读取数据
     */
Relay.prototype.read = function(addr, code) {
  if (code == null)code = this.checksAddress
  else if (typeof code === 'string') code = [code]
  var analysis = []
  var _this = this
  code.forEach(function(item) {
    analysis.push(_this['analysis' + item])
  })
  while (addr.length < 2) {
    addr = '0' + addr
  }
  var commond1 = this.validate.crc16(addr + '0300070002')
  var cmd = []
  if (code.indexOf('7') > -1) {
    cmd.push(commond1)
  }
  var validate = this.validate
  return {
    cmd: cmd.join(','),
    resolve: function(result, success, error) {
      var data = result.split(',')
      if (data.length !== cmd.length) {
        return error(400)
      }
      var res = {}
      var allChecks = {}
      for (var i = 0; i < data.length; i++) {
        var item = data[i]
        item = item.substr(0, item.length - 4)
        var validatedata = validate.crc16(item)
        if (validatedata.toLowerCase() !== data[i].toLowerCase()) {
          return error(401)
        }
        var addrback = item.substr(0, 2)
        if (addrback !== addr.toLowerCase()) {
          return error(403)
        }
        if (cmd[i] === commond1) {
          const func = item.substr(2, 2)
          if (func !== '03') {
            return error(402)
          }
          allChecks['7'] = item.substr(6, 8)
        }
        code.forEach(function(item, index) {
          var analyze = null
          eval(analysis[index])
          if (allChecks[item] && analyze) {
            res[item] = analyze(allChecks[item])
          }
        })
      }
      success(res)
    }
  }
}
/**
    * 生成主动上报
    * addr 设备地址
    * parameters 默认参数配置
    * changecycle 默认参数 --变化周期 1个字节
    * rangeofchange 默认参数 --变化幅度 1个字节
    * lowerLimitValue 默认参数 --下限值 字节数(根据commonds中的reslength/2)
    * upperlimitvalue  默认参数 --上限值 字节数(根据commonds中的reslength/2)
    * port 串口配置
    */
Relay.prototype.encode = function(addr, parameters, port) {
  /**
  * 定义个查询指令
  *cmd1:查询电压
  *cmd2:查询电流
  *cmd3:查询电能
  */
  var cmd1 = this.validate.crc16(addr + '0300070002')
  /**
  *commonds --定义数据参数的反馈起始位和惭愧数据参数长度。
  *begin ---数据参数 字节数 反馈起始位*2
  *reslength----数据参数 反馈数据参数长度 下限值-上限值的指令字节数为该长度*2
  *cmd  ------ 非必选，用于设定不同的指令的作用
  */
  var commonds = [
    { begin: 3, reslength: 4 }
  ]
  var pars = {}
  for (var o = 0; o < parameters.length; o++) {
    pars[parameters[o].key] = parameters[o].value
  }

  var readTime = parseInt(pars['读取周期']).toString(16)
  var upTime = parseInt(pars['上报周期']).toString(16)
  while (readTime.length < 4) {
    readTime = '0' + readTime
  }
  while (upTime.length < 4) {
    upTime = '0' + upTime
  }
  function isNumber(val) {
    var regPos = /^\d+(\.\d+)?$/ // 非负浮点数
    if (regPos.test(val)) {
      return true
    } else {
      return false
    }
  }
  function paramData(cmd, commonds, parameter, port, orderNo, cmds, type) {
    orderNo = orderNo.toString(16)
    while (orderNo.length < 2) {
      orderNo = '0' + orderNo
    }
    var allcs = ''
    commonds.forEach(function(commond) {
      var params = parameter.split(',')
      if (type === 'gz') {
        if (params[0] === undefined || !isNumber(params[0])) {
          params[0] = 200
        }
        if (params[1] === undefined || !isNumber(params[1])) {
          params[1] = 300
        } else if (parseFloat(params[1]) < 300) {
          params[1] = 300
        } else if (parseFloat(params[1]) > 4000) {
          params[1] = 4000
        }
        params[1]=parseInt(params[1]/100);
        if (params[2] === undefined || !isNumber(params[2])) {
          params[2] = 1
        } else if (parseInt(commond.reslength) < parseInt(params[2])) {
          params[2] = commond.reslength
        }
        if (params[3] === undefined || !isNumber(params[3])) {
          params[3] = 0
        } else if (parseFloat(params[3]) >= 200000) {
          params[3] = 0
        }
        if (params[4] === undefined || !isNumber(params[4])) {
          params[4] = 200000
        } else if (parseFloat(params[4]) < parseFloat(params[3])) {
          params[4] = 200000
        } else if (parseFloat(params[4]) > 200000) {
          params[4] = 200000
        }
      }
      let changecycle = parseInt(params[0]).toString(16)
      while (changecycle.length < 2) {
        changecycle = '0' + changecycle
      }
      let rangeofchange = parseInt(params[1]).toString(16)
      while (rangeofchange.length < 2) {
        rangeofchange = '0' + rangeofchange
      }
      if (parseInt(params[2]) > 1) {
        commond.reslength = parseInt(commond.reslength) - parseInt(params[2]) + 1
      }
      var resth = parseInt(commond.reslength * 2)
      let lowerLimitValue = parseInt(params[3]).toString(16)
      while (lowerLimitValue.length < resth) {
        lowerLimitValue = '0' + lowerLimitValue
      }

      let upperlimitvalue = parseInt(params[4]).toString(16)
      while (upperlimitvalue.length < resth) {
        upperlimitvalue = '0' + upperlimitvalue
      }

      commond.begin = commond.begin.toString(16)
      while (commond.begin.length < 2) {
        commond.begin = '0' + commond.begin
      }

      commond.reslength = commond.reslength.toString(16)
      while (commond.reslength.length < 2) {
        commond.reslength = '0' + commond.reslength
      }

      var cscmd = commond.begin + commond.reslength + changecycle + rangeofchange + lowerLimitValue + upperlimitvalue
      // 计算单条数据参数的指令长度
      var wlength = (parseInt(cscmd.length / 2) + 1).toString(16)
      while (wlength.length < 2) {
        wlength = '0' + wlength
      }
      cscmd = wlength + cscmd
      allcs = allcs + cscmd
    })

    var alength = parseInt(allcs.length / 2).toString(16)
    while (alength.length < 2) {
      alength = '0' + alength
    }
    var allNumber = commonds.length.toString(16)
    while (allNumber.length < 2) {
      allNumber = '0' + allNumber
    }
    var ncmd = '00' + port + readTime + upTime + alength + allNumber + allcs + cmd
    if (ncmd.length > 128) {
      // 计算指令截成几段
      let i = 1
      var j = parseInt(ncmd.length / 128) + 1
      var xh = i + '' + j
      while (ncmd.length > 128) {
        var mm = ncmd.substr(0, 128)
        ncmd = ncmd.substr(128)
        xh =
                  cmds.push(addr + orderNo + xh + mm)
        i = i + 1
      }
      if (ncmd.length > 0) {
        cmds.push(addr + orderNo + j + '' + j + ncmd)
      }
    } else {
      cmds.push(addr + orderNo + '11' + ncmd)
    }
    return cmds
  }
  var cmds = []
  cmds = paramData(cmd1, commonds, pars['gz'], port, 0, cmds, 'gz')
  return {
    cmd: cmds.join(','),
    try: 5
  }
}
/**
    * 简析主动上报指令，并且生成一个数组
    */
Relay.prototype.decode = function(result) {
  var ret = {}
  if (result.length === 22) {
    var code = result.substr(2, 2)
    let data = ''
    if (code === '00') {
      data = result.substr(10, 8)
      const valid = this.validate.crc16(result.substr(4, 14)).toUpperCase()
      if (valid !== result.substr(4, 18).toUpperCase()) {
        return null
      }
      const code = 7
      let d = data
      const analysis = this['analysis' + code.toString(16)]
      var analyze = null
      if (analysis) {
        eval(analysis)
      }
      if (analyze) {
        d = analyze(d)
      }
      ret[code.toString(16)] = d
    }
    return ret
  } else {
    return null
  }
}

Relay.prototype.navi = function(result) {
  if (result) {
    const ret = result.substr(0, 2)
    return ret
  }
  return null
}

module.exports = Relay
