// TODO : We should change parts of session to passport.
var express = require('express');
var bodyParser = require('body-parser')
var jwt = require('jsonwebtoken');

var db = require('../lib/db')
var jwtOptions = require('../lib/passport')

var router = express.Router();

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  // usually this would be a database call:

  db.query('SELECT * FROM customer WHERE cid = ?', [jwt_payload.id], function(error, user) {
    if (error) {
      tnext(null, false);
    }
    if (user) {
      next(null, user[0].cid);
    } else {
      next(null, false);
    }
  });
  
});

passport.use(strategy);

router.use(passport.initialize());

router.use(bodyParser.urlencoded({
  extended: true
}));

router.post("/login/customer", function(req, res) {
  if(req.body.cid && req.body.passwd){
    var name = req.body.cid;
    var password = req.body.passwd;
  }
  // usually this would be a database call:

  db.query('SELECT * FROM customer WHERE cid = ? AND passwd = ?', [name, password], function(error, user) {
    if (error) {
      res.status(501).send({message:"Server Error"});
      return false;
    }

    if( ! user ){
      message = {message:"no such user found"}
      res.status(401).send(message);
      return false;
    }
  
    if(user[0].passwd === password) {
      // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
      var payload = {id: user[0].cid};
      var token = jwt.sign(payload, jwtOptions.secretOrKey);
      res.json({message: "ok", token: token});
    } else {
      res.status(401).json({message:"passwords did not match"});
    }
  });
});

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

    response.send("logout!");
})

module.exports = router;
