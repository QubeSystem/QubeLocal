var async = require('async');
var Router = require('./unitRouter');
var factory = require('./factory');

var routers = {};

exports.addUnit = function addUnit(language, connection, onDisconnect) {
    if (!routers[language]) {
        routers[language] = new Router(language);
    }
    routers[language].addUnit(connection, onDisconnect);
}

exports.work = function work(tasks, callback) {
    async.each(Object.keys(routers), function(each, cb) {
        var router = routers[each];
        router.work(tasks, cb);
    }, function(err) {
        if (err) {
            console.error('Error on game loop', err, err.stack);
            return;
        }
        callback();
    });
}

exports.init = function init() {
    for (var i=0;i<3;i++) {
        factory.request('Javascript');
    }
}