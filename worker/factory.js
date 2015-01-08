var child = require('child_process').spawn;

exports.request = function request(language) {
    switch (language) {
        case 'Javascript':
            console.log('launching js process');
            var cp = child('node', ['main'], {
                cwd : './worker/language/QubeJS'
            });
            cp.stdout.setEncoding('utf8');
            cp.stderr.setEncoding('utf8');
            cp.stdout.on('data', console.log)
            cp.stderr.on('data', console.error);
            break;
        default :
            console.error('Language ' + language + ' is not supported');
    }
}

exports.release = function release(unit) {

}