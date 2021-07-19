var createError = require('http-errors');

// catch 404 and forward to error handler
module.exports.error404 = function(req, res, next) {
    console.log(req.originalUrl)
    res.status(404).json(String(createError(404)));
};

// error handler
module.exports.error5xx = function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
};
