var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

const mongoose = require('mongoose');
const Users = require('./schemas/users');
const url = config.mongoUrl;// 'mongodb://localhost:27017/chatApp'
const connect = mongoose.connect(url,{useNewUrlParser : true});
connect.then(db => {
  console.log( `Server  is successfully connected`);
})
.catch(err => console.log(err));


//var indexRouter = require('./routes/index');
var initialRouter = require('./routes/create-user')
var loginRouter = require('./routes/loginRouter');

var app = express();
//var port  = 5000;
app.use(cors({
  origin : "http://localhost:3000"
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(passport.initialize());
//app.use(passport.session()); removed when we are using Json web token

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', loginRouter);
app.use('/users', initialRouter);
app.use(express.static(path.join(__dirname, 'public')));

// function auth() is also removed as we are using Json web tokens

// function auth (req, res, next) {
//   if(!req.user){
//     var err = new Error("You are not authenticated");
//     err.status = 403;
//     next(err);
//   }
//   else{
//     next();
//   }
// }

// app.use(auth);


// app.listen(port, ()=> {
//   console.log("Port is running at " + port);
// })

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
