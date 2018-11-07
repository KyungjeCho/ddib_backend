// 인증에 관한 코드
// Author : KJ
// ..
//
// Author : KJ
// Modified Date : 2018.11.07
// 비밀번호 암호화 추가

var express = require('express');
var bodyParser = require('body-parser')
var jwt = require('jsonwebtoken');

var db = require('../lib/db')
var jwtOptions = require('../lib/passport')
var CryptoPasswd = require('../lib/passwordSecret')

var router = express.Router();

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  // usually this would be a database call:

  db.query('SELECT * FROM customer WHERE cid = ?', [jwt_payload.id], function(error, user) {
    if (error) {
      next(null, false);
    }
    if (user) {
      var user_info = {
        id : user[0].cid,
          name : user[0].name,
          permission : "customer"
      }
      if (user[0].cid === '999-9999-9999') {
        user_info['permission'] = 'admin';
      }
      next(null, user_info);
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
  var result = {
    success : false
  };

  if(req.body.cid && req.body.passwd){
    var name = req.body.cid;
    var password = req.body.passwd;
  } else {
    result['empty_params'] = true;
    res.json(result);
  }
  // usually this would be a database call:

  db.query('SELECT * FROM customer WHERE cid = ?;', [name], function(error, user) {
    if (error) {
      result['error'] = true;
      res.status(501).send(result);
      return false;
    }

    if(user.length <= 0){
      result['error'] = true;
      res.status(401).send(result);
      return false;
    }
  
    if(CryptoPasswd.verify(user[0].passwd,password)) {
      // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
      var payload = {id: user[0].cid};
      var token = jwt.sign(payload, jwtOptions.secretOrKey);
      result['token'] = token;
      result['success'] = true;
      res.json(result);
    } else {
      result['error'] = true;
      res.status(401).json(result);
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
