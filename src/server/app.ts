var express = require('express');
var Model = require('objection').Model;
var Knex = require('knex');
var passport = require('passport');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();

require('./middleware/passport');

// Set up our database connection
var knexConfig = require('../../knexfile');
Model.knex(Knex(knexConfig.development));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Sets up authentication
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
// Makes user variable available in templates.
// Source: http://stackoverflow.com/a/20912861
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.use(require('less-middleware')(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var data = {
        status: 404,
        message: 'Not Found',
        url: req.url
    };
    res.status(404)
        .send(data)
        .end();
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
