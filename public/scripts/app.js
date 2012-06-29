define(function(require, exports, module){

seajs.config({
    base: '/scripts/',
    timeout: 1000
});
require.async('login', function( login ){
    login.init();
    window.scrollTo(0, 0);
});

});