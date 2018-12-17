var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/economy/is/there/any/easter/egg', function(req, res, next) {
  res.send(`<h1>Who are you?</h1>
  <p>Why are you connecting this page? We don't have any easter egg!</p>
  <p>Not! Never!</p>`)
})

module.exports = router;
