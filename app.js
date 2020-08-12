var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const mongoDB = require('./config/db');

var app = express();

// const headersMiddleware = require('./middlewares/HeaderMiddleware')
// app.use(headersMiddleware);

// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});



const headerMiddleware = require("./middlewares/HeaderMiddleware");
app.use(headerMiddleware);



app.use((req, res, next)=>
{
	res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', '*');
	next();
});

// app.use(mongoDB.ConnectToDatabase);

const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/GoGreen';
const connect = mongoose.connect(url);
// connecting to the database
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
const { allowedNodeEnvironmentFlags } = require('process');

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
