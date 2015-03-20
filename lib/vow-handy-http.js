var HTTPClient = require('handy-http');
var client = new HTTPClient();
var vow = require('vow');

/**
 * Wraps handy http API in the Vow promises implementation.
 * @fork vow-asker
 *
 * @param {Object} options see https://github.com/dimik/node-handy-http for details
 * @returns {vow.Promise}
 */
function vowHandy(options) {
    var deferred = vow.defer();

    client.open(options, function (error, response) {
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve(response);
        }
    });

    return deferred.promise();
}

module.exports = vowHandy;
