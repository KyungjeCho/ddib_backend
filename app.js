var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
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

app.use(session);

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  console.log('seralizeUser', user);
  done(null, user.cid);
  // done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('deseralizeUser', id);
  db.query('SELECT * FROM customer WHERE cid = ?;', [id], function(error, result){
    done(null, result[0]);
  });
  // User.findById(id, function(err, user) {
  //   done(null, user.id);
  // });
});

passport.use(new LocalStrategy(
  {
    usernameField : 'cid',
    passwordField : 'passwd'
  },
  function (username, password, done) {
    console.log('LocalStrategy', username, password);
    db.query('SELECT * FROM customer WHERE cid = ? AND passwd = ?;',[username, password], function(err, result){

      if (err) { return done(err); }
      if (result.length <= 0) {
        return done(null, false, {message: 'Incorrect username.'});
      }
      if (result.length > 0){
        return done(null, JSON.parse(JSON.stringify(result[0])));
      }
    })
    /*
    User.findOne({
      username: username
    }, function (error, user) {
      if (err) {
        return done(err);
      }
      if(!user) {
        return done(null, false, {
          message: 'Incorrect username.'
        });
      }
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Incorrect password.'
        });
      }
      return done(null, user);
    });
    */
  }
))

app.post('/auth/login/customer', 
  passport.authenticate('local'), 
  { successRedirect: '/',
    failureRedirect: '/'});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/auth', authRouter);;

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
