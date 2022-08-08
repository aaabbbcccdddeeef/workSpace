/*//所有控制命令:0-10
//停止
if (state == "0") {
    var coc = parseInt("40078").toString(16);
    while (coc.length < 4) {
        coc = '0' + coc;
    }
    var commond1 = addr + '06' + coc + '0000'
    cmd.push(commond1);
}
//运转
if (state == "1") {
    var coc = parseInt("40078").toString(16);
    while (coc.length < 4) {
        coc = '0' + coc;
    }
    var commond2 = addr + '06' + coc + '0001'
    cmd.push(commond2);
}
//自动
if (state == "2") {
    var coc = parseInt("40079").toString(16);
    while (coc.length < 4) {
        coc = '0' + coc;
    }
    var commond3 = addr + '06' + coc + parseInt('0000000000000001', 2).toString(16)
    cmd.push(commond3);
}
//制冷
if (state == "3") {
    var coc = parseInt("40079").toString(16);
    while (coc.length < 4) {
        coc = '0' + coc;
    }
    var commond4 = addr + '06' + coc +parseInt('0000000000000010', 2).toString(16)
    cmd.push(commond4);
}
//除湿
if (state == "4") {
    var coc = parseInt("40079").toString(16);
    while (coc.length < 4) {
        coc = '0' + coc;
    }
    var aoa =
    var commond5 = addr + '06' + coc +parseInt('0000000000000100', 2).toString(16);
    cmd.push(commond5);
}
//送风
if (state == "5") {
    var coc = parseInt("40079").toString(16);
    while (coc.length < 4) {
        coc = '0' + coc;
    }
    var aoa =
    var commond6 = addr + '06' + coc + parseInt('0000000000001000', 2).toString(16);
    cmd.push(commond6);
}
//制热
if (state == "6") {
    var coc = parseInt("40079").toString(16);
    while (coc.length < 4) {
        coc = '0' + coc;
    }
    var aoa =
    var commond7 = addr + '06' + coc +  parseInt('0000000000010000', 2).toString(16);
    cmd.push(commond7);
}
//高风
if (state == "7") {
    var coc = parseInt("40080").toString(16);
    while (coc.length < 4) {
        coc = '0' + coc;
    }
    var aoa = parseInt('0000000000000010', 2).toString(16);
    var commond8 = addr + '06' + coc + parseInt('0000000000000010', 2).toString(16);
    cmd.push(commond8);
}
//中风
if (state == "8") {
    var coc = parseInt("40080").toString(16);
    while (coc.length < 4) {
        coc = '0' + coc;
    }
    var aoa = parseInt('0000000000000100', 2).toString(16);
    var commond9 = addr + '06' + coc + parseInt('0000000000000100', 2).toString(16);
    cmd.push(commond9);
}
//低风
if (state == "9") {
    var coc = parseInt("40079").toString(16);
    while (coc.length < 4) {
        coc = '0' + coc;
    }
    var aoa = parseInt('0000000000001000', 2).toString(16);
    var commond10 = addr + '06' + coc + parseInt('0000000000001000', 2).toString(16);
    cmd.push(commond10);
}
//设定温度25度
if (state == "10") {
    var coc = parseInt("40079").toString(16);
    while (coc.length < 4) {
        coc = '0' + coc;
    }
    var aoa = parseInt("25").toString(16);
    var commond11 = addr + '06' + coc + parseInt("25").toString(16);
    cmd.push(commond11);
}*/
/*
console.log( parseInt("40078").toString(16))*/
/*
var item='00010000008dff03'
console.log(item.substr(0,14))
console.log(item.substr(14,2))*/
/*var test='1111'.padStart(5,'0')
console.log(test)*/
/*var a={};
var b=["name"]
function fun(a,b,i) {
    a[b[0]]='徐清风'+i
    return a;
}
fun(a,b,1)
console.log(a);
fun(a,b,2);
console.log(a)*/

var all={}
var arr1=['11','21','31',NaN]
arr1.forEach(function (value, index, array) {
    all['10'+index+1]=array[index]
})
console.log(all)
/*var sum='0123456789112345'
console.log(sum.substr(12,4))*/
function ana(item){
    var arrName=[]
    //运转/停止状态
    let kgzt = item.substr(6, 4);
    kgzt = parseInt(kgzt, 16).toString(2);
    kgzt=kgzt.padStart(16,'0');
    let kgzt_1 = kgzt.charAt(16);
    arrName[0] = kgzt_1;
    //运转模式
    let yzms = item.substr(10, 4);
    yzms = parseInt(yzms, 16).toString(2);
    yzms =yzms.padStart(16,'0')
    let yzms_1 = yzms.substr(12, 5);
    arrName[1] = yzms_1;
    //风量设定
    let fl = item.substr(16, 4);
    fl = parseInt(fl, 16).toString(2);
    f1=f1.padStart(16,'0');
    let fl_1 = fl.substr(12, 5);
    arrName[2] = fl_1;
    //设定温度
    let sdwd = item.substr(30, 4);
    sdwd = parseInt(sdwd, 16)
    arrName[3]= sdwd;
    //吸入温度T1
    let xrwdT1 = item.substr(78, 4);
    xrwdT1 = parseInt(xrwdT1, 16)
    arrName[4] = xrwdT1;
    //警报代码Alm
    let jbAlm = item.substr(82, 4);
    jbAlm = parseInt(jbAlm, 16)
    arrName[5]= jbAlm;
    return arrName;
}
