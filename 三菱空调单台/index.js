
var verification=require('../utils/verification.js');
var optionApi=require('../utils/options.js');

//加载协议文件js
//可以修改成指定协议
var str=require('./index.source.js');

/*
*基本参数
*/
//获取温湿度的设备字典参数
var options=optionApi.getOption('kt_sl')
//打印出设备字典对应参数
//  console.log(options)
var validate={crc16:verification.crc16,he:verification.he}

//设置类型 find read write,decode 类型
// 用于调用下对应的方法
var type='write'  // find, read ,write,decode

//初始化协议
var newXy=new str(options,validate)
var addr='0';
//设置设备地址.read和write时会使用到
if(type==='find'){
    var findOptions={}
    var changeAddr=false;
    var startAddr=1
    var endAddr=2
    //调用协议中find方法，获取
    var newFind=newXy.find(startAddr,endAddr)
    var changeAddr=newFind.changeAddr
    /**
     * 输出设备查询指令
     * 将指令复制到串口调试工具中下发到设备
     */
    console.log('输出Find查询指令')
    console.log(newFind.cmd.split(','))
    /**
     * returnStr为串口调试工具返回的质量
     */
    var returnStr=''
    newFind.resolve(returnStr.split(' ').join(''),function(data){
        console.log("---------find正常解析结果---------")
        console.log(data)
        findOptions=data;
        addr=findOptions.oldAddr=data.shortAddress;
        findOptions.shortAddress='02';//替换地址
    },function(err){
        console.log("---------find错误解析结果---------")
        console.log('错误:'+err);
        changeAddr=false
    })
    /*
    *运行changeAddr方法
    *cmd:下发指令
    *resolve:处理方法
    */
    if(changeAddr==true){
        var newChange=newXy.changeAddr(findOptions)
        /**
         * 输出设备修改地址指令
         * 将指令复制到串口调试工具中下发到设备
         */
        console.log('输出设备修改地址指令')
        console.log(newChange.cmd.split(','))
        /**
         * changeS为串口调试工具返回的质量
         */
        var changeS='0106048cf94232B1B2'
        newChange.resolve(changeS.split(' ').join(''),function(data){
            console.log("---------changeAddr解析结果---------")
            console.log(data)
            addr=data.shortAddress
        },function(err){
            console.log(err);
        })
    }
}

/*
*运行read方法
*cmd:下发指令
*resolve:处理方法
* addr 设备地址
* code
*/
if(type==='read') {
    if(addr===undefined){
        console.log("请输入设备地址")
        return
    }
    console.log("---------read查询指令--------")
    var read_code
    var newRead=newXy.read(addr, ["10","11","12"])
    /**
     * 输出查询的指令数组
     * 将指令一条条复制到串口调试工具下发至设备
     * 返回指令也泛指到readS数组中
     * 返回指令数量与下发查询指令数量一致
     */
    console.log(newRead.cmd.split(','))
    var readS = [
        ' 32 03 8A 0052 0041  0059 0089 434A '.split(' ').join(''),
    ]
    console.log("开始对唐老鸭read指令返回的值进行解析")
    newRead.resolve(readS.join(','), function (data) {
        console.log("---------read解析结果---------")
        console.log(data)
    }, function (err) {
        console.log(err);
    })
}


/*
*运行write方法
*cmd:下发指令
*resolve:处理方法
* addr:设备地址
* code:节点
* state:控制状态
*/
if(type==='write') {
    if(addr===undefined){
        console.log("请输入设备地址")
        return
    }
    var write_code = '2'
    var state = '3'
    var newWrite=newXy.write(addr, write_code, state)
    /**
     * 输出写入的指令数组
     * 将指令一条条复制到串口调试工具下发至设备
     * 返回指令也泛指到writeS数组中
     * 返回指令数量与下发查询指令数量一致
     */
    console.log(newWrite.cmd.split(','))
    var writeS = [
        '' .split(' ').join('') //  '01 06 00 06 00 03 29 CA'.split(' ').join(''),
    ]
    console.log("开始对唐老鸭write指令返回的值进行解析")
    newWrite .resolve(writeS.join(','), function (data) {
        console.log("---------write解析结果---------")
        console.log(data)
    }, function (err) {
        console.log(err);
    })
}

if(type==='decode') {
    var str=''
    if(newXy.navi!==undefined){
        var newNavi=newXy.navi(newNavi)
        if(newNavi===addr){
            var newDecode=newXy.decode(str)
            console.log('输入主动上报设备参数')
            console.log(newDecode)
        }else{
            console.log('指令解析设备地址与当前设定设备地址不一致')
        }
    }else{
        console.log('当前协议navi方法不存在，无法进行主动上报解析')
    }
}
