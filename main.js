process.on('uncaughtException', function(err) {
    console.error('ERROR!!!!!!!!!', err, err.stack);
});

require('./server');
var client = require('./client/clientRouter');
var ur = require('./worker/unitRouter');

var eventQueue = [];
var loadQueue = [];
var saveQueue = [];

var addEvent = function addEvent(event) {
    if (event.target) {
        client.emit(event.target, 'custom', event);
    }
    eventQueue.push(event);
}
client.registerMain(addEvent);
ur.registerMain(addEvent, loadQueue.push, saveQueue.push);

var async = require('async');
var data = require('./io/data');
var worker = require('./worker/workerRouter');
var setting = require('./setting');

var tickTime = Math.floor(1000/setting.maxTPS);

var timeFlag = true;
var eventFlag = true;

function loop() {
    if (!timeFlag || !eventFlag) return;
    timeFlag = eventFlag = false;

    setTimeout(function() {
        timeFlag = true;
        loop();
    }, tickTime);

    async.each(loadQueue, function(key, cb) {
        data.load(key, cb);
    }, function(err) {
        if (err) {
            console.error('Error on loading data', err, err.stack);
        }
        worker.work(eventQueue, function() {
            async.each(saveQueue, function(key, cb) {
                data.save(key, cb);
            }, function(err) {
                if (err) {
                    console.error('Error on saving data', err, err.stack);
                }
                eventQueue = [];
                eventFlag = true;
                loop();
            });
        });
    });
}

loop();