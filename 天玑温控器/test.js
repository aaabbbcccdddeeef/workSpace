var operateValue=parseInt('22').toString(2)
console.log(operateValue)
while (operateValue.length<16){
    operateValue='0'+operateValue;
}
console.log(operateValue);
var value=operateValue.substr(0, 10) + '1' + operateValue.substr(11, 6);
value=parseInt(value,2).toString(16)
console.log(value)
value=value.padStart(4,'0');
var commond2 ='10' + '06103f' + value;
console.log(commond2);
console.log(parseInt("bc",16).toString(2));
var item=parseInt("bc",16).toString(2);
while (item.length<16){
    item='0'+item;
}
console.log(item)
console.log(item.substr(12,3))