// Favorites API 코드
// Author : KJ
// 2018.12.26

var express = require('express');
var passport = require("passport");

var db = require('../../lib/db');

var router = express.Router();

// favorites API
// Method : POST
// Headers : token
// Parameters : sid
// URL : /api/favorites
// 즐겨찾기 등록 api
router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var post = req.body;
    var sid = post.sid;
    var cid = "";

    var result = {
        message: 'false'
    };

    if (!(req.user.permission === "customer" ||
        req.user.permission === "admin")) {
        res.json(result);
        return false;
    } else {
        cid = req.user.id;
    }

    db.query('SELECT * FROM favorites WHERE cid = ? AND sid = ?;', [cid, sid], function (error1, results1) {
        if (error1) {
            res.json(result);
            return false;
        }

        if (results1 <= 0) {
            db.query(`INSERT INTO favorites (cid, sid) VALUES (?, ?);`,
                [cid, sid], function (error2, results) {
                    if (error2) {
                        res.send(result);
                        return false;
                    }

                    result['message'] = 'success';
                    res.send(result);
                })
        } else {
            result['message'] = 'duplicate';
            res.json(result);
            return false;
        }
    })
})

// favorites HISTORY API
// Method : GET
// Headers : Authorization
// URL : /api/favorites/history
// 즐겨찾기 히스토리 API 
router.get('/history', passport.authenticate('jwt', { session: false }), function (req, res, next) {

    var cid = "";

    if (!(req.user.permission === 'customer' ||
        req.user.permission === 'admin')) {
        res.json([]);
        return false;
    } else {
        cid = req.user.id;
    }

    db.query(`select A.cid, B.* from ddib.favorites A inner join ddib.supplier B on A.sid = B.sid WHERE A.cid = ?; `, [cid], function (error, results) {

        if (error) {
            res.json([]);
            return false;
        }

        var result = [];

        for (var i = 0; i < results.length; i++) {
            result[i] = {
                customer_ID: results[i].cid,
                supplier_ID: results[i].sid,
                restaurant_name: results[i].rname,
                address: results[i].address,
                dlprice: results[i].dlprice,
                latitude: results[i].latitude,
                longitude: results[i].longitude
            }
        }

        res.json(result);
    })
})

// Favorites DELETE API
// Method : POST
// Headers : Authorization
// Params : sid
// URL : /api/favorites/delete
// 즐겨찾기 삭제 API
router.post('/delete', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var sid = req.body.sid;
    var cid = "";

    var result = {
        success: false
    }

    if (!sid) {
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

    db.query('DELETE FROM favorites WHERE cid = ? AND sid = ?;', [cid, sid], function (error, results) {
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