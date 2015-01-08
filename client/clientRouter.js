var Unit = require('../unit');

var queue = [];
var addEvent = function addEvent(event) {
    queue.push(event);
}

exports.registerMain = function(funcAddEvent) {
    queue.forEach(function(each) {
        funcAddEvent(each);
    });
    addEvent = funcAddEvent;
}

var clients = {};

exports.addUnit = function(uid, connection, onDisconnect) {
    onDisconnect = onDisconnect || function(){};
    var unit = new Unit(connection, function() {
        delete clients[uid];
        onDisconnect();
    });
    unit.on('key', function(data) {
        addEvent({
            event : 'onKeyAction',
            info : data
        });
    });
    unit.on('custom', function(data) {
        addEvent(data);
    });
    clients[uid] = unit;
}

exports.emit = function(target, type, data) {
    clients[target].emit(type, data);
}