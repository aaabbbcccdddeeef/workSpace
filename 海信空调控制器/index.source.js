function Relay(options, validate) {
    this.addrmin = 1 // 地址最小
    this.addrmax = 100// 地址最大
    this.validate = validate
    this.button = [0, 1, 2, 3]
    this.options = options
    var _this = this
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
        commond += this.validate.crc16(addrS + '039c420001') + ','
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
            if (func !== '04') {
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

function analyzeFun(item) {
    var arrName = []
    //运转/停止状态
    let kgzt = item.substr(6, 4);
    //console.log(kgzt)
    kgzt = parseInt(kgzt, 16).toString(2);
    kgzt = kgzt.padStart(16, '0');
    let kgzt_1 = kgzt.charAt(15)
    arrName[0] = kgzt_1;
    //运转模式
    let yzms = item.substr(10, 4);
    // console.log(yzms)
    yzms = parseInt(yzms, 16).toString(2);
    // console.log(yzms)
    yzms = yzms.padStart(16, '0')
    let yzms_1 = yzms.substr(11, 5);
    arrName[1] = yzms_1;
    //风量设定
    let fl = item.substr(14, 4);
    fl = parseInt(fl, 16).toString(2);
    fl = fl.padStart(16, '0');
    let fl_1 = fl.substr(12, 3);
    arrName[2] = fl_1;
    //设定温度
    let sdwd = item.substr(30, 4);
    sdwd = parseInt(sdwd, 16)
    arrName[3] = sdwd;
    //吸入温度T1
    let xrwdT1 = item.substr(78, 4);
    xrwdT1 = parseInt(xrwdT1, 16)
    arrName[4] = xrwdT1;
    //警报代码Alm
    let jbAlm = item.substr(82, 4);
    jbAlm = parseInt(jbAlm, 16)
    arrName[5] = jbAlm;
    return arrName;
}

/**
 * 读取所有
 */
Relay.prototype.read = function (addr, code) {
    if (code == null) code = this.checksAddress
    else if (typeof code === 'string') code = [code]
    var analysis = []
    var _this = this
    while (addr.length < 2) {
        addr = '0' + addr
    }
    var pars = {}
    var cmdMap = {}

    function getCommond(addr, item) {//01-631
        while (item.length < 3) {
            item = '0' + item
        }
        const number = parseInt(item.substr(0, 2))
        let state = ((number * 91) + 40002).toString(16)
        state = state.padStart(4, '0')
        const cmd2 = _this.validate.crc16(addr + '03' + state + '0014')
        if (cmdMap[cmd2] === undefined) {
            cmdMap[cmd2] = number
        }
        return cmd2
    }

    var cmd = []
    code.forEach(function (item) {
        analysis.push(_this['analysis' + item])
        const commond = getCommond(addr, item)
        if (cmd.indexOf(commond) < 0) {
            cmd.push(commond)
        }
    })
    var validate = this.validate
    return {
        cmd: cmd.join(','),
        timeout: 5000,
        resolve: function (result, success, error) {
            var data = result.split(',')
            if (data.length !== cmd.length) {
                return error(400)
            }
            var res = {}
            var allChecks = {}
            for (var i = 0; i < data.length; i++) {
                var item = data[i]
                var validatedata = validate.crc16(item.substr(0, item.length - 4))
                var addrback = item.substr(0, 2)
                var func = item.substr(2, 2)
                if (validatedata.toLowerCase() === item.toLowerCase() && addrback === addr.toLowerCase() && func === '03') {
                    var cmd3 = cmd[i]
                    if (cmdMap[cmd3] !== undefined) {
                        var key = cmdMap[cmd3]
                        let arrBack = analyzeFun(item)
                        console.log("arrBack--" + arrBack)
                        allChecks[key + '1'] = arrBack[0]
                        allChecks[key + '2'] = arrBack[1]
                        allChecks[key + '3'] = arrBack[2]
                        allChecks[key + '4'] = arrBack[3]
                        allChecks[key + '5'] = arrBack[4]
                        allChecks[key + '6'] = arrBack[5]
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
Relay.prototype.write = function (addr, code, state) {
    if (typeof addr === 'number') addr = addr.toString(16)
    if (typeof state === 'number') state = state.toString()
    while (addr.length < 2) {
        addr = '0' + addr;
    }
    while (state.length < 4) {
        state = '0' + state
    }
    var cmd = [];
    var commond = ""
    code = code.padStart(3, '0') //01-631
    var number = parseInt(code.substr(0, 2))
    var code1 = code.substr(2, 1)
    switch (code1) {
        case "1":
            var code2 = ((number * 91) + 40078).toString(16)
            code2 = code2.padStart(4, "0")
            commond = this.validate.crc16(addr + '10' + code2 + '000102' + state);//开关机,state:1-开,0-关
            cmd.push(commond)
            break
        case "2":
            var code2 = ((number * 91) + 40079).toString(16)
            code2 = code2.padStart(4, "0")
            state = parseInt(parseInt(state).toString(2).padStart(16, 0), 2).toString(16)//state:1,2,4,8,16,运转模式
            state = state.padStart(4, '0')
            commond = this.validate.crc16(addr + '10' + code2 + '000102' + state);
            cmd.push(commond)
            break
        case "3":
            var code2 = ((number * 91) + 40080).toString(16)
            code2 = code2.padStart(4, "0")
            state = parseInt(parseInt(state).toString(2).padStart(16, 0), 2).toString(16)//state:2,4,8,风量
            state = state.padStart(4, '0')
            commond = this.validate.crc16(addr + '10' + code2 + '000102' + state);
            cmd.push(commond)
            break
        case "4":
            var code2 = ((number * 91) + 40082).toString(16)
            code2 = code2.padStart(4, "0")
            state = parseInt(state).toString(16)
            state = state.padStart(4, '0')
            commond = this.validate.crc16(addr + '10' + code2 + '000102' + state);//设定温度
            cmd.push(commond)
            break
    }
    var validate = this.validate;
    return {
        cmd: cmd.join(','),
        timeout: 5000,
        resolve: function (result, success, error) {
            var item = result.substr(0, result.length - 4);
            if (result.toLowerCase() !== validate.crc16(item).toLowerCase()) {
                return error(401)
            }
            if (item.substr(0, 2) !== addr) {
                return error(402)
            }
            if (item.substr(2, 2) !== '10') {
                return error(403)
            }
            success(state)
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
Relay.prototype.encode = function (addr, parameters, port) {

}
/**
 * 简析主动上报指令，并且生成一个数组
 */
Relay.prototype.decode = function (result) {

}
Relay.prototype.navi = function (result) {
    if (result) {
        const ret = result.substr(0, 2) //返回对应地址
        return ret
    }
    return null
}

module.exports = Relay

