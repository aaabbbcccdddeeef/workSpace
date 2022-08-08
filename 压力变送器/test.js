console.log( "function analyze(hexStr) {\n" +
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
    "}".replace('"',''))

function analyze(hexStr) {
    let twoStr = parseInt(hexStr,16).toString(2);
    let bitNum = hexStr.length * 4;
    if(twoStr.length < bitNum){
        while(twoStr.length < bitNum){
            twoStr = "0" + twoStr;
        }
    }
    if(twoStr.substring(0,1) == "0"){
        twoStr = parseInt(twoStr,2);
        return twoStr/1000;
    }else{
        let twoStr_unsign = "";
        twoStr = parseInt(twoStr,2) - 1;
        twoStr = twoStr.toString(2);
        twoStr_unsign = twoStr.substring(1,bitNum)
        twoStr_unsign = twoStr_unsign.replace(/0/g, "z");
        twoStr_unsign = twoStr_unsign.replace(/1/g, "0");
        twoStr_unsign = twoStr_unsign.replace(/z/g, "1");
        twoStr = parseInt(-twoStr_unsign, 2);
        return twoStr/10000;
    }
}
var str="if (typeof addr === 'number') addr = addr.toString(16)\n" +
    "    while (addr.length < 2) {\n" +
    "        addr = '0' + addr;\n" +
    "    }\n" +
    "    var cmd = [];\n" +
    "    state=state.toString(16)\n" +
    "    if (state.length<2){\n" +
    "        state='0'+state\n" +
    "    }\n" +
    "    if (code.indexOf('6')>-1){//零位偏移值.压力输出值\n" +
    "        var commond=this.validate.crc16(addr+'06000c00'+state) //非法功能，不被允许使用\n" +
    "        cmd.push(commond)\n" +
    "    }\n" +
    "    var validate = this.validate;\n" +
    "    return {\n" +
    "        cmd: cmd.join(','),\n" +
    "        timeout: 5000,\n" +
    "        resolve: function (result, success, error) {\n" +
    "            var item = result.substr(0, result.length - 4);\n" +
    "            if (result.toLowerCase() !== validate.crc16(item).toLowerCase()) {\n" +
    "                return error(401)\n" +
    "            }\n" +
    "            if (item.substr(0,2)!==addr){\n" +
    "                return error(402)\n" +
    "            }\n" +
    "            if (item.substr(2,2)!=='06'){\n" +
    "                return error(403)\n" +
    "            }\n" +
    "            success(state)\n" +
    "        }\n" +
    "    }"
