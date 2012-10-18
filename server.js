
var app = require('http').createServer( onHttpRequest )
  , io  = require('socket.io').listen(app)
  , fs  = require('fs')
  , url = require("url");

var port     = 7777;
var serverIP = getIP();


app.listen(port);


function onHttpRequest(request, res) {

  var pathname = url.parse(request.url).pathname;
  console.log("Request for " + pathname + " received.");

  fs.readFile(__dirname + pathname,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading html');
    }

	var str = data.toString().replace( "{IP}", serverIP );
	str = str.replace( "{PORT}", port );
    res.writeHead(200, {
		'Access-Control-Allow-Origin' : '*'
    } );
    res.end( str );
  });
}


function getIP() {
  var os = require('os');
  var ifaces = os.networkInterfaces();
  var ip = "";

  for (var dev in ifaces) {
    var alias=0;
    ifaces[dev].forEach(function(details){
      if (details.family=='IPv4' &&
          details.address != "127.0.0.1" &&
          dev.indexOf( "VMware" ) == -1 ) {
          
          ip = details.address;
      }
    });
  }

  console.log( "IP:" + ip );
  return ip;
}

///////////////////////////////////////////////////////////////

// クライアントが接続してきたときの処理

io.of('/app').on('connection', function(client) {
  console.log(client.sessionid + ' is connected.');

  // メッセージを受けたときの処理
  client.on('message', function(msg) {

    console.log( "Receive app message: " + msg );
    var obj = JSON.parse(msg);

    switch( obj.method ) {
      case "registerApp":
        emitNotifyAppInfo( obj.params[0], 0, true );
        break;

      case "setController":
        emitSetControllerURL( obj.params[1] );
        break;

      case "sendApplicationMessage":
        emitSendApplicationMessage2( obj.params[1] );
        break;
        
    }
  });

  // クライアントが切断したときの処理
  client.on('disconnect', function(){
    console.log(client.sessionid + ' disconneced');
  });
});


function emitSendApplicationMessage2( message ) {
  var obj = {
    method:"sendApplicationMessage2",
    params:[ message ],
    id:1,
    version:"1.0"
  };
  
  emitScalarApiClient( obj );
}

function emitNotifyAppInfo( name, id, connected ) {
  var obj = {
    method:"notifyAppInfo",
    params:[ connected, [ { "name":name, "id":id } ] ],
    id:1,
    version:"1.0"
  };

  emitScalarApiClient( obj );
}

function emitSetControllerURL( url ) {
  var obj = {
    method:"setControllerURL",
    params:[ url ],
    id:1,
    version:"1.0"
  };
  
  emitScalarApiClient( obj );
}

function emitScalarApiClient( obj ) {
  io.of('/client').send( JSON.stringify(obj) );
}

//////////////////////////////////////////////////////////////////////

io.of('/client').on('connection', function(client) {
  console.log(client.sessionid + ' is connected.');

  // メッセージを受けたときの処理
  client.on('message', function(msg) {

    console.log( "Receive client message: " + msg );
    var obj = JSON.parse(msg);

    switch( obj.method ) {
      case "connectController":
        emitNotifyClientInfo( 0, true );
        break;

      case "sendClientMessage":
        emitSendClientMessage2( obj.params[0] );
        break;
        
    }
  });

  // クライアントが切断したときの処理
  client.on('disconnect', function(){
    console.log(client.sessionid + ' disconneced');
  });
});


function emitNotifyClientInfo( id, connected ) {
  var obj = {
    method:"notifyClientInfo",
    params:[ id, connected ],
    id:1,
    version:"1.0"
  };
  
  emitScalarApiApp( obj );
}

function emitSendClientMessage2( message ) {
  var obj = {
    method:"sendClientMessage2",
    params:[ message ],
    id:1,
    version:"1.0"
  };
  
  emitScalarApiApp( obj );
}

function emitScalarApiApp( obj ) {
  io.of('/app').send( JSON.stringify(obj) );
}



