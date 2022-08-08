switch (code){
    case '1501':
        commond=this.validate.crc16(addr+'0315010001');//采集点1温度
        break;
    case '1502':
        commond=this.validate.crc16(addr+'0315020001');//采集点2温度
        break;
    case '1503':
        commond=this.validate.crc16(addr+'0315030001');//采集点3温度
        break;
    case '2218':
        commond=this.validate.crc16(addr+'0322180001');//采集点718温度
        break;
    case '2219':
        commond=this.validate.crc16(addr+'0322190001');//采集点719温度
        break;
    case '2220':
        commond=this.validate.crc16(addr+'0322200001');//采集点720温度
        break;
    case '2501':
        commond=this.validate.crc16(addr+'0325010001');//采集点1电压值
        break;
    case '2502':
        commond=this.validate.crc16(addr+'0325020001');//采集点2电压值
        break;
    case '2503':
        commond=this.validate.crc16(addr+'0325030001');//采集点3电压值
        break;
    case '3218':
        commond=this.validate.crc16(addr+'0332180001');//采集点718电压值
        break;
    case '3219':
        commond=this.validate.crc16(addr+'0332190001');
        break;
    case '3220':
        commond=this.validate.crc16(addr+'0332200001');
        break;
}