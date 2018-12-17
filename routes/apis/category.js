// Category API 코드
// Author : KJ
// 2018.12.18

var express = require('express');
var passport = require("passport");

var db = require('../../lib/db');

var router = express.Router();

// Category API
// Method : GET
// URL : /api/category
// 모든 카테고리를 반환하는 API
router.get('/', function (req, res, next) {

    db.query('SELECT * FROM category;', function (error, results) {
        if (error) {
            res.json([]);
            return false;
        }

        var result = [];

        for (var i = 0; i < results.length; i++) {
            result[i] = {
                ID: results[i].cateid,
                name: results[i].name
            }
        }

        res.json(results);
    })
})

// Category POST API
// Method : POST
// Parameters : name, token
// URL : /api/category
// 카테고리 등록 api
router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var body = req.body;
    var name = body.name;

    var result = {
        success: false
    };

    if (req.user.permission !== 'admin') {
        res.json(result);
        return false;
    }

    db.query('INSERT INTO category (name) VALUES (?);', [name], function (error, results) {
        if (error) {
            res.status(501).json(result);
            return false;
        }

        result['success'] = true;

        res.json(result);
    })
})

// Category Detail API
// Method : GET
// URL : /api/category/detail/:CategoryID
// 한 카테고리를 반환하는 API
router.get('/detail/:CategoryID', function (req, res, next) {
    var cateid = req.params.CategoryID;

    db.query('SELECT * FROM category WHERE cateid = ?;', [cateid], function (error, results) {
        if (error) {
            res.json([])
            return false;
        }

        var result = [];

        for (var i = 0; i < results.length; i++) {
            result[i] = {
                ID: results[i].cateid,
                name: results[i].name
            }
        }

        res.json(result);
    })
})


module.exports = router;