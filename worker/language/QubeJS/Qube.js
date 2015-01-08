var sorter = require('./util/sorter');
var eventManager = require('./util/event');
var socket = require('./util/socket');

/*
 meta = {
 name : String (required)
 require : Array<String>
 after : Array<String>
 }
 module = function(afterModules) - array of modules' returned object. undefined when not exist.

 create new module.
 */
exports.module = function (meta, module) {
    sorter.add(meta, module);
}

/*
 event = String
 requests = [
 String..
 ]
 handler = function(eventObj, requestObj)

 register event handler
 */
exports.on = function (event, requester, handler) {
    eventManager.on(event, requester, handler);
}

/*
 event = String
 eventObj = Object

 emit new event
 */
exports.emit = function (event, eventObj, target) {
    socket.emit('event', {
        event : event,
        info : eventObj,
        target : target
    });
}

/*
 key = String

 load data from storage to memory
 */
exports.load = function (key) {
    socket.emit('load', {
        key : key
    })
}

/*
 key = String
 data = Object

 save data from memory to storage
 */
exports.save = function (key) {
    socket.emit('save', {
        key : key
    })
}