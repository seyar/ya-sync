var Api = require('bla').Api;
var api = new Api(__dirname + './../api/**/*.api.js');
var blaError = require('bla').ApiError;
var inherit = require('inherit');
var config = require('./../config/config');
var path = require('path');

var Handlers = inherit(/** @lends Handlers.prototype */ {
    __constructor: function () {
        this._remoteRoot = config.disk.remoteRoot;
        this._localRoot = config.disk.localRoot;
    },

    /**
     * Makes directory
     *
     * @param {String} name
     * @param {Boolean} isRoot
     * @returns {*}
     */
    mkdir: function (name, isRoot) {
        isRoot = isRoot || false;
        if (!name || name === 'undefined') {
            throw new blaError(blaError.INTERNAL_ERROR, 'Name must be a string');
        }

        var pathArray = isRoot ?  [this._remoteRoot, name] : [this._remoteRoot, path.basename(this._localRoot), name];
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

    getList: function () {
        api
            .exec('get-list'/*, {depth: 1}*/)
            .then(function (response) {
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
     * @returns {Promise}
     */
    upload: function (localPath) {
        if (!localPath || localPath === 'undefined') {
            throw new blaError(blaError.INTERNAL_ERROR, 'localPath must be a string');
        }
        var destination = path.normalize([this._remoteRoot, path.basename(this._localRoot), localPath].join('/'));
        var source = path.normalize(this._localRoot + '/' + localPath);

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
