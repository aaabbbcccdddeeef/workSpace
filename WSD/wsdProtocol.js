const {analyze} = require("../utils/analyze");
function WsdProtocol(options,validate) {
    //构造方法:进行初始化
        this.addrmin = 1; //最小地址
        this.admax = 100; //最大地址
        this.validate = validate; //校验
        this.options = options; //设备信息对象
        var _this = this //指向本对象,为了防止函数指向错误
        _this.checksAddress = []
        //遍历数组获取各对象设备参数地址
        options.defaultCheck.forEach(function (data) {
            _this['analysis' + data.address] = data.analysis;
            _this.checksAddress.unshift(data.address);//把设备参数地址放到数组checksAddress中
        })
    //console.log(_this.analysis2);
}

/*
初始化结构：
传入参数的获取数据给本地对象属性
1.规定最小地址和最大地址
2.导入校验对象
3.设备信息：code地址,每一个对应的解析函数
4.设备信息的解析函数，在设备信息里面
*/

/*
find,changeAddr,read,write大致结构:
1.对参数进行检查，包括补位，补0，以及类型字符串判断,因为如果是字符串要转换成整数类型
2.创建指令,指令格式看说明文档
3.指令中的地址要转换成十六进制字符串
4.多个设备则把指令拼接，逗号连接
5.指令要用校验函数校验,搜索地址一般4位2个字节
6.设备地址则是一个字节2位
7.返回数据处理，格式
{
cmd:xxx,
resolve:function(result,sucess,error){
return success(json)
}
}
8.result为返回结果，对返回结果进行校验，判断正确性
9.根据返回的数据进行切割进行转换十进制成具体数据
*/


    //搜索设备方法find,参数一是搜索起始地址,参数二是搜索末端地址
//判断参数信息阶段
    //返回一个对象，包含发送指令和返回结果
WsdProtocol.prototype.find=function (startAddr,endAddr){
        if (startAddr && typeof startAddr==='string'){
            startAddr=parseInt(startAddr);
        }
        if (endAddr && typeof endAddr==='string'){
            endAddr=parseInt(startAddr);
        }
        //保留正确地址，如果起始地址不存在就用设备最小地址
        var addr=startAddr||this.addrmin;
        var end=endAddr||this.admax;
        //创建指令
        var commond='';
        //只有参数输入正确才有命令
        while (addr<=end){
            var addrS=addr.toString(16);
            //给搜索地址补位
            while (addr.length<4){
                addrS='0'+addrS;
            }
            //把搜索到的地址使用crc校验返回正确指令,会自动发给设备
            commond+=this.validate.crc16(addrS + '0300000001') + ',';
            addr++;
        }
        var validate=this.validate;
        var devicename=this.options.name;
        var defaultCheck=this.options.defaultCheck;
        var attribute=[]//设备参数，用于设备之间的差异
        //如果此设备参数未定义，则为其赋值
        if (this.options.attribute!==undefined){
            attribute=this.options.attribute;
        }
        return{
            //下发的指令
            cmd:commond.substr(0,commond.length-1),
            resolve:function (result,res,error) {
                //对结果正确性进行判断
                if(result.length<14){
                    result
                    console.error(400);
                }
                //对结果进行处理
                var data=result.substr(0,result.length-4);
                var validatedata=validate.crc16(data);
                //对返回的数据进行crc校验
                if (validatedata!==data){
                    return error(401);
                }
                //对返回功能码进行判断是否是03:获取寄存器数据
                var functionCode=result.substr(2,2);
                if (functionCode!=='03'){
                    return  error(402);
                }
                //地址
                var address=result.substr(0,2);
                var data={
                    shortAddress:address,
                    name:devicename+address,
                    checks:defaultCheck,
                    attribute:attribute//设备无差异则无需
                }
                return res(data);//把最终结果返回
            }
        }
    }
    //改变设备地址,参数一是设备参数信息
    /*传入参数options对象,
    详细键值
    - shortAddress 必需,改写的地址
    - oldAddr 原地址*/
