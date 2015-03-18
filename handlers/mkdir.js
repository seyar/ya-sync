var api = require('./api');
var blaError = require('bla').ApiError;

api
    .exec('mkdir', {name: 'c/d/e'})
    .then(function (response) {
        console.log(response);
    })
    .fail(function (error) {
        throw new blaError(error.type || blaError.INTERNAL_ERROR, error.message || error.toString());
    }).done();
