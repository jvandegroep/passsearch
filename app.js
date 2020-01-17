var express = require('express');

var index = require('./routes/index');
var passSearch = require('./routes/passSearch');
var job = require('./routes/job');

var app = express();

// default view engine
//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');

// go directly to ./public and finds index.html
app.use(express.static(__dirname + '/public'));

// when url path includes /blah then go to blah route (./routes/blah)
app.use('/passSearch', passSearch);
app.use('/job', job);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
