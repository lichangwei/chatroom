define(function(require, exports, module){

$(function(){
    $('#viewport').height(window.innerHeight + 'px');
});

seajs.config({
    base: '/scripts/',
    timeout: 1000
});

exports.login = function(){
    require.async('login', function(module){
        module.init();
    });
}
exports.chat = function(){
    require.async('chat', function(module){
        module.init();
    });
}

exports.login();

});