var analyzeApi = require('./analyze.js');
//模拟物字典
exports.RSWSD = {
    name: '温湿度',
    defaultCheck: [
        {
            name: '湿度',
            address: '1',
            analysis: analyzeApi.getOne('analyzeInt10')
        },
        {
            name: '温度',
            address: '2',
            analysis: analyzeApi.getOne('analyzeInt10')
        }
    ]
}

exports.yd = {//盐度值
    name: '盐度值',
    defaultCheck: [
        {
            name: '温度',
            address: '3',
            analysis: analyzeApi.getOne('analyze100')
        },
        {
            name: '盐度',
            address: '5',
            analysis: analyzeApi.getOne('analyze100')
        }
    ]
}

exports.kt_sl = {
    name: '三菱空调控制',
    defaultCheck: [
        {
            name: '0号空调温度设置',
            address: '4',
            analysis: analyzeApi.getOne('analyzeInt')
        }
    ]
}
exports.kt_1 = {
    name: '空调控制器',
    defaultCheck: [
        {
            name: '一号空调开关机',
            address: '10',
            analysis: analyzeApi.getOne('analyzeInt')
        },
        {
            name: '一号空调运转模式',
            address: '11',
            analysis: analyzeApi.getOne('analyzeInt')
        },
        {
            name: '一号空调风量设定',
            address: '12',
            analysis: analyzeApi.getOne('analyzeInt')
        },
        {
            name: '1号空调设定温度',
            address: '13',
            analysis: analyzeApi.getOne('analyzeInt')
        }
    ]
}

exports.DTSDUKY2 = {
    name: '科艺电表',
    defaultCheck: [
        {
            name: 'A电压',
            address: '5',
            analysis: analyzeApi.getOne('analyze')
        },
        {
            name: 'B电压',
            address: '6',
            analysis: analyzeApi.getOne('analyze')
        },
        {
            name: 'C电压',
            address: '7',
            analysis: analyzeApi.getOne('analyze')
        },
        {
            name: 'A电流',
            address: '8',
            analysis: analyzeApi.getOne('analyze')
        },
        {
            name: 'B电流',
            address: '9',
            analysis: analyzeApi.getOne('analyze')
        },
        {
            name: 'C电流',
            address: '10',
            analysis: analyzeApi.getOne('analyze')
        },
        {
            name: '电能',
            address: '0',
            analysis: analyzeApi.getOne('analyze')
        },
        {
            name: '反向电能',
            address: 'a',
            analysis: analyzeApi.getOne('analyze')
        }
    ],
    defaultOperate: [
        {
            name: '开合闸',
            address: 'a',
            analysis: analyzeApi.getOne('analyzeInt10')
        }
    ]
}
exports.getOption = function (type) {
    return this[type]
}