function Relay(options, validate, device) {
    this.validate = validate
    this.device = device
    console.log('初始化')
}

Relay.prototype.config = function (device) {
    // const imei = device.attribute.filter(item => item.key === 'imei')[0].value
    // const obj_id = device.attribute.filter(item => item.key === 'obj_id')[0].value
    // const obj_inst_id = device.attribute.filter(item => item.key === 'obj_inst_id')[0].value
    // const res_id = device.attribute.filter(item => item.key === 'res_id')[0].value
    // const SLEEPTIME = device.attribute.filter(item => item.key === 'SLEEPTIME')[0].value
    // const SENDTIME = device.attribute.filter(item => item.key === 'SENDTIME')[0].value
    // const TDS = device.attribute.filter(item => item.key === 'TDS')[0].value
    // return {
    //     imei,
    //     obj_id,
    //     obj_inst_id,
    //     res_id,
    //     val: JSON.stringify({ TDSID: [0], TDS: TDS.split(',').map(i => parseInt(i)), TYPE: 1, SLEEPTIME: parseInt(SLEEPTIME), SENDTIME: parseInt(SENDTIME), STATE: 2 }),
    //     config: true
    // }
}

Relay.prototype.write = function (code, state) {
    const device = this.device
    const imei = device.attribute.filter(item => item.key === 'imei')[0].value
    const obj_id = device.attribute.filter(item => item.key === 'obj_id')[0].value
    const obj_inst_id = device.attribute.filter(item => item.key === 'obj_inst_id')[0].value
    const res_id = device.attribute.filter(item => item.key === 'res_id')[0].value
    return {
        data: {
            address: device.address,
            obj_id,
            obj_inst_id,
            res_id,
            val: JSON.stringify({ GNSS: '?' })
        },
        delayed: true // 低功耗设备 等下次上传再下发
    }
}

Relay.prototype.decode = function (result) {
    try {
        const objData = JSON.parse(result)
        if (objData.value) {
            var data = objData.value
            if(typeof objData.value=='string'){
                data = JSON.parse(objData.value)
            }
            data['0303a'] = data['0303'][0]
            data['0303b'] = data['0303'][1]
            data['0303c'] = data['0303'][2]
            data['0304a'] = data['0304'][0]
            data['0304b'] = data['0304'][1]
            data['0304c'] = data['0304'][2]
            var obj = {//电压,正向有功总,反向有功总,电压块,电流块
                0: data['V'],
                1: data['0301']/100,
                2: data['0302']/100,
                3: data['0303a']/10,
                4: data['0303b']/10,
                5: data['0303c']/10,
                6: data['0304a']/1000,
                7: data['0304b']/1000,
                8: data['0304c']/1000,
                ESQ: data['ESQ'],
                GAPTIME: data['GAPTIME'],
                IPV: data['IPV'],
                REASON: data['REASON']
            }
            return obj
        } else {
            return null
        }
    } catch (e) {
        return null
    }
}

Relay.prototype.navi = function (result) {
    const json = JSON.parse(result)
    return json.id
}

module.exports = Relay