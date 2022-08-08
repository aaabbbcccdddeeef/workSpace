function Relay(options, validate) {
    this.validate = validate
    this.options = options // options.defaulttest  options.defaultbutton
    var _this = this
    _this.checksAddress = []
    options.defaultCheck.forEach(function(test) {
        _this['analysis' + test.address] = test.analysis// test.analysis 解析函数
        _this.checksAddress.push(test.address)
    })
    options.defaultOperate.forEach(function(operate) {
        _this['analysis' + operate.address] = operate.analysis// test.analysis 解析函数
    })
}

Relay.prototype.config = function(model) {
    const imei = model.attribute.filter(item => item.key === 'imei')[0].value
    const obj_id = model.attribute.filter(item => item.key === 'obj_id')[0].value
    const obj_inst_id = model.attribute.filter(item => item.key === 'obj_inst_id')[0].value
    const res_id = model.attribute.filter(item => item.key === 'res_id')[0].value
    const SLEEPTIME = model.attribute.filter(item => item.key === 'SLEEPTIME')[0].value
    const SENDTIME = model.attribute.filter(item => item.key === 'SENDTIME')[0].value
    const TDS = model.attribute.filter(item => item.key === 'TDS')[0].value
    return {
        imei,
        obj_id,
        obj_inst_id,
        res_id,
        val: JSON.stringify({ TDSID: [0], TDS: TDS.split(',').map(i => parseInt(i)), TYPE: 1, SLEEPTIME: parseInt(SLEEPTIME), SENDTIME: parseInt(SENDTIME), STATE: 2 }),
        config: true
    }
}

Relay.prototype.write = function(model, code, state) {
    const imei = model.attribute.filter(item => item.key === 'imei')[0].value
    const obj_id = model.attribute.filter(item => item.key === 'obj_id')[0].value
    const obj_inst_id = model.attribute.filter(item => item.key === 'obj_inst_id')[0].value
    const res_id = model.attribute.filter(item => item.key === 'res_id')[0].value

    return {
        imei,
        obj_id,
        obj_inst_id,
        res_id,
        val: JSON.stringify({ GNSS: '?' })
    }
}

Relay.prototype.decode = function(result) {
    try {
        const data = JSON.parse(result)
        data['0303a']=data['0303'][0]
        data['0303b']=data['0303'][1]
        data['0303c']=data['0303'][2]
        data['0304a']=data['0304'][0]
        data['0304b']=data['0304'][1]
        data['0304c']=data['0304'][2]
        console.log('NB_TEST',data)
        var obj= {//电压,正向有功总,反向有功总,电压块,电流块
            0:data['V'],
            1:parseInt(data['0301'])*0.01,
            2:parseInt(data['0302'])*0.01,
            3:parseInt(data['0303a'])*0.1,
            4:parseInt(data['0303b'])*0.1,
            5:parseInt(data['0303c'])*0.1,
            6:parseInt(data['0304a'])*0.001,
            7:parseInt(data['0304b'])*0.001,
            8:parseInt(data['0304c'])*0.001,
            ESQ:data['ESQ'],
            GAPTIME:data['GAPTIME'],
            IPV:data['IPV'],
            REASON:data['REASON']
        }
        console.log('NB_TEST',obj)
        return obj
    } catch (e) {
        return null
    }
}

module.exports = Relay