var async = require('async');
var util = require('./util');
var socket = require('./socket');

var registry = {};

exports.on = function(event, requester, handler) {
    if (!registry[event]) {
        registry[event] = [];
    }
    registry[event].push({
        requester : requester,
        handler : handler
    });
};

function order(input) {
    if (!registry[input.event]) {
        socket.emit('ask', {
            id : input.id,
            data : []
        });
        return;
    }
    var requests = [];
    async.each(registry[input.event], function(each, cb) {
        each.requester(input.info, function(err, request) {
            if (err) {
                socket.emit('err', 'Error on handling event\'s data requester');
                socket.emit('err', err);
                socket.emit('err', err.stack);
                cb();
                return;
            }
            util.mergeArr(requests, request);
            cb();
        });
    }, function() {
        socket.emit('ask', {
            id : input.id,
            data : requests
        });
    });
}

function answer(input) {
    if (!registry[input.event]) {
        socket.emit('result', {
            id : input.id,
            data : {}
        });
        return;
    }

    var saves = {};

    async.eachSeries(registry[input.event], function(elem, cb) {
        elem.handler(input.info, input.data, function(err, output) {
            if (err) {
                socket.emit('err', 'Error on executing event handlers for event ' + event);
                socket.emit('err', err);
                socket.emit('err', err.stack);
                cb();
                return;
            }
            for (var key in output) {
                if (input.data[key]) {
                    saves[key] = output[key];
                }
            }
            cb();
        });
    }, function() {
        socket.emit('result', {
            id : input.id,
            data : saves
        });
    });
}

exports.init = function() {
    socket.on('answer', answer);
    socket.on('order', order);
}