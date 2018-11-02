// TODO : We should change parts of session to passport.
var express = require('express');
var bodyParser = require('body-parser')

var db = require('../lib/db')
var auth = require('../lib/auth')

var router = express.Router();

/*
router.post('/login/customer', function(request, response){
    var post = request.body;
    var cid = post.cid;
    var password = post.passwd;

    if (auth.isOwner(request, response)){
        response.send("Already logined");
        return false;
    }

    db.query(`SELECT * FROM customer WHERE cid=? AND passwd=?;`, [cid, password], function(error, result){
        if(error)
            throw error;

        if(result.length > 0){
            request.session.is_logined = true;
            request.session.nickname = result[0].name;
            request.session.is_id = result[0].cid;
            request.session.save(function() {
                response.send("Welcome!");
            });
        }
        else {
            response.send("Who?");
        }
    })
})
*/

router.get('/logout/customer', function(request, response){
    
    request.logout();
    // request.session.destroy(function(error) {
    //     response.send("Logout!");
    // })
    // request.session.save(function(){
    //     response.send("Logout!");
    // })

    request.send("logout!");
})

module.exports = router;
