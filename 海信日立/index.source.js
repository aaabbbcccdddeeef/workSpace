function Relay(options, validate, model) {
    this.addrmin = 50 // 地址最小
    this.addrmax = 57// 地址最大
    this.validate = validate
    this.button = [0, 1, 2, 3]
    this.options = options
    var _this = this
    this.model = model
    this.time = null//获取当前系统时间毫秒数
    _this.checksAddress = []
    options.defaultCheck.forEach(function (test) {
        _this['analysis' + test.address] = test.analysis// test.analysis 解析函数
        _this.checksAddress.push(test.address)
    })
    options.defaultOperate.forEach(function (test) {
        _this['analysis' + test.address] = test.analysis// test.analysis 解析函数
    })
    // name company analysis address sort
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
        commond += this.validate.crc16(addrS + '0313850001') + ','
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
        cmd: commond.substr(0, commond.length - 1),
        resolve: function (result, success, error) {
            result = rmDb(result)
            if (result.length < 14) {
                return error(400)
            }
            var data = result.substr(0, result.length - 4)
            var validatedata = validate.crc16(data)
            if (validatedata.toLowerCase() !== result.toLowerCase()) {
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
                operates: defaultOperates,
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
Relay.prototype.changeAddr = function (options) {
}
/**
 * 读取所有
 */
Relay.prototype.read = function (addr, code, attribute) {
    if (code == null) code = this.checksAddress
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
    var n = parseInt(addr, 16) - 50
    var cmdMap = {}

    function getCommond(item) {
        while (item.length < 3) {
            item = '0' + item
        }
        const m = parseInt(item.substr(0, 2))
        var codeNumber = (40028 + 91 * (16 * n + m)).toString(16)
        while (codeNumber.length < 4) {
            codeNumber = '0' + codeNumber
        }
        cmd2 = _this.validate.crc16(addr + '03' + codeNumber + '0008')
        console.log('cmd2', cmd2)
        if (cmdMap[cmd2] === undefined) {
            cmdMap[cmd2] = m
        }
        return cmd2 // 空调12
    }

    var cmd = []
    code.forEach(function (item) {
        analysis.push(_this['analysis' + item])
        const commond = getCommond(item)
        if (cmd.indexOf(commond) < 0) {
            cmd.push(commond)
        }
    })
    var validate = this.validate
    return {
        cmd: cmd.join(','),
        resolve: function (result, success, error) {
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
                    var cmd3 = cmd[i]
                    if (cmdMap[cmd3] !== undefined) {
                        var key = cmdMap[cmd3]
                        allChecks[key + '1'] = item.substr(6, 4) //开关机
                        var tt = parseInt(allChecks[key + '1'], 16).toString()
                        if (tt.length < 4) {
                            tt = tt.padStart(4, '0')
                        }
                        if (tt == '0001') {//开的时候
                            if (this.time !== null) {
                                var newtime = Date.now() - this.time
                                res['9'] = newtime
                            } else {
                                this.time = Date.now()
                            }
                        } else {//关的时候
                            this.time = null
                        }
                        allChecks[key + '2'] = item.substr(10, 4)//模式
                        allChecks[key + '3'] = item.substr(14, 4)//风量
                        allChecks[key + '4'] = item.substr(18, 4) //温度
                        allChecks[key + '6'] = item.substr(26, 4) //风向
                        allChecks[key + '8'] = item.substr(30, 4) //报警代码
                    }
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
 * 写操作
 * @param addr
 * @param options  shortAddress value, oldValue
 * @return {{cmd: string, resolve: resolve}}
 */
Relay.prototype.write = function (addr, code, state) { // 01 05 00 03 FF 00 7C 3A 线圈4 01 05 00 03 00 00 3D CA
    while (addr.length < 2) {
        addr = '0' + addr
    }
    var validate = this.validate
    while (code.length < 3) {
        code = '0' + code
    }
    if (state == '1') {//为开时截取当前时间
        this.time = Date.now()
    }
    var n = parseInt(addr, 16) - 50
    var cN = parseInt(code.substr(2, 1))
    const m = parseInt(code.substr(0, 2))
    var code1 = (40077 + cN + 91 * (16 * n + m)).toString(16)
    console.log('code1', code1)
    while (code1.length < 4) {
        code1 = '0' + code1
    }
    console.log('code2', code1)
    var state1 = state.toString(16)
    while (state1.length < 4) {
        state1 = '0' + state1
    }

    var commond = this.validate.crc16(addr + '06' + code1 + state1)

    console.log(commond)
    return {
        cmd: commond,
        resolve: function (result, success, error) {
            if (result.length < 16) {
                return error(400)
            }
            var data = result.substr(0, result.length - 4)
            var validatedata = validate.crc16(data)
            if (validatedata !== result) {
                return error(401)
            }
            var addrback = result.substr(0, 2)
            if (addrback !== addr.toLowerCase()) {
                return error(403)
            }
            var func = result.substr(2, 2)
            if (func !== '06') {
                return error(402)
            }
            data = result.substr(8, 4)
            data = parseInt(data, 16)
            return success(data)
        }
    }
}

// 去掉最后两位信号强度
function rmDb(result) {
    // if (result.length > 2) {
    //   result = result.substr(0, result.length - 2)
    // }
    return result
}

module.exports = Relay