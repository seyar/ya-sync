var api = require('./api');
var blaError = require('bla').ApiError;
api
    .exec('get-list'/*, {depth: 1}*/)
    .then(function (response) {
        console.log(response); // 'Hello, Stepan'
    })
    .fail(function (error) {
        throw new blaError(error.type || blaError.INTERNAL_ERROR, error.message || error.toString());
    }).done();
