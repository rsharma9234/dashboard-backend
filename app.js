var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require('compression')
var indexRouter = require('./routes/index');
var cron = require('node-cron');
var {cronSwapValues} = require('./cron_job')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,POST,OPTIONS,UPDATE,DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, token"
  );
  next();
});

app.use('/api', indexRouter);
// app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', function (req, res) { res.sendFile(path.join(__dirname, 'build', 'index.html')) });


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

cron.schedule('0 16 */1 */1 *', function () {
  cronSwapValues()
});

module.exports = app;