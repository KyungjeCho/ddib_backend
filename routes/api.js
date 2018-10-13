// API 코드
// Author : KJ
// 2018.10.12
//
// Item detail API 추가 
// Author : KJ
// Modified-Date: 2018.10.12

var express = require('express');
var bodyParser = require('body-parser')

var hello = require('../api/hello.json')
var db = require('../lib/db')
var auth = require('../lib/auth')

var router = express.Router();

/* GET api home page. */
router.get('/', function(req, res, next) {
  res.send(hello);
});

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

    category_json['results'] = results;
    res.json(category_json);
  })
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

  console.log(req.session)

  if(!auth.isOwner(req, res)){
    res.send("Pls login!");
    return false;
  }
  else {
    cid = req.session.is_id;
  }

  db.query(`INSERT INTO want_to_buy (cid, cateid, min_price, max_price) VALUES (?, ?, ? ,?);`,
  [cid, cateid, min_price, max_price], function(error, result){
    if (error)
      throw error;
    
    res.send(result);
  })
})

// Item Detail Page API
// Method : GET
router.get('/item/detail/:itemID', function(req, res, next) {
  var itemId = req.params.itemID;
  var itemDetailJson = {};
  db.query(`SELECT * FROM item WHERE iid = ?;`, [itemId], function(error, item) {
    if (error)
      throw error;
    if (item.length == 0){
      res.send("Item dont exist!");
      return false;
    }

    itemDetailJson['iid'] = item[0].iid;
    itemDetailJson['itemName'] = item[0].name;
    itemDetailJson['rawPrice'] = item[0].rawprice;
    itemDetailJson['salePrice'] = item[0].salerice;
    itemDetailJson['context'] = item[0].context;
    itemDetailJson['views'] = item[0].views;
    itemDetailJson['startTime'] = item[0].starttime;
    itemDetailJson['endTime'] = item[0].endtime;
    itemDetailJson['deliverable'] = item[0].deliverable;
    itemDetailJson['supplierId'] = item[0].sid;
    itemDetailJson['categoryId'] = item[0].cateid;
    itemDetailJson['imagePath'] = item[0].image;

    res.json(itemDetailJson);
  })
})

module.exports = router;

