var Api = require('bla').Api;
var api = new Api(__dirname + './../api/**/*.api.js');
var blaError = require('bla').ApiError;
var inherit = require('inherit');
var path = require('path');

var vow = require('vow');

var LRU = require('lru-cache');
var cache = LRU(1000 * 60 * 60 * 60 * 24); // one day

var Handlers = inherit(/** @lends Handlers.prototype */ {
    /**
     * Makes directory
     *
     * @param {String} destination
     * @returns {*}
     */
    mkdir: function (destination) {
        destination = path.normalize(destination);
        if (!destination || destination === 'undefined') {
            throw new blaError(blaError.INTERNAL_ERROR, 'Name must be a string');
        }

        return api
            .exec('mkdir', {
                destination: destination
            })
            .then(function (response) {
                return response;
            })
            .fail(function (error) {
                console.trace(error);
                error.message += ', destination=' + destination.normalize(destination);
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
            .exec('get-list', {folder: path.normalize(folder)})
            .then(function (response) {
                if (response.toString().indexOf('Error') !== -1) {
                    throw Error(response);
                }
                cache.set(cacheKey, response);
                return response;
            })
            .fail(function (error) {
                console.error('Folder ' + folder + ' not found.');
                console.trace(error);
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
                console.trace(error);
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
                console.trace(error);
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
                console.trace(error);
                throw new blaError(error.type || blaError.INTERNAL_ERROR, error.message || error.toString());
            });
    },

    /**
     * Uploads a file
     *
     * @param {String} localPath /folder1/folder2/some.png
     * @param {String} remotePath
     * @returns {*}
     */
    upload: function (localPath, remotePath) {
        if (!localPath || localPath === 'undefined' || !remotePath || remotePath === 'undefined') {
            throw new blaError(blaError.INTERNAL_ERROR, 'localPath must be a string');
        }

        return api
            .exec('upload', {
                source: path.normalize(localPath),
                destination: path.normalize(remotePath)
            })
            .then(function (response) {
                return response;
            })
            .fail(function (error) {
                console.trace(error);
                error.message += ' destination=' + destination + ', local=' + source;
                throw new blaError(error.type || blaError.INTERNAL_ERROR, error.message || error.toString());
            }, this);

    }
});

module.exports = Handlers;
