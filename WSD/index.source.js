const {analyze} = require("../utils/analyze");

function Relay(options, validate) {
  this.addrmin = 1 // 地址最小
  this.addrmax = 60 // 地址最大
  this.validate = validate
  this.button = [0, 1, 2, 3]
  this.options = options // options.defaulttest  options.defaultbutton
  var _this = this
  _this.checksAddress = []
  options.defaultCheck.forEach(function(test) {
    //console.log(test)
    _this['analysis' + test.address] = test.analysis// test.analysis 解析函数
    _this.checksAddress.push(test.address)
  })
 // console.log(_this)
}
/**
     * 搜索设备
     * 回调 [addr] 返回搜索到的设备的地址
     */
Relay.prototype.read = function(startAddr, endAddr) {
  if (startAddr && typeof startAddr === 'string')startAddr = parseInt(startAddr)
  if (endAddr && typeof endAddr === 'string')endAddr = parseInt(endAddr)
  var addr = startAddr || this.addrmin
 // console.log("addr:"+addr)
  var end = endAddr || this.addrmax
  var commond = ''
  while (addr <= end) {
    var addrS = addr.toString(16)
    while (addrS.length < 2) {
      addrS = '0' + addrS
    }
    commond += this.validate.crc16(addrS + '0300000001') + ','
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

  var commond = options.oldAddr + '100000000102' + options.shortAddress + '01'
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
  var commond=this.validate.crc16(addr+'0300070002');
  var cmd=[];
  if(code.indexOf('2')>-1){
    cmd.push(commond);
  }
  //console.log(cmd);
  var validate = this.validate
  return {
    cmd: cmd.join(','),
    resolve: function(result, success, error) {
      var data = result.split(',')
      if (data.length !== cmd.length) {
        return error(400)
      }
      var res = {}
      // var allChecks = {}
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
          allChecks['1'] = item.substr(6, 8)
          res['1'] = parseInt('aaa', 16)
        }
        /*code.forEach(function(item, index) {
          var analyze = null
          eval(analysis[index])
          if (allChecks[item] && analyze) {
            res[item] = analyze(allChecks[item])
          }
        })*/
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
