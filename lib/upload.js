var inherit = require('inherit');
var readdirp = require('readdirp');
var vow = require('vow');
var Handlers = require('./../handlers/handlers');
var config = require('./../config/config');
var path = require('path');
var fs = require('fs');

var Upload = inherit(/** @lends Upload.prototype */ {

    /**
     * Recursivly copies files to remove webdav server
     *
     * @name Upload
     * @constructor
     * @param {Object} options
     * @param {String} options.localPath
     * @param {String} options.remotePath
     * @param {Boolean} options.verbose
     */
    __constructor: function (options) {
        /**
         * Local folder /Volumes/www/site1
         *
         * @type {String}
         */
        this._localPath = path.normalize(options.localPath + '/');

        this._verbose = options.verbose;

        /**
         * Remote root. eq / or backups/
         *
         * @type {String}
         */
        this._remotePath = path.normalize(options.remotePath + '/');

        /**
         * Api handlers
         *
         * @type {Handlers}
         */
        this._handlers = new Handlers();

        /**
         * Local directories
         *
         * @type {Array}
         */
        this._localDirectories = [];

        /**
         * Local files
         *
         * @type {Array}
         */
        this._localFiles = [];
    },

    /**
     * Runs copying
     */
    run: function () {
        writeLog('Start', this._verbose);
        fs.stat(this._localPath, function (err) {
            if (err) {
                writeLog(err.toString(), true);
                return ;
            }

            this._getEntries(this._localPath, 'directories')
                .then(function (data) {
                    this._localDirectories = data;
                }, this)
                .then(function () {
                    return this._getEntries(this._localPath, 'files');
                }, this)
                .then(function (files) {
                    this._localFiles = files;
                }, this)
                .then(function () {
                    // creating remote folders
                    // if folders exists not big deal
                    return this._recirsiveMkdir();
                }, this)
                .then(function () {
                    return this._recursiveUploadFiles();
                }, this)
                .fail(function (err) {
                    console.trace(err);
                    writeLog(err.toString(), true);
                })
                .done(function () {
                    writeLog('All files uploaded', this._verbose);
                }, this);
        }.bind(this));
    },

    /**
     * Shows the progress
     */
    _showProgress: function () {
    },

    /**
     * Ascending sort function. For creating folders by depth
     *
     * @param {String} a
     * @param {String} b
     * @returns {Number}
     */
    _sortFunction: function (a, b) {
        return a.length - b.length;
    },

    /**
     * Creates one folder
     *
     * @param {String} folderName
     * @returns {Promise}
     */
    _mkdir: function (folderName) {
        return this._handlers.getList(path.dirname(folderName))
            .then(function (entries) {
                var isExist = false;
                entries.forEach(function (entry) {
                    var size = entry['d:propstat'][0]['d:prop'][0]['d:getcontentlength'];
                    var isFile = Boolean(size);
                    if (!isFile) {
                        var entryName = decodeURIComponent(entry['d:href']);
                        if (entryName.indexOf(folderName) !== -1) {
                            isExist = true;
                        }
                    }
                });

                if (!isExist) {
                    return this._handlers.mkdir(folderName);
                } else {
                    this._showProgress();
                    return false;
                }
            }, this)
            .then(function (result) {
                if (result) {
                    writeLog('folder ' + folderName + ' created', this._verbose);
                }
                return result;
            }, this);
    },

    /**
     * Create folders
     *
     * @param {Number} i array iterator
     * @returns {Promise}
     */
    _recirsiveMkdir: function (i) {
        i = i || 0;

        if (i > this._localDirectories.length - 1) {
            return true;
        }

        if (!this._localDirectories[i]) {
            return vow.reject('Folder with i=' + i + ' not found');
        }

        var folderName = this._remotePath + this._localDirectories[i];

        return this._mkdir(folderName)
            .then(function () {
                return this._recirsiveMkdir(++i);
            }, this);
    },

    /**
     * Uploads file
     *
     * @param {String} filename
     * @returns {Promise}
     */
    _uploadFile: function (filename) {
        var remoteDir = path.normalize(this._remotePath + path.dirname(filename));
        return this._handlers.getList(remoteDir)
            .then(function (entries) {
                var isExist = false;
                if (entries) {
                    entries.forEach(function (entry) {
                        var size = entry['d:propstat'][0]['d:prop'][0]['d:getcontentlength'];
                        var isFile = Boolean(size);
                        if (isFile) {
                            var entryName = decodeURIComponent(entry['d:href']);
                            isExist = entryName === this._remotePath + filename;
                        }
                    }.bind(this));
                }

                if (!isExist) {
                    return this._handlers.upload(this._localPath + filename, this._remotePath + filename);
                } else {
                    this._showProgress();
                    return false;
                }
            }, this)
            .then(function (data) {
                if (data === true) {
                    writeLog('file ' + filename + ' uploaded', this._verbose);
                }
                return data;
            }, this);
    },

    /**
     * Recursive Upload Files
     *
     * @param {Number} i localFiles iterator
     * @returns {Promise}
     */
    _recursiveUploadFiles: function (i) {
        i = i || 0;

        if (i > this._localFiles.length - 1) {
            return true;
        }

        var path = this._localFiles[i];
        if (path) {
            return this._uploadFile(path)
                .then(function () {
                    return this._recursiveUploadFiles(++i);
                }, this);
        }
    },

    /**
     * Find list of files or directiories
     *
     * @param {String} path
     * @param {files|directories} entryType
     * @returns {Promise}
     */
    _getEntries: function (path, entryType) {
        entryType = entryType || 'directories';
        var defer = vow.defer();
        var entries = [];
        readdirp({root: path, entryType: entryType, fileFilter: '!.*'})
            .on('data', function (entry) {
                entries.push(entry.path);
            }.bind(this))
            .on('end', function () {
                entries.sort(this._sortFunction);
                defer.resolve(entries);
            }.bind(this))
            .on('error', function (error) {
                defer.reject('error ' + error.toString());
            });

        return defer.promise();
    }
});

function writeLog(message, verbose) {
    if (verbose) {
        var date = new Date();
        console.info([
            '[',
            date.getHours(), ':', date.getMinutes(), ' ', date.getDate(), '.', date.getMonth(), '.',
            date.getFullYear(),
            '] ',
            message.toString()
        ].join(''));
    }
}

module.exports = Upload;
