var ApiMethod = require('bla').ApiMethod;
var config = require('./../../config/config');
var vowHandyHttp = require('../../lib/vow-handy-http');
var extend = require('extend');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var vow = require('vow');

/**
 * Возвращает список элементов в каталоге
 *
 * curl -v -X PROPFIND -H 'Depth: 1' -H 'Authorization: OAuth b56608838c7f4550a88ca629d2f565cd' https://webdav.yandex.ru/
 */
module.exports = new ApiMethod({
    name: 'get-list',
    description: 'Returns files and folders from server',
    params: {
        folder: {
            type: 'String',
            description: 'Start folder',
            defaultValue: '/',
            required: true
        },
        depth: {
            type: 'Number',
            description: 'depth',
            defaultValue: 1
        },
        amount: {
            type: 'Number',
            description: 'amount of files'
        },
        offset: {
            type: 'Number',
            description: 'start offset'
        }
    },
    action: function (params) {
        var options = {
            method: 'PROPFIND',
            headers: {
                Depth: params.depth
            }
        };
        var ext = extend(true, {}, config.sync, options);
        ext.url += params.folder;

        if (params.start && params.offset) {
            ext.url += '?offset=' + params.offset + '&amount=' + params.start;
        }

        return vowHandyHttp(ext)
            .then(function (data) {
                var defer = vow.defer();
                if (data && data.toString() && data.toString().indexOf('authoriz') !== -1) {
                    defer.reject('Authorize error');
                }

                parser.parseString(data, function (err, result) {
                    if (err) {
                        defer.reject('Cannot parse xml. ' + err);
                    }
                    defer.resolve(result);
                });

                return defer.promise();
            })
            .then(function (data) {
                return data['d:multistatus']['d:response'] || null;
            });
    }
});
