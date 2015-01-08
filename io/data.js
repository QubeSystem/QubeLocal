var fs = require('fs');
var db = require('./db');

db.add('data')

exports.load = function load(key, callback) {
    fs.readFile('./data/' + key, {encoding:'utf8'}, function(err, data) {
        if (err) {
            console.error('Error on loading data', err, err.stack);
            return;
        }
        db.setString('data', key, data, callback);
    });
}

exports.save = function save(key, callback) {
    db.get('data', key, function(err, data) {
        if (err) {
            console.error('Error on saving data', err, err.stack);
            return;
        }
        fs.writeFile('./io/data/' + key, data, {encoding:'utf8'}, function(err) {
            if (err) {
                console.error('Error on saving data', err, err.stack);
                return;
            }
            db.set('data', key, null, callback);
        });
    });

}

exports.get = function get(key, callback) {
    db.get('data', key, callback);
}

exports.set = function set(key, value, callback) {
    db.set('data', key, value, callback);
}