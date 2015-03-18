var api = require('./api');
var blaError = require('bla').ApiError;

api
    .exec('upload', {destination: 'a/', localPath: '/Users/seyar/Documents/2014-05-07_1655.png'})
    .then(function (response) {
        console.log(response);
    })
    .fail(function (error) {
        throw new blaError(error.type || blaError.INTERNAL_ERROR, error.message || error.toString());
    }).done();
