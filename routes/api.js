// API 코드
// Author : KJ
// 2018.10.12
//
// Modified Date : 2018.11.02
// Author : KJ
// 알람 서비스 api 작성
//
// Modified Date : 2018.11.06
// Author : KJ
// add sign_up api 
//
// Modified Date : 2018.11.07
// Author : KJ
// 비밀번호 암호화 추가


var express = require('express');
var bodyParser = require('body-parser')
var passport = require("passport");

var hello = require('../api/hello.json')
var db = require('../lib/db')
var CryptoPasswd = require('../lib/passwordSecret');

var auth = require('../lib/auth')


var router = express.Router();

/* GET api home page. */
router.get('/', function(req, res, next) {
  res.send(hello);
});

// Customer Sign Up API
// Method : POST
// URL : /api/sign_up/customer
// 회원가입 API
router.post('/sign_up/customer', function(req, res, next) {
  var post = req.body;
  var cid = post.cid;
  var passwd = post.passwd;
  var name = post.name;
  var address = post.address;
  var latitude = post.latitude;
  var longitude = post.longitude;

  var result = {};
  result['success'] = false;

  if (!(cid && passwd)) {
    res.json(result);
    return false;
  }

  var idError = false;
  var passwdError = false;

  // 1. 아이디 중복 체크
  db.query('SELECT * FROM customer WHERE cid = ?;', [cid], function(error, user){

    if (error) {
      throw error;
    }
    
    if (user.length <= 0) {

      // 2. 아이디 패스워드 유효 체크 
      
      var regID = /^\d{3}-\d{3,4}-\d{4}$/;
      var regPasswd = /^[a-z0-9_]{8,20}$/; 

      if (!regID.test(cid)){
        idError = true;
      }
      if (!regPasswd.test(passwd)) {
        passwdError = true;
      }
      if (idError || passwdError) {
        result['idError'] = idError;
        result['passwdError'] = passwdError;

        res.send(result);
        return false;
      }
      
      passwd = CryptoPasswd.create(passwd);
      
      db.query(`INSERT INTO customer 
      (cid, passwd, name, address, latitude, longitude) VALUES 
      (?, ?, ?, ?, ?, ?);`, [cid, passwd, name, address, latitude, longitude],
      function(error, user){
        if (error) {
          res.json(result);
          return false;
        }
        result['success'] = true;
        res.json(result);
      });

    } else {
      res.json(result);
    }
  })
})

// Supplier Sign Up API
// Method : POST
// Params : sid, passwd, rname, address, dlprice, latitude, longitude
// URL : /api/sign_up/supplier
// 가맹업주 회원가입 API
router.post('/sign_up/supplier', function(req, res, next) {
  var post = req.body;
  var sid = post.sid;
  var passwd = post.passwd;
  var rname = post.rname;
  var address = post.address;
  var dlprice = post.dlprice;
  var latitude = post.latitude;
  var longitude = post.longitude;

  var result = {};
  result['success'] = false;
  if (!(sid && passwd)) {
    res.json(result);
    return false;
  }

  var idError = false;
  var passwdError = false;

  // 1. 아이디 중복 체크
  db.query('SELECT * FROM supplier WHERE sid = ?;', [sid], function(error, user){

    if (error) {
      throw error;
    }
    if (user.length <= 0) {

      // 2. 아이디 패스워드 유효 체크 
      
      var regID = /^\d{3}-\d{3,4}-\d{4}$/;
      var regPasswd = /^[a-z0-9_]{8,20}$/; 

      if (!regID.test(sid)){
        idError = true;
      }
      if (!regPasswd.test(passwd)) {
        passwdError = true;
      }
      if (idError || passwdError) {
        result['idError'] = idError;
        result['passwdError'] = passwdError;

        res.send(result);
        return false;
      }
      
      passwd = CryptoPasswd.create(passwd);
      
      db.query(`INSERT INTO supplier 
      (sid, passwd, rname, address, dlprice, latitude, longitude) VALUES 
      (?, ?, ?, ?, ?, ? ,?);`, [sid, passwd, rname, address, dlprice, latitude, longitude],
      function(error, user){
        if (error) {
          res.json(result);
          return false;
        }

        result['success'] = true;
        res.json(result);
      });
    } else {
      res.json(result);
    }
  })
})

router.post('/customer', function(req, res, next){
  var post = req.body;
  var id = post.cid;
  var passwd = post.passwd;

  db.query(`SELECT * FROM customer WHERE cid = ? AND passwd = ?;`, [id, passwd], function(error, customer) {
    if (error)
      throw error;
    
    var customer_json = {
      ID: customer[0].cid,
      passwd: customer[0].passwd,
      name: customer[0].name,
      address: customer[0].address
    }

    res.send(customer_json);
  })
})

router.post('/supplier', function(req, res, next){
  var post = req.body;
  var id = post.sid;
  var passwd = post.passwd;

  db.query(`SELECT * FROM supplier WHERE sid = ? AND passwd = ?;`, [id, passwd], function(error, supplier) {
    if (error)
      throw error;

    var supplier_json = {
      ID: supplier[0].sid,
      passwd: supplier[0].passwd,
      rname: supplier[0].rname,
      address: supplier[0].address,
      dlprice: supplier[0].dlprice
    }

    res.send(supplier_json);
  })
})

