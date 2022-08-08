function Relay(options, validate) {
    this.addrmin = 1 // 地址最小
    this.addrmax = 40 // 地址最大
    this.validate = validate
    this.button = [0, 1, 2, 3]
    this.options = options // options.defaulttest  options.defaultbutton
    var _this = this
    _this.checksAddress = []
    options.defaultCheck.forEach(function (test) {
        _this['analysis' + test.address] = test.analysis// test.analysis 解析函数
        _this.checksAddress.push(test.address)
    })
}

var rmDb = function (result) {
    return result
}
/**
 * 搜索设备
 * 回调 [addr] 返回搜索到的设备的地址
 */
Relay.prototype.find = function (startAddr, endAddr) {
    if (startAddr && typeof startAddr === 'string') startAddr = parseInt(startAddr)
    if (endAddr && typeof endAddr === 'string') endAddr = parseInt(endAddr)
    var addr = startAddr || this.addrmin
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
    var defaultOperates = this.options.defaultOperate
    var attribute = []
    if (this.options.attribute !== undefined) {
        attribute = this.options.attribute
    }
    return {
        cmd: commond.substr(0, commond.length - 1), resolve: function (result, success, error) {
            result = rmDb(result)
            if (result.length < 14) {
                return error(400)
            }
            var fun = result.substr(0, result.length - 4)
            var validatedata = validate.crc16(fun)
            if (validatedata.toLowerCase() != result.toLowerCase()) {
                return error(401)
            }
            var func = result.substr(2, 2)
            if (func != '03') {
                return error(402)
            }
            var address = result.substr(0, 2)
            var json = {
                shortAddress: address,
                name: devicename + address,
                checks: defaultCheck,
                operates: defaultOperates,
                attribute: attribute
            }
            return success(json)
        }, changeAddr: true // 改变地址
    }
}
/**
 * 改变设备地址
 * 回调 【addr】  返回
 */
Relay.prototype.changeAddr = function (options) {
    if (typeof options.shortAddress === 'number') options.shortAddress = options.shortAddress.toString(16)
    while (options.shortAddress.length < 2) {
        options.shortAddress = '0' + options.shortAddress
    }

    var commond = 'FDFDFD00' + options.shortAddress
    commond = this.validate.crc16(commond)
    var devicename = this.options.name
    var defaultCheck = this.options.defaultCheck
    var defaultOperates = this.options.defaultOperate
    var attribute = []
    if (this.options.attribute != null) {
        attribute = this.options.attribute
    }
    return {
        cmd: commond, resolve: function (result, success, error) {
            result = rmDb(result)
            if (result.length < 14) {
                return error(400)
            }
            result = result.toUpperCase()
            var func = result.substr(6, 2)
            if (func !== '03') {
                return error(402)
            }
            var addr = result.substr(8, 2)
            if (addr.toUpperCase() !== options.shortAddress.toUpperCase()) {
                return error(403)
            }
            var json = {
                shortAddress: options.shortAddress,
                name: devicename + options.shortAddress,
                checks: defaultCheck,
                operates: defaultOperates,
                attribute: attribute
            }
            return success(json)
        }
    }
}

/**
 * 读取数据
 */
Relay.prototype.read = function (addr, code) {
    if (code == null) code = this.checksAddress
    else if (typeof code === 'string') code = [code]
    var analysis = []
    var _this = this
    code.forEach(function (item) {
        analysis.push(_this['analysis' + item])
    })
    while (addr.length < 2) {
        addr = '0' + addr
    }
    // 读取噪声
    var commond1 = this.validate.crc16(addr + '0301F40002')// 温湿度
    var commond2 = this.validate.crc16(addr + '0301F60003') // 噪音，PM
    var commond3 = this.validate.crc16(addr + '0301FA0002') // 光照
    var cmd = []
    if (code.indexOf('506') > -1 || code.indexOf('507') > -1) {
        cmd.push(commond1)
    }
    if (code.indexOf('502') > -1 || code.indexOf('503') > -1 || code.indexOf('504') > -1) {
        cmd.push(commond2)
    }
    if (code.indexOf('505') > -1) {
        cmd.push(commond3)
    }
    var validate = this.validate
    return {
        cmd: cmd.join(','), timeout: 10000, resolve: function (result, success, error) {
            var data = result.split(',')
            if (data.length !== cmd.length) {
                return error(400)
            }
            var res = {}
            var allChecks = {}
            for (var i = 0; i < data.length; i++) {
                var item = rmDb(data[i])
                var func1 = item.substr(0, item.length - 4)
                var validatedata = validate.crc16(func1)
                if (validatedata.toLowerCase() !== item.toLowerCase()) {
                    continue
                }
                var addrback = item.substr(0, 2)
                if (addrback !== addr.toLowerCase()) {
                    continue
                }
                var func2 = item.substr(2, 2)
                if (func2 !== '03') {
                    continue
                }
                if (cmd[i] === commond1) {
                    allChecks['507'] = item.substr(6, 4)
                    allChecks['506'] = item.substr(10, 4)
                }
                if (cmd[i] === commond2) {
                    allChecks['502'] = item.substr(6, 4)
                    allChecks['503'] = item.substr(10, 4)
                    allChecks['504'] = item.substr(14, 4)
                }
                if (cmd[i] === commond3) {
                    allChecks['505'] = item.substr(6, 8)
                }
            }
            code.forEach(function (item, index) {
                var analyze = null
                eval(analysis[index])
                if (allChecks[item] && analyze) {
                    res[item] = analyze(allChecks[item])
                }
            })
            success(res)
        }
    }
}
/**
 * 简析主动上报指令，并且生成一个数组
 */
Relay.prototype.decode = function (result) {
    return result
}

Relay.prototype.navi = function (result) {
    if (result) {
        const ret = result.substr(0, 2)
        return ret
    }
    return null
}

module.exports = Relay