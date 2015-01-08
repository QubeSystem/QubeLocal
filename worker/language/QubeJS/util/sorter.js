var util = require('./util');
var async = require('async');

var modules = [];

exports.add = function(meta, module) {
    meta.require = meta.require || [];
    meta.after = meta.after || [];
    modules.push({
        meta : meta,
        module : module
    });
};

exports.execute = function() {
    if (modules.length <= 0) return;

    var returns = {};
    var resultNames = [];

    var names = util.childArr(util.childArr(modules, 'meta'), 'name');

    modules.forEach(function(module1) {
        module1.meta.require.forEach(function(require1) {
            if (names.indexOf(require1) === -1) {
                throw new Error('Missing required module: ' + require1);
            }
        });
    });
    var count = 0;
    var flag = true;
    async.whilst(function() {
        return modules.length > 0 && flag;
    }, function(callback) {
        if (++count > names.length *3) {
            throw new Error('Circular loop detected... I think');
        }

        var module1 = modules.pop();
        var args = {};
        var after = module1.meta.after;
        for (var i=0;i<after.length;i++) {
            if (resultNames.indexOf(after[i]) < 0 && names.indexOf(after[i])) {
                modules.push(module1);
                flag = false;
                callback();
                return;
            }
            args[after[i]] = returns[after[i]];
        }
        returns[module1.meta.name] = module1.module(args);
        callback();
    }, function(err) {

    });
};