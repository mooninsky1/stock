//引入redis
var redis = require("redis");
function login(socket,user,password,db)
{
    console.log(user+password);
    db.get("Account:"+user,function(err,res){
        console.log(res);
        if(res == password){
            socket.emit("loginRsp",0);
        }
        else{
            socket.emit("loginRsp",-1);
        }
    })
}
module.exports = login;