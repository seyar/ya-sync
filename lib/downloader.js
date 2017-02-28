/**
 * @name downloadTorrents
 */
var inherit = require('inherit');
var Handlers = require('../handlers/handlers');
var config = require('../config/config');
var path = require('path');
var fs = require('fs');

var verbose = false;

var downloader = inherit(/** @lends downloader.prototype */ {
    /**
     * @constructor
     * @param {Object} options
     * @param {String} options.destination
     * @param {Boolean} options.verbose
     */
    __constructor: function (options) {
        verbose = options.verbose;
        this._destination = options.destination;

        this._handlers = new Handlers();

        this._run();
    },

    _run: function () {
        var fileName = '';
        this._getList(config.torrentsDownloader.folder + '/')
            .then(function (entries) {
                return entries.map(function (entry) {
                    var size = entry['d:propstat'][0]['d:prop'][0]['d:getcontentlength'];
                    var isFile = Boolean(size);
                    if (isFile) {
                        return decodeURIComponent(entry['d:href']);
                    }
                }).filter(Boolean);
            })
            .then(function (files) {
                if (!files.length) {
                    throw Error('No torrent files');
                }
                fileName = files[0];
                return this._download(fileName);
            }, this)
            .then(function (buffer) {
                var stream = fs.createWriteStream(path.normalize(
                    [this._destination, path.basename(fileName)].join('/'))
                );
                stream.write(buffer);
                stream.end();
            }, this)
            .then(function () {
                writeLog('Removing ' + fileName);
                this._handlers.remove(fileName);
            }, this)
            .fail(function (error) {
                writeLog(error.toString());
            })
            .done(function () {
                writeLog('Done.');
            });
    },

    _getList: function (folderName) {
        folderName = path.normalize(folderName);
        return this._handlers.getListFromRoot(path.basename(folderName))
            .then(function (data) {
                writeLog('Listed ' + folderName);
                return data;
            });
    },

    _download: function (file) {
        return this._handlers.download(path.normalize(file));
    }
});

function writeLog(message) {
    if (verbose) {
        process.stdout.write(message + '\n');
    }
}

module.exports = downloader;