WsdProtocol.prototype.changeAddr=function (options){
        //判断参数信息阶段
       if (typeof  options.shortAddress==='number'){
           options.shortAddress=options.shortAddress
       }
       //补位判断
       if(typeof options.shortAddress<2){
           options.shortAddress='0'+options.shortAddress
       }
        if(typeof oldAddr==='number'){
              options.oldAddr=options.oldAddr.toString(16);
        }
        if(typeof options.shortAddress<2){
            options.shortAddress='0'+options.shortAddress
        }
        //创建指令
        var commond = options.oldAddr + '100000000102' + options.shortAddress + '01';
        commond=this.validate.crc16(commond);//crc校验
        var validate=this.validate;
        var devicename=this.options.name;
        var defaultCheck=this.options.defaultCheck;
        var attribute=[]//设备参数，用于设备之间的差异
        //如果此设备参数未定义，则为其赋值
        if (this.options.attribute!==undefined){
            attribute=this.options.attribute;
        }
        return{
            //下发的指令
            cmd:commond.substr(0,commond.length-1),
            resolve:function (result,res,error) {
                //对结果正确性进行判断
                if(result.length<14){
                    result
                    console.error(400);
                }
                //对结果进行处理
                var data=result.substr(0,result.length-4);
                var validatedata=validate.crc16(data);
                //对返回的数据进行crc校验
                if (validatedata.toLowerCase()!==result.toLowerCase()){
                    return error(401);
                }
                //对返回功能码进行判断是否是03:获取寄存器数据
                var functionCode=result.substr(2,2);
                if (functionCode!=='03'){
                    return  error(402);
                }
                var data={
                    shortAddress:options.shortAddress,
                    name:devicename+options.shortAddress,
                    checks:defaultCheck,
                    attribute:attribute//设备无差异则无需
                }
                return res(data);//把最终结果返回
            }
        }
    }
    //读取数据
    //参数一是设备通讯地址,参数二是设备参数地址
WsdProtocol.prototype.read=function (addr,code){
        //为空的话，默认是设备全部地址
        if(code==null){
            code=this.checksAddress;
        }
        else if(typeof code=='string'){
            code=[code];//放到数组里面
        }
        var analysis=[];//存放
        var _this=this;//区分this指向
        //补位
        while (addr.length<2){
            addr='0'+addr;
        }
        var commond1=this.validate.crc16(addr+'0300000002');//地址（01），功能码（03），数据起始地址2个字节（00,00），数据个数(00,02)两个，crc校验码(crc16会加上去的)
        var cmd=[];
        //遍历code数组信息,设备参数地址
        code.forEach(function (item) {
            analysis.unshift(_this['analysis'+item]);
            //看32在该code字符串中第一次出现的位置,没有找到则是-1
            if(code.indexOf('2')>-1){
                cmd.unshift(commond1);
            }
        })
        var validate=this.validate;
        return {
            //数组里面数据的用逗号隔开的字符串
            cmd:cmd.join(','),
            resolve:function (result,success,error) {
                var data=result.split(',');
                if (data.length!==cmd.length){
                    return error(400);
                for (var i=0;i<data.length;i++){
                }
                var res={};
                    var item=data[i];
                    item=item.substr(0,item.length-4);
                    var validatedata=validate.crc16(item);
                    //对返回数据进行校验,要转换成小写字母
                    if(validatedata.toLowerCase()!==data[i].toLowerCase()){
                        return error(401);
                    }
                    var addrback=item.substr(0,2);
                    //返回的地址
                    if(addrback!==addr){
                        return error(402)
                    }
                    //返回的功能码
                    var functionCode=item.substr(2,2);
                    if (functionCode!=='03'){
                        return error(403)
                    }
                    var allchecks=[];
                    allchecks['1']=item.substr(6,4);//湿度
                    allchecks['2']=item.substr(10,4);//温度
                    code.forEach(function (item,index) {
                        var analyze=null;
                        eval(analysis[index]);
                        res[item]=analyze(allchecks[item]);
                    })
                }
                success(res);
            }
        }
    }
  /*  传入参数addr, code, state, operates
    -addr:设备地址
    -code:可读(采集节点和控制节点)地址
    -state:控制状态
    */
   /* //写入数据
    write(addr,code,state){
        if (typeof addr ==='number'){
            addr=addr.toString(16);
        }
        while (addr.length<4){
            addr='0'+addr;
        }
        var commond=this.validate.crc16(addr+'0300320003');
        var cmd=[];
        cmd.unshift(commond);
        return
    }*/
    //导航函数,返回result中的设备地址
WsdProtocol.prototype.navi=function (result){
        if(result){
            const addr=result.substr(0,2);
        }
        return null
    }
module.exports = WsdProtocol;