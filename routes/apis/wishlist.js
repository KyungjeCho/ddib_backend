// Wishlist API 코드
// Author : KJ
// 2018.12.26

var express = require('express');
var passport = require("passport");

var db = require('../../lib/db');

var router = express.Router();

// wishlist POST API
// Method : POST
// Parameters : iid
// URL : /api/wishlist
// 찜 등록 api
router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var post = req.body;
    var cid = "";
    var iid = post.iid;

    var result = {
        message: 'false'
    }

    if (!(req.user.permission === 'customer' ||
        req.user.permission === 'admin')) {
        res.json(result);
        return false;
    } else {
        cid = req.user.id;
    }

    db.query('SELECT * FROM wishlist WHERE cid = ? AND iid = ?;', [cid, iid], function (error, results1) {
        if (error) {
            res.json(result);
            return false;
        }

        if (results1 <= 0) {
            db.query(`INSERT INTO wishlist (cid, iid) VALUES (?, ?);`, [cid, iid], function (error, results2) {
                if (error) {
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
});

// Wishlist DELETE API
// Method : POST
// Parameters : iid
// URL : /api/wishlist/delete
// 찜 삭제 api
router.post('/delete', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var post = req.body;
    var cid = "";
    var iid = post.iid;

    var result = {
        success: false
    }

    if (!iid) {
        res.send(result);
        return false;
    }

    if (!(req.user.permission === 'customer' ||
        req.user.permission === 'admin')) {
        res.send(result);
        return false;
    } else {
        cid = req.user.id;
    }

    db.query(`DELETE FROM wishlist WHERE cid = ? AND iid = ?;`, [cid, iid], function (error, results) {
        if (error) {
            res.send(result);
            return false;
        }

        if (results.affectedRows <= 0) {
            res.send(result);
            return false;
        }

        result['success'] = true;
        res.send(result);
    })
});

// Wishlist HISTORY API
// Method : GET
// URL : /api/wishlist/history
// 고객의 찜 목록 반환 API
router.get('/history', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var cid = "";

    if (!(req.user.permission === 'customer' ||
        req.user.permission === 'admin')) {
        res.json([]);
        return false;
    } else {
        cid = req.user.id;
    }

    db.query(`SELECT 
    A.*,
    B.sid,
    B.name,
    B.cateid,
    B.saleprice,
    B.image,
    B.views,
    B.starttime,
    B.endtime,
    B.deliverable,
    B.itemcount
  FROM
    (SELECT 
        *
    FROM
        ddib.wishlist
    WHERE
        cid = ?) A
        INNER JOIN
    ddib.item B ON A.iid = B.iid;`, [cid], function (error, results) {
        if (error) {
            res.json([]);
            return false;
        }

        var result = [];
        for (var i = 0; i < results.length; i++) {
            result[i] = {
                customer_id: results[i].cid,
                item_id: results[i].iid,
                supplier_id: results[i].sid,
                name: results[i].name,
                category_id: results[i].cateid,
                sale_price: results[i].saleprice,
                image_path: results[i].image.toString('utf-8'),
                views: results[i].views,
                start_time: results[i].starttime,
                end_time: results[i].endtime,
                deliverable: results[i].deliverable,
                item_count: results[i].itemcount
            }
        }

        res.json(result);
    })
})

module.exports = router;