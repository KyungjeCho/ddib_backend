var express = require('express');

var hello = require('../api/hello.json')
var db = require('../lib/db')

var router = express.Router();

/* GET api home page. */
router.get('/', function(req, res, next) {
  res.send(hello);
});

router.get('/customer/:customerId', function(req, res, next) {
  
  db.query(`SELECT * FROM customer WHERE cid = '${req.params.customerId}';`, function(error, customer){
    if (error)
      throw error;
    
    var customer_json = {};
    customer_json['ID'] = customer[0].cid;
    customer_json['password'] = customer[0].passwd;
    customer_json['name'] = customer[0].name;
    customer_json['address'] = customer[0].address;
    res.send(customer_json);
  })
})

router.get('/supplier/:supplierId', function(req, res, next) {
  
  db.query(`SELECT * FROM supplier WHERE sid = '${req.params.supplierId}';`, function(error, supplier){
    if (error)
      throw error;

    var supplier_json = {};
    supplier_json['ID'] = supplier[0].sid;
    supplier_json['password'] = supplier[0].passwd;
    supplier_json['rname'] = supplier[0].rname;
    supplier_json['address'] = supplier[0].address;
    supplier_json['dlprice'] = supplier[0].dlpress;
    res.send(supplier_json);
  })
})

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
module.exports = router;

