var Qube = require('../../Qube');

Qube.module({
    name : 'testModule'
}, function testModule(callback) {
    console.log('test module is loading')
    Qube.on('testEvent', function requester(eventInfo, callback) {
        console.log('requesting')
        callback(null, []);
    }, function handler(eventInfo, data, callback) {
        console.log('handling')
        console.log(eventInfo)
        Qube.emit('test.echo', {
            foo : 'bar',
            hello : 'world!',
            got : eventInfo
        }, eventInfo.from);
        callback(null, {})
    });
})