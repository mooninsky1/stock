
var http    = require('http');
var iconv = require('iconv-lite');
var realtimestock = require('./realtime');

function login(socket,user,password)
{
    //console.log(user);
    realtimestock.realtime(user);
    var url = "http://hq.sinajs.cn/list=sz000601";
    var url = "http://quotes.money.163.com/service/chddata.html?code=0600795&start=20181118&end=20181129&fields=TCLOSE;HIGH;LOW;TOPEN;LCLOSE;CHG;PCHG;TURNOVER;VOTURNOVER;VATURNOVER;TCAP;MCAP";
	/*http.get(url, function(res) {
	var source = "";
	res.on('data', function(data) {
							//source += data;
                           source +=  iconv.decode(data, 'GBK')
						});
    res.on('end', function() {
        var now = new Date();
        var hh = now.getHours();
        var mm = now.getMinutes();          //minutes
        var ss = now.getSeconds();
        var clock ="";
        if(hh < 10)
            clock += "0";

        clock += hh + ":";
        if (mm < 10) clock += '0'; 
        clock += mm+":"; 

        if (ss < 10) clock += '0'; 
        clock += ss; 

        var elements=source.split(",");

        var nameJson ="韶能股份";
        var stockidJson ="000601";
        var dayJson= elements[30];
        var timeJson= clock;
        var priceJson= Number(elements[3]);
        var volumeJson=Number(elements[8]);
        var stockIndexJson=0;

       
        console.log(source);

        socket.emit("loginRsp",source);
        var json ={name:nameJson,stockid:stockidJson,
            day:dayJson,time:timeJson,
            price:priceJson,volume:volumeJson,
            stockIndex:stockIndexJson};

           console.log(json)
        });
}).on('error', function() {
    console.log("获取数据出现错误");
});*/

}
var realInter;
function realtime(socket,db,code){
    // code = "000601";
    realInter = setInterval(realtimestock.realtime,1000,socket,db,code);
}
function realtime_stop(){
    clearInterval(realInter);
}

function history(socket){

}
module.exports.realtime = realtime;
module.exports.history = history;
exports.realtime_stop = realtime_stop;