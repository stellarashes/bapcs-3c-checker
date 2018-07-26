module.exports = function (duration) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, duration)
    });
};