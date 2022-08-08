function Relay(options, validate, model) {
    this.addrmin = 1 // 地址最小
    this.addrmax = 60 // 地址最大
    this.validate = validate
    this.model = model
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
    addr = addr.toString(16);
    var cmd = [];
    //1101-读取温控器温度，code:1
    if (code.indexOf("1") > -1) {
        var commond1 = this.validate.crc16(addr + '0311010001');
        cmd.push(commond1);
    }
    //103f-读取干触点控制现有状态,code:2
    if (code.indexOf("2") > -1) {
        var commond2 = this.validate.crc16(addr + '03103F0001');
        cmd.push(commond2);
    }
    //1104-读取外部温度设定，code:3
    if (code.indexOf("3") > -1) {
        var commond3 = this.validate.crc16(addr + '0311040001');
        cmd.push(commond3);
    }

    validate = this.validate;
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
                    return error(404);
                }
                var Addr = item.substr(0, 2);
                if (Addr !== addr) {
                    return error(401)
                }
                var func = item.substr(2, 2);
                if (func !== '03') {
                    return error(402)
                }
                //温控器温度
                if (cmd[i] == commond1) {
                    var wd = item.substr(6, 4);
                    allChecks['1'] = wd;
                }
                //干触点控制信息
                if (cmd[i] == commond2) {
                    var gcd = item.substr(6, 4);
                    allChecks['2'] = gcd;
                }
                //外部温度设定
                if (cmd[i] == commond3) {
                    var wd1 = item.substr(6, 4);
                    allChecks['3'] = wd1;
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
//通过控制设备节点操控设备动作
Relay.prototype.write = function (addr, code, state) {
    if (typeof addr === 'number') addr = addr.toString(16)
    while (addr.length < 2) {
        addr = '0' + addr;
    }
    var cmd = [];
    var operates = this.model.operates.filter(item => {
        return item.shortAddress === '2'
    })
    var operateValue = parseInt(operates[0].value).toString(2);
    while (operateValue.length < 16) {
        operateValue = '0' + operateValue;
    }
    var value = '';
    //干触点控制,0-关,1-开
    value = operateValue.substr(0, 10) + state + operateValue.substr(11, 6);
    value = parseInt(value, 2).toString(16)
    value = value.padStart(4, '0');
    if (code.indexOf("2") > -1) {
        var commond4 = this.validate.crc16(addr + '06103f' + value);
        cmd.push(commond4);
    }
    var validate = this.validate;
    return {
        cmd: cmd.join(','),
        timeout: 5000,
        resolve: function (result, success, error) {
            var data = result.split(',')
            if (data.length !== cmd.length) {
                return error(400)
            }
            var item = result.substr(0, result.length - 4);
            if (validate.crc16(item).toLowerCase() !== result.toLowerCase()) {
                return error(401);
            }
            var Addr = item.substr(0, 2);
            if (Addr !== addr) {
                return error(402)
            }
            var func = item.substr(2, 2);
            if (func !== '06') {
                return error(403);
            }
            success(state);
        }
    }
}
/**
 * 简析主动上报指令，并且生成一个数组
 */
Relay.prototype.decode = function (result) {

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