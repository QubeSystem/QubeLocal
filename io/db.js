var level = require('level');
var dbs = {};

exports.add = function add(table) {
    if (dbs[table]) return;
    dbs[table] = level('./io/db/' + table);
}

exports.get = function get(table, key, callback) {
    if (!dbs[table]) return;
    callback = callback || function(){};
    dbs[table].get(key, function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, JSON.parse(data));
    });
}

exports.set = function set(table, key, value, callback) {
    exports.setString(table, key, JSON.stringify(value), callback);
}

exports.setString = function setString(table, key, value, callback) {
    console.log('setString')
    if (!dbs[table]) {
        console.log('no table')
        callback();
        return;
    }
    if (!value) {
        dbs[table].del(key, callback || function(){});
    }
    dbs[table].put(key, value, callback || function(){});
}