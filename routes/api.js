// API 코드
// Author : KJ
// 2018.10.12
//
//
// Item detail API 추가 
// Author : KJ
// Modified-Date: 2018.10.12
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
//
// Modified Date : 2018.11.07
// Author : KJ
// Add category post API 
//
// Modified Date : 2018.11.13
// Author : KJ
// 장바구니 목록 출력 api 추가
//
// Modified Date : 2018.11.20
// Author : KJ
// Add Shopping Cart Update api
//
// Modified Date : 2018.11.20
// Author : KJ
// 장바구니 삭제 API 추가
//
// Modified Date : 2018.11.22
// Author : KJ
// 찜 삭제 추가
//
// Modified Date : 2018.11.22
// Author : KJ
// Wishlist HISTORY API 추가
//
// Modified Date : 2018.12.18
// Author : KJ
// Clean Up

var express = require('express');
var passport = require("passport")

var hello = require('../api/hello.json')
var db = require('../lib/db')
var CryptoPasswd = require('../lib/password_secret');

var schedule = require('node-schedule');
var key_word = require('../lib/key_word');

var FCM = require('fcm-node');

/* Server Key issued from Firebase*/
var serverKey = require('../ddib-fcm.json');
var fcm = new FCM(serverKey);

var router = express.Router();

/* GET api home page. */
router.get('/', function (req, res, next) {
  res.json(hello);
});

// Customer Sign Up API
// Method : POST
// URL : /api/sign_up/customer
// 회원가입 API
router.post('/sign_up/customer', function (req, res, next) {
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
  db.query('SELECT * FROM customer WHERE cid = ?;', [cid], function (error, user) {

    if (error) {
      throw error;
    }

    if (user.length <= 0) {

      // 2. 아이디 패스워드 유효 체크 

      var regID = /^\d{3}-\d{3,4}-\d{4}$/;
      var regPasswd = /^[a-z0-9_]{8,20}$/;

      if (!regID.test(cid)) {
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
        function (error, user) {
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
router.post('/sign_up/supplier', function (req, res, next) {
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
  db.query('SELECT * FROM supplier WHERE sid = ?;', [sid], function (error1, user1) {

    if (error1) {
      throw error1;
    }

    if (user1.length <= 0) {

      // 2. 아이디 패스워드 유효 체크 

      var regID = /^\d{3}-\d{3,4}-\d{4}$/;
      var regPasswd = /^[a-z0-9_]{8,20}$/;

      if (!regID.test(sid)) {
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
        function (error2, user2) {
          if (error2) {
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

router.post('/customer', function (req, res, next) {
  var post = req.body;
  var id = post.cid;
  var passwd = post.passwd;

  db.query(`SELECT * FROM customer WHERE cid = ? AND passwd = ?;`, [id, passwd], function (error, customer) {
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

// Supplier All GET API
// Method : GET
// URL : /api/supplier
// 모든 가맹업주를 반환하는 API
router.get('/supplier', function (req, res, next) {

  db.query(`SELECT * FROM supplier;`, function (error, supplier) {
    if (error) {
      res.json([]);
      return false;
    }

    var result = [];

    for (var i = 0; i < supplier.length; i++) {
      result[i] = {
        ID: supplier[i].sid,
        passwd: supplier[i].passwd,
        rname: supplier[i].rname,
        address: supplier[i].address,
        dlprice: supplier[i].dlprice,
        latitude: supplier[i].latitude,
        longitude: supplier[i].longitude
      }
    }


    res.send(result);
  })
})

// Customer Order history API
// Method : GET
// URL : /api/order_history/customer
// 고객의 주문 내역 제공 api
router.get("/order_history/customer", passport.authenticate('jwt', { session: false }), function (req, res) {
  var cid = "";

  var result = {
    success: false
  }
  if (!(req.user.permission === 'customer' ||
    req.user.permission === 'admin')) {
    res.send([]);
    return false;
  } else {
    cid = req.user.id;
  }

  db.query(`SELECT 
  C.*, D.sid, D.name, D.cateid, D.saleprice, D.image
FROM
  (SELECT 
      A.*, B.oid, B.iid, B.amount, B.orderstate, B.\`time\`
  FROM
      (SELECT 
      *
  FROM
      ddib.order_group
  WHERE
      cid = ?) A
  INNER JOIN ddib.\`order\` B ON A.gid = B.gid) C
      INNER JOIN
  ddib.item D ON C.iid = D.iid
ORDER BY orderdate DESC;`, [cid], function (error, results) {
      if (error) {
        res.status(501).json([]);
      }

      var orders = [];

      for (var i = 0; i < results.length; i++) {
        orders[i] = {
          gid: results[i].gid,
          cid: results[i].cid,
          order_date: results[i].orderdate,
          payment: results[i].payment,
          oid: results[i].oid,
          iid: results[i].iid,
          order_state: results[i].orderstate,
          time: results[i].time,
          sid: results[i].sid,
          name: results[i].name,
          cateid: results[i].cateid,
          sale_price: results[i].saleprice,
          image_path: results[i].image.toString('utf-8'),
          amount: results[i].amount
        };
      }

      res.json(orders);
    })
});

// Supplier Order history API
// Method : GET
// URL : /api/order_history/supplier
// 고객의 주문 내역 제공 api
router.get("/order_history/supplier", passport.authenticate('jwt', { session: false }), function (req, res) {
  var sid = "";

  if (!(req.user.permission === 'supplier' ||
    req.user.permission === 'admin')) {
    res.send([]);
    return false;
  } else {
    sid = req.user.id;
  }

  db.query(`SELECT 
  C.*, D.cid, D.orderdate, D.payment
FROM
  (SELECT 
      B.*, A.name, A.cateid, A.saleprice
  FROM
      (SELECT 
      *
  FROM
      ddib.item
  WHERE
      sid = ?) A
  INNER JOIN ddib.order B ON A.iid = B.iid) C
      INNER JOIN
  ddib.order_group D ON C.gid = D.gid ORDER BY D.orderdate DESC;`, [sid], function (error, results) {
      if (error) {
        res.status(501).json([]);
      }

      var orders = [];

      for (var i = 0; i < results.length; i++) {
        orders[i] = {
          oid: results[i].oid,
          iid: results[i].iid,
          amount: results[i].amount,
          order_state: results[i].orderstate,
          time: results[i].time,
          gid: results[i].gid,
          name: results[i].name,
          sale_price: results[i].saleprice,
          cid: results[i].cid,
          order_date: results[i].orderdate,
          payment: results[i].payment
        };
      }

      res.json(orders);
    })
});

var category_router = require('./apis/category')
var wishlist_router = require('./apis/wishlist')
var favorites_router = require('./apis/favorites')
var wtb_router = require('./apis/wtb')

router.use('/category', category_router);
router.use('/wishlist', wishlist_router);
router.use('/favorites', favorites_router);
router.use('/wtb', wtb_router);

// Shopping Cart Hisotry API
// Method : GET
// URL : /api/shopping_cart_history
// 유저의 모든 장바구니를 반환하는 API
router.get('/shopping_cart_history', passport.authenticate('jwt', { session: false }), function (req, res, next) {

  var result = [];

  var cid = req.user.id;

  db.query(`SELECT 
  A.*,
  B.sid,
  B.name,
  B.cateid,
  B.saleprice,
  B.image,
  B.starttime,
  B.endtime,
  B.deliverable,
  B.itemcount
FROM
  (SELECT 
      *
  FROM
      shopping_cart
  WHERE
      cid = ?) A
      INNER JOIN
  ddib.item B ON A.iid = B.iid;`, [cid], function (error, results) {
      if (error) {
        res.send([]);
      }

      if (results.length <= 0) {
        res.send([]);
      }
      var result = [];

      var i = 0;
      while (i < results.length) {
        result[i] = {
          ItemID: results[i].iid,
          Amount: results[i].amount,
          name: results[i].name,
          sale_price: results[i].saleprice,
          start_time: results[i].starttime,
          end_time: results[i].endtime,
          deliverable: results[i].deliverable,
          sid: results[i].sid,
          category_id: results[i].cateid,
          image_path: results[i].image.toString('utf-8'),
          item_count: results[i].itemcount
        }
        i++;
      }
      res.json(result);
    })
})

// Order POST API
// Method : POST
// Parameters : payment, iid, amount, time, length
// iid, amount, time는 order 정보들로 1;2;3;4;5; 처럼 ;를 이용하여 구분한다.
// URL : /api/order
// 주문 등록 api
router.post('/order', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  var post = req.body;
  var cid = "";
  var payment = post.payment;
  var iid = post.iid;
  var amount = post.amount;
  var time = post.time;
  var length = post.length;

  var result = {
    success: false
  }

  // iid amount time params 크기가 틀리면 false 반환 
  // TODO : string split
  var iid_length = iid.split(';').length;
  var amount_length = amount.split(';').length;
  var time_length = time.split(';').length;
  var iids = iid.split(';');

  if (iids.length < 1) {
    iids = iids.slice(0, iids.length - 1);
  }

  if ((iid_length !== amount_length) ||
    (amount_length !== time_length)) {
    res.json(result);
    return false;
  }

  if (!(req.user.permission === 'customer' ||
    req.user.permission === 'admin')) {
    res.json(result);
    return false;
  } else {
    cid = req.user.id;
  }

  db.query('CALL InsertOrders(?, ?, ?, ?, ?, ?);', [cid, payment, iid, amount, time, length], function (error, results) {
    if (error) {
      res.json(result);
      return false;
    }

    if (!(results[1][0].MYSQL_ERROR === null)) {
      res.json(result);
      return false;
    }

    result['success'] = true;
    res.json(result)
  });

  console.log(iids);
  for (var i = 0; i < iids.length; i++) {
    db.query('SELECT A.fcm_token FROM supplier A INNER JOIN item B ON A.sid = B.sid WHERE B.iid = ? AND A.fcm_token is not null;', [iids[i]], function (error, results) {
      if (error) {
        return false;
      }
      console.log(results[0].fcm_token);
      if (results.length > 0) {
        message = {
          // 수신대상
          to: results[0].fcm_token,
          // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
          notification: {
            title: "음식 주문이 들어왔습니다!",
            body: "음식 주문이 올라왔어요! 확인해 주세요",
            sound: "default"
          },
        };

        fcm.send(message, function (err, response) {
          if (err) {
            console.error('Push메시지 발송에 실패했습니다.');
            console.log(err);
            return false;
          }

          console.log('Push메시지가 발송되었습니다.');
          console.log(response);
        });
      }
    });
  }
})

// Item Post API
// Method : POST
// Header : Authorization
// Parameters : name, cateid, rawprice, saleprice, context, image, views, starttime, endtime, deliverable, count
// URL : /api/item
// 음식 등록 api
router.post('/item', passport.authenticate('jwt', { session: false }), /*upload.single('image'),*/ function (req, res, next) {
  var post = req.body;
  var sid = "";
  var name = post.name;
  var category_id = post.category_id;
  var raw_price = post.raw_price;
  var sale_price = post.sale_price;
  var context = post.context;
  var start_time = post.start_time;
  var end_time = post.end_time;
  var deliverable = post.deliverable;
  var count = post.count;
  var image = post.image;
  var timesale = post.timesale;
  var leastprice = post.leastprice;

  var result = {
    success: false
  }

  if (!image) {
    console.log(2);
    res.json(result);
    return false;
  }

  if (!(req.user.permission == 'supplier' ||
    req.user.permission == 'admin')) {
    console.log(1);
    res.json(result);
    return false;
  }
  else {
    sid = req.user.id;
  }

  db.query(`INSERT INTO item 
  (sid, name, cateid, rawprice, saleprice, context, starttime, endtime, deliverable, itemcount, image, timesale, leastprice, original_item_count) 
  VALUES (?, ?, ? ,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [sid, name, category_id, raw_price, sale_price, context, start_time, end_time, deliverable, count, image, timesale, leastprice, count],
    function (error, results) {
      if (error) {
        console.log(error);
        res.json(result);
        return false;
      }

      var message = {};
      db.query('SELECT * FROM want_to_buy A INNER JOIN customer B ON A.cid = B.cid WHERE A.cateid = ? AND A.min_price <= ? AND ? <= A.max_price;', [category_id, sale_price, sale_price], function (error2, results2) {
        if (error2) {
          console.log(error2);
          res.json(result);
          return false;
        }
        var regTokens = [];
        for (var i = 0; i < results2.length; i++) {
          if (results2[i].fcm_token) {
            regTokens[i] = results2[i].fcm_token;
          }
        }
        if (regTokens.length > 0) {
          message = {
            // 수신대상
            registration_ids: regTokens,
            // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
            notification: {
              title: "삽니다!",
              body: "삽니다!에 등록하신 카테고리로 새 음식이 올라왔어요!",

            },
          };

          fcm.send(message, function (err, response) {
            if (err) {
              console.error('Push메시지 발송에 실패했습니다.');
              console.log(err);
              return false;
            }

            console.log('Push메시지가 발송되었습니다.');
            console.log(response);
          });
        }
      });

      db.query('SELECT * FROM favorites A INNER JOIN customer B ON A.cid = B.cid WHERE A.sid = ?;', [sid], function (error2, results2) {
        if (error2) {
          console.log(error2);
          res.json(result);
          return false;
        }

        var regTokens = [];
        for (var i = 0; i < results2.length; i++) {
          if (results2[i].fcm_token) {
            regTokens[i] = results2[i].fcm_token;
          }
        }

        if (regTokens.length > 0) {
          message = {
            // 수신대상
            registration_ids: regTokens,
            // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
            notification: {
              title: "즐겨찾기!",
              body: "즐겨찾기!에 등록하신 식당에서 새 음식이 올라왔어요!",

            },
          };

          fcm.send(message, function (err, response) {
            if (err) {
              console.error('Push메시지 발송에 실패했습니다.');
              return false;
            }

            console.log('Push메시지가 발송되었습니다.');
            console.log(response);
          });
        }

      })

      result['success'] = true;
      res.json(result);
    })
})

// Review Post API
// Method : POST
// Header : Authorization
// Parameters : iid, score, text
// URL : /api/review
// 리뷰 등록 api
router.post('/review', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  var post = req.body;
  var cid = "";
  var iid = post.iid;
  var score = post.score;
  var text = post.text;

  var result = {
    success: false
  }

  if (!(req.user.permission == 'customer' ||
    req.user.permission == 'admin')) {
    res.json(result);
    return false;
  }
  else {
    cid = req.user.id;
  }

  db.query('SELECT * FROM \`order\` A WHERE A.iid = ?', [iid], function (error2, results2) {
    if (error2) {
      console.log(error2);
      res.json(result);
      return false;
    }

    if (results2.length <= 0) {
      console.log('주문한 음식이 아니다')
      res.json(result);
      return false;
    }

    db.query(`INSERT INTO review 
  (cid, iid, score, text) 
  VALUES (?, ?, ?, ?);`,
      [cid, iid, score, text],
      function (error, results) {
        if (error) {
          console.log(error2);
          res.json(result);
          return false;
        }

        result['success'] = true;
        res.json(result);
      })
  })
})

// Review GET API
// Method : GET
// URL : /api/review/:ItemID
// 리뷰 api
router.get('/review/:ItemID', function (req, res, next) {
  var iid = req.params.ItemID;

  var result = [];

  db.query(`SELECT * FROM review WHERE iid = ?;`,
    [iid],
    function (error, results) {
      if (error) {
        res.json([]);
        return false;
      }

      for (var i = 0; i < results.length; i++) {
        result[i] = {
          category_id: results[i].cid,
          item_id: results[i].iid,
          score: results[i].score,
          text: results[i].text,
          date: results[i].date
        }
      }
      res.json(result);
    })
})

// Review Custoemr ID GET API
// Method : GET
// URL : /api/review/customer/:CusotmerID
// 리뷰 api
router.get('/review/customer/:CustomerID', function (req, res, next) {
  var cid = req.params.CustomerID;

  var result = [];

  db.query(`SELECT A.*, B.name FROM review A INNER JOIN item B ON A.iid = B.iid WHERE cid = ? ORDER BY A.\`date\` DESC;`,
    [cid],
    function (error, results) {
      if (error) {
        res.json([]);
        return false;
      }

      for (var i = 0; i < results.length; i++) {
        result[i] = {
          category_id: results[i].cid,
          item_id: results[i].iid,
          score: results[i].score,
          text: results[i].text,
          date: results[i].date,
          itemName: results[i].name
        }
      }
      res.json(result);
    })
})

// Shopping Cart Post API
// Method : POST
// Headers : Authorization
// Parameters : iid, amount
// URL : /api/shopping_cart
// 장바구니 등록 api
router.post('/shopping_cart', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  var post = req.body;
  var cid = "";
  var iid = post.iid;
  var amount = post.amount;

  var result = {
    message: 'false'
  }

  if (!(iid && amount)) {
    res.json(result);
    return false;
  }

  if (!(req.user.permission === 'customer' ||
    req.user.permission === 'admin')) {
    res.json(result);
    return false;
  } else {
    cid = req.user.id;
  }

  db.query('SELECT * FROM shopping_cart WHERE cid = ? AND iid = ?',
    [cid, iid], function (error1, results1) {
      if (error1) {
        res.json(result);

        return false;
      }
      if (results1 <= 0) {
        db.query(`INSERT INTO shopping_cart (cid, iid, amount) VALUES (?, ?, ? );`,
          [cid, iid, amount], function (error2, results2) {
            if (error2) {
              res.json(result);
              return false;
            }

            result['message'] = 'success';
            res.json(result);
          })
      } else {
        result['message'] = 'duplicate';
        res.json(result);
        return false;
      }
    })
})

// Item Detail Page API
// Method : GET
// URL : [server-name]/api/item/detail/:itemID(입력)
// Return : { success : false } or 
// {
//    success : true,
//    iid : iid,
//    itemName : name.
//    rawPrice : raw_price,
//    salePrice : sale_price,
//    context : context,
//    views : views,
//    startTime : start_time.
//    endTime : end_time.
//    delivable : 0 or 1,
//    supplierId : sid.
//    categoryId : cateid.
//    imagePath : image.
//    itemCount : count
//}
router.get('/item/detail/:itemID', function (req, res, next) {
  var itemId = req.params.itemID;
  var itemDetailJson = {};
  db.query(`SELECT * FROM item WHERE iid = ?;`, [itemId], function (error, item) {
    if (error) {
      res.json({ success: false });
      return false;
    }

    if (item.length <= 0) {
      res.json({ success: false });
      return false;
    }
    db.query('UPDATE item SET views = ? WHERE iid = ?;', [item[0].views + 1, item[0].iid], function (error, result) {
      if (error) {
        res.json({ success: false })
        return false;
      }
    })

    itemDetailJson['success'] = true;
    itemDetailJson['iid'] = item[0].iid;
    itemDetailJson['itemName'] = item[0].name;
    itemDetailJson['rawPrice'] = item[0].rawprice;
    itemDetailJson['salePrice'] = item[0].saleprice;
    itemDetailJson['context'] = item[0].context;
    itemDetailJson['views'] = item[0].views + 1;
    itemDetailJson['startTime'] = item[0].starttime;
    itemDetailJson['endTime'] = item[0].endtime;
    itemDetailJson['deliverable'] = item[0].deliverable;
    itemDetailJson['supplierId'] = item[0].sid;
    itemDetailJson['categoryId'] = item[0].cateid;
    itemDetailJson['imagePath'] = item[0].image.toString('utf-8');
    itemDetailJson['itemCount'] = item[0].itemcount;
    res.json(itemDetailJson);
  })
})

// All Item List Page API
// Method : GET
// URL : [server-name]/api/item/list/:sort
// Return : { success : false } or 
// [{ 
//    success : true,
//    iid : iid,
//    itemName : name.
//    rawPrice : raw_price,
//    salePrice : sale_price,
//    context : context,
//    views : views,
//    startTime : start_time.
//    endTime : end_time.
//    delivable : 0 or 1,
//    supplierId : sid.
//    categoryId : cateid.
//    imagePath : image.
//    itemCount : count,
//    avg_review_score : review
//}, ... ]
router.get('/item/list/:sort', function (req, res, next) {

  var result = [];

  var sql = 'SELECT C.*, ifnull(avg(D.score), 0) as avg_score FROM (SELECT A.*, B.rname FROM ddib.item A INNER JOIN ddib.supplier B ON A.sid = B.sid) C LEFT OUTER JOIN ddib.review D on C.iid = D.iid GROUP BY C.iid ';

  if (req.params.sort === '0') { // 최다 조회수 순
    sql = sql + 'ORDER BY views DESC;';
  } else if (req.params.sort === '1') { // 최신 음식 순
    sql = sql + 'ORDER BY starttime DESC, endtime DESC;';
  } else if (req.params.sort === '2') { // 싼 가격 순
    sql = sql + 'ORDER BY saleprice ASC;';
  } else if (req.params.sort === '3') { // 비싼 가격 순
    sql = sql + 'ORDER BY saleprice DESC';
  } else {
    // Nothing
  }
  db.query(sql, function (error, item) {
    if (error) {
      res.json([]);
      return false;
    }

    if (item.length <= 0) {
      res.json([]);
      return false;
    }
    for (var i = 0; i < item.length; i++) {
      result[i] = {
        success: true,
        iid: item[i].iid,
        itemName: item[i].name,
        rawPrice: item[i].rawprice,
        salePrice: item[i].saleprice,
        context: item[i].context,
        views: item[i].views,
        startTime: item[i].starttime,
        endTime: item[i].endtime,
        deliverable: item[i].deliverable,
        supplierId: item[i].sid,
        categoryId: item[i].cateid,
        imagePath: item[i].image.toString('utf-8'),
        itemCount: item[i].itemcount,
        restaurant_name: item[i].rname,
        avg_review_score: item[i].avg_score
      }
    }
    res.json(result);
  })
})

// Item Search Page API
// Method : POST
// Params : name or cateid or sid
// URL : [server-name]/api/item/Search/:Name(입력)
// Return : { success : false } or 
// {
//    success : true,
//    iid : iid,
//    itemName : name.
//    rawPrice : raw_price,
//    salePrice : sale_price,
//    context : context,
//    views : views,
//    startTime : start_time.
//    endTime : end_time.
//    delivable : 0 or 1,
//    supplierId : sid.
//    categoryId : cateid.
//    imagePath : image.
//    itemCount : count
//}
router.post('/item/search', function (req, res, next) {
  var name = req.body.name;
  var category_id = req.body.cateid;
  var supplier_id = req.body.sid;

  var result = [];

  var format_sql = [];

  var format = [];

  var sql = 'SELECT A.*, B.rname FROM item A INNER JOIN supplier B ON A.sid = B.sid WHERE ';
  var condition = "";

  var i = 0;

  if (name && category_id && supplier_id) {
    format_sql = "name LIKE ? AND cateid = ? AND sid = ? "
    format = ['%' + name + '%', category_id, supplier_id];
  } else if (name && category_id) {
    format_sql = "name LIKE ? AND cateid = ? "
    format = ['%' + name + '%', category_id];
  } else if (name && supplier_id) {
    format_sql = "name LIKE ? AND sid = ? "
    format = ['%' + name + '%', supplier_id];
  } else if (category_id && supplier_id) {
    format_sql = "cateid = ? AND sid = ? "
    format = [category_id, supplier_id];
  } else if (name) {
    format_sql = 'name LIKE ? ';
    format = ['%' + name + '%'];
  } else if (category_id) {
    format_sql = 'cateid = ? ';
    format = [category_id];
  } else if (supplier_id) {
    format_sql = 'A.sid = ? ';
    format = [supplier_id];
  } else {
    res.json([]);
    return false;
  }

  sql = sql + format_sql + 'ORDER BY views DESC;';

  db.query(sql, format, function (error, item) {
    if (error) {
      res.json([]);
      return false;
    }

    for (var i = 0; i < item.length; i++) {

      result[i] = {
        success: true,
        iid: item[i].iid,
        itemName: item[i].name,
        rawPrice: item[i].rawprice,
        salePrice: item[i].saleprice,
        context: item[i].context,
        views: item[i].views + 1,
        startTime: item[i].starttime,
        endTime: item[i].endtime,
        deliverable: item[i].deliverable,
        supplierId: item[i].sid,
        categoryId: item[i].cateid,
        imagePath: item[i].image.toString('utf-8'),
        itemCount: item[i].itemcount,
        restaurant_name: item[i].rname
      }
    }
    res.json(result);
  })
})


// All Item Search Page API
// Method : POST
// Params : name 
// URL : [server-name]/api/item/search/all
// Return : { success : false } or 
// {
//    success : true,
//    iid : iid,
//    itemName : name.
//    rawPrice : raw_price,
//    salePrice : sale_price,
//    context : context,
//    views : views,
//    startTime : start_time.
//    endTime : end_time.
//    delivable : 0 or 1,
//    supplierId : sid.
//    categoryId : cateid.
//    imagePath : image.
//    itemCount : count
//}
router.post('/item/search/all', function (req, res, next) {
  var name = req.body.name;

  name = '%' + name + '%';

  var result = [];

  var sql = 'select * from (select A.*, B.name as CategoryName, C.rname as RestaurantName from ddib.item A, ddib.category B, ddib.supplier C WHERE A.cateid = B.cateid AND A.sid = C.sid ) D WHERE name like ? OR CategoryName like ? OR RestaurantName like ? ';

  sql = sql + 'ORDER BY views DESC;';

  db.query(sql, [name, name, name], function (error, item) {
    if (error) {
      res.json([]);
      console.log(error)
      return false;
    }

    for (var i = 0; i < item.length; i++) {

      result[i] = {
        success: true,
        iid: item[i].iid,
        itemName: item[i].name,
        rawPrice: item[i].rawprice,
        salePrice: item[i].saleprice,
        context: item[i].context,
        views: item[0].views + 1,
        startTime: item[0].starttime,
        endTime: item[0].endtime,
        deliverable: item[0].deliverable,
        supplierId: item[0].sid,
        categoryId: item[0].cateid,
        imagePath: item[0].image.toString('utf-8'),
        itemCount: item[0].itemcount
      }
    }
    res.json(result);
  })
})

// Alarm API
// Method : GET
// HEADERS : Authorization
// URL : /api/alarm
// 알람 서비스 
router.get('/alarm', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  var cid = req.user.id;

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
INNER JOIN \`order\` B ON A.gid = B.gid group by iid order by sum_amount desc, max_orderdate desc) C inner join item D on C.iid = D.iid limit 1;`, [cid], function (error, items) {
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
      \`order\` A inner join order_group B on A.gid = B.gid group by orderdate_date, iid order by 1 desc, 3 desc limit 1) C inner join item D on C.iid = D.iid;`, function (error, items) {
            if (error)
              throw error;

            if (items.length > 0) {
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

// FAQ POST API
// Method : POST
// Parameters : token, question, answer
// URL : /api/faq
// FAQ 등록 api
router.post('/faq', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  var post = req.body;
  var question = post.question;
  var answer = post.answer;

  var result = {
    success: false
  }

  if (!(question && answer)) {
    res.json(result);
    return false;
  }
  // 권한 admin
  if (req.user.permission !== 'admin') {
    result['permssion'] = false;
    res.json(result);
    return false;
  }

  db.query(`INSERT INTO faq (question, answer) VALUES (? ,?);`,
    [question, answer], function (error, results) {
      if (error) {
        result['error'] = true;
        res.status(501).send(result);
        return false;
      }

      result['success'] = true;
      res.send(result);
    })
})

// Shopping Cart Update API
// Method : POST
// Parameters : amount, iid
// URL : /api/shopping_cart/update
// 장바구니 업데이트 api
router.post('/shopping_cart/update', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  var post = req.body;
  var cid = "";
  var amount = post.amount;
  var iid = post.iid;

  var result = {
    success: false
  }
  // 무조건 입력
  if (!(iid && amount)) {
    res.json(result);
    return false;
  }

  // amount가 0 이하일 경우
  if (amount <= 0) {
    res.json(result);
    return false;
  }

  if (!(req.user.permission === 'customer' ||
    req.user.permission === 'admin')) {
    res.json(result);
    return false;
  } else {
    cid = req.user.id;
  }

  db.query(`SELECT * FROM shopping_cart WHERE cid = ? AND iid = ?;`,
    [cid, iid],
    function (error, results) {
      if (error) {
        res.json(result);
        return false;
      }

      if (results.length <= 0) {
        res.json(result);
        return false;
      } else {
        db.query(`UPDATE shopping_cart 
      SET 
          amount = ?
      WHERE
          iid = ? AND cid = ?;`, [amount, iid, cid], function (error, results) {
            if (error) {
              res.json(result);
              return false;
            }

            result['success'] = true;
            res.json(result);
          })
      }
    })
})

// Shopping Cart DELETE API
// Method : POST
// Parameters : iid
// URL : /api/shopping_cart/delete
// 장바구니 삭제 api
router.post('/shopping_cart/delete', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  var post = req.body;
  var cid = "";
  var iid = post.iid;

  var result = {
    success: false
  }

  if (!iid) {
    res.json(result);
    return false;
  }

  if (!(req.user.permission === 'customer' ||
    req.user.permission === 'admin')) {
    res.json(result);
    return false;
  } else {
    cid = req.user.id;
  }

  db.query(`DELETE FROM shopping_cart WHERE cid = ? AND iid = ?;`,
    [cid, iid], function (error, results) {
      if (error) {
        res.json(result);
        return false;
      }

      if (results.affectedRows > 0) {
        result['success'] = true;
      }

      res.send(result);
    })
})

// Supplier Detail Item API
// Method : GET
// URL : /api/supplier/detail/item/:ItemID
// 아이템을 이용하여 가맹업주 정보 제공하는 API
router.get('/supplier/detail/item/:ItemID', function (req, res, next) {
  var iid = req.params.ItemID;
  var sid = "";

  // HACK : how about joining two table such as `item` and `supplier`
  db.query('SELECT sid FROM item WHERE iid = ?;', [iid], function (error, results) {
    if (error) {
      res.json([]);
      return false;
    }

    if (results.length <= 0) {
      res.json([]);
      return false;
    }

    sid = results[0].sid;

    db.query('SELECT * FROM supplier WHERE sid = ?;', [sid], function (error, supplier) {
      if (error) {
        res.json([]);
        return false;
      }

      var result = [];

      for (var i = 0; i < supplier.length; i++) {
        result[i] = {
          ID: supplier[i].sid,
          rname: supplier[i].rname,
          latitude: supplier[i].latitude,
          longitude: supplier[i].longitude,
          address: supplier[i].address,
          dlprice: supplier[i].dlprice
        }
      }

      res.json(result);
    })
  })
})

// Order state UPDATE API
// Method : POST
// Headers : Authorization
// Params : oid, state ['waiting', 'cooking', 'delivery', 'complement']
// URL : /api/order/state/update
// Order state UPDATE API
router.post('/order/state/update', passport.authenticate('jwt', { session: false }), function (req, res, next) {

  var states = ['waiting', 'cooking', 'delivery', 'complement'];

  var sid = "";
  var state = req.body.state;
  var oid = req.body.oid;

  var result = {
    success: false
  }

  if (states.indexOf(state) === -1) {

    res.json(result);
    return false;
  }

  if (!(req.user.permission === 'supplier' ||
    req.user.permission === 'admin')) {
    res.json(result);
    return false;
  } else {
    sid = req.user.id;
  }

  db.query('UPDATE \`order\` SET orderstate = ? WHERE oid = ?;', [state, oid], function (error, results) {
    if (error) {
      console.log(error);
      res.json(result);
      return false;
    }

    if (results.affectedRows <= 0) {
      res.json(result);
      return false;
    }

    result['success'] = true;
    res.json(result);
  })
})

// Item UPDATE API
// Method : POST
// Headers : Authorization (sid)
// Params : sale_price, count, start_time, endtime, iid
// URL : /api/order/state/update
// Item UPDATE API
router.post('/item/update', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  var post = req.body;
  var sid = "";
  var saleprice = post.sale_price;
  var itemcount = post.count;
  var starttime = post.start_time;
  var endtime = post.end_time;
  var iid = post.iid;

  var result = {
    success: false
  }

  if (!(req.user.permission === 'supplier' ||
    req.user.permission === 'admin')) {
    res.json(result);
    return false;
  } else {
    sid = req.user.id;
  }

  db.query('UPDATE item SET saleprice = ?, itemcount = ?, starttime = ?, endtime = ? WHERE iid = ? AND sid = ?;', [saleprice, itemcount, starttime, endtime, iid, sid], function (error, results) {
    if (error) {
      console.log(error);
      res.json(result);
      return false;
    }

    if (results.affectedRows <= 0) {
      res.json(result);
      return false;
    }

    result['success'] = true;
    res.json(result);
  })
})

module.exports = router;