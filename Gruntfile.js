module.exports = function (grunt) {
    var fs = require('fs');

    /**
     * Дополняет строку слева
     */
    function lpad(str, padString, length) {
        while (str.length < length) {
            str = padString + str;
        }
        return str;
    }

    /**
     * Записывает лог
     *
     * @param {String} fileName
     * @param {Buffer} buffer
     */
    function write(fileName, buffer) {
        fs.open(__dirname + fileName, 'a', function (err, fd) {
            if (err) {
                throw 'error opening file: ' + err;
            } else {
                var date = new Date();
                var d = lpad(date.getDate(), '0', 2);
                var m = date.getMonth() + 1;
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
    }

    grunt.initConfig({
        rsync: {
            options: {
                args: ['--verbose'],
                exclude: ['.*', 'sorter*', 'video-sorter'],
                recursive: true,
                onStderr: function (data) {
                    write('/error.log', data);
                }
            },
            dist: {
                options: {
                    src: '/Users/seyar/Documents/photos/',
                    dest: '/Users/seyar/Documents/photos-bak/'
                }
            },
            stage: {
                options: {
                    src: '/Users/seyar/Documents/photos/',
                    dest: '/home/seyar/photos/',
                    host: 'seyar@192.168.0.150'
                    // delete: true // Careful this option could cause data loss, read the docs!
                }
            }

            // ,
            // prod: {
            //    options: {
            //        src: '../dist/',
            //        dest: '/var/www/site',
            //        host: 'user@live-host',
            //        delete: true // Careful this option could cause data loss, read the docs!
            //    }
            // }
        }
    });

    grunt.loadNpmTasks('grunt-rsync');

    // Default task(s).
    grunt.registerTask('default', 'rsync');

};
