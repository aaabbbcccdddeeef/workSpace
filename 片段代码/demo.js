var roomTemp //室内温度
var outTemp //室外温度
var fs //风扇状态,1-开,0关
var kt //空调状态,1-开,0-关
var commond1 //开启风扇
var commond2 //关闭风扇
var commond3 //开启空调
var commond4 //关闭空调
if (outTemp <= 28 && roomTemp >= 30) {//开启风扇
    commond1
}
if (fs == '0' && kt == '0') {//都关闭状态执行此判断
    if (roomTemp < 30) {
        commond2
        commond4
    }
}
if (outTemp > 28 && roomTemp >= 30) {//关闭风扇开启空调
    commond2
    commond3
}