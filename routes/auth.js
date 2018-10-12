var express = require('express');
var bodyParser = require('body-parser')

var db = require('../lib/db')
var auth = require('../lib/auth')

var router = express.Router();


router.post('/login/customer', function(request, response){
    var post = request.body;
    var cid = post.cid;
    var password = post.passwd;

    if (auth.isOwner(request, response)){
        response.send("Already logined");
        return false;
    }

    db.query(`select * from customer where cid=? and passwd=?`, [cid, password], function(error, result){
        if(error)
            throw error;
        
        if(result.length > 0){
            console.log(result[0].cid)
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

router.get('/logout/customer', function(request, response){
    request.session.destroy(function(error) {
        response.send("Logout!");
    })
    
})

module.exports = router;