// Category API
// Method : GET
// URL : /api/category
// 모든 카테고리를 반환하는 API
router.get('/category', function(req, res, next){

  db.query('SELECT * FROM category;', function(error, categorys){
    if (error)
      throw error;
    
    var category_json = {};
    var results = [];
    
    var i = 0;
    while (i < categorys.length)
    {
      results[i] = {
        ID : categorys[i].cateid,
        name : categorys[i].name
      }
      i++;
    }

    //category_json['results'] = results;
    res.json(results);
  })
})

// Itemp Post API
// Method : POST
// Header : Authorization
// Parameters : name, cateid, rawprice, saleprice, context, image, views, starttime, endtime, deliverable, count
// URL : /api/item
// 음식 등록 api
router.post('/item', passport.authenticate('jwt', { session: false }), function(req, res, next){
  var post = req.body;
  var sid = "";
  var image = post.image;
  var name = post.name;
  var category_id = post.category_id;
  var raw_price = post.raw_price;
  var sale_price = post.sale_price;
  var context = post.context;
  var start_time = post.start_time;
  var end_time = post.end_time;
  var deliverable = post.deliverable;
  var count = post.count;
console.log(post);
  var result = {
    success : false
  }
  
  if(! (req.user.permission == 'supplier' || 
        req.user.permission == 'admin')) {
    res.json(result);
    return false;
  }
  else {
    sid = req.user.id;
  }

  // Ver 0 not insert image path and don't store image file
  // TODO : save file 
  if (image){
    db.query(`INSERT INTO item 
  (sid, name, cateid, rawprice, saleprice, context, starttime, endtime, deliverable, itemcount, image) 
  VALUES (?, ?, ? ,?, ?, ?, ?, ?, ?, ?, ?);`,
  [sid, name, category_id, raw_price, sale_price, context, start_time, end_time, deliverable, count, image],
  function(error, results){
    if (error){
      res.json(result);
    }

    result['success'] = true;
    res.json(result);
  })
  } else {
    db.query(`INSERT INTO item 
  (sid, name, cateid, rawprice, saleprice, context, starttime, endtime, deliverable, itemcount) 
  VALUES (?, ?, ? ,?, ?, ?, ?, ?, ?, ?);`,
  [sid, name, category_id, raw_price, sale_price, context, start_time, end_time, deliverable, count],
  function(error, results){
    if (error){
      res.json(result);
    }

    result['success'] = true;
    res.json(result);
  })
  }
  
})

// Want_to_buy API
// Method : POST
// Parameters : cid, cateid, min_price, max_price
// URL : /api/wtb
// 삽니다 등록 api
router.post('/wtb', function(req, res, next){
  var post = req.body;
  var cid = "";
  var cateid = post.cateid;
  var min_price = post.min_price;
  var max_price = post.max_price;

  if(!req.user){
    res.send("Pls login!");
    return false;
  }
  else {
    cid = req.user.cid;
  }

  db.query(`INSERT INTO want_to_buy (cid, cateid, min_price, max_price) VALUES (?, ?, ? ,?);`,
  [cid, cateid, min_price, max_price], function(error, result){
    if (error)
      throw error;
    
    res.send(result);
  })
})

// Alarm API
// Method : POST
// Parameters : cid
// URL : /api/alarm
// 알람 서비스 
// HACK : cid 유저가 틀릴 경우 false를 출력하지 않고 전날 제일 많이 팔린 제품을 출력한다.
// TODO : session or token 으로 인증, GET 메소드로 변경, params 삭제

router.post('/alarm', function(req, res, next) {
  var post = req.body;
  var cid = post.cid;

  // 안드로이드로 보낼 json 객체 선언
  var item = {};
  item['success'] = false;

  // 먼저 유저가 제일 많이 구매한 제품의 정보 찾는 데이터베이스 쿼리
  db.query(`select D.* from (SELECT 
    iid, sum(amount) as sum_amount, max(orderdate) as max_orderdate
FROM
    (SELECT 
    *
FROM
    order_group
WHERE
    cid = ?) A
INNER JOIN \`order\` B ON A.gid = B.gid group by iid order by sum_amount desc, max_orderdate desc) C inner join item D on C.iid = D.iid limit 1;`, [cid], function(error, items) {
  if (error)
    throw error;
  // 구매한 적이 있을 경우
  if (items.length > 0) {

    item['success'] = true;
    item['id'] = items[0].iid;
    item['sid'] = items[0].sid;
    item['name'] = items[0].name; 

    res.json(item);
  }
  // 구매한 적이 없는 경우
  else {

    // 최근 제일 많이 팔린 제품 찾는 데이터베이스 쿼리
    db.query(`select D.* from (select date(orderdate) as orderdate_date, iid, sum(amount) from
    \`order\` A inner join order_group B on A.gid = B.gid group by orderdate_date, iid order by 1 desc, 3 desc limit 1) C inner join item D on C.iid = D.iid;`, function(error, items) {
      if (error)
        throw error;
      
      if (items.length > 0)
      {
        item['success'] = true;
        item['id'] = items[0].iid;
        item['sid'] = items[0].sid;
        item['name'] = items[0].name; 
        
        res.json(item);
      }

      // 실패할 경우
      else {
        res.json(item);
      }
    })
  }
})
})

module.exports = router;

