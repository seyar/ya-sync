var inherit = require('inherit');

var IConfigReader = inherit({
    __constructor: function () {
        /**
         * Driver for read config
         */
        this.reader = new FileConfigReader;

        /**
         * Config values
         */
        this.config = {};
    },

    /**
     * Function get one config value
     * @param {String}  config key
     * @return
     */
    get: function (key) {

    },

    /**
     * Function get all config values
     * @return {Object} JSON
     */
    getConfig: function () {
        this.config = this.reader.getConfig();
        return this.config;
    }
});

var FileConfigReader = inherit(IConfigReader, {
    // if some problems with getting token
    // http://api.yandex.ru/oauth/doc/dg/tasks/get-oauth-token.xml
    __constructor: function(){

    },

    /**
     * Function read config from file
     * @return {Object} JSON
     */
    getConfig: function () {

        return require('./config');
    }

});


module.exports = new IConfigReader();