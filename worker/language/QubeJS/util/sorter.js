var util = require('./util');
var async = require('async');

var modules = [];

exports.add = function(meta, module) {
    meta.after = meta.after || [];
    modules.push({
        meta : meta,
        module : module
    });
};

exports.execute = function(sorterCallback) {
    if (modules.length <= 0) return;

    var returns = {};
    var resultNames = [];
    resultNames.shift();

    var names = util.childArr(util.childArr(modules, 'meta'), 'name');

    var count = 0;
    var flag = true;
    async.whilst(function() {
        return modules.length > 0 && flag;
    }, function(callback) {
        if (++count > names.length *3) {
            throw new Error('Circular loop detected... I think');
        }

        var module1 = modules.shift();
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
        module1.module(args, function(result) {
            returns[module1.meta.name] = result;
            callback();
        });
    }, function(err) {
        sorterCallback();
    });
};