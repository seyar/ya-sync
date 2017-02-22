var ApiMethod = require('bla').ApiMethod;
var config = require('./../../config/config');
var vowHandyHttp = require('../../lib/vow-handy-http');
var extend = require('extend');
var vow = require('vow');

/**
 * Загрузка файла
 *
 * curl -v -X GET -H 'Authorization: OAuth b56608838c7f4550a88ca629d2f565cd' /readme.txt
 */
module.exports = new ApiMethod({
    name: 'download',
    description: 'Donwloads a file',
    params: {
        file: {
            type: 'String',
            description: 'Path to file.',
            required: true
        }
    },
    action: function (params) {
        var httpParams = extend({}, config.sync);
        httpParams.url += params.file;

        return vowHandyHttp(httpParams)
            .fail(function (error) {
                throw new Error(error);
            });

    }
});
