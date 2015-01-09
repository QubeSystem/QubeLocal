var Qube = require('../../Qube');

Qube.module({
    name : 'testModule'
}, function testModule(args, callback) {
    Qube.on('client.testEvent', function requester(eventInfo, callback) {
        callback(null, []);
    }, function handler(eventInfo, data, callback) {
        Qube.emit('test.echo', {
            foo : 'bar',
            hello : 'world!',
            got : eventInfo
        }, eventInfo.from);
        callback(null, data);
    });
    callback({foo:'bar'});
});