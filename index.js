var inherit = require('inherit');

var IAuthirzation = inherit({
    __constructor: function(cloud){
        this.cloud = cloud;
    },

    /**
     * Function get token from cloud
     */
    getToken: function(){
    }
});

var YaDiskAuthorization = inherit(IAuthirzation,{

});


var IConfigReader = inherit({
    __constructor: function(){
        /**
         * Driver for read config
         */
        this.reader = FileConfigReader;

        /**
         * Config values
         */
        this.config = {};
    },

    /**
     * Read all filename
     * @return {Object} JSON
     *
    read: function(){
    },
    */

    /**
     * Function get one config value
     * @param {String}  config key
     * @return
     */
    get: function(key){

    },

    /**
     * Function get all config values
     * @return {Object} JSON
     */
    getConfig: function(){
        return this.config;
    }
});

var FileConfigReader = inherit(IConfigReader,{

});
