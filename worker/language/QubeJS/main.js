process.on('uncaughtException', function(err) {
    console.error('ERROR!!!!!!!', err, err.stack);
});

var fs = require('fs');
var sorter = require('./util/sorter');
var modules = fs.readdirSync('./module');

modules.forEach(function(module) {
    require('./module/' + module + '/main');
});

sorter.execute();

require('./util/event');