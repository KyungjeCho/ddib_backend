// Want_To_Buy API 코드
// Author : KJ
// 2018.12.29

var express = require('express');
var passport = require("passport");

var db = require('../../lib/db');

var router = express.Router();

// Want To Buy API
// Method : GET
// Headers : Authorization
// URL : /api/wtb
// Return : 유저의 삽니다 목록 or []
// 유저의 삽니다 목록 API
router.get('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var cid = "";

    if (!(req.user.permission === 'customer' ||
        req.user.permission === 'admin')) {
        res.json([]);
        return false;
    }
    else {
        cid = req.user.id;
    }

    // wtb 테이블과 category 테이블을 조인하여 카테고리 이름을 얻는다.
    // HACK: 조인문은 느리다. 일단 인덱스를 걸었지만 더 빠르게 구현하기
    db.query(`SELECT wtb.*, cate.name FROM want_to_buy wtb INNER JOIN category cate ON wtb.cateid = cate.cateid WHERE wtb.cid = ?;`, [cid], function (error, results) {
        if (error)
            throw error;

        var result = [];

        for (var i = 0; i < results.length; i++) {
            result[i] = {
                // TODO : change camelCase to snake_case
                cateID: results[i].cateid,
                cateName: results[i].name,
                minPrice: results[i].min_price,
                maxPrice: results[i].max_price
            }
        }

        res.json(result);
    })
})

// Want_to_buy API
// Method : POST
// Headers : Authorization
// Parameters : cateid, min_price, max_price
// URL : /api/wtb
// 삽니다 등록 api
router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var post = req.body;
    var cid = "";
    var cateid = post.cateid;
    var min_price = post.min_price;
    var max_price = post.max_price;

    if (!(req.user.permission === 'customer' ||
        req.user.permission === 'admin')) {
        res.json({ success: false });
        return false;
    }
    else {
        cid = req.user.id;
    }

    db.query(`INSERT INTO want_to_buy (cid, cateid, min_price, max_price) VALUES (?, ?, ? ,?);`, [cid, cateid, min_price, max_price], function (error, result) {
        if (error) {
            res.json({ success: false });
            return false;
        }

        res.json({ success: true });
    })
})

// Want_to_buy DELETE API
// Method : POST
// Headers : Authorization
// Parameters : cateid
// URL : /api/wtb/delete
// 삽니다 삭제 api
router.post('/delete', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var post = req.body;
    var cid = "";
    var cateid = post.cateid;

    var result = {
        success: false
    }

    if (!(req.user.permission === 'customer' ||
        req.user.permission === 'admin')) {
        res.json(result);
        return false;
    } else {
        cid = req.user.id;
    }

    db.query(`DELETE FROM want_to_buy WHERE cid = ? AND cateid = ?;`, [cid, cateid], function (error, results) {
        if (error) {
            res.json(result);
            return false;
        }

        if (results.affectedRows <= 0) {
            res.json(result);
            return false;
        };

        result['success'] = true;
        res.json(result);
    })
})

module.exports = router;