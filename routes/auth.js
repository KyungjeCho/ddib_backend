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

  if (jwt_payload.permission === "customer") {
    db.query('SELECT * FROM customer WHERE cid = ?', [jwt_payload.id], function(error, user) {
      if (error) {
        next(null, false);
      }
      if (user.length > 0) {
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
  } else if (jwt_payload.permission === 'supplier') {
    db.query('SELECT * FROM supplier WHERE sid = ?', [jwt_payload.id], function(error, user) {
      if (error) {
        next(null, false);
      }
      if (user.length > 0) {
        var user_info = {
          id : user[0].sid,
            name : user[0].rname,
            permission : "supplier"
        }
        if (user[0].cid === '999-9999-9999') {
          user_info['permission'] = 'admin';
        }
        next(null, user_info);
      } else {
        next(null, false);
      }
    })
  } else {
    next(null, false);
  }
});

passport.use(strategy);

router.use(passport.initialize());

router.use(bodyParser.urlencoded({
  extended: true
}));

// Customer Login API
// Method : POST
// Params : cid, passwd
// URL : /auth/login/supplier
// Return : ID, name, token, success
router.post("/login/customer", function(req, res) {
  var result = {
    success : false
  };

  if(req.body.cid && req.body.passwd){
    var name = req.body.cid;
    var password = req.body.passwd;
    var fcm_token = req.body.token;
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


    if( user.length <= 0){
      message = {message:"no such user found"}
      res.status(401).send(message);

      return false;
    }
  
    if(CryptoPasswd.verify(user[0].passwd,password)) {
      // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
      var payload = {id: user[0].cid, permission : "customer"};
      var token = jwt.sign(payload, jwtOptions.secretOrKey);
      result['ID'] = user[0].cid;
      result['name'] = user[0].name;
      result['token'] = token;
      db.query('UPDATE customer SET fcm_token = ? WHERE cid = ?;', [fcm_token, user[0].cid], function(error2, results){
        if (error2) {
          res.json(result);
          return false;
        }

        result['success'] = true;
        res.json(result);
        return true;
      })

    } else {
      result['error'] = true;
      res.status(401).json(result);
    }
  });
});

// Supplier Login API
// Method : POST
// Params : sid, passwd
// URL : /auth/login/supplier
// Return : id, rname, token, success
router.post("/login/supplier", function(req, res) {
  var result = {
    success : false
  };

  if(req.body.sid && req.body.passwd){
    var name = req.body.sid;
    var password = req.body.passwd;
    var fcm_token = req.body.token;
  } else {
    result['empty_params'] = true;
    res.json(result);
  }
  // usually this would be a database call:

  db.query('SELECT * FROM supplier WHERE sid = ?;', [name], function(error, user) {
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
      var payload = {id: user[0].sid, permission: "supplier"};
      var token = jwt.sign(payload, jwtOptions.secretOrKey);
      result['ID'] = user[0].sid;
      result['name'] = user[0].rname;
      result['token'] = token;

      db.query('UPDATE supplier SET fcm_token = ? WHERE sid = ?;', [fcm_token, user[0].sid], function(error2, results){
        if (error2) {
          res.json(result);
          return false;
        }

        result['success'] = true;
        res.json(result);
        return true;
      })

      result['success'] = true;
      res.json(result);
    } else {
      result['error'] = true;
      res.status(401).json(result);
    }
  });
});

router.get('/logout/customer', function(request, response){
    
    request.logout();

    // TODO : delete fcm_token

    response.send("logout!");
})

module.exports = router;
