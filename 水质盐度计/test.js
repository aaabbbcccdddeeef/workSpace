/*console.log( "function analyze(data){ \n" +
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
    "}".replace('"',''))*/
function analyze(data) {
    var str2 = parseInt(data, 16).toString(2)
    while (str2.length < 32) {
        str2 = '0' + str2
    }
    var sign = str2.substring(0, 1)
    var exponent = str2.substring(1, 9)
    var expint = parseInt(exponent, 2)
    var mobit = expint - 127
    var d = Math.pow(2, mobit)
    var last = str2.substring(9)
    var lastRes = 0 // 存放尾数的结果
    for (var i = 0; i < last.length; i++) {
        var b = last[i]
        if (b === '1') {
            lastRes += 1 / Math.pow(2, (i + 1)) // 尾数的计算
        }
    }
    var result = d * (sign === '1' ? -1 : 1) * (1 + lastRes)
    return result;
}

var data1=analyze('3f800000').toString(2).padEnd(16,'0')

function bin(data){
    let buf = new Uint8Array(data);
    buf.reverse();
    let buf32 =  new Float32Array(buf.buffer);
    return buf32[0];
}

console.log(bin(data1))
