// var str={"v":4141,"0304":[0x00000000,0x00000032,0x00000000]}
// console.log('00001'.replace(0,''))
// console.log('00001'.replace(/0/g,'')) //正则表达式,全局选定,因为replace这个方法只执行一次匹配,所以用正则表达式可以全局替换
// console.log(parseInt('0032')*0.1)
// var aa=a=>a=5 //箭头函数,一个参数简写方式，默认返回这个参数
// console.log(aa())
var sta='{\n' +
    '    "v":1323,\n' +
    '    "esq":12\n' +
    '}'
var obj=JSON.parse(sta)
console.log(obj)
obj['124']=obj['v']
console.log(obj)
console.log(obj['v'])
