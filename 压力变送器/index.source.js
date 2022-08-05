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
Relay.prototype.find = function(startAddr, endAddr) {
    if (startAddr && typeof startAddr === 'string')startAddr = parseInt(startAddr)
    if (endAddr && typeof endAddr === 'string')endAddr = parseInt(endAddr)
    var addr = startAddr || this.addrmin
    var end = endAddr || this.addrmax
    var commond = ''
    while (addr <= end) {
        var addrS = addr.toString(16)
        while (addrS.length < 2) {
            addrS = '0' + addrS
        }
        commond += this.validate.crc16(addrS + '0300000001')+ ','
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

    var commond = this.validate.crc16(options.oldAddr + '06000000' + options.shortAddress)
    var validate = this.validate
    var devicename = this.options.name
    var defaultCheck = this.options.defaultCheck
    var attribute = []
    if (this.options.attribute !== undefined) {
        attribute = this.options.attribute
    }
    return {
        cmd: commond,
        resolve: function (result, success, error) {
            var item=result.substr(0,result.length-4);
            if (validate.crc16(item).toLowerCase()!==result.toLowerCase()){
                return error(401)
            }
            var func=item.substr(2,2);
            if (func!=='06'){
                return error(402)
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
    addr=addr.toString(16)
    var cmd=[]
    if (code.indexOf('11')>-1||code.indexOf('12')>-1||code.indexOf('13')>-1||code.indexOf('14')>-1){
        //读取地址/波特率/当前压力单位/当前小数点位数
        var commond1=this.validate.crc16(addr+'0300000004')
        cmd.push(commond1)
    }
    if (code.indexOf('21')>-1){//读取测量输出值
        var commond2=this.validate.crc16(addr+'0300040001')
        cmd.push(commond2)
    }
    if (code.indexOf('31')>-1||code.indexOf('32')>-1){//读取变送器量程零点/变送器量程满点
        var commond3=this.validate.crc16(addr+'0300050002')
        cmd.push(commond3)
    }
    if (code.indexOf('41')>-1){//读取零位偏移量，默认为0
        var commond4=this.validate.crc16(addr+'0300060001')
        cmd.push(commond4)
    }
    var validate = this.validate
    return {
        cmd: cmd.join(','),
        timeout:5000,
        resolve: function (result, success, error) {
            var data = result.split(',')
            if (data.length !== cmd.length) {
                return error(400)
            }
            var res = {}
            var allChecks = {}
            for (let i=0;i<data.length;i++){
                var item=data[i].substr(0,data[i].length-4);
                if (validate.crc16(item).toLowerCase()!==data[i].toLowerCase()){
                    return error(404)
                }
                if (item.substr(0,2)!==addr){//地址判断
                    return error(401)
                }
                if (item.substr(2,2)!=='03'){//功能码判断
                    return error(402)
                }
                if (cmd[i]==commond1){
                    allChecks['11']=item.substr(6,4) //地址
                    allChecks['12']=item.substr(10,4) //波特率
                    allChecks['13']=item.substr(14,4) //压力单位
                    allChecks['14']=item.substr(18,4) //小数点位数
                }
                if (cmd[i]==commond2){
                    allChecks['21']=item.substr(6,4) //测量输出值
                }
                if (cmd[i]==commond3){
                    allChecks['31']=item.substr(6,4) //变送器量程零点
                    allChecks['32']=item.substr(10,4) //变送器量程满点
                }
                if (cmd[i]==commond4){
                    allChecks['41']=item.substr(6,4) //零位偏移值，默认是0
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