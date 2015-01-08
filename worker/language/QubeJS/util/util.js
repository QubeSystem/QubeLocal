exports.childArr = function(arr, childName) {
    var result = [];
    arr.forEach(function(each) {
        result.push(each[childName]);
    });
    return result;
}

exports.mergeArr = function(arr1, arr2) {
    var result = arr1.slice(0);
    arr2.forEach(function(each) {
        if (result.indexOf(each) < 0) {
            result.push(each);
        }
    });
    return result;
}