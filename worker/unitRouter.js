var async = require('async');
var Unit = require('../unit');
var db = require('../io/db');
var data = require('../io/data');

var eventQueue = [];
var loadQueue = [];
var saveQueue = [];

db.add('key');

var Router = module.exports = function Router(language, policy) {
    this.language = language || 'Javascript';
    this.policy = policy || {};
    this.policy.trigerDown = this.policy.trigerDown || 0.5;
    this.policy.actionDown = this.policy.actionDown || 0.5;
    this.policy.trigerUp = this.policy.trigerUp || 1.5;
    this.policy.actionUp = this.policy.actionUp || 2.0;

    this.units = [];
    this.tasks = [];
    this.callback = function(){};

    this.list = [];
    this.working = [];
    this.done = [];
}

Router.prototype.work = function work(tasks, callback) {
    var self = this;
    this.tasks = tasks.slice(0);
    this.list = Object.keys(self.tasks);
    this.callback = function() {
        //insert scaling code here
        self.done = [];
        callback();
    }
    if (this.units.length <= 0 || self.tasks.length <= 0) {
        this.callback();
    }
    while (this.units.length > 0 && this.list.length > 0) {
        this.order();
    }
}

Router.prototype.order = function order() {
    if (this.units.length <= 0 || this.list.length <= 0) {
        return;
    }
    var unit = this.units.shift();
    var id = this.list.shift();

    unit.emit('order', {
        id : id,
        event : this.tasks[id].event,
        info : this.tasks[id].info
    });
}

Router.prototype.answer = function answer() {
    var self = this;
    if (self.units.length <= 0 || self.working.length <= 0) {
        return;
    }
    var unit = self.units.shift();
    var workFlag = true;
    async.whilst(function() {
        return workFlag;
    }, function(callback) {
        var work = self.working.shift();
        async.each(work.data, function(each, cb) {
            db.get('key', each, function(err, value) {
                if (err) {
                    cb(err);
                    return;
                }
                if (value) {
                    self.working.push(work);
                    callback();
                }
                cb();
            })
        }, function(err) {
            if (err) {
                callback(err);
                return;
            }
            workFlag = false;
            var dataset = {};
            async.each(work.data, function(each, cb) {
                data.get(each, function(err, value) {
                    if (err) {
                        cb(err);
                        return;
                    }
                    dataset[each] = value;
                    cb();
                });
            }, function(err) {
                if (err) {
                    callback(err);
                    return;
                }
                unit.emit('answer', {
                    id : work.id,
                    event : self.tasks[work.id].event,
                    info : self.tasks[work.id].info,
                    data : dataset
                });
                callback();
            });
        });
    }, function(err) {
        if (err) {
            console.error('Error on answering to worker', err, err.stack);
            return;
        }
    });
}

Router.prototype.addUnit = function addUnit(connection, onDisconnect) {
    var self = this;
    var unit = new Unit(connection, function() {
        delete self.units[self.units.indexOf(unit)];
        onDisconnect();
    });
    function action() {
        self.units.push(unit);
        if (self.list.length > 0) {
            self.order();
        } else if (self.working.length > 0) {
            self.answer();
        } else if (self.done.length >= self.tasks.length) {
            self.callback();
        }
    }
    unit.on('ask', function(msg) {
        self.working.push({
            id : msg.id,
            data : msg.data
        });
        action();
    });
    unit.on('result', function(msg) {
        self.done.push({
            id : msg.id
        });
        for (var key in msg.data) {
            db.set('key', key);
            data.set(key, msg.data[key]);
        }
        action();
    });
    unit.on('event', function(msg) {
        addEvent(msg);
    })
    unit.on('load', function(msg) {
        addDataToLoad(msg.key);
    });
    unit.on('save', function(msg) {
        addDataToSave(msg.key);
    });
    unit.on('log', function(msg) {
        console.log(msg.log);
    });
    unit.on('err', function(msg) {
        console.error(msg.log);
    });
    self.units.push(unit);
}

var addEvent = function addEvent(event) {
    eventQueue.push(event);
}
var addDataToLoad = function addDataToLoad(key) {
    loadQueue.push(key);
}
var addDataToSave = function addDataToSave(key) {
    saveQueue.push(key);
}
Router.registerMain = function(funcAddEvent, funcAddDataToLoad, funcAddDataToSave) {
    addEvent = funcAddEvent;
    addDataToLoad = funcAddDataToLoad;
    addDataToSave = funcAddDataToSave;
    eventQueue.forEach(function(each) {
        addEvent(each);
    });
    loadQueue.forEach(function(each) {
        addDataToLoad(each);
    });
    saveQueue.forEach(function(each) {
        addDataToSave(each);
    });
}
