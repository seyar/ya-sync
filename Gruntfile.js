/**
 * Только локальное копирование
 *
 * @type {Boolean}
 */
LOCAL_ONLY = false;

/**
 * Только удаленное копирование
 *
 * @type {Boolean}
 */
REMOTE_ONLY = true;

/**
 * Источник
 *
 * @type {String}
 */
SOURCE = '/Volumes/FAT/media/photos/';

/**
 * Куда копировать. Локальное хранилище
 *
 * @type {String}
 */
DESTINATION_LOCAL = '/home/seyar/media/photos/';

/**
 * Куда копировать удаленное хранилище по ssh
 * требуются прокинутые ключи
 *
 * @type {{host: String, folder: String}}
 */
DESTINATION_REMOTE = {host: 'seyar@192.168.0.150', folder: '/home/seyar/photos/'};

var logger = require('./lib/logger');

module.exports = function (grunt) {
    var fs = require('fs');

    var srcExists = grunt.file.exists(SOURCE);
    var destExists = grunt.file.exists(DESTINATION_LOCAL);

    var rsync = {
        options: {
            args: ['--verbose'],
            exclude: ['.*', 'sorter*', 'video-sorter'],
            recursive: true,
            onStderr: function (data) {
                logger('/error.log', data);
            }
        }
    };
    if (srcExists && destExists && LOCAL_ONLY) {
        rsync.dist = {
            options: {
                src: SOURCE,
                dest: DESTINATION_LOCAL
            }
        };
    }
    if (srcExists && REMOTE_ONLY) {
        rsync.stage = {
            options: {
                src: SOURCE,
                dest: DESTINATION_REMOTE.folder,
                host: DESTINATION_REMOTE.host
                // delete: true // Careful this option could cause data loss, read the docs!
            }
        };
    }

    grunt.initConfig({
        rsync: rsync
    });

    grunt.loadNpmTasks('grunt-rsync');

    // Default task(s).
    grunt.registerTask('default', 'rsync');

};
