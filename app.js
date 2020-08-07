var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var app = express();

const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/GoGreen';
const connect = mongoose.connect(url);

connect.then((db) => {
    console.log("Connected to the MongoDB server");
}, (err) => { console.log(err); });



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// Routers

var userAuthRouter = require('./routes/userAuthRouter');
var mapRouter = require('./routes/mapRouter');

app.use('/public',express.static('public'));



app.use('/auth/user', userAuthRouter);
app.use('/map', mapRouter);


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
