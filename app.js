var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken');
var _ = require("lodash");
var bodyParser = require('body-parser');
var FCM = require('fcm-node');

var serverKey = require('./ddib-fcm.json');

var fcm = new FCM(serverKey)

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

db.query('SELECT * FROM customer WHERE fcm_token is not null;', function(error, results) {
  if (error){
    return false;
  }

  client_token = results[0].fcm_token;
})
/** 발송할 Push 메시지 내용 */
var push_data = {
  // 수신대상
  to: client_token,
  // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
  notification: {
      title: "Hello Node",
      body: "Node로 발송하는 Push 메시지 입니다.",
      sound: "default",
      click_action: "FCM_PLUGIN_ACTIVITY",
      icon: "fcm_push_icon"
  },
  // 메시지 중요도
  priority: "high",
  // App 패키지 이름
  restricted_package_name: "study.cordova.fcmclient",
  // App에게 전달할 데이터
  data: {
      num1: 2000,
      num2: 3000
  }
};

/** 아래는 푸시메시지 발송절차 */
var fcm = new FCM(serverKey);

fcm.send(push_data, function(err, response) {
  if (err) {
      console.error('Push메시지 발송에 실패했습니다.');
      console.error(err);
      return;
  }

  console.log('Push메시지가 발송되었습니다.');
  console.log(response);
});

module.exports = app;
