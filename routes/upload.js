// Static file Upload 코드 
// Author : KJ
// Created-Date : 2018.10.13

var express = require('express');
var bodyParser = require('body-parser')
var multer = require('multer')

var hello = require('../api/hello.json')
var db = require('../lib/db')

var router = express.Router();

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/images' + req.url + '/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage })

// Suppler Upload Thumb nail image
// Method : POST
// Parameter : userfile=[image file]
// URL : /upload/item
// 가맹업주 썸네일 이미지 업로드
router.post('/item', upload.single('userfile'), function(req, res, next) {
    // TODO: AUTH Supplier

    res.send("Uploaded! : " + req.file);
})

module.exports = router;

