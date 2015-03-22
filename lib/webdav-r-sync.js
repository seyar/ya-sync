var inherit = require('inherit');
var readdirp = require('readdirp');
var vow = require('vow');
var Handlers = require('./../handlers/handlers');
var config = require('./../config/config');
var path = require('path');
var fs = require('fs');

var WebdavRSync = inherit(/** @lends WebdavRSync.prototype */ {

    /**
     * Recursivly copies files to remove webdav server
     *
     * @name Copy
     * @constructor
     */
    __constructor: function () {
        /**
         * Local folder /Volumes/www/site1
         *
         * @type {String}
         */
        this._localRoot = config.disk.localRoot;

        /**
         * Remote root. eq / or backups/
         *
         * @type {String}
         */
        this._remoteRoot = config.disk.remoteRoot;

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
        this._directories = [];

        /**
         * Local files
         *
         * @type {Array}
         */
        this._files = [];

        /**
         * Remote directories
         *
         * @type {Array}
         */
        this._remoteDirectories = [];

        /**
         * Promises for remote async recursive get folder contents
         *
         * @type {Array}
         */
        this._listPromises = [];

        /**
         * Remote files
         *
         * @type {Array}
         */
        this._remoteFiles = [];

        fs.exists(this._localRoot, function (exists) {
            if (exists) {
                this.run();
            } else {
                console.info('%s folder not found', this._localRoot);
            }
        }.bind(this));
    },

    /**
     * Runs copying
     */
    run: function () {
        this._createRootFolder()
            .then(function () {
                // put result to this._remoteDirectories
                return this._getRemoteEntries(path.basename(this._localRoot), 'directories');
            }, this)
            .then(function () {
                // TODO to do with 'end' of all promises event
                return vow.delay(true, 2000);
                // return vow.allResolved(this._listPromises);
            }, this)
            .then(function () {
                return this._getEntries(this._localRoot, 'directories');
            }, this)
            .then(function (data) {
                this._remoteDirectories.sort(this._sortFunction);

                // first get files from directories array
                this._remoteFiles = this._formatResponse(this._remoteDirectories, 'files');
                this._remoteDirectories = this._formatResponse(this._remoteDirectories, 'directories');

                data.sort(this._sortFunction);
                this._directories = this._arrayDiff(data, this._remoteDirectories);
            }, this)
            .then(function () {

                // creating folders
                return this._recirsiveMkdir(0, vow.defer());
            }, this)
            .then(function () {
                return this._getEntries(this._localRoot, 'files');
            }, this)
            .then(function (files) {

                // uploading
                this._files = this._arrayDiff(files, this._remoteFiles);
                return this._uploadFile(0, vow.defer());
            }, this)
            .fail(function (err) {
                throw new Error(err);
            }).done(function () {
                console.info('Files uploaded');
            });
    },

    /**
     * Creates remote root folder
     *
     * @returns {Promise}
     */
    _createRootFolder: function () {
        var remoteRootName = path.basename(this._localRoot);
        return this._handlers.mkdir(remoteRootName, true)
            .then(function () {
                console.info('root folder %s created', remoteRootName);
            })
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
     * Create folders
     *
     * @param {Number} i array iterator
     * @param {Promise} defer
     * @returns {Promise}
     */
    _recirsiveMkdir: function (i, defer) {
        if (i > this._directories.length - 1) {
            defer.resolve(true);
            return true;
        }

        var folderName = this._directories[i];
        if (!folderName) {
            this._recirsiveMkdir(++i, defer);
        } else {

            this._handlers.mkdir(folderName)
                .then(function (result) {
                    console.info('folder %s created', folderName);
                    if (result === true) {
                        this._recirsiveMkdir(++i, defer);
                    }
                }, this)
                .fail(function (error) {
                    defer.reject(error);
                }).done();
        }

        return defer.promise();
    },

    /**
     * Uploads file
     */
    _uploadFile: function (i, defer) {
        if (i > this._files.length - 1) {
            defer.resolve(true);
            return true;
        }

        var path = this._files[i];
        if (!path) {
            this._uploadFile(++i, defer);
        } else {
            this._handlers.upload(path)
                .then(function (data) {
                    if (data === true) {
                        console.info('file %s uploaded', path);
                        this._uploadFile(++i, defer);
                    }
                }, this)
                .fail(function (error) {
                    defer.reject(error);
                }).done();
        }

        return defer.promise();
    },

    /**
     * Find list of files or directiories
     *
     * @param {String} root folder
     * @param {files|directories} entryType
     * @returns {Promise}
     */
    _getEntries: function (root, entryType) {
        var entryType = entryType || 'directories';
        var defer = vow.defer();
        var entries = [];
        readdirp({root: root, entryType: entryType, fileFilter: '!.DS_Store'})
            .on('data', function (entry) {
                entries.push(entry.path);
            })
            .on('end', function () {
                defer.resolve(entries);
            })
            .on('error', defer.reject);

        return defer.promise();
    },

    /**
     * Receives remote file folder entries
     *
     * @param {String} local root
     * @returns {Promise}
     */
    _getRemoteEntries: function (root) {

        var promise = this._handlers.getList(root)
            .then(function (data) {
                var entries = data.map(function (item) {
                    return decodeURIComponent(item['d:href']);
                });

                entries.forEach(function (item) {
                    if (this._remoteDirectories.indexOf(item) === -1) {
                        this._remoteDirectories.push(item);
                        var pth = path.normalize(item.replace(this._remoteRoot, ''));
                        return this._getRemoteEntries(pth);
                    }
                }.bind(this));
            }, this)
            .fail(function (error) {
                throw new Error(error);
            });
        this._listPromises.push(promise);
        return promise;
    },

    /**
     * Reformat object to array
     *
     * @param {Object} items
     * @param {directories|files} entryType
     * @return {Array}
     */
    _formatResponse: function (items, entryType) {
        entryType = entryType || 'files';

        var array = [];
        var remoteRoot = this._remoteRoot;
        var localRoot = path.basename(this._localRoot);
        var search = path.normalize(['/', remoteRoot, localRoot, '/'].join('/'));

        items.forEach(function (entryName) {
            // filter
            if (entryName.indexOf('[object Object]') === -1 && entryName.indexOf('.DS_Store') === -1) {
                var isFolder = (entryName.slice(-1) === '/');
                if ((isFolder && entryType === 'directories') || (!isFolder && entryType === 'files')) {
                    var file = path.normalize(entryName.replace(search, '').replace(/\/?$/, ''));
                    if (file !== '.') {
                        array.push(file);
                    }
                }
            }
        });
        return array;
    },

    /**
     * Computes the difference of arrays
     *
     * @example array_diff(['Kevin', 'van', 'Zonneveld'], ['van', 'Zonneveld']);
     * @see http://javascript.ru/php/array_diff
     * @param {Array} array
     * @returns {Array}
     */
    _arrayDiff: function (array) {
        // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)

        var arr_dif = [];
        var i = 1;
        var argc = arguments.length;
        var argv = arguments;
        var key;
        var key_c;
        var found = false;

        // loop through 1st array
        for (key in array) {
            // loop over other arrays
            for (i = 1; i < argc; i++) {
                // find in the compare array
                found = false;
                for (key_c in argv[i]) {
                    if (argv[i][key_c] == array[key]) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    arr_dif[key] = array[key];
                }
            }
        }

        return arr_dif;
    }
});

module.exports = new WebdavRSync();
