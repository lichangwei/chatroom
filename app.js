var restjs = require('restjs');
var app = restjs.createServer({port: 8080});
var log4js = require("log4js");

app.static(__dirname + '/public');
app.static('/scripts', __dirname + '/../base');
app.static('/scripts', __dirname + '/../gesture');
app.static('/scripts', __dirname + '/../domtemp');

app.lookup(__dirname + '/server/resource');

require('./server/chatserver').setup(app.server);

    