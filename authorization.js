// var fs = require('fs');
// var sys = require("sys");
var inherit = require('inherit');

var IAuthirzation = inherit({
    /**
     * Authorize app in cloud
     * @param {Object} config with login data
     * @private
     */
    __constructor: function (config) {
        this.cloud = new YaDiskAuthorization;
        this.config = config;
    },

    /**
     * Function get token from cloud
     */
    getToken: function () {
        return '';
//        var c = this.cloud.getToken();
//        console.log(c);
    }

    /**
     * Login into cloud
     */
//    login: function(){
//        this.cloud.login(this.config);
//    }
});

var YaDiskAuthorization = inherit(IAuthirzation, {

    __constructor: function () {

    },

    login: function (config) {

    },

    /**
     * make request to another server as curl
     * @param {String} url
     * @param {Object} options
     * @returns {String}
     * @private
     */
    __makeRequest: function (url, options) {
        var http = require('http');
        var options = {
            host: 'oauth.yandex.ru',
//                port: '80',
//                path: '/compile',
//                method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
            }
        };

        request = http.request(options, function (result) {

        });
        request.on('error', function (error) {
            console.log('Something with http request ' + error);
        });
        request.end();

        return result;
    }

});

module.exports = new IAuthirzation();
