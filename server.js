var express = require('express');
var app = express();
var  io = require('socket.io').listen(8081); 
var  fs = require('fs');
 var stock = require('./js/stock.js');
// var oss = require('./js/oss.js');
// var db = require('./js/db.js');

//会打开目录html下的index.html 静态,
app.use(express.static(__dirname + '/html'));

app.listen(8082);

io.sockets.on('connection', function (socket){
    socket.on('clientmsg', function (data){
      console.log(data);
       socket.emit('servermsg',data);
    });
    socket.on('login',function(data){
        console.log("recve login event");
        stock(socket,data.user,data.password);
    });
}); 
console.log("http://192.168.31.249:8082")