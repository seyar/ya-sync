var ApiMethod = require('bla').ApiMethod;
var config = require('./../../config/config');
var vowHandyHttp = require('../../lib/vow-handy-http');
var extend = require('extend');

/**
 * Создание каталога
 *
 * curl -v -X MKCOL -H 'Authorization: OAuth b56608838c7f4550a88ca629d2f565cd' https://webdav.yandex.ru/a/b
 */
module.exports = new ApiMethod({
    name: 'mkdir',
    description: 'Creates a folder',
    params: {
        destination: {
            type: 'String',
            description: 'Path to folder with new name.',
            required: true
        }
    },
    action: function (params) {
        var options = {
            method: 'MKCOL'
        };

        var ext = extend(true, {}, config.disk, options);
        ext.url += params.destination;

        return vowHandyHttp(ext)
            .then(function (data) {
                // если ответ пустой значит все ок. 201
                if (Boolean(data.toString()) && data.toString().indexOf('resource already exists') === -1) {
                    throw new Error(data.toString());
                }
                return true;
            })
            .fail(function (error) {
                throw new Error(error);
            });
    }
});
