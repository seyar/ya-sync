var Api = require('bla').Api;
var api = new Api(__dirname + './../api/**/*.api.js');
var blaError = require('bla').ApiError;
var inherit = require('inherit');
var config = require('./../config/config');
var path = require('path');

var vow = require('vow');

var LRU = require('lru-cache');
var cache = LRU(1000 * 60 * 60 * 60 * 24); // one day

var Handlers = inherit(/** @lends Handlers.prototype */ {
    __constructor: function () {
        this._remoteRoot = config.remoteRoot;
    },

    /**
     * Makes directory
     *
     * @param {String} name
     * @returns {*}
     */
    mkdir: function (name) {
        if (!name || name === 'undefined') {
            throw new blaError(blaError.INTERNAL_ERROR, 'Name must be a string');
        }

        var pathArray = [this._remoteRoot, name];
        return api
            .exec('mkdir', {
                destination: path.normalize(pathArray.join('/'))
            })
            .then(function (response) {
                return response;
            })
            .fail(function (error) {
                error.message += ', path=' + path.normalize(pathArray.join('/'));
                throw new blaError(error.type || blaError.INTERNAL_ERROR, error.message || error.toString());
            });
    },

    /**
     * Retrieve file and folder list
     *
     * @param {String} folder
     * @returns {*}
     */
    getList: function (folder) {
        var cacheKey = folder.replace(/\//gi, '');
        var cachedList = cache.get(cacheKey);
        if (cachedList) {
            return vow.resolve(cachedList);
        }
        return api
            .exec('get-list', {folder: path.normalize([this._remoteRoot, folder].join('/'))})
            .then(function (response) {
                if (response.toString().indexOf('Error') !== -1) {
                    throw new Error(response);
                }
                cache.set(cacheKey, response);
                return response;
            })
            .fail(function (error) {
                throw new blaError(error.type || blaError.INTERNAL_ERROR, error.message || error.toString());
            });
    },

    getListFromRoot: function (folder) {
        return api
            .exec('get-list', {folder: path.normalize(folder)})
            .then(function (response) {
                if (response.toString().indexOf('Error') !== -1) {
                    throw new Error(response);
                }
                return response;
            })
            .fail(function (error) {
                throw new blaError(error.type || blaError.INTERNAL_ERROR, error.message || error.toString());
            });
    },

    /**
     * @param {String} file
     * @returns {*}
     */
    download: function (file) {
        return api
            .exec('download', {file: path.normalize(file)})
            .then(function (response) {
                if (response.toString().indexOf('Error') !== -1) {
                    throw new Error(response);
                }
                return response;
            })
            .fail(function (error) {
                throw new blaError(error.type || blaError.INTERNAL_ERROR, error.message || error.toString());
            });
    },

    /**
     * @param {String} file
     * @returns {*}
     */
    remove: function (file) {
        return api
            .exec('remove', {file: path.normalize(file)})
            .then(function (response) {
                if (response.toString().indexOf('Error') !== -1) {
                    throw new Error(response);
                }
                return response;
            })
            .fail(function (error) {
                throw new blaError(error.type || blaError.INTERNAL_ERROR, error.message || error.toString());
            });
    },

    /**
     * Uploads a file
     *
     * @param {String} localPath /folder1/folder2/some.png
     * @param {String} root
     * @returns {*}
     */
    upload: function (localPath, root) {
        if (!localPath || localPath === 'undefined') {
            throw new blaError(blaError.INTERNAL_ERROR, 'localPath must be a string');
        }
        var destination = path.normalize([this._remoteRoot, localPath].join('/'));
        localPath = localPath.replace(path.basename(root), '');
        var source = path.normalize(root + '/' + localPath);

        return api
            .exec('upload', {
                destination: destination,
                localPath: source
            })
            .then(function (response) {
                return response;
            })
            .fail(function (error) {
                error.message += ' destination=' + destination + ', local=' + source;
                throw new blaError(error.type || blaError.INTERNAL_ERROR, error.message || error.toString());
            }, this);

    }
});

module.exports = Handlers;
