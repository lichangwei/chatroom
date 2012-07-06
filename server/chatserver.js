
var io = require('socket.io');

var logger = require('log4js').getLogger(__filename);

var users = {};
var users_client = {};

exports.setup = function(server){
    var chat = io.listen(server).of('/chat');
    
    chat.authorization(function(data, fn){
        var cookie = data.headers ? data.headers.cookie : "",
            sid;
        if( cookie && cookie.match(/sid=([^;]+)/) ){
            sid = RegExp.$1;
        }
        logger.debug("get session info: " + sid);
        if(cookie2user[sid]){console.log('cookie2user[sid]');
            data.passport = cookie2user[sid];
            fn(null, true);
        }
    });
    chat.on('connection', function(socket){logger.info(0);
        var handshaken = socket.manager.handshaken[socket.id];
        var pt = socket.passport = handshaken.passport;
        var name = socket.name = handshaken.passport;
        logger.info(1);
        if( users[pt] && users[pt].socket ){
            logger.info( users[pt].passport, " logined in another place.");
            users[pt].socket.emit("msg", "您已经在另一个地方登录。");
            users[pt].socket.disconnect()
        }logger.info(2);
        socket.broadcast.emit("user-login", {"passport": pt, "name": name});
        users_client[pt] = name;
        users[pt] = {"passport": pt, "name": name, "socket": socket};
        logger.info(3);
        socket.broadcast.emit("user-login", {"passport": pt, "name": name});
        users_client[pt] = name;
        users[pt] = {"passport": pt, "name": name, "socket": socket};
        logger.info(4);
        socket.on("user-list", function(){
            logger.info('get user list');
            socket.emit("user-list", users_client);
        });
        socket.on("msg", function( msg ){
            if( !msg.msg || !msg.to ) return;
            // XSS
            msg.msg = msg.msg.replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
            
            var to = msg.to;
            msg.toname = users_client[to];
            msg.from = socket.passport;
            msg.fromname = socket.name;
            if( to === "all" ){
                chat.emit("msg", msg);
            }else{
                if( !users[to] || !users[to].socket){
                    return socket.emit("user-offline", msg.toname);
                }
                socket.emit("msg", msg);
                users[to].socket.emit("msg", msg);
            }
        });
        
        function exit(){
            var pt = socket.passport;
            socket.broadcast.emit("user-logout", {passport: pt, name: socket.name})
            delete users[pt];
            delete users_client[pt];
        }
        socket.on("logout", function(){
            socket.emit("disconnect");
            socket.disconnect();
        });
        socket.on("disconnect", exit);
    });
}

exports.set = function(cookie, user){
    cookie2user[cookie] = user;
}

var cookie2user = {};
