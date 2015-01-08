var ws = require('ws');
var setting = require('../setting');
var client = new ws(setting.server);

var listeners = {};
var queue = [];

client.on('open', function() {
    client.isOpen = true;
    client.send('Javascript');
    queue.forEach(function(each) {
        client.send(each);
    });
    client.on('message', function(msg) {
        var message = JSON.parse(msg);
        if (!message.type || !message.data || !listeners[message.type]) {
            return;
        }
        listeners[message.type](message.data);
    });
})

exports.on = function(type, listener) {
    listeners[type] = listener;
};

exports.emit = function(type, data, target) {
    var message = JSON.stringify({
        type : type,
        data : data,
        target : target
    });
    if (client.isOpen) {
        client.send(message);
    } else {
        queue.push(message);
    }
};