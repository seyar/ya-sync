var inherit = require('inherit');
var readdirp = require('readdirp');
var vow = require('vow');
var Handlers = require('./../handlers/handlers');
var config = require('./../config/config');
var path = require('path');

var WebdavRSync = inherit(/** @lends WebdavRSync.prototype */ {

    /**
     * Recursivly copies files to remove webdav server
     *
     * @name Copy
     * @constructor
     * @param {Object} options
     * @param {String} options.localRoot
     * @param {Boolean} options.verbose
     */
    __constructor: function (options) {
        /**
         * Local folder /Volumes/www/site1
         *
         * @type {String}
         */
        this._localRoot = path.normalize(options.localRoot + '/');

        this._verbose = options.verbose;

        /**
         * Remote root. eq / or backups/
         *
         * @type {String}
         */
        this._remoteRoot = path.normalize(config.remoteRoot + '/' + path.basename(this._localRoot));

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
        writeLog('Start', true);
        // create remote root folder.
        this._createRootFolder()
            // get local dirs
            .then(function () {
                return this._getEntries(this._localRoot, 'directories');
            }, this)
            .then(function (data) {
                this._localDirectories = data;
            }, this)
            // get local files
            .then(function () {
                return this._getEntries(this._localRoot, 'files');
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
                throw new Error(err);
            }).done(function () {
                writeLog('All files uploaded', true);
            });
    },

    /**
     * Shows the progress
     */
    _showProgress: function () {
    },

    /**
     * Creates remote root folder
     *
     * @returns {Promise}
     */
    _createRootFolder: function () {
        var remoteRootName = path.basename(this._localRoot);
        return this._handlers.mkdir(remoteRootName)
            .then(function () {
                writeLog('root folder ' + remoteRootName + ' created', this._verbose);
            }, this)
            .fail(function (err) {
                throw new Error(err);
            });
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
            }, this)
            .fail(function (error) {
                throw new Error(error);
            });
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

        var folderName = this._localDirectories[i];

        return this._mkdir(folderName)
            .then(function () {
                return this._recirsiveMkdir(++i);
            }, this)
            .fail(function (error) {
                throw Error(error);
            });
    },

    /**
     * Uploads file
     *
     * @param {String} pth
     * @returns {Promise}
     */
    _uploadFile: function (pth) {
        var dir = path.dirname(pth);

        return this._handlers.getList(dir)
            .then(function (entries) {
                var isExist = false;
                if (entries) {
                    entries.forEach(function (entry) {
                        var size = entry['d:propstat'][0]['d:prop'][0]['d:getcontentlength'];
                        var isFile = Boolean(size);
                        if (isFile) {
                            var entryName = decodeURIComponent(entry['d:href']);
                            if (entryName.indexOf(pth) !== -1) {
                                isExist = true;
                            }
                        }
                    });
                }

                if (!isExist) {
                    return this._handlers.upload(pth, this._localRoot);
                } else {
                    this._showProgress();
                    return false;
                }
            }, this)
            .then(function (data) {
                if (data === true) {
                    writeLog('file ' + pth + ' uploaded', this._verbose);
                }
                return data;
            }, this)
            .fail(function (error) {
                throw Error(error);
            });
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
                }, this)
                .fail(function (error) {
                    throw Error(error);
                });
        }
    },

    /**
     * Find list of files or directiories
     *
     * @param {String} root folder
     * @param {files|directories} entryType
     * @returns {Promise}
     */
    _getEntries: function (root, entryType) {
        entryType = entryType || 'directories';
        var defer = vow.defer();
        var entries = [];
        readdirp({root: root, entryType: entryType, fileFilter: '!.*'})
            .on('data', function (entry) {
                entries.push(path.basename(root) + '/' + entry.path);
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

module.exports = WebdavRSync;
