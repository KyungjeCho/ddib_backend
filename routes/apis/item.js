// Want_To_Buy API 코드
// Author : KJ
// 2018.12.29

var express = require('express');
var passport = require("passport");
var firebase = require('firebase-admin')

var db = require('../../lib/db');

// 잠재적 문제가 있음 : 알람 전송 테스트 필요
if (!firebase.apps.length) {
    firebase.initializeApp({});
 }

var router = express.Router();

// Item Post API
// Method : POST
// Header : Authorization
// Parameters : name, cateid, rawprice, saleprice, context, image, views, starttime, endtime, deliverable, count
// URL : /api/item
// 음식 등록 api
router.post('/', passport.authenticate('jwt', { session: false }), /*upload.single('image'),*/ function (req, res, next) {
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
    var time_sale = post.timesale;
    var least_price = post.leastprice;

    var result = {
        success: false
    }

    if (!image) {
        res.json(result);
        return false;
    }

    if (!(req.user.permission == 'supplier' ||
        req.user.permission == 'admin')) {
        res.json(result);
        return false;
    } else {
        sid = req.user.id;
    }

    db.query(`INSERT INTO item 
    (sid, name, cateid, rawprice, saleprice, context, starttime, endtime, deliverable, itemcount, image, timesale, leastprice, original_item_count) 
    VALUES (?, ?, ? ,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
    , [sid, name, category_id, raw_price, sale_price, context, start_time, end_time, deliverable, count, image, time_sale, least_price, count], function (error, results) {
            if (error) {
                res.json(result);
                return false;
            }

            var message = {};

            // 'want to buy' feature alarm push
            db.query('SELECT * FROM want_to_buy A INNER JOIN customer B ON A.cid = B.cid WHERE A.cateid = ? AND A.min_price <= ? AND ? <= A.max_price;', [category_id, sale_price, sale_price], function (error2, results2) {
                if (error2) {
                    console.log(error2);
                    res.json(result);
                    return false;
                }

                var reg_tokens = [];

                for (var i = 0; i < results2.length; i++) {
                    if (results2[i].fcm_token) {
                        reg_tokens[i] = results2[i].fcm_token;
                    }
                }

                if (reg_tokens.length > 0) {
                    message = {
                        // 수신대상
                        registration_ids: reg_tokens,
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

            // 'favorites' alarm push
            db.query('SELECT * FROM favorites A INNER JOIN customer B ON A.cid = B.cid WHERE A.sid = ?;', [sid], function (error2, results2) {
                if (error2) {
                    res.json(result);
                    return false;
                }

                var reg_tokens = [];
                for (var i = 0; i < results2.length; i++) {
                    if (results2[i].fcm_token) {
                        reg_tokens[i] = results2[i].fcm_token;
                    }
                }

                if (reg_tokens.length > 0) {
                    message = {
                        // 수신대상
                        registration_ids: reg_tokens,
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
router.get('/detail/:item_id', function (req, res, next) {
    var item_id = req.params.item_id;
    var result = {};
    db.query(`SELECT * FROM item WHERE iid = ?;`, [item_id], function (error, results) {
        if (error) {
            res.json({ success: false });
            return false;
        }

        if (results.length <= 0) {
            res.json({ success: false });
            return false;
        }
        db.query('UPDATE item SET views = ? WHERE iid = ?;', [results[0].views + 1, results[0].iid], function (error2, results2) {
            if (error2) {
                res.json({ success: false })
                return false;
            }
        })

        result['success'] = true;
        result['iid'] = results[0].iid;
        result['itemName'] = results[0].name;
        result['rawPrice'] = results[0].rawprice;
        result['salePrice'] = results[0].saleprice;
        result['context'] = results[0].context;
        result['views'] = results[0].views + 1;
        result['startTime'] = results[0].starttime;
        result['endTime'] = results[0].endtime;
        result['deliverable'] = results[0].deliverable;
        result['supplierId'] = results[0].sid;
        result['categoryId'] = results[0].cateid;
        result['imagePath'] = results[0].image.toString('utf-8');
        result['itemCount'] = results[0].itemcount;
        res.json(result);
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
router.get('/list/:sort', function (req, res, next) {

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

    db.query(sql, function (error, results) {
        if (error) {
            res.json([]);
            return false;
        }

        if (results.length <= 0) {
            res.json([]);
            return false;
        }
        for (var i = 0; i < results.length; i++) {
            result[i] = {
                // TODO : change camelCase to snake_case
                success: true,
                iid: results[i].iid,
                itemName: results[i].name,
                rawPrice: results[i].rawprice,
                salePrice: results[i].saleprice,
                context: results[i].context,
                views: results[i].views,
                startTime: results[i].starttime,
                endTime: results[i].endtime,
                deliverable: results[i].deliverable,
                supplierId: results[i].sid,
                categoryId: results[i].cateid,
                imagePath: results[i].image.toString('utf-8'),
                itemCount: results[i].itemcount,
                restaurant_name: results[i].rname,
                avg_review_score: results[i].avg_score
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
router.post('/search', function (req, res, next) {
    var name = req.body.name;
    var category_id = req.body.cateid;
    var supplier_id = req.body.sid;

    var result = [];

    var format_sql = [];

    var format = [];

    var sql = 'SELECT A.*, B.rname FROM item A INNER JOIN supplier B ON A.sid = B.sid WHERE ';

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

    db.query(sql, format, function (error, results) {
        if (error) {
            res.json([]);
            return false;
        }

        for (var i = 0; i < results.length; i++) {

            result[i] = {
                // TODO : change camelCase to snake_case
                success: true,
                iid: results[i].iid,
                itemName: results[i].name,
                rawPrice: results[i].rawprice,
                salePrice: results[i].saleprice,
                context: results[i].context,
                views: results[i].views + 1,
                startTime: results[i].starttime,
                endTime: results[i].endtime,
                deliverable: results[i].deliverable,
                supplierId: results[i].sid,
                categoryId: results[i].cateid,
                imagePath: results[i].image.toString('utf-8'),
                itemCount: results[i].itemcount,
                restaurant_name: results[i].rname
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
router.post('/search/all', function (req, res, next) {
    var name = req.body.name;

    name = '%' + name + '%';

    var result = [];

    var sql = 'select * from (select A.*, B.name as CategoryName, C.rname as RestaurantName from ddib.item A, ddib.category B, ddib.supplier C WHERE A.cateid = B.cateid AND A.sid = C.sid ) D WHERE name like ? OR CategoryName like ? OR RestaurantName like ? ';

    sql = sql + 'ORDER BY views DESC;';

    db.query(sql, [name, name, name], function (error, results) {
        if (error) {
            res.json([]);
            return false;
        }

        for (var i = 0; i < results.length; i++) {

            result[i] = {
                // TODO : change camelCase to snake_case
                success: true,
                iid: results[i].iid,
                itemName: results[i].name,
                rawPrice: results[i].rawprice,
                salePrice: results[i].saleprice,
                context: results[i].context,
                views: results[0].views + 1,
                startTime: results[0].starttime,
                endTime: results[0].endtime,
                deliverable: results[0].deliverable,
                supplierId: results[0].sid,
                categoryId: results[0].cateid,
                imagePath: results[0].image.toString('utf-8'),
                itemCount: results[0].itemcount
            }
        }
        res.json(result);
    })
})

// Item UPDATE API
// Method : POST
// Headers : Authorization (sid)
// Params : sale_price, count, start_time, endtime, iid
// URL : /api/order/state/update
// Item UPDATE API
router.post('/update', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var post = req.body;
    var sid = "";
    var sale_price = post.sale_price;
    var item_count = post.count;
    var start_time = post.start_time;
    var end_time = post.end_time;
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

    db.query('UPDATE item SET saleprice = ?, itemcount = ?, starttime = ?, endtime = ? WHERE iid = ? AND sid = ?;', [sale_price, item_count, start_time, end_time, iid, sid], function (error, results) {
        if (error) {
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