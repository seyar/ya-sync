var inherit = require('inherit');
var Handlers = require('../handlers/handlers');
var path = require('path');
var fs = require('fs');
var vow = require('vow');

var verbose = false;

var Download = inherit(/** @lends Download.prototype */ {
        /**
         * @constructor
         * @param {Object} options
         * @param {String} options.localPath
         * @param {String} options.remotePath
         * @param {Boolean} options.verbose
         */
        __constructor: function (options) {
            verbose = options.verbose;
            this._localPath = path.normalize(options.localPath + '/');
            this._remotePath = options.remotePath;

            this._handlers = new Handlers();

            this._run();
        },

        _run: function () {
            var fileName = '';
            var promise = {};
            if (isFolder(this._remotePath)) {
                promise = this._getList(this._remotePath);
            } else {
                var defer = vow.defer();
                defer.resolve([this._remotePath]);
                promise = defer.promise();
            }

            promise
                .then(function (files) {
                    if (!files.length) {
                        throw Error('No torrent files');
                    }
                    fileName = files[0];
                    return this._download(fileName);
                }, this)
                .then(function (buffer) {
                    if (!buffer.length) {
                        throw Error('Remote file ' + fileName + ' is not exists. Or empty');
                    }
                    var saveToFile = path.normalize([this._localPath, path.basename(fileName)].join('/'));
                    fs.open(saveToFile, 'wx', function (err, fd) {
                        if (err) {
                            if (err.code === 'EEXIST') {
                                throw Error(saveToFile + ' already exists.');
                                return;
                            } else {
                                throw err;
                            }
                        }

                        var stream = fs.createWriteStream(saveToFile);
                        stream.write(buffer);
                        stream.end();
                    });
                }, this)
                .then(function () {
                    writeLog('Removing ' + fileName);
                    this._handlers.remove(fileName);
                }, this)
                .fail(function (error) {
                    writeLog(error.toString());
                })
                .done();
        },

        _getList: function (folderName) {
            folderName = path.normalize(folderName);
            return this._handlers.getListFromRoot(path.basename(folderName))
                .then(function (data) {
                    writeLog('Listed ' + folderName);
                    return data;
                })
                .then(function (entries) {
                    return entries.map(function (entry) {
                        var size = entry['d:propstat'][0]['d:prop'][0]['d:getcontentlength'];
                        var isFile = Boolean(size);
                        if (isFile) {
                            return decodeURIComponent(entry['d:href']);
                        }
                    }).filter(Boolean);
                });
        },

        _download: function (file) {
            return this._handlers
                .download(path.normalize(file))
                .then(function (buffer) {
                    writeLog('Downloaded ' + file);
                    return buffer;
                });
        }
    });

function isFolder(path) {
    return path[path.length - 1] === '/';
}

function writeLog(message) {
    if (verbose) {
        process.stdout.write(message + '\n');
    }
}

module.exports = Download;
