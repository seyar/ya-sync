var inherit = require('inherit');
var readdirp = require('readdirp');
var vow = require('vow');
var Handlers = require('./../handlers/handlers');
var config = require('./../config/config');
var path = require('path');

var Copy = inherit(/** @lends Copy.prototype */ {

    /**
     * Recursivly copies files to remove webdav server
     *
     * @name Copy
     * @constructor
     */
    __constructor: function () {
        this._localRoot = config.disk.localRoot;
        this._handlers = new Handlers();

        this._directories = [];
        this._files = [];
    },

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
     * Runs copying
     */
    run: function () {
        this._createRootFolder()
            .then(function () {
                return this._getEntries(this._localRoot, 'directories');
            }, this)
            .then(function (data) {
                this._directories = data;
                this._directories.sort(this._sortFunction);
                // creating folders
                return this._recirsiveMkdir(0, vow.defer());
            }, this)
            .then(function () {
                return this._getEntries(this._localRoot, 'files');
            }, this)
            .then(function (files) {
                // uploading
                this._files = files;
                return this._uploadFile(0, vow.defer());
            }, this)
            .fail(function (err) {
                throw new Error(err);
            }).done(function () {
                console.log('Files uploaded');
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
        if (a.length < b.length) {
            return -1;
        }
        if (a.length > b.length) {
            return 1;
        }
        return 0;
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
        readdirp({root: root, entryType: entryType})
            .on('data', function (entry) {
                entries.push(entry.path);
            })
            .on('end', function () {
                defer.resolve(entries);
            })
            .on('error', defer.reject);

        return defer.promise();
    }
});

var c = new Copy();
c.run();
module.exports = Copy;
