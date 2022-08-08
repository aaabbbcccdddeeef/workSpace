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

/**
 * 搜索设备
 * 回调 [addr] 返回搜索到的设备的地址
 */
//搜索地址
Relay.prototype.find = function(startAddr, endAddr) {
    if (startAddr && typeof startAddr === 'string')startAddr = parseInt(startAddr)
    if (endAddr && typeof endAddr === 'string')endAddr = parseInt(endAddr)
    var addr = startAddr || this.addrmin
    var end = endAddr || this.addrmax
    var commond = ''
    while (addr <= end) {
        var addrS = addr.toString(16)
        while (addrS.length < 2) {
            addrS =addrS+'0'
        }
        commond += this.validate.he(addrS + 'c80201ff')+ ','
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
        resolve: function(result, success, error) {
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
        options.oldAddr = '4' + options.oldAddr
    }
    var commond = options.oldAddr + 'c80209' + options.shortAddress;
    commond = this.validate.he(commond);
    var validate = this.validate
    var devicename = this.options.name
    var defaultCheck = this.options.defaultCheck
    var attribute = []
    if (this.options.attribute !== undefined) {
        attribute = this.options.attribute
    }
    return {
        cmd: commond,
        resolve: function (result, success, error) {//例(返回):C8 40 02 09 01 14
            var data = result.substr(0, result.length - 2)
            var validatedata = validate.he(data)
            if (validatedata.toUpperCase() !== result.toUpperCase()) {
                return error(401)
            }
            var func = result.substr(4, 2)
            if (func !== '02') {
                return error(402);
            }
            var Addr = result.substr(0, 2).toLowerCase();
            if (Addr !== 'c8') {
                return error(403)
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
 * 读取数据解析
 */
Relay.prototype.read = function (addr, code, attribute) {

}
/*
* 写入数据控制
* */
Relay.prototype.write = function (addr, code, state) {
    if (typeof addr === 'number') addr = addr.toString(16)
    while (addr.length < 2) {
        addr = '4' + addr;
    }
    var cmd = [];
    var commond
    if (code.indexOf("1") > -1) {//运转/停止
        if (state == '0') {//停止
            commond = this.validate.he(addr + 'c802010' + state);
            cmd.push(commond)
        }
        if (state == '1') {//运转
            commond = this.validate.he(addr + 'c802010' + state)
            cmd.push(commond)
        }
    }
    if (code.indexOf("2") > -1) {//运转方式
        if (state == '0') {//自动
            commond = this.validate.he(addr + 'c802020' + state)
            cmd.push(commond)
        }
        if (state == '1') {//除湿
            commond = this.validate.he(addr + 'c802020' + state)
            cmd.push(commond)
        }
        if (state == '2') {//冷房
            commond = this.validate.he(addr + 'c802020' + state)
            cmd.push(commond)
        }
        if (state == '3') {//送风
            commond = this.validate.he(addr + 'c802020' + state)
            cmd.push(commond)
        }
        if (state == '4') {//暖房
            commond = this.validate.he(addr + 'c802020' + state)
            cmd.push(commond)
        }
    }
    if (code.indexOf(3) > -1) {//风量
        if (state == '1') {//静音
            commond = this.validate.he(addr + 'c802030' + state)
            cmd.push(commond)
        }
        if (state == '2') {//超低
            commond = this.validate.he(addr + 'c802030' + state)
            cmd.push(commond)
        }
        if (state == '3') {//弱
            commond = this.validate.he(addr + 'c802030' + state)
            cmd.push(commond)
        }
        if (state == '5') {//中
            commond = this.validate.he(addr + 'c802030' + state)
            cmd.push(commond)
        }
        if (state == '7') {//急
            commond = this.validate.he(addr + 'c802030' + state)
            cmd.push(commond)
        }
        if (state == '8') {//强力
            commond = this.validate.he(addr + 'c802030' + state)
            cmd.push(commond)
        }
        if (state == '9') {//自动
            commond = this.validate.he(addr + 'c802030' + state)
            cmd.push(commond)
        }
    }
    if (code.indexOf("4") > -1) {//设定温度
        if (state == '25') {//25度
            state = parseInt(state).toString(16)
            commond = this.validate.he(addr + 'c8030503' + state);
            cmd.push(commond)
        }
        if (state == '20') {//20度
            state = parseInt(state).toString(16)
            commond = this.validate.he(addr + 'c8030503' + state);
            cmd.push(commond)
        }
    }
    if (code.indexOf("5") > -1) {//常复位
        if (state == '1') {//复位
            commond = this.validate.he(addr + 'c802410' + state)
            cmd.push(commond)
        }
    }
    if (code.indexOf("6") > -1) {//风门控制
        if (state == '0') {//关
            commond = this.validate.he(addr + 'c802060' + state)
            cmd.push(commond)
        }
        if (state == '1') {//开
            commond = this.validate.he(addr + 'c802060' + state)
            cmd.push(commond)
        }
    }
    if (code.indexOf("7") > -1) {//排水泵控制
        if (state == '0') {//停止
            commond = this.validate.he(addr + 'c802230' + state)
            cmd.push(commond)
        }
        if (state == '1') {//运行
            commond = this.validate.he(addr + 'c802230' + state)
            cmd.push(commond)
        }
    }
    if (code.indexOf("8") > -1) {//辅电控制
        if (state == '0') {//停止
            commond = this.validate.he(addr + 'c802070' + state)
            cmd.push(commond)
        }
        if (state == '1') {//运行
            commond = this.validate.he(addr + 'c802070' + state)
            cmd.push(commond)
        }
    }
    var validate = this.validate;
    return {
        cmd: cmd.join(','),
        timeout: 5000,
        resolve: function (result, success, error) {
            var item = result.substr(0, result.length - 2);
            if (result.toLowerCase() !== validate.he(item).toLowerCase()) {
                return error(401)
            }
            var Addr = result.substr(0, 2).toLowerCase();
            if (Addr !== 'c8') {
                return error(402)
            }
            var len = result.substr(4, 2);
            if (len !== '02') {//返回数据字节数应等于发送数据字节数
                return error(403)
            }
            success(state);
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