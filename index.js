//var inherit = require('inherit');
var config = require('./config-reader');
var autorization = require('./authorization');

var project = {
    __constructor: function () {
        this.config = config.getConfig();
        this.token = autorization.getToken();


        this.upload();
    },

    upload: function(){
        var http = require('http');
        var options = {
                host: 'webdav.yandex.ru',
//                port: '80',
//                path: '/compile',
                method: 'PUT',
                headers: {
                    Accept: '*/*',
                    Authorization: 'OAuth '+this.token,
                    Expect: '100-continue',
                    'Content-Type': 'application/binary',
                    'Content-Length': post_data.length
                }
        };

        request = http.request(options, function (result) {
            console.log(result);
        });
        request.on('error', function (error) {
            console.log('Something with http request ' + error);
        });
        request.end();


        PUT /a/readme.txt HTTP/1.1

    }
};

project.__constructor();
