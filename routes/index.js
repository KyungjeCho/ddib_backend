var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* 테스트 용 로그인 페이지 오직 웹페이지에서 사용 */
router.get('/login', function(req, res, next) {
  res.send(`<form action='/auth/login/customer' method='POST'>
  <input type="text" name="cid" placeholder="ID" /><br />
  <input type="password" name="passwd" placeholder="password" /><br />
  <input type="submit" />
  </form>
  `)
});

router.get('/economy/is/there/any/easter/egg', function(req, res, next) {
  res.send(`<h1>Who are you?</h1>
  <p>Why are you connecting this page? We don't have any easter egg!</p>
  <p>Not! Never!</p>`)
})

module.exports = router;
