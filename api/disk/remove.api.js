var ApiMethod = require('bla').ApiMethod;
var config = require('./../../config/config');
var vowHandyHttp = require('../../lib/vow-handy-http');
var extend = require('extend');
var vow = require('vow');

/**
 * Удаление файла.
 *
 * curl -v -X DELETE -H 'Authorization: OAuth b56608838c7f4550a88ca629d2f565cd' /readme.txt
 */
module.exports = new ApiMethod({
    name: 'remove',
    description: 'Removes a file',
    params: {
        file: {
            type: 'String',
            description: 'Path to file.',
            required: true
        }
    },
    action: function (params) {
        var file = params.file.trim();
        if (file === '/' || file === '') {
            return vow.reject('Cannot remove /');
        }

        var httpParams = extend(true, {}, config.auth, {
            method: 'DELETE'
        });
        httpParams.url += file;

        return vowHandyHttp(httpParams)
            .fail(function (error) {
                throw Error('remove error. ' + error);
            });
    }
});
