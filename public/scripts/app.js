define(function(require, exports, module){

seajs.config({
    base: '/scripts/',
    timeout: 1000
});

['login', 'chat'].forEach(function( modulename ){
    exports[modulename] = function(){
        require.async(modulename, function(module){
            module.init();
        });
    }
});

exports.login();

// document.addEventListener('touchmove', function(e){
    // e.preventDefault();
// }, false);

});