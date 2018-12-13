var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken');
var _ = require("lodash");
var bodyParser = require('body-parser');


var schedule = require('node-schedule');

var key_word = require('./lib/key_word');
var session = require('./lib/session')
var db = require('./lib/db');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api')

var authRouter = require('./routes/auth');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var passport = require("passport");

app.get("/secret", passport.authenticate('jwt', { session: false }), function(req, res){
  res.json({message: "Success! You can not see this without a token"});
});

app.get("/secretDebug",
  function(req, res, next){
    console.log(req.get('Authorization'));
    next();
  }, function(req, res){
    res.json("debugging");
});

function item_decrease() {

  db.query('SELECT * FROM item WHERE timesale = 1 AND original_item_count / 2 < itemcount;', function(error, results){
    if (error) {
      return false;
    }

    for (var i = 0; i < results.length; i++) {
      var date = new Date();
      
      date.setHours(date.getUTCHours() + 9);
      console.log(date.toDateString());
      var starttime = new Date(results[i].starttime);
      var endtime = new Date(results[i].endtime);
      console.log(starttime, endtime);

      var half_time = (starttime.getTime() + endtime.getTime()) / 2;
      var quarter_time = ((1 - 3/ 4) * starttime.getTime() + (3/4) * endtime.getTime());

      console.log(date.getTime(), half_time, quarter_time);
      console.log(results[i].sale_step);

      var half_time_obj = new Date(half_time);
      var quarter_time_obj = new Date(quarter_time);

      console.log(date.getTime(), half_time, quarter_time);
      console.log("Current : " + date.toLocaleString(), "Half time : " + half_time_obj.toLocaleString(), "Quarter time : " + quarter_time_obj.toLocaleString());
      console.log("Over Half time : " + (date.getTime() > half_time), "Over quarter Time : " + (date.getTime() > quarter_time));

      if (date.getTime() /*current time*/ > half_time /*over than half time */&& results[i].sale_step === 0) {
        console.log(1);

        console.log(results[i].saleprice, results[i].leastprice);
        var sale_price =  (results[i].saleprice + results[i].leastprice) / 2;

        console.log(sale_price);
        db.query('UPDATE item SET saleprice = ?, sale_step = ?, original_review_count = ? WHERE iid = ?;', [sale_price, 1, results[i].iid, results[i].itemcount], function (error2, resutls2){
          if (error2) {
            console.log('Update error');
          }
        })
      } else if (date.getTime() > quarter_time && results[i].sale_step === 1) {
        console.log(0);
        var sale_price = results[i].leastprice;

        console.log(sale_price);
        db.query('UPDATE item SET saleprice = ?, sale_step = ?, timesale = ? WHERE iid = ?;', [sale_price, 2, 0, results[i].iid], function (error2, resutls2){
          if (error2) {
            console.log('Update Error');
          }
        })
      } else {
        console.log(-1);
      }
    }
  })
}
var timerObj = setInterval(function () {
  item_decrease();
}, 300000);

timerObj.unref();

setImmediate(() => {
  timerObj.ref();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
