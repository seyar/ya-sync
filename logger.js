var fs = require('fs');
/**
 * Записывает лог
 *
 * @name logger
 * @param {String} fileName
 * @param {Buffer} buffer
 */
module.exports = function (fileName, buffer) {
    /**
     * Дополняет строку слева
     */
    function lpad(str, padString, length) {
        while (str.length < length) {
            str = padString + str;
        }
        return str;
    }

    fs.open(__dirname + fileName, 'a', function (err, fd) {
        if (err) {
            throw 'error opening file: ' + err;
        } else {
            var date = new Date();
            var d = lpad(date.getDate(), '0', 2);
            var m = lpad(String(date.getMonth() + 1), '0', 2);
            var y = date.getFullYear();
            var h = lpad(date.getHours(), '0', 2);
            var i = lpad(date.getMinutes(), '0', 2);
            var s = lpad(date.getSeconds(), '0', 2);
            var fulldate = 'd.m.y h:i:s'
                    .replace('d', d)
                    .replace('m', m)
                    .replace('y', y)
                    .replace('h', h)
                    .replace('i', i)
                    .replace('s', s) + ' ';
            var dateBuffer = new Buffer(fulldate);
            var newBuffer = Buffer.concat([dateBuffer, buffer]);
            fs.writeSync(fd, newBuffer, 0, newBuffer.length, null, function (err) {
                if (err) {
                    throw 'error writing file: ' + err;
                }
                fs.close(fd);
            });
        }
    });
};
