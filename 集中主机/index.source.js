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
    //采集点电池余量
    if (code.indexOf("3701") > -1) {
        var coc = parseInt("3701").toString(16);
        if (coc.length < 4) {
            while (coc.length < 4) {
                coc = '0' + coc;
            }
        }
        var commond1 = this.validate.crc16(addr + '03' + coc + '0004');
        cmd.push(commond1);
    }
    //采集点超声波最大值
    if (code.indexOf("4101") > -1) {
        var coc = parseInt("4101").toString(16);
        if (coc.length < 4) {
            while (coc.length < 4) {
                coc = '0' + coc;
            }
        }
        var commond2 = this.validate.crc16(addr + '03' + coc + '0004');
        cmd.push(commond2);
    }
    //采集点超声波有效值
    if (code.indexOf("4301") > -1) {
        var coc = parseInt("4301").toString(16);
        if (coc.length < 4) {
            while (coc.length < 4) {
                coc = '0' + coc;
            }
        }
        var commond3 = this.validate.crc16(addr + '03' + coc + '0004');
        cmd.push(commond3);
    }
    //采集点暂态低电压
    if (code.indexOf("4901") > -1) {
        var coc = parseInt("4901").toString(16);
        if (coc.length < 4) {
            while (coc.length < 4) {
                coc = '0' + coc;
            }
        }
        var commond4 = this.validate.crc16(addr + '03' + coc + '0004');
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
                //解析电池余量
                if (cmd[i] === commond1) {
                    for (let j = 1; j <= 4; j++) {
                        var dc = item.substr(6 + (j - 1) * 4, 4);
                        allChecks['370' + j] = dc
                    }
                }
                //解析超声波信号最大值
                if (cmd[i] === commond2) {
                    for (let j = 1; j <= 4; j++) {
                        var csmax = item.substr(6 + (j - 1) * 4, 4);
                        allChecks['410' + j] = csmax
                    }
                }
                //解析超声波信号有效值
                if (cmd[i] === commond3) {
                    for (let j = 1; j <= 4; j++) {
                        var cs = item.substr(6 + (j - 1) * 4, 4);
                        allChecks['430' + j] = cs
                    }
                }
                //解析局放暂态性电压
                if (cmd[i] === commond4) {
                    for (let j = 1; j <= 4; j++) {
                        var dy = item.substr(6 + (j - 1) * 4, 4);
                        allChecks['490' + j] = dy
                    }
                }
                //console.log(allChecks)
            }
            code.forEach(function (item, index) {
                var analyze = null
                eval(analysis[index])
                //console.log(analysis[index])
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