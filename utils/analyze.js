//浮点型数据
exports.analyze100 = "function analyze(data){ \n" +
    "  var str2 = parseInt(data, 16).toString(2)\n" +
    "  while (str2.length < 32) {\n" +
    "    str2 = '0' + str2\n" +
    "  }\n" +
    "  var sign = str2.substring(0, 1)\n" +
    "  var exponent = str2.substring(1, 9)\n" +
    "  var expint = parseInt(exponent, 2)\n" +
    "  var mobit = expint - 127\n" +
    "  var d = Math.pow(2, mobit)\n" +
    "  var last = str2.substring(9)\n" +
    "  var lastRes = 0 // 存放尾数的结果\n" +
    "  for (var i = 0; i < last.length; i++) {\n" +
    "    var b = last[i]\n" +
    "    if (b === '1') {\n" +
    "      lastRes += 1 / Math.pow(2, (i + 1)) // 尾数的计算\n" +
    "    }\n" +
    "  }\n" +
    "  var result = d * (sign === '1' ? -1 : 1) * (1 + lastRes)\n" +
    "  return result; \n" +
    "}";

//16进制转换成数字
exports.analyzeInt = "function analyze(data){ data=parseInt(data,16); return data; }";

//16进制转换成数字/10
exports.analyzeInt10 = "function analyze(data){ data=parseInt(data,16)/10; return data; }";

//16进制转换成数字/100
exports.analyzeInt100 = "function analyze(data){ data=parseInt(data,16)/100; return data; }";

//
exports.analyze22 = "function analyze (data){var strBase16 = data;var temp = 0;var m_s = 0;var m_e = 0;var m_x = 0;var m_re = 0;var strTemp = strBase16.substr(0, 2);temp = parseInt(strTemp, 16) & 0x80;if (temp == 128) m_s = 1;strTemp = strBase16.substr(0, 3);temp = parseInt(strTemp, 16) & 0x7f8;m_e = parseInt(temp /Math.pow(2, 3)); strTemp = strBase16.substr(2, 6);temp = parseInt(strTemp, 16) & 0x7fffff;m_x = temp /Math.pow(2, 23);m_re = Math.pow(-1, m_s) * (1 + m_x) *Math.pow(2, m_e - 127);if (m_re > 300 || m_re < 0){ return 'error';}m_re=m_re.toFixed(2);m_re=parseFloat(m_re);return m_re }";
/*
* 转换函数，把十六进制转换成有符号的十进制数
* */
exports.analy16 = "function analyze(hexStr) {\n" +
    "  let twoStr = parseInt(hexStr,16).toString(2);\n" +
    "  let bitNum = hexStr.length * 4;\n" +
    "  if(twoStr.length < bitNum){\n" +
    "    while(twoStr.length < bitNum){\n" +
    "      twoStr = \"0\" + twoStr;\n" +
    "    }\n" +
    "  }\n" +
    "  if(twoStr.substring(0,1) == \"0\"){\n" +
    "    twoStr = parseInt(twoStr,2);\n" +
    "    return twoStr;\n" +
    "  }else{\n" +
    "    let twoStr_unsign = \"\";\n" +
    "    twoStr = parseInt(twoStr,2) - 1;\n" +
    "    twoStr = twoStr.toString(2);\n" +
    "    twoStr_unsign = twoStr.substring(1,bitNum)\n" +
    "    twoStr_unsign = twoStr_unsign.replace(/0/g, \"z\");\n" +
    "    twoStr_unsign = twoStr_unsign.replace(/1/g, \"0\");\n" +
    "    twoStr_unsign = twoStr_unsign.replace(/z/g, \"1\");\n" +
    "    twoStr = parseInt(-twoStr_unsign, 2);\n" +
    "    return twoStr/10;\n" +
    "  }\n" +
    "}"

