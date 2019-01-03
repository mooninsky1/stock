var express = require('express');
//引入redis
var redis = require("redis");
var realtimestock = require('./js/realtime');
var app = express();
var  io = require('socket.io').listen(9081); 
var  fs = require('fs');
var stock = require('./js/stock.js');
var login = require("./js/login")

//创建redis客户端
var db = redis.createClient("6379", "192.168.17.141");
//连接错误处理
db.on("error", function (error) {
    console.log(error);
});
//redis验证 （如果redis没有开启验证，此配置可以不写）
db.auth("123456");
db.select("15", function (error) {
    if(error){
        console.log(error);
    }
});

//会打开目录html下的index.html 静态,
app.use(express.static(__dirname + '/html'));

app.listen(9082);

io.sockets.on('connection', function (socket){
    socket.on('clientmsg', function (data){
      console.log(data);
       socket.emit('servermsg',data);
    });
     socket.on('login',function(data){
        console.log("recve login event");
        login(socket,data.user,data.password,db);
    });
    socket.on('realtime',function(data){
        stock.realtime(socket,db,data.code);
    });
    socket.on('realtime_del',function(data){
        realtimestock.realtime_del(socket,db,data.code);
    });
    socket.on('realtime_add',function(data){
        realtimestock.realtime_add(socket,db,data.code);
    });
    socket.on('realtime_stop',function(data){
         stock.realtime_stop(socket,db);
    })
    socket.on('history',function(data){
        stock.realtime(socket);
    });
}); 
console.log("http://192.168.31.249:9082")