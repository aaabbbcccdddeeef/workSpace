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
  options.defaultOperate.forEach(function(test) {
    _this['analysis' + test.address] = test.analysis// test.analysis 解析函数
  })
}

// 去掉最后两位信号强度
function rmDb(result) {
  // if (result.length > 2) {
  //   result = result.substr(0, result.length - 2)
  // }
  return result
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
  var defaultOperate = this.options.defaultOperate
  var attribute = []
  if (this.options.attribute !== undefined) {
    attribute = this.options.attribute
  }
  return {
    cmd: commond.substr(0, commond.length - 1),
    timeout: 5000,
    resolve: function(result, success, error) {
      result = rmDb(result)
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
        operates: defaultOperate,
        attribute: attribute
      }
      return success(json)
    },
    changeAddr: false // 改变地址
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
  var commond = options.oldAddr + '100DB000010200' + options.shortAddress
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
    timeout: 5000,
    resolve: function(result, success, error) {
      result = rmDb(result)
      if (result.length < 16) {
        return error(400)
      }
      var data = result.substr(0, result.length - 4)
      var validatedata = validate.crc16(data)
      if (validatedata.toUpperCase() !== result.toUpperCase()) {
        return error(401)
      }
      var func = result.substr(2, 2)
      if (func !== '10') {
        return error(402)
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
Relay.prototype.read = function(addr, code, attribute) {
  if (code == null)code = this.checksAddress
  else if (typeof code === 'string') code = [code]
  var analysis = []
  var _this = this
  while (addr.length < 2) {
    addr = '0' + addr
  }
  var pars = {}
  if (attribute !== undefined) {
    for (var o = 0; o < attribute.length; o++) {
      pars[attribute[o].key] = attribute[o].value
    }
  }
  var xs = Number(pars['电能系数'] || 1)
  var commond1 = this.validate.crc16(addr + '0300000002') // 用功电量
  var commond2 = this.validate.crc16(addr + '0300800008') // 视在功率
  var commond3 = this.validate.crc16(addr + '0300640006') // 电压
  var commond4 = this.validate.crc16(addr + '03006A0006') // 电流
  var commond5 = this.validate.crc16(addr + '0300700008') // 有功功率
  var commond6 = this.validate.crc16(addr + '0300880008') // 功率因数
  var commond7 = this.validate.crc16(addr + '0300900002') // 电网频率
  var commond8 = this.validate.crc16(addr + '03000A0002') // 反向电量
  var commond9 = this.validate.crc16(addr + '030DBA0001') // 断电状态
  var cmd = []
  code.forEach(function(item) {
    analysis.push(_this['analysis' + item])
    if (item === '0' && cmd.indexOf(commond1) < 0) {
      cmd.push(commond1)
    }
    if ((item === '1' || item === '2' || item === '3' || item === '4') && cmd.indexOf(commond2) < 0) {
      cmd.push(commond2)
    }
    if ((item === '5' || item === '6' || item === '7') && cmd.indexOf(commond3) < 0) {
      cmd.push(commond3)
    }
    if ((item === '8' || item === '9' || item === '10') && cmd.indexOf(commond4) < 0) {
      cmd.push(commond4)
    }
    if ((item === '11' || item === '12' || item === '13' || item === '14') && cmd.indexOf(commond5) < 0) {
      cmd.push(commond5)
    }
    if ((item === '15' || item === '16' || item === '17' || item === '18') && cmd.indexOf(commond6) < 0) {
      cmd.push(commond6)
    }
    if (item === '19' && cmd.indexOf(commond7) < 0) {
      cmd.push(commond7)
    }
    if (item === '20' && cmd.indexOf(commond8) < 0) {
      cmd.push(commond8)
    }
    if (item === 'a' && cmd.indexOf(commond9) < 0) {
      cmd.push(commond9)
    }
  })
  var validate = this.validate
  return {
    cmd: cmd.join(','),
    timeout: 5000,
    resolve: function(result, success, error) {
      var data = result.split(',')
      if (data.length !== cmd.length) {
        return error(400)
      }
      var res = {}
      var allChecks = {}
      for (var i = 0; i < data.length; i++) {
        var item = rmDb(data[i])
        var validatedata = validate.crc16(item.substr(0, item.length - 4))
        var addrback = item.substr(0, 2)
        var func = item.substr(2, 2)
        if (validatedata.toLowerCase() === item.toLowerCase() && addrback === addr.toLowerCase() && func === '03') {
          if (cmd[i] === commond1) {
            allChecks['0'] = item.substr(6, 8)
          }
          if (cmd[i] === commond2) {
            allChecks['1'] = item.substr(6, 8)
            allChecks['2'] = item.substr(14, 8)
            allChecks['3'] = item.substr(22, 8)
            allChecks['4'] = item.substr(30, 8)
          }
          if (cmd[i] === commond3) {
            allChecks['5'] = item.substr(6, 8)
            allChecks['6'] = item.substr(14, 8)
            allChecks['7'] = item.substr(22, 8)
          }
          if (cmd[i] === commond4) {
            allChecks['8'] = item.substr(6, 8)
            allChecks['9'] = item.substr(14, 8)
            allChecks['10'] = item.substr(22, 8)
          }
          if (cmd[i] === commond5) {
            allChecks['11'] = item.substr(6, 8)
            allChecks['12'] = item.substr(14, 8)
            allChecks['13'] = item.substr(22, 8)
            allChecks['14'] = item.substr(30, 8)
          }
          if (cmd[i] === commond6) {
            allChecks['15'] = item.substr(6, 8)
            allChecks['16'] = item.substr(14, 8)
            allChecks['17'] = item.substr(22, 8)
            allChecks['18'] = item.substr(30, 8)
          }
          if (cmd[i] === commond7) {
            allChecks['19'] = item.substr(6, 8)
          }
          if (cmd[i] === commond8) {
            allChecks['20'] = item.substr(6, 8)
          }
          if (cmd[i] === commond9) {
            allChecks['a'] = item.substr(8, 2)
          }
        }
      }
      code.forEach(function(item, index) {
        var analyze = null
        eval(analysis[index])
        if (allChecks[item] && analyze) {
          if (item === '0') {
            res[item] = xs * Number(analyze(allChecks[item]))
          } else {
            res[item] = Number(analyze(allChecks[item]))
          }
        }
      })
      success(res)
    }
  }
}

// 写入
Relay.prototype.write = function(addr, code, state, operates) { // 01 05 00 03 FF 00 7C 3A 线圈4 01 05 00 03 00 00 3D CA
  if (typeof addr === 'number')addr = addr.toString(16)
  while (addr.length < 2) {
    addr = '0' + addr
  }
  let commond = ''
  const ostate = parseInt(state)
  if (ostate === 1) {
    state = '1111'
  }
  if (ostate === 0) {
    state = '2222'
  }
  commond = this.validate.crc16(addr + '100DB8000102' + state)
  var validate = this.validate
  return {
    cmd: commond,
    timeout: 5000,
    resolve: function(result, success, error) {
      var item = rmDb(result)
      console.log(item.length)
      if (item.length < 16) {
        return error(400)
      }
      var validatedata = validate.crc16(item.substr(0, item.length - 4))
      if (validatedata.toLowerCase() !== item.toLowerCase()) {
        return error(401)
      }
      var addrback = item.substr(0, 2)
      if (addrback.toLowerCase() !== addr.toLowerCase()) {
        return error(403)
      }
      const func = item.substr(2, 2)
      if (func !== '10') {
        return error(402)
      }
      return success(ostate)
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
  var cmd1 = this.validate.crc16(addr + '0300070002')
  var commonds = [
    { begin: 3, reslength: 4 }
  ]
  var pars = {}
  for (var o = 0; o < parameters.length; o++) {
    pars[parameters[o].key] = parameters[o].value
  }

  var readTime = parseInt(pars['读取周期']).toString(16)
  var upTime = parseInt(pars['Heartbeat']).toString(16)
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
        params[1] = parseInt(params[1] / 100)
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
  // console.log('cmd_' + cmds.join(','))
  return {
    cmd: cmds.join(','),
    timeout: 5000,
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
