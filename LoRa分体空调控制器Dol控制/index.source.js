function Relay(options, validate, model) {
    this.addrmin = 1 // 地址最小
    this.addrmax = 100 // 地址最大
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

/**
 * 读取数据
 */
Relay.prototype.read = function (addr, code, attribute) {
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
    if (code.indexOf("11") > -1 || code.indexOf('12') > -1 || code.indexOf('13') > -1 || code.indexOf('14') > -1 || code.indexOf('15') > -1) {//读取空调遥控参数
        var commond1 = '000020' // 00读  00保留  20对象编号
        cmd.push(commond1)
    }
    if (code.indexOf("21") > -1) {//读取电测参数-电流有效值
        var commond2 = '000030'
        cmd.push(commond2)
    }
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
                if (data[i].substr(0, 2) !== '01') {
                    return error(400)
                }
                if (data[i].substr(6, 2) !== '00') {//00-操作成功,01-操作失败...
                    return error(401)
                }
                if (cmd[i] == commond1) {//空调遥控参数 01 00 20 00  --- 0104 00 00 00 00
                    let sdwd = data[i].substr(8, 4); //设定温度
                    let workms = data[i].substr(12, 2); //工作模式
                    let fs = data[i].substr(14, 2); //风速
                    let cz = data[i].substr(16, 2); //垂直摇摆
                    let sp = data[i].substr(18, 2); //水平摇摆
                    allChecks['11'] = sdwd;
                    allChecks['12'] = workms;
                    allChecks['13'] = fs;
                    allChecks['14'] = cz;
                    allChecks['15'] = sp;
                }
                if (cmd[i] == commond2) {//01 00 30 00  --- 0055f000 00002d00 0003e503 e813 8800 0000
                    let dl = data[i].substr(16, 8) //电流有效值
                    allChecks['21'] = dl;
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
    if (typeof state === 'number') state = state.toString()
    while (addr.length < 2) {
        addr = '0' + addr;
    }
    var cmd = [];
    while (state.length < 2) {
        state = '0' + state
    }
    //工作模式
    var operates1 = this.model.operates.filter(item => {
        return item.shortAddress === '12'
    })
    var operateValue1 = parseInt(operates1[0].value).toString(16);
    while (operateValue1.length < 2) {
        operateValue1 = '0' + operateValue1
    }
    //温度
    var operates2 = this.model.operates.filter(item => {
        return item.shortAddress === '11'
    })
    var operateValue2 = (parseInt(operates2[0].value) * 10).toString(16);
    while (operateValue2.length < 4) {
        operateValue2 = '0' + operateValue2
    }
    //风速
    var operates3 = this.model.operates.filter(item => {
        return item.shortAddress === '13'
    })
    var operateValue3 = parseInt(operates3[0].value).toString(16);
    while (operateValue3.length < 2) {
        operateValue3 = '0' + operateValue3
    }
    if (code.indexOf('11') > -1) {//温度
        state = (parseInt(state) * 10).toString(16)
        while (state.length < 4) {
            state = '0' + state
        }
        var commond22 = '020020' + state + operateValue1 + operateValue3
        cmd.push(commond22)
    }
    if (code.indexOf('12') > -1) {//模式
        //重启:温度25度，模式自动，风速自动
        var commond33=state == '11'?'02002000fa0100': '020020' + operateValue2 + state + operateValue3
        cmd.push(commond33)
    }
    if (code.indexOf('13') > -1) {//风速
        var commond44 = '020020' + operateValue2 + operateValue1 + state
        cmd.push(commond44)
    }
    return {
        cmd: cmd.join(','),
        timeout: 5000,
        resolve: function (result, success, error) {
            if (result.substr(0, 2) !== '04') {
                return error(400)
            }
            if (result.substr(4, 2) !== '05') {
                return error(401)
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