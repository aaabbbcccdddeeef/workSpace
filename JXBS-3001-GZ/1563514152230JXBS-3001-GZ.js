(function (){
    function Relay(options,validate){
        this.addrmin=1;           //地址最小
        this.addrmax=100;         //地址最大
        this.validate=validate;
        this.button=[0,1,2,3];        //备用
        this.options=options;
        var _this=this;
        this.readTime=2;
        this.upTime=60;
        JSON.parse(options.defaulttest).forEach(function(test){
            _this["analysis"+test.address]=test.analysis;
        });
    }

    /*    搜索设备
            回调[addr]返回搜索到的设备地址
            */
    Relay.prototype.find=function(){
        var addr=this.addrmin;
        var commond="";
        while (addr<=this.addrmax){           //从最低到最高进行尝试地址
            var addrS=addr.toString(16);        //帧数处理
            while (addrS.length<2){
                addrS="0"+addrS;
            }
            commond+=this.validate(addrS+"0301000001")+",";
            addr ++;
        }
        var validate=this.validate;           //CRC验证,上位机数据处理
        var devicename=this.options.devicename;
        var defaulttest=JSON.parse(this.options.defaulttest);
        var defaultbutton=JSON.parse(this.options.defaultbutton);
        var defaultparameterdata=[];
        if(this.options.defaultparameterdata!=undefined){
            defaultparameterdata=JSON.parse(this.options.defaultparameterdata);
        }
        return {
            cmd:commond.substr(0,commond.length-1),   //去除‘，’号
            resolve:function(result,success,error){
                if(result.length<14){
                    return error(400);
                }
                var data=result.substr(0,result.length-4);
                var validatedata=validate(data);      //CRC验证
                if(validatedata.toUpperCase() != result.toUpperCase()){
                    return error(401);
                }
                var func=result.substr(2,2);      //验证功能码
                if(func!='03'){
                    return error(402);
                }
                var data=result.substr(0,2);      //获取设备地址位，上报
                var json={
                    address:data,
                    name:devicename+data,
                    test:defaulttest,
                    button:defaultbutton,
                    defaultparameterdata:defaultparameterdata
                };
                return success(json);
            },
            changeAddr:true               //能否改地址
        }
    }

    /**
     * 改变设备地址
     * 回调 【addr】  返回
     */
    Relay.prototype.changeAddr=function(options){
        if(typeof options.address == "number")options.address=options.address.toString(16);   //上位机地址转换为16进制
        while (options.address.length<2){
            options.address="0"+options.address;
        }
        if(typeof options.oldAddr == "number")options.oldAddr=options.oldAddr.toString(16);   //设备地址转换为16进制
        while (options.oldAddr.length<2){
            options.oldAddr="0"+options.oldAddr;
        }

        var commond=options.oldAddr+"06010000"+options.address;           //更改设备地址
        commond=this.validate(commond);
        var validate=this.validate;
        var devicename=this.options.devicename;
        var defaulttest=JSON.parse(this.options.defaulttest);
        var defaultbutton=JSON.parse(this.options.defaultbutton);
        var defaultparameterdata=[];
        if(this.options.defaultparameterdata!=undefined){
            defaultparameterdata=JSON.parse(this.options.defaultparameterdata);
        }
        return {
            cmd:commond,
            resolve:function(result,success,error){
                if(result.length<16){
                    return error(400);
                }
                var data=result.substr(0,result.length-4);
                var validatedata=validate(data);
                if(validatedata.toUpperCase() != result.toUpperCase()){               //字符转化为大写
                    return error(401);
                }
                var func=result.substr(2,2);
                if(func!='06'){
                    return error(402);
                }
                var data=result.substr(10,2);
                var json={
                    address:data,
                    name:devicename+data,
                    test:defaulttest,
                    button:defaultbutton,
                    defaultparameterdata:defaultparameterdata
                };
                return success(json);
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
    Relay.prototype.encode=function(addr,parameters,port){
        /**
         * 定义个查询指令
         */
        var cmd1=this.validate(addr+'0300070002');
        /**
         *commonds --定义数据参数的反馈起始位和惭愧数据参数长度。
         *begin ---数据参数 字节数 反馈起始位*2
         *reslength----数据参数 反馈数据参数长度 下限值-上限值的指令字节数为该长度*2
         *cmd  ------ 非必选，用于设定不同的指令的作用
         */
        var commonds=[
            {begin:3,reslength:4},
        ]
        var readTime=this.readTime.toString(16);
        var upTime=this.upTime.toString(16);
        while(readTime.length<4){
            readTime="0"+readTime
        }
        while(upTime.length<4){
            upTime="0"+upTime
        }
        function paramData(cmd,commonds,parameters,port,orderNo,cmds){
            orderNo=orderNo.toString(16);
            while(orderNo.length<2){
                orderNo="0"+orderNo;
            }
            var parameter={};
            var allcs="";
            commonds.forEach(function(commond,index){
                //判断有几个默认参数,每一个commond对应一个默认参数
                if(parameters.length==1){
                    parameter=parameters[0];
                }else{
                    if(parameters[index]!=undefined){
                        parameter=parameters[index];
                    }else{
                        parameter=parameters[0];
                    }
                }
                //判断读取的字节数
                alert(JSON.stringify(parameter))
                if(parameter.compareByte!=undefined){
                    commond.reslength=parseInt(commond.reslength)-parseInt(parameter.compareByte)+1;
                }
                alert(commond.reslength)
                parameter.changecycle=parameter.changecycle.toString(16);
                while(parameter.changecycle.length<2){
                    parameter.changecycle="0"+parameter.changecycle;
                }

                parameter.rangeofchange=parameter.rangeofchange.toString(16);
                if(parameter.rangeofchange.length<2){
                    parameter.rangeofchange="0"+parameter.rangeofchange
                }

                var resth=parseInt(commond.reslength*2);
                parameter.lowerLimitValue=parameter.lowerLimitValue.toString(16);
                while(parameter.lowerLimitValue.length<resth){
                    parameter.lowerLimitValue="0"+parameter.lowerLimitValue
                }

                parameter.upperlimitvalue=parameter.upperlimitvalue.toString(16);
                while(parameter.upperlimitvalue.length<resth){
                    parameter.upperlimitvalue="0"+parameter.upperlimitvalue
                }

                commond.begin=commond.begin.toString(16);
                while(commond.begin.length<2){
                    commond.begin="0"+commond.begin
                }

                commond.reslength=commond.reslength.toString(16);
                while(commond.reslength.length<2){
                    commond.reslength="0"+commond.reslength
                }

                var cscmd=commond.begin+commond.reslength+parameter.changecycle+parameter.rangeofchange+parameter.lowerLimitValue+parameter.upperlimitvalue;
                //计算单条数据参数的指令长度
                var wlength=(parseInt(cscmd.length/2)+1).toString(16);
                while(wlength.length<2){
                    wlength="0"+wlength
                }
                cscmd=wlength+cscmd;
                allcs=allcs+cscmd;
            })

            var alength=parseInt(allcs.length/2).toString(16);
            while(alength.length<2){
                alength="0"+alength
            }
            var allNumber=commonds.length.toString(16);
            while(allNumber.length<2){
                allNumber="0"+allNumber
            }
            var ncmd="00"+port+readTime+upTime+alength+allNumber+allcs+cmd
            if(ncmd.length>128){
                //计算指令截成几段
                var i=1;
                var j=parseInt(ncmd.length/128)+1;
                var xh=i+""+j;
                while(ncmd.length>128){
                    var mm=ncmd.substr(0,128);
                    ncmd=ncmd.substr(128);
                    xh=
                        cmds.push(addr+orderNo+xh+mm)
                    i=i+1;
                }
                if(ncmd.length>0){
                    cmds.push(addr+orderNo+j+""+j+ncmd)
                }
            }else{
                cmds.push(addr+orderNo+"11"+ncmd);
            }
            return cmds;
        }
        var cmds=[];
        cmds=paramData(cmd1,commonds,parameters,port,0,cmds)
        return cmds;
    };
    /**
     * 简析主动上报指令，并且生成一个数组
     */
    Relay.prototype.decode=function(result){
        var ret=[];
        if(result.length==20){
            var code=result.substr(0,2);
            var data = result.substr(8,8);
            var valid=this.validate(result.substr(2,14)).toUpperCase();
            if(valid!=result.substr(2,18).toUpperCase()){
                return 401;
            }
            var tdata={};
            tdata.code=7;
            tdata.data=data;
            var analysis = this["analysis" + tdata.code];
            var analyze = null;
            if(analysis){
                eval(analysis);
            }
            if (analyze) {
                tdata.data =analyze(tdata.data);
            }
            ret.push(tdata);
            return ret;
        }else{
            return 400;
        }
    }
    /**
     * 读取多个数据
     */
    Relay.prototype.read=function (addr,codes){
    }

    /**
     * 读取单个地址
     */
    Relay.prototype.readOne=function (addr,code){         //code 读取的寄存器地址
        var analysis = this["analysis" + code];
        if (typeof addr == "number")addr = addr.toString(16);
        while (addr.length<2) {
            addr="0"+addr;
        }
        code=code.toString(16);
        while(code.length<4){
            code="0"+code;
        }
        validate=this.validate;
        var commond=addr+"03"+code+"0002";
        commond=this.validate(commond);
        return{
            cmd:commond,
            resolve:function(result,success,error){
                if(result.length<18){
                    return error(400);
                }
                var data=result.substr(0,result.length-4);
                var validatedata=validate(data);
                if(validatedata.toUpperCase() != result.toUpperCase()){
                    return error(401);
                }
                var addrback=result.substr(0,2);
                if(addrback.toUpperCase() != addr.toUpperCase()){
                    return error(403);
                }
                var func=result.substr(2,2);
                if(func != '03'){
                    return error(402);
                }
                var data=null;
                var data=result.substr(6,8);
                var analyze=null;
                eval(analysis);                   //判断后台有无解析
                if (analyze){                   //如果需要解析，进行解析
                    return success(analyze(data));
                }
                return success(data);
            }
        }
    }

    Relay.prototype.write = function (addr,codes) {
    };

    /**
     * 写单个地址
     * 写地址的时候，因为一个16进制写入指令中可能包含其他控制按钮，要传入其他控制按钮的这些状态，保证不改变他们的状态,写入任何控制都要全部包含
     */
    Relay.prototype.writeOne=function(addr,code,state){

    }

    if (
        typeof cordova == 'object' &&
        typeof cordova.define == 'function'
    ) {
        cordova.define("JXBS-3001-GZ",function(require, exports, module) {
            module.exports = Relay;
        });
    }else if( typeof module == 'object' &&
        typeof module.exports == 'object'){
        module.exports = Relay;
    }
}(this));
    
    
    