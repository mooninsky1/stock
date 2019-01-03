
var http = require('http');
var iconv = require('iconv-lite');
//引入redis
var redis = require("redis");
/*
0：”大秦铁路”，股票名字；
1：”27.55″，今日开盘价；
2：”27.25″，昨日收盘价；
3：”26.91″，当前价格；
4：”27.55″，今日最高价；
5：”26.20″，今日最低价；
6：”26.91″，竞买价，即“买一”报价；
7：”26.92″，竞卖价，即“卖一”报价；
8：”22114263″，成交的股票数，由于股票交易以一百股为基本单位，所以在使用时，通常把该值除以一百；
9：”589824680″，成交金额，单位为“元”，为了一目了然，通常以“万元”为成交金额的单位，所以通常把该值除以一万；
10：”4695″，“买一”申请4695股，即47手；
11：”26.91″，“买一”报价；
12：”57590″，“买二”
13：”26.90″，“买二”
14：”14700″，“买三”
15：”26.89″，“买三”
16：”14300″，“买四”
17：”26.88″，“买四”
18：”15100″，“买五”
19：”26.87″，“买五”
20：”3100″，“卖一”申报3100股，即31手；
21：”26.92″，“卖一”报价
(22, 23), (24, 25), (26,27), (28, 29)分别为“卖二”至“卖四的情况”
30：”2008-01-11″，日期；
31：”15:05:32″，时间；
 */

//创建redis客户端
//var client = redis.createClient("6379", "192.168.17.141");
//连接错误处理
//client.on("error", function (error) {
//   console.log(error);
//});
//redis验证 （如果redis没有开启验证，此配置可以不写）
//client.auth("123456");


function realtime(socket, db, code) {
    var mycode
    if ('6' == code.charAt(0)) {
        mycode = "sh" + code;
    }
    else if ('0' == code.charAt(0) || '3' == code.charAt(0)) {
        mycode = "sz" + code;
    }
    var url = "http://hq.sinajs.cn/list=" + mycode;
    http.get(url, function (res) {
        var source = "";
        res.on('data', function (data) {
            //source += data;
            source += iconv.decode(data, 'GBK')
        });
        res.on('end', function () {
            var now = new Date();
            var hh = now.getHours();
            var mm = now.getMinutes();          //minutes
            var ss = now.getSeconds();
            var clock = "";
            if (hh < 10)
                clock += "0";

            clock += hh + ":";
            if (mm < 10) clock += '0';
            clock += mm + ":";

            if (ss < 10) clock += '0';
            clock += ss;

            var elements = source.split(",");

            var nameJson = elements[0].substring(21, elements[0].length);
            var stockidJson = code;
            var dayJson = elements[30];
            var timeJson = clock;
            var priceJson = Number(elements[3]);
            var volumeTotal = Number(elements[8]);
            var priceold = priceJson;
            var volumcur = 0;
            var pricePer = 0;
            var volumPer = 0;

            db.lrange(code, 0, 0, function (err, res) {
                if (err) {
                    console.log("err:" + err);
                }
                else {
                    if (res != "") {
                        let data = JSON.parse(res)
                        volumcur = volumeTotal - data.volume;
                        //如果量为0不处理
                        if(0 ==volumcur){
                            return;
                        }
                        priceold = data.price;
                        if (priceold != 0) {
                            pricePer = (priceJson - priceold) * 100 / priceold;
                        }
                        if (data.volumeNow) {
                            volumPer = (volumcur - data.volumeNow) * 100 / data.volumeNow;
                        }
                    }
                    var json = {
                        "name": nameJson,
                        "stockid": stockidJson,
                        "day": dayJson,
                        "time": timeJson,
                        "price": priceJson,
                        "volume": volumeTotal,
                        "volumeNow": volumcur,
                        "pricePer": pricePer,
                        "volumPer": volumPer
                    };

                    db.lpush(code, JSON.stringify(json));
                    db.ltrim(code, 0, 9);
                    socket.emit('realtimeRsp', json);

                }
            });

        });
    }).on('error', function () {
        console.log("获取数据出现错误");
    });

}

function insertpool(socket, db, code) {
    db.sadd("realpool", code);

    socket.emit('insertpoolRsp', "succesful");

}
function getpool(socket, db) {
    db.smembers("realpool", function (err, res) {
        if (err) {

        }
        else {
            socket.emit('getpoolRsp', res);
        }
    })
}
function delpool(socket, db, code) {
    db.srem("realpool", code);
}

exports.realtime = realtime;
exports.realtime_add = insertpool;
exports.getpool = getpool;
exports.realtime_del = delpool;