exports.analyze = "function analyze (data){" +
    "var strBase16 = data;" +
    "console.log(strBase16);" +
    "var temp = 0;" +
    "var m_s = 0;" +
    "var m_e = 0;" +
    "var m_x = 0;" +
    "var m_re = 0;" +
    "var strTemp = strBase16.substr(0, 2);" +
    "temp = parseInt(strTemp, 16) & 0x80;" +
    "console.log(temp);" +
    "if (temp == 128) m_s = 1;" +
    "strTemp = strBase16.substr(0, 3);" +
    "temp = parseInt(strTemp, 16) & 0x7f8;" +
    "m_e = parseInt(temp /Math.pow(2, 3)); " +
    "strTemp = strBase16.substr(2, 6);" +
    "temp = parseInt(strTemp, 16) & 0x7fffff;" +
    "m_x = temp /Math.pow(2, 23);" +
    "m_re = Math.pow(-1, m_s) * (1 + m_x) *Math.pow(2, m_e - 127);" +
    "if (m_re > 300000 || m_re < 0){ return 'error';}" +
    "m_re=m_re.toFixed(2);" +
    "m_re=parseFloat(m_re);" +
    "return m_re }"


exports.sdtD1 = "function analyze(data){ var data2=data.toString().substr(2,2); var data1=data.toString().substr(0,2); data2=parseInt(data2,16); data1=parseInt(data1,16); data=(data1*256+data2)/100; return data; }"

exports.sdtD2 = "function analyze(data) {var data=data.toString();while(data.length<8){data='0'+data;};var data1=data.toString().substring(0,2);var data2=data.toString().substring(2,4);var data3=data.toString().substring(4,6);var data4=data.toString().substring(6,8);data1=parseInt(data1,16);data2=parseInt(data2,16);data3=parseInt(data3,16);data4=parseInt(data4,16);data=(65536*(256*data1+data2)+(256*data3+data4))/100;return data}"

exports.KYKG = "function analyze(data){ if (data === '00'){ data = 0 }else if (data === '01') {data = 1}; return data; }"

exports.getOne = function (type) {
    return this[type]
}
/*在字符串里面“”加内容会自动排序
exports.xxx='function hex2int(hexStr) {\n' +
    '    let twoStr = parseInt(hexStr,16).toString(2);\n' +
    '    let bitNum = hexStr.length * 4;\n' +
    '    if(twoStr.length < bitNum){\n' +
    '        while(twoStr.length < bitNum){\n' +
    '            twoStr = "0" + twoStr;\n' +
    '        }\n' +
    '    }\n' +
    '    if(twoStr.substring(0,1) == "0"){\n' +
    '        twoStr = parseInt(twoStr,2);\n' +
    '        return twoStr;\n' +
    '    }else{\n' +
    '        let twoStr_unsign = "";\n' +
    '        twoStr = parseInt(twoStr,2) - 1;\n' +
    '        twoStr = twoStr.toString(2);\n' +
    '        twoStr_unsign = twoStr.substring(1,bitNum)\n' +
    '        twoStr_unsign = twoStr_unsign.replace(/0/g, "z");\n' +
    '        twoStr_unsign = twoStr_unsign.replace(/1/g, "0");\n' +
    '        twoStr_unsign = twoStr_unsign.replace(/z/g, "1");\n' +
    '        twoStr = parseInt(-twoStr_unsign, 2);\n' +
    '        return twoStr;\n' +
    '    }\n' +
    '}'
*/

/*function analyze(hexStr) {
    let twoStr = parseInt(hexStr,16).toString(2);
    let bitNum = hexStr.length * 4;
    if(twoStr.length < bitNum){
        while(twoStr.length < bitNum){
            twoStr = "0" + twoStr;
        }
    }
    if(twoStr.substring(0,1) == "0"){
        twoStr = parseInt(twoStr,2);
        return twoStr;
    }else{
        let twoStr_unsign = "";
        twoStr = parseInt(twoStr,2) - 1;
        twoStr = twoStr.toString(2);
        twoStr_unsign = twoStr.substring(1,bitNum)
        twoStr_unsign = twoStr_unsign.replace(/0/g, "z");
        twoStr_unsign = twoStr_unsign.replace(/1/g, "0");
        twoStr_unsign = twoStr_unsign.replace(/z/g, "1");
        twoStr = parseInt(-twoStr_unsign, 2)/10;
        return twoStr;
    }
}*/
