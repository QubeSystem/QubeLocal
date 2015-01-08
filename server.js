var http = require('http');
var url = require('url');
var fs = require('fs');
var WSS = require('ws').Server;
var worker = require('./worker/workerRouter');
var client = require('./client/clientRouter');

var server = http.createServer(function(req, res) {
    function send(path) {
        fs.readFile(path, {encoding:'utf8'}, function(err, data) {
            if (err) {
                console.error('Error on sending app page', err, err.stack);
                res.end('Server error!');
                return;
            }
            res.end(data);
        });
    }
    switch (url.parse(req.url).pathname) {
        case '/app':
            send('./app/app.js');
            break;
        case '/style':
            send('./app/style.css');
            break;
        case '/ng':
            send('./app/lib/angular.min.js');
            break;
        case '/ngws':
            send('./app/lib/angular-websocket.min.js');
        default :
            send('./app/index.html');
    }
});

console.log('Creating websocket servers')

var wsWorker = new WSS({
    server : server,
    path : '/worker'
});

wsWorker.on('connection', function connection(ws) {
    console.log('A new worker is arrived!');
    ws.on('message', function(data) {
        if (ws.isRegistered) {
            return;
        }
        worker.addUnit(data, ws);
        ws.isRegistered = true;
    });
});

console.log('websocket for workers is started!')
worker.init();

var wsClient = new WSS({
    server : server,
    path : '/app'
});

wsClient.on('connection', function connection(ws) {
    console.log('A new client is joined!')
    ws.on('message', function(data) {
        if (ws.isRegistered) {
            return;
        }
        client.addUnit(data, ws);
        ws.isRegistered = true;
    })
});

server.listen(8080);