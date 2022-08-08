function Relay(options, validate) {
    this.addrmin = 0 // 地址最小
    this.addrmax = 100 // 地址最大
    this.validate = validate
    this.button = [0, 1, 2, 3]
    this.options = options // options.defaulttest  options.defaultbutton
    var _this = this
    _this.checksAddress = []
    options.defaultCheck.forEach(function (test) {
        _this['analysis' + test.address] = test.analysis// test.analysis 解析函数
        _this.checksAddress.push(test.address)
    })
    options.defaultOperate.forEach(function (test) {
        _this['analysis' + test.address] = test.analysis// test.analysis 解析函数
    })
}

// 和校验
var he = function (commond) {
    let jy = 0
    commond = commond.replace(new RegExp(/( )/g), '')
    for (let i = 0; i < commond.length; i += 2) {
        jy += parseInt(commond.substr(i, 2), 16)
    }
    jy = jy.toString(16)
    while (jy.length < 4) {
        jy = '0' + jy
    }
    jy = jy.substr(2, 2) + jy.substr(0, 2)
    return (commond + jy).toLowerCase()
}

var flip = function (commond) {
    return commond.substr(2, 2) + commond.substr(0, 2)
}
var reflip = function (commond) {
    return commond.substr(0, 2) + commond.substr(2, 2)
}
var Maxflip = function (commond) {
    const filpStr = commond.substr(4, 4) + commond.substr(0, 4)
    const result = filpStr.substr(2,2) + filpStr.substr(0,2) + filpStr.substr(6,2) + filpStr.substr(4,2)
    return result
}
var rmDb = function (result) {
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
        while (addrS.length < 4) {
            addrS = '0' + addrS
        }
        addrS = flip(addrS)
        // 5a413c8000000b00127401
        commond += he('5a413c80' +  addrS + '0b0012') + ','
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
        timeout: 5000,
        resolve: function(result, success, error) {
            if (result.length < 22) {
                return error(400)
            }
            var data = result.substr(0, result.length - 4)
            var validatedata = he(data)
            // console.log(validatedata,result)
            if (validatedata.toLowerCase() !== result.toLowerCase()) {
                return error(401)
            }
            var func = result.substr(6, 2)
            if (func !== '12') {
                return error(402)
            }
            var address = result.substr(8, 2)
            var json = {
                shortAddress: address,
                name: devicename + address,
                checks: defaultCheck,
                operates: defaultOperates,
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
Relay.prototype.changeAddr = function (options) {
    if (typeof options.shortAddress === 'number') options.shortAddress = options.shortAddress.toString(16)
    while (options.shortAddress.length < 4) {
        options.shortAddress = '0' + options.shortAddress
    }
    if (typeof options.oldAddr === 'number') options.oldAddr = options.oldAddr.toString(16)
    while (options.oldAddr.length < 4) {
        options.oldAddr = '0' + options.oldAddr
    }
    var commond = '5A413C96' + flip(options.oldAddr) + '0C00' + flip(options.shortAddress)
    commond = he(commond)
    var devicename = this.options.name
    var defaultOperates = this.options.defaultOperate
    var defaultCheck = this.options.defaultCheck
    var attribute = []
    if (this.options.attribute !== undefined) {
        attribute = this.options.attribute
    }
    return {
        cmd: commond,
        timeout: 5000,
        resolve: function (result, success, error) {
            if (result.length < 44) {
                return error(400)
            }
            var result1 = result.substr(0, 22)
            var data = result1.substr(0, result1.length - 4)
            var validatedata = he(data)
            if (validatedata.toUpperCase() !== result1.toUpperCase()) {
                console.log(validatedata.toUpperCase(), result1.toUpperCase())
                return error(401)
            }
            var func = result1.substr(6, 2)
            if (func !== '00') {
                return error(402)
            }
            var code = result1.substr(14, 4)
            if (code != '0001') {
                return error(403)
            }


            var json = {
                shortAddress: flip(options.shortAddress).substr(2,2),
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
    while (addr.length < 4) {
        addr = '0' + addr
    }
    console.log(code, 'code')
    var commond1
    var commond2
    var commond3
    var commond4
    var commond5
    var cmd = []
    addr = flip(addr)
    code.forEach(function (item) {
        analysis.push(_this['analysis' + item])
        if (item.indexOf('81') > -1) {
            commond1 = he('5A413C80' + addr + '0B0001') // 最近检测距离
            cmd.push(commond1)
        }
        if (item.indexOf('82') > -1) {
            commond2 = he('5A413C80' + addr + '0B0002') // 最远检测距离
            cmd.push(commond2)
        }
        if (item.indexOf('83') > -1) {
            commond3 = he('5A413C80' + addr + '0B0003') // 灵敏度
            cmd.push(commond3)
        }
        if (item.indexOf('84') > -1) {
            commond4 = he('5A413C80' + addr + '0B0004') // 确认延迟
            cmd.push(commond4)
        }
        if (item.indexOf('85') > -1) {
            commond5 = he('5A413C80' + addr + '0B0005') // 消失延迟
            cmd.push(commond5)
        }
    })
    return {
        cmd: cmd.join(','),
        timeout: 5000,
        resolve: function (result, success, error) {
            var data = result.split(',')
            if (data.length !== cmd.length) {
                return error(400)
            }
            var res = {}
            for (var i = 0; i < data.length; i++) {
                var item = rmDb(data[i])
                var validatedata = he(item.substr(0, item.length - 4))
                if (validatedata.toLowerCase() !== item.toLowerCase()) {
                    return error(401)
                }
                var addrback = item.substr(8, 4)
                if (addrback !== addr.toLowerCase()) {
                    return error(403)
                }
                if (cmd[i] === commond1) {
                    console.log(item, 'cm1')
                    const func = item.substr(6, 2)
                    if (func !== '01') {
                        return error(402)
                    }
                    // 最近检测距离
                    const near = flip(item.substr(16, 4))
                    console.log(near, '最近检测距离')
                    res['81'] = parseInt(near, 16)
                }
                if (cmd[i] === commond2) {
                    console.log(item, 'cm2')
                    const func = item.substr(6, 2)
                    if (func !== '02') {
                        return error(402)
                    }
                    // 最远检测距离
                    const far = flip(item.substr(16, 4))
                    console.log(far, '最近检测距离')
                    res['82'] = parseInt(far, 16)
                }
                if (cmd[i] === commond3) {
                    console.log(item, 'cm3')
                    const func = item.substr(6, 2)
                    if (func !== '03') {
                        return error(402)
                    }
                    const quick = item.substr(16, 2)
                    // 灵敏度
                    res['83'] = parseInt(quick, 16)
                    console.log(quick, 'res')
                }
                if (cmd[i] === commond4) {
                    console.log(item, 'cm4')
                    const func = item.substr(6, 2)
                    if (func !== '04') {
                        return error(402)
                    }
                    // 确认延迟
                    const conform = Maxflip(item.substr(16, 8))
                    console.log(conform, '最近检测距离')
                    res['84'] = parseInt(conform, 16)
                }
                if (cmd[i] === commond5) {
                    console.log(item, 'cm5')
                    const func = item.substr(6, 2)
                    if (func !== '05') {
                        return error(402)
                    }
                    // 消失延迟
                    const cancel = Maxflip(item.substr(16, 8))
                    console.log(cancel, '消失延迟')
                    res['85'] = parseInt(cancel, 16)
                }
            }
            console.log(res, 'res')
            success(res)
        }
    }
}

// 写
// 配置主动上报模式
/*
* 5A 41 3C 89 00 00 0C 00 FF FF 6A 03
* 5A 41 3C 8B 00 00 0C 00 05 00 73 01
* */
Relay.prototype.write = function (addr, code, state) {
    // 灵敏 0-9
    // 最近0 最远 11 检测距离
    // 确认延迟 0-10s
    // 消失延迟 0.5 - 15s
    if (typeof addr === 'number') addr = addr.toString(16)
    while (addr.length < 4) {
        addr = '0' + addr
    }
    addr = flip(addr)
    var commond;
    var cmd = []
    let data
    if (code === '81') {
        // 最近检测距离
        data = state.toString(16).padStart(4, '0')
        data = flip(data)
        commond = he('5A413C' + code + addr + '0C00' + data)
    } else if (code === '82') {
        // 最远检测距离
        data = state.toString(16).padStart(4, '0')
        data = flip(data)
        commond = he('5A413C' + code + addr + '0C00' + data)
    } else if (code === '83') {
        // 灵敏度
        data = state.toString(16).padStart(2, '0')
        commond = he('5A413C' + code + addr + '0B00' + data)
    } else if (code === '84') {
        // 确认延迟
        data = state.toString(16).padStart(8, '0')
        data = Maxflip(data)
        commond = he('5A413C' + code + addr + '0E00' + data)
    } else if (code === '85') {
        // 消失延迟
        data = state.toString(16).padStart(8, '0')
        data = Maxflip(data)
        commond = he('5A413C' + code + addr + '0E00' + data)
    }
    console.log(code, '这是code', commond, '这是命令')
    cmd.push(commond)
    return {
        cmd: cmd.join(','),
        timeout: 5000,
        resolve: function (result, success, error) {
            // 控制 返回通用码 5A 41 3C 00 00 00 0B 00 01 E3 00
            var data = result.split(',')
            console.log(data, cmd)
            // 判断指令和数据的长度是否一致
            if (data.length !== cmd.length) {
                return error(400)
            }
            for (var i = 0; i < data.length; i++) {
                var item = rmDb(data[i])
                var validatedata = he(item.substr(0, item.length - 4))
                if (validatedata.toLowerCase() !== item.toLowerCase()) {
                    return error(401)
                }
                // 地址位验证
                var addrback = item.substr(8, 4)
                if (addrback !== addr.toLowerCase()) {
                    return error(403)
                }
                // 判断功能码
                if (cmd[i] === commond) {
                    console.log(cmd[i], commond)
                    // 5a413c0002000b0001e500
                    var func = item.substr(6, 2)
                    if (func !== '00') {
                        return error(404)
                    }
                    const code = item.substr(14, 4)
                    console.log(code, '这是控制的code')
                    if (code == '0001') {
                        success(state)
                    }
                }
            }
        }
    }
}

/**
 * 简析主动上报指令，并且生成一个数组
 */
Relay.prototype.decode = function (result) {
    var ret = {}
    // 解析人感上报指令 有无人
  //  console.log(result, '解析上报指令')
    // 5A 41 3C 12 00 00 0B 00 01 F5 00
    if (result.length === 22) {
        const func = result.substr(6, 2)
        if (func.toLowerCase() !== '12') {
           // console.log(func.toLowerCase(), 'func')
            return 401
        }
        var data = result.substr(0, result.length - 4)
        var validatedata = he(data)
        if (validatedata.toLowerCase() !== result.toLowerCase()) {
            return 402
        }
        const code = parseInt(result.substr(14, 4), 16)
      //  console.log(code, '这是code', code, '这是addr')
        ret['12'] = code
        return ret
    } else {
        console.log(result, '123456')
        return null
    }
}

Relay.prototype.navi = function (result) {
    if (result) {//5A 41 3C 12 00 00 0B 00 01 F5 00
        const ret = flip(result.substr(8,4)).substr(2,2)
        // if (result.substr(8, 2)=='00') {
        //     ret = flip(result.substr(8,4))
        // }
        // if (result.substr(8, 2)!=='00') {
        //     ret = flip(result.substr(8,4))
        // }
        return ret
    }
    return null
}

module.exports = Relay
