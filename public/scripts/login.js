define(function(require, exports, module){
    
    module.exports = {
        $view: $('#login'),
        init: function(){
            var $v = this.$view;
            $v.show();
            var $passport = $v.find('input[name=passport]');
            var $password = $v.find('input[name=password]');
            var $login = $v.find('input[name=login]');
            var $reset = $v.find('input[name=reset]');
            
            g($login).tap(function(){
                var passport = $passport.val();
                var password = $password.val();
                if(!passport && !password){
                    alert('请输入登录名和密码。');
                    return $passport.focus();
                }else if(!passport){
                    alert('请输入登录名。');
                    return $passport.focus();
                }else if(!password){
                    alert('请输入密码。');
                    return $password.focus();
                }
                require.async('ajax', function(ajax){
                    ajax.put('/login', {
                        passport: passport,
                        password: password
                    }, function(data){
                        
                    })
                });
            });
            
            g($reset).tap(function(){
                $passport.val('');
                $password.val('');
            });
        }
    }
});