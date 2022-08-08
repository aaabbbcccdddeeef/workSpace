function Relay(options, validate) {
    this.addrmin = 1 // 地址最小
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
}

//搜索地址
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
        commond += this.validate.crc16(addrS + '0300080002') + ','
        addr++
    }
    console.log(startAddr)
    console.log(endAddr)
    console.log(commond)
    var validate = this.validate
    var devicename = this.options.name
    var defaultCheck = this.options.defaultCheck
    var attribute = []
    if (this.options.attribute !== undefined) {
        attribute = this.options.attribute
    }
    return {
        cmd: commond.substr(0, commond.length - 1),
        timeout: 5000,
        resolve: function (result, success, error) {
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
Relay.prototype.changeAddr = function (options) {
    if (typeof options.shortAddress === 'number') options.shortAddress = options.shortAddress.toString(16)
    while (options.shortAddress.length < 2) {
        options.shortAddress = '0' + options.shortAddress
    }
    if (typeof options.oldAddr === 'number') options.oldAddr = options.oldAddr.toString(16)
    while (options.oldAddr.length < 2) {
        options.oldAddr = '0' + options.oldAddr
    }
    var commond = this.validate.crc16(options.oldAddr + '06001400' + options.shortAddress)
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
        resolve: function (result, success, error) {
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
    var cmd = [];
    if (code.indexOf("1") > -1) {//电导率值
        var command1 = this.validate.crc16(addr + '0300000002');
        cmd.push(command1)
    }
    if (code.indexOf("2") > -1) {//电阻率值
        var command2 = this.validate.crc16(addr + '0300020002');
        cmd.push(command2)
    }
    if (code.indexOf("3") > -1) {//温度值
        var command3 = this.validate.crc16(addr + '0300040002');
        cmd.push(command3)
    }
    if (code.indexOf("4") > -1) {//TDS值
        var command4 = this.validate.crc16(addr + '0300060002');
        cmd.push(command4)
    }
    if (code.indexOf("5") > -1) {//盐度值
        var command5 = this.validate.crc16(addr + '0300080002');
        cmd.push(command5)
    }
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
            for (let i = 0; i < data.length; i++) {
                var item = data[i].substr(0, data[i].length - 4);
                if (validate.crc16(item).toLowerCase() !== data[i].toLowerCase()) {
                    return error(401);
                }
                var Addr = item.substr(0, 2);
                if (Addr !== addr) {
                    return error(402);
                }
                var func = item.substr(2, 2);
                if (func !== '03') {
                    return error(403);
                }
                var len = item.substr(4, 2);
                if (len !== '04') {
                    return error(404)
                }
                var abcd = item.substr(10, 4) + item.substr(6, 4)
                if (cmd[i] == command1) {//电导率值
                    allChecks['1'] = abcd
                }
                if (cmd[i] == command2) {//电阻率值
                    allChecks['2'] = abcd
                }
                if (cmd[i] == command3) {//温度值
                    allChecks['3'] = abcd
                }
                if (cmd[i] == command4) {//TDS值
                    allChecks['4'] = abcd
                }
                if (cmd[i] == command5) {//盐度值
                    allChecks['5'] = abcd
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
// 写入
//addr为设备地址编号,code为控制节点,state为行为,字符串
Relay.prototype.write = function (addr, code, state) {
    if (typeof addr === 'number') addr = addr.toString(16)
    while (addr.length < 2) {
        addr = '0' + addr;
    }
    var cmd = [];

    state=toHex(state);
    while (state.length<4){
        state='0'+ state;
    }
    if (code.indexOf("7") > -1) {//电导率常数设置
        var commond = this.validate.crc16(addr + '10000A000204' + state)
        cmd.push(commond)
    }
    var validate = this.validate;
    return {
        cmd: cmd.join(','),
        timeout: 5000,
        resolve: function (result, success, error) {
            var item = result.substr(0, result.length - 4)
            if (validate.crc16(item).toLowerCase() !== result.toLowerCase()) {
                return error(400)
            }
            var Addr = item.substr(0, 2);
            if (Addr !== addr) {
                return error(401)
            }
            var func = item.substr(2, 2);
            if (func !== '10') {
                return error
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
        const ret = result.substr(0, 2)
        return ret
    }
    return null
}

module.exports = Relay