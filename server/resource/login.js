
exports.put = function(req, res, params, cookies){
    var passport = params.passport;
    var password = params.password;
    if(password === passport + '1'){
        var sid = require("shortid").generate();
        require('../chatserver').set(sid, passport);
        cookies.set("sid", sid, {httpOnly: false});
        res.render( {code: 0} );
    }else{
        res.render( {code: 1} )
    }
}
