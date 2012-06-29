
var io = require('socket.io');

var users = {};
var users_client = {};

exports.setup = function(server){
    var chat = io.listen(server).of('/chat');
    
    chat.authorization(function(data, fn){
        
    });
    chat.on('connect', function(socket){
        var handshaken = socket.manager.handshaken[socket.id];
        var pt = socket.passport = handshaken.passport;
        var name = socket.name = handshaken.name;
        
        if( users[pt] && users[pt].socket ){
            logger.info( users[pt].passport, " logined in another place.");
            users[pt].socket.emit("msg", "您已经在另一个地方登录。");
            users[pt].socket.disconnect()
        }
        socket.broadcast.emit("user-login", {"passport": pt, "name": name});
        users_client[pt] = name;
        users[pt] = {"passport": pt, "name": name, "socket": socket};
        
        socket.broadcast.emit("user-login", {"passport": pt, "name": name});
        users_client[pt] = name;
        users[pt] = {"passport": pt, "name": name, "socket": socket};
        
        socket.on("user-list", function(){
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
