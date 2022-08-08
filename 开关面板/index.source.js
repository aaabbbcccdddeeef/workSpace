function Relay(options, validate) {
    this.addrmin = 1 // 地址最小
    this.addrmax = 60 // 地址最大
    this.validate = validate
    this.button = [0, 1, 2, 3]
    this.options = options // options.defaulttest  options.defaultbutton
    var _this = this
    _this.checksAddress = []
    options.defaultCheck.forEach(function (test) {
        //console.log(test)
        _this['analysis' + test.address] = test.analysis// test.analysis 解析函数
        _this.checksAddress.push(test.address)
    })
    // console.log(_this)
}

//搜索地址
Relay.prototype.find = function (startAddr, endAddr) {

}
/**
 * 改变设备地址
 * 回调 【addr】  返回
 */
Relay.prototype.changeAddr = function (options) {

}
/**
 * 读取数据
 */
Relay.prototype.read = function (addr, code, attribute) {

}
// 写入
//addr为设备地址编号,code为控制节点,state为行为,字符串
//通过控制设备节点操控设备动作
Relay.prototype.write = function (addr, code, state) {
    if (typeof addr === 'number') addr = addr.toString(16)
    while (addr.length < 2) {
        addr = addr + '0'
    }
    code = parseInt(code);
    var cmd = [];
    if (state == "10") {
        state = "00";
    } else if (state == "9") {
        state = "01";
    }
    var commond = '';
    if (code > 68 && code < 75) {
        switch (code) {
            case 69:
                commond = this.validate.crc16(addr + '060045000' + state);
                break;
            case 70:
                commond = this.validate.crc16(addr + '060046000' + state);
                break;
            case 71:
                commond = this.validate.crc16(addr + '060047000' + state);
                break;
            case 72:
                commond = this.validate.crc16(addr + '06004800' + state);
                break;
            case 73:
                commond = this.validate.crc16(addr + '06004900' + state);
                break;
            case 74:
                commond = this.validate.crc16(addr + '06004A00' + state);
                break;
        }
    }
    cmd.push(commond)
    var validate = this.validate;
    return {
        cmd: cmd.join(','),
        timeout: 5000,
        resolve: function (result, success, error) {
            var data = result.split(',')
            //console.log(result)
            //  console.log(data.length+'??/'+cmd.length)
            if (data.length !== cmd.length) {
                return error(400)
            }
            for (let i = 0; i < data.length; i++) {
                // console.log(data[i]+'//////')
                var item = data[i].substr(0, data[i].length - 4);
                if (validate.crc16(item).toLowerCase() !== data[i].toLowerCase()) {
                    return error(404);
                }
                var Addr = item.substr(0, 2);
                if (Addr !== addr) {
                    return error(401)
                }
                // console.log(Addr,addr)
                if (cmd[i] == commond) {
                    var func = item.substr(2, 2);
                    if (func !== '06') {
                        return error(402);
                    }
                    if (item.substr(4, 4) !== cmd[i].substr(4, 4)) {
                        return error(403);
                    }
                }
            }
            success(state);
        }
    }
}
/**
 * 简析主动上报指令，并且生成一个数组
 */
Relay.prototype.decode = function (result) {
    var ret = {};
    if (result.length === 16) {
        var item = result.substr(0, result.length - 4);
        if (this.validate.crc16(item).toLowerCase() !== result.toLowerCase()) {
            return null;
        }
        var func = item.substr(2, 2);
        if (func !== item.substr(8, 2)) {
            return null;
        }
        var code = item.substr(6, 2);
        ret[code] = 1
        return ret;
    }

}
/*导航函数,返回地址*/
Relay.prototype.navi = function (result) {
    if (result) {
        const ret = result.substr(0, 2)
        return ret
    }
    return null
}
module.exports = Relay;