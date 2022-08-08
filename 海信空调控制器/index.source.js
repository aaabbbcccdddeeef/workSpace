function Relay(options, validate) {
    this.addrmin = 1 // 地址最小
    this.addrmax = 60 // 地址最大
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
Relay.prototype.read = function (addr, code) {//addr:32
    if (code == null) code = this.checksAddress
    else if (typeof code === 'string') code = [code]
    var analysis = []
    var _this = this
    while (addr.length < 2) {
        addr = '0' + addr
    }
    addr = addr.toString(16);
    var cmd = [];
    //1-16内机
    var commond1 = this.validate.crc16(addr + '039c420014');//空调一
    var commond2 = this.validate.crc16(addr + '039c9d0014');//空调二
    var commond3 = this.validate.crc16(addr + '039cf80014');//空调三
    var commond4 = this.validate.crc16(addr + '039d530014');//空调四
    var commond5 = this.validate.crc16(addr + '039dae0014');//空调五
    var commond6 = this.validate.crc16(addr + '039e090014');//空调六
    var commond7 = this.validate.crc16(addr + '039e640014');//空调七
    var commond8 = this.validate.crc16(addr + '039ebf0014');//空调八
    var commond9 = this.validate.crc16(addr + '039f1a0014');//空调九
    var commond10 = this.validate.crc16(addr + '039f750014');//空调十
    var commond11 = this.validate.crc16(addr + '039fd00014');//空调十一
    var commond12 = this.validate.crc16(addr + '03a02b0014');//空调十二
    var commond13 = this.validate.crc16(addr + '03a0860014');//空调十三
    var commond14 = this.validate.crc16(addr + '03a0e10014');//空调十四
    var commond15 = this.validate.crc16(addr + '03a13c0014');//空调十五
    var commond16 = this.validate.crc16(addr + '03a1970014');//空调十六
    code.forEach(function (item) {
        analysis.push(_this['analysis' + item])
        if ((item === '10' || item === '11' || item === '12' || item === '13' || item === '14' || item === '15') && cmd.indexOf(commond1) < 0) {
            cmd.push(commond1)
        }
        if ((item === '20' || item === '21' || item === '22' || item === '23' || item === '24' || item === '25') && cmd.indexOf(commond2) < 0) {
            cmd.push(commond2)
        }
        if ((item === '30' || item === '31' || item === '32' || item === '33' || item === '34' || item === '35') && cmd.indexOf(commond3) < 0) {
            cmd.push(commond3)
        }
        if ((item === '40' || item === '41' || item === '42' || item === '43' || item === '44' || item === '45') && cmd.indexOf(commond4) < 0) {
            cmd.push(commond4)
        }
        if ((item === '50' || item === '51' || item === '52' || item === '53' || item === '54' || item === '55') && cmd.indexOf(commond5) < 0) {
            cmd.push(commond5)
        }
        if ((item === '60' || item === '61' || item === '62' || item === '63' || item === '64' || item === '65') && cmd.indexOf(commond6) < 0) {
            cmd.push(commond6)
        }
        if ((item === '70' || item === '71' || item === '72' || item === '73' || item === '74' || item === '75') && cmd.indexOf(commond7) < 0) {
            cmd.push(commond7)
        }
        if ((item === '80' || item === '81' || item === '82' || item === '83' || item === '84' || item === '85') && cmd.indexOf(commond8) < 0) {
            cmd.push(commond8)
        }
        if ((item === '90' || item === '91' || item === '92' || item === '93' || item === '94' || item === '95') && cmd.indexOf(commond9) < 0) {
            cmd.push(commond9)
        }
        if ((item === '100' || item === '101' || item === '102' || item === '103' || item === '104' || item === '105') && cmd.indexOf(commond10) < 0) {
            cmd.push(commond10)
        }
        if ((item === '110' || item === '111' || item === '112' || item === '113' || item === '114' || item === '115') && cmd.indexOf(commond11) < 0) {
            cmd.push(commond11)
        }
        if ((item === '120' || item === '121' || item === '122' || item === '123' || item === '124' || item === '125') && cmd.indexOf(commond12) < 0) {
            cmd.push(commond12)
        }
        if ((item === '130' || item === '131' || item === '132' || item === '133' || item === '134' || item === '135') && cmd.indexOf(commond13) < 0) {
            cmd.push(commond13)
        }
        if ((item === '140' || item === '141' || item === '142' || item === '143' || item === '144' || item === '145') && cmd.indexOf(commond14) < 0) {
            cmd.push(commond14)
        }
        if ((item === '150' || item === '151' || item === '152' || item === '153' || item === '154' || item === '155') && cmd.indexOf(commond15) < 0) {
            cmd.push(commond15)
        }
        if ((item === '160' || item === '161' || item === '162' || item === '163' || item === '164' || item === '165') && cmd.indexOf(commond16) < 0) {
            cmd.push(commond16)
        }
    })
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
            var ana = function (item) {
                var arrName = []
                //运转/停止状态
                let kgzt = item.substr(6, 4);
                kgzt = parseInt(kgzt, 16).toString(2);
                kgzt = kgzt.padStart(16, '0');
                let kgzt_1 = kgzt.charAt(15)
                arrName[0] = kgzt_1;
                //运转模式
                let yzms = item.substr(10, 4);
                yzms = parseInt(yzms, 16).toString(2);
                yzms = yzms.padStart(16, '0')
                let yzms_1 = yzms.substr(11, 5);
                arrName[1] = yzms_1;
                //风量设定
                let fl = item.substr(16, 4);
                fl = parseInt(fl, 16).toString(2);
                fl = fl.padStart(16, '0');
                let fl_1 = fl.substr(11, 5);
                arrName[2] = fl_1;
                //设定温度
                let sdwd = item.substr(30, 4);
                sdwd = parseInt(sdwd, 16)
                arrName[3] = sdwd;
                //吸入温度T1
                let xrwdT1 = item.substr(78, 4);
                xrwdT1 = parseInt(xrwdT1, 16)
                arrName[4] = xrwdT1;
                //警报代码Alm
                let jbAlm = item.substr(82, 4);
                jbAlm = parseInt(jbAlm, 16)
                arrName[5] = jbAlm;
                return arrName;
            }
            for (var i = 0; i < data.length; i++) {
                var item = data[i].substr(0, data[i].length - 4);
                if (validate.crc16(item).toLowerCase() !== data[i].toLowerCase()) {
                    return error(401)
                }
                var Addr = item.substr(0, 2);
                if (Addr !== addr) {
                    return error(402)
                }
                var func = item.substr(2, 2);//响应功能码
                if (func !== '03') {
                    return error(403)
                }
                if (func == '83') {
                    return error(404)
                }
                if (cmd[i] == commond1) {
                    let arr1 = ana(item);
                    console.log(arr1)
                    arr1.forEach(function (value, index, array) {
                        allChecks['1' + index] = array[index]
                    })
                    // console.log(allChecks)
                }
                if (cmd[i] == commond2) {
                    let arr2 = ana(item);
                    arr2.forEach(function (value, index, array) {
                        allChecks['2' + index] = array[index]
                    })
                }
                if (cmd[i] == commond3) {
                    let arr3 = ana(item);
                    arr3.forEach(function (value, index, array) {
                        allChecks['3' + index] = array[index]
                    })
                }
                if (cmd[i] == commond4) {
                    let arr4 = ana(item);
                    arr4.forEach(function (value, index, array) {
                        allChecks['4' + index] = array[index]
                    })
                }
                if (cmd[i] == commond5) {
                    let arr5 = ana(item);
                    arr5.forEach(function (value, index, array) {
                        allChecks['5' + index] = array[index]
                    })
                }
                if (cmd[i] == commond6) {
                    let arr6 = ana(item);
                    arr6.forEach(function (value, index, array) {
                        allChecks['6' + index] = array[index]
                    })
                }
                if (cmd[i] == commond7) {
                    let arr7 = ana(item);
                    arr7.forEach(function (value, index, array) {
                        allChecks['7' + index] = array[index]
                    })
                }
                if (cmd[i] == commond8) {
                    let arr8 = ana(item);
                    arr8.forEach(function (value, index, array) {
                        allChecks['8' + index] = array[index]
                    })
                }
                if (cmd[i] == commond9) {
                    let arr9 = ana(item);
                    arr9.forEach(function (value, index, array) {
                        allChecks['9' + index] = array[index]
                    })
                }
                if (cmd[i] == commond10) {
                    let arr10 = ana(item);
                    arr10.forEach(function (value, index, array) {
                        allChecks['10' + index] = array[index]
                    })
                }
                if (cmd[i] == commond11) {
                    let arr11 = ana(item);
                    arr11.forEach(function (value, index, array) {
                        allChecks['11' + index] = array[index]
                    })
                }
                if (cmd[i] == commond12) {
                    let arr12 = ana(item);
                    arr12.forEach(function (value, index, array) {
                        allChecks['12' + index] = array[index]
                    })
                }
                if (cmd[i] == commond13) {
                    let arr13 = ana(item);
                    arr13.forEach(function (value, index, array) {
                        allChecks['13' + index] = array[index]
                    })
                }
                if (cmd[i] == commond14) {
                    let arr14 = ana(item);
                    arr14.forEach(function (value, index, array) {
                        allChecks['14' + index] = array[index]
                    })
                }
                if (cmd[i] == commond15) {
                    let arr15 = ana(item);
                    arr15.forEach(function (value, index, array) {
                        allChecks['15' + index] = array[index]
                    })
                }
                if (cmd[i] == commond16) {
                    let arr16 = ana(item);
                    arr16.forEach(function (value, index, array) {
                        allChecks['16' + index] = array[index]
                    })
                }
            }
            console.log(allChecks)
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
    var coc;
    if (code.indexOf("011") > -1) {//一号空调开关机
        coc = parseInt("40078").toString(16)
    }
    if (code.indexOf("012") > -1) {//一号空调设定运转模式
        coc = parseInt("40079").toString(16)
    }
    if (code.indexOf("013") > -1) {//一号空调设定风量
        coc = parseInt("40080").toString(16)
    }
    if (code.indexOf("014") > -1) {//一号空调设定温度
        coc = parseInt("40082").toString(16)
    }
    if (code.indexOf("021") > -1) {//二号空调开关机
        coc = parseInt("40169").toString(16)
    }
    if (code.indexOf("022") > -1) {//二号空调设定运转模式
        coc = parseInt("40170").toString(16)
    }
    if (code.indexOf("023") > -1) {//二号空调设定风量
        coc = parseInt("40171").toString(16)
    }
    if (code.indexOf("024") > -1) {//二号空调设定温度
        coc = parseInt("40173").toString(16)
    }
    if (code.indexOf("031") > -1) {//三号空调开关机
        coc = parseInt("40260").toString(16)
    }
    if (code.indexOf("032") > -1) {//三号空调设定运转模式
        coc = parseInt("40261").toString(16)
    }
    if (code.indexOf("033") > -1) {//三号空调设定风量
        coc = parseInt("40262").toString(16)
    }
    if (code.indexOf("034") > -1) {//三号空调设定温度
        coc = parseInt("40264").toString(16)
    }
    if (code.indexOf("041") > -1) {//四号空调开关机
        coc = parseInt("40351").toString(16)
    }
    if (code.indexOf("042") > -1) {//四号空调设定运转模式
        coc = parseInt("40352").toString(16)
    }
    if (code.indexOf("043") > -1) {//四号空调设定风量
        coc = parseInt("40353").toString(16)
    }
    if (code.indexOf("044") > -1) {//四号空调开关机
        coc = parseInt("40355").toString(16)
    }
    if (code.indexOf("051") > -1) {//五号空调开关机
        coc = parseInt("40442").toString(16)
    }
    if (code.indexOf("052") > -1) {//五号空调设定运转模式
        coc = parseInt("40443").toString(16)
    }
    if (code.indexOf("053") > -1) {//五号空调设定风量
        coc = parseInt("40444").toString(16)
    }
    if (code.indexOf("054") > -1) {//五号空调设定温度
        coc = parseInt("40446").toString(16)
    }
    if (code.indexOf("061") > -1) {//六号空调开关机
        coc = parseInt("40533").toString(16)
    }
    if (code.indexOf("062") > -1) {//六号空调设定运转模式
        coc = parseInt("40534").toString(16)
    }
    if (code.indexOf("063") > -1) {//六号空调设定风量
        coc = parseInt("40535").toString(16)
    }
    if (code.indexOf("064") > -1) {//六号空调设定温度
        coc = parseInt("40537").toString(16)
    }
    if (code.indexOf("071") > -1) {//七号空调开关机
        coc = parseInt("40624").toString(16)
    }
    if (code.indexOf("072") > -1) {//七号空调设定运转模式
        coc = parseInt("40625").toString(16)
    }
    if (code.indexOf("073") > -1) {//七号空调设定风量
        coc = parseInt("40626").toString(16)
    }
    if (code.indexOf("074") > -1) {//七号空调设定温度
        coc = parseInt("40628").toString(16)
    }
    if (code.indexOf("081") > -1) {//八号空调开关机
        coc = parseInt("40715").toString(16)
    }
    if (code.indexOf("082") > -1) {//八号空调设定运转模式
        coc = parseInt("40716").toString(16)
    }
    if (code.indexOf("083") > -1) {//八号空调设定风量
        coc = parseInt("40717").toString(16)
    }
    if (code.indexOf("084") > -1) {//八号空调设定温度
        coc = parseInt("40719").toString(16)
    }
    if (code.indexOf("091") > -1) {//九号空调开关机
        coc = parseInt("40806").toString(16)
    }
    if (code.indexOf("092") > -1) {//九号空调设定运转模式
        coc = parseInt("40807").toString(16)
    }
    if (code.indexOf("093") > -1) {//九号空调设定风量
        coc = parseInt("40808").toString(16)
    }
    if (code.indexOf("094") > -1) {//九号空调设定温度
        coc = parseInt("40810").toString(16)
    }
    if (code.indexOf("0101") > -1) {//十号空调开关机
        coc = parseInt("40897").toString(16)
    }
    if (code.indexOf("0102") > -1) {//十号空调设定运转模式
        coc = parseInt("40898").toString(16)
    }
    if (code.indexOf("0103") > -1) {//十号空调设定风量
        coc = parseInt("40899").toString(16)
    }
    if (code.indexOf("0104") > -1) {//十号空调设定温度
        coc = parseInt("40901").toString(16)
    }
    if (code.indexOf("0111") > -1) {//十一号空调开关机
        coc = parseInt("40988").toString(16)
    }
    if (code.indexOf("0112") > -1) {//十一号空调设定运转模式
        coc = parseInt("40989").toString(16)
    }
    if (code.indexOf("0113") > -1) {//十一号空调设定风量
        coc = parseInt("40990").toString(16)
    }
    if (code.indexOf("0114") > -1) {//十一号空调设定温度
        coc = parseInt("40992").toString(16)
    }
    if (code.indexOf("0121") > -1) {//十二号空调开关机
        coc = parseInt("41079").toString(16)
    }
    if (code.indexOf("0122") > -1) {//十二号空调设定运转模式
        coc = parseInt("41080").toString(16)
    }
    if (code.indexOf("0123") > -1) {//十二号空调设定风量
        coc = parseInt("41081").toString(16)
    }
    if (code.indexOf("0124") > -1) {//十二号空调设定温度
        coc = parseInt("41083").toString(16)
    }
    if (code.indexOf("0131") > -1) {//13号空调运转/停止设定
        coc = parseInt("41170").toString(16)
    }
    if (code.indexOf("0132") > -1) {//13号空调设定运转模式
        coc = parseInt("41171").toString(16)
    }
    if (code.indexOf("0133") > -1) {//13号空调设定风量
        coc = parseInt("41172").toString(16)
    }
    if (code.indexOf("0134") > -1) {//13号空调设定温度
        coc = parseInt("41173").toString(16)
    }
    if (code.indexOf("0141") > -1) {//14号空调开关机
        coc = parseInt("41261").toString(16)
    }
    if (code.indexOf("0142") > -1) {//14号空调设定运转模式
        coc = parseInt("41262").toString(16)
    }
    if (code.indexOf("0143") > -1) {//14号空调设定风量
        coc = parseInt("41263").toString(16)
    }
    if (code.indexOf("0144") > -1) {//14号空调设定温度
        coc = parseInt("41265").toString(16)
    }
    if (code.indexOf("0151") > -1) {//15号空调开关机
        coc = parseInt("41352").toString(16)
    }
    if (code.indexOf("0152") > -1) {//15号空调设定运转模式
        coc = parseInt("41353").toString(16)
    }
    if (code.indexOf("0153") > -1) {//15号空调设定风量
        coc = parseInt("41354").toString(16)
    }
    if (code.indexOf("0154") > -1) {//15号空调设定温度
        coc = parseInt("41356").toString(16)
    }
    if (code.indexOf("0161") > -1) {//16号空调开关机
        coc = parseInt("41443").toString(16)
    }
    if (code.indexOf("0162") > -1) {//16号空调设定运转模式
        coc = parseInt("41444").toString(16)
    }
    if (code.indexOf("0163") > -1) {//16号空调设定风量
        coc = parseInt("41445").toString(16)
    }
    if (code.indexOf("0164") > -1) {//16号空调设定温度
        coc = parseInt("41447").toString(16)
    }
    var commond
    //开关机
    if (code == '011' || code == '021' || code == '031' || code == '041' || code == '051' || code == '061' || code == '071'
        || code == '081' || code == '091' || code == '0101' || code == '0111' || code == '0121' || code == '0131' || code == '0141'
        || code == '0151' || code == '0161') {
        if (state == '1') {//开机
            commond = this.validate.crc16(addr + '10' + coc + '0001020001');//开,32 10 9c8e 0001 02 0001 65 86
            cmd.push(commond);
        }
        if (state == '0') {//关机
            commond = this.validate.crc16(addr + '10' + coc + '0001020000');//关
            cmd.push(commond);
        }
    }
    //设定运转模式
    if (code == '012' || code == '022' || code == '032' || code == '042' || code == '052' || code == '062' || code == '072'
        || code == '082' || code == '092' || code == '0102' || code == '0112' || code == '0122' || code == '0132' || code == '0142'
        || code == '0152' || code == '0162') {
        if (state == '2') {//自动
            let aoe = parseInt('0000000000000001', 2).toString(16);
            aoe = aoe.padStart(4, '0');
            commond = this.validate.crc16(addr + '10' + coc + '000102' + aoe);
            cmd.push(commond);
        }
        if (state == '3') {//制冷
            let aoe = parseInt('0000000000000010', 2).toString(16);
            aoe = aoe.padStart(4, '0');
            commond = this.validate.crc16(addr + '10' + coc + '000102' + aoe);
            cmd.push(commond);
        }
        if (state == '4') {//除湿
            let aoe = parseInt('0000000000000100', 2).toString(16);
            aoe = aoe.padStart(4, '0');
            commond = this.validate.crc16(addr + '10' + coc + '000102' + aoe);
            cmd.push(commond)
        }
        if (state == '5') {//送风
            let aoe = parseInt('0000000000001000', 2).toString(16);
            aoe = aoe.padStart(4, '0');
            commond = this.validate.crc16(addr + '10' + coc + '000102' + aoe);
            cmd.push(commond)
        }
        if (state == '6') {//制热
            let aoe = parseInt('0000000000010000', 2).toString(16);
            aoe = aoe.padStart(4, '0');
            commond = this.validate.crc16(addr + '10' + coc + '000102' + aoe);
            cmd.push(commond)
        }
    }
    //设定风量
    if (code == '013' || code == '023' || code == '033' || code == '043' || code == '053' || code == '063' || code == '073'
        || code == '083' || code == '093' || code == '0103' || code == '0113' || code == '0123' || code == '0133' || code == '0143'
        || code == '0153' || code == '0163') {
        if (state == '7') {//高风
            let aoe = parseInt('0000000000000010', 2).toString(16);
            aoe = aoe.padStart(4, '0');
            commond = this.validate.crc16(addr + '10' + coc + '000102' + aoe);
            cmd.push(commond);
        }
        if (state == '8') {//中风
            let aoe = parseInt('0000000000000100', 2).toString(16);
            aoe = aoe.padStart(4, '0');
            commond = this.validate.crc16(addr + '10' + coc + '000102' + aoe);
            cmd.push(commond);
        }
        if (state == '9') {//低风
            let aoe = parseInt('0000000000001000', 2).toString(16);
            aoe = aoe.padStart(4, '0');
            commond = this.validate.crc16(addr + '10' + coc + '000102' + aoe);
            cmd.push(commond);
        }
    }
    //设定温度
    if (code == '014' || code == '024' || code == '034' || code == '044' || code == '054' || code == '064' || code == '074'
        || code == '084' || code == '094' || code == '0104' || code == '0114' || code == '0124' || code == '0134' || code == '0144'
        || code == '0154' || code == '0164') {
        if (state == '10') {//25度
            commond = this.validate.crc16(addr + '10' + coc + '000102' + parseInt("25").toString(16));
            cmd.push(commond);
        }
        if (state == '11') {//19度
            commond = this.validate.crc16(addr + '10' + coc + '000102' + parseInt("19").toString(16));
            cmd.push(commond);
        }
        if (state == '12') {//30度
            commond = this.validate.crc16(addr + '10' + coc + '000102' + parseInt("30").toString(16));
            cmd.push(commond);
        }
        if (state == '13') {//20度
            commond = this.validate.crc16(addr + '10' + coc + '000102' + parseInt("20").toString(16));
            cmd.push(commond);
        }
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
            if (result.toLowerCase() !== validate.crc16(item).toLowerCase()) {
                return error(401)
            }
            var func = result.substr(2, 2);
            if (func !== '10') {
                return error(402)
            }
            if (func == '90') {
                return error(405)
            }
            var Addr = result.substr(0, 2);
            if (Addr !== addr) {
                return error(403)
            }
            if (result.substr(2, 2) == '90') {
                return error(404)
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
