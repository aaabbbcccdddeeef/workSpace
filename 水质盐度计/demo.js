function toHexFloat(data) {
    var dataArr = data.split('.')
    var header //整数部分
    var footer//小数部分
    header = dataArr[0] !== '0' ? dataArr[0] : 0
    footer = dataArr[1] !== '0' ? dataArr[1] : 0
    if (header == '0' && footer == '0') {
        return '00000000'
    }
    var SS = parseFloat(data) >= 0 ? 0 : 1//S,符号位
    header = Math.abs(header)
    var arr1 = []//二进制整数
    var arr2 = [] //二进制小数
    if (header !== 0) {
        let i = 0, a
        header = parseInt(header)
        while (true) {
            a = header % 2
            arr1[i] = a
            i++
            header = Math.floor(header / 2)
            if (header == 0) {
                break;
            }
        }
    } else {
        arr1[0] = header
    }
    if (footer !== 0) {
        let a, b, j = 0
        while (true) {
            footer = '0.' + footer
            a = (footer * 2).toString()
            b = a.split('.')
            arr2[j] = b[0]
            footer = b[1]
            j++
            if (j >= 10) {
                break;
            }
        }
    } else {
        arr2[0] = 0
    }
    arr1 = arr1.reverse() //整数逆取，小数顺取
    var arr1str = '', arr2str = ''
    arr1.forEach(value => arr1str += value)
    arr2.forEach(value => arr2str += value)
    var obstr
    if (arr1str.length > 1) {
        obstr = arr1str.substr(0, 1) + '.' + arr1str.substr(1, arr1str.length) + arr2str
    } else {
        obstr = arr1str.substr(0, 1) + '.' + arr2str
    }
    console.log(obstr)
    var EE = (arr1str.length - 1) + 127 //E
    EE = EE.toString(2).padStart(8, '0') //8位
    var MM = (obstr.substr(2, obstr.length)).padEnd(23, '0')//M
    var bin = SS + EE + MM
    var endHex //返回结果
    if (parseFloat(data)<1){
        console.log('bin'+bin)
        endHex=bin.replace('"','')-'00111111100000000000000000000000'.replace('"','')
    }
    endHex = parseInt(bin, 2).toString(16)
    console.log(EE, MM, bin, endHex)
    return endHex
}


console.log(toHexFloat('8.0'))
console.log(parseInt('3DCCCCCC',16).toString(2))

