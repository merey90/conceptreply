const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');

const carsRouter = require('./routes/cars');
const usersRouter = require('./routes/users');
const demandsRouter = require('./routes/demands');
const schedulesRouter = require('./routes/schedules');

const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/cars', carsRouter);
app.use('/users', usersRouter);
app.use('/demands', demandsRouter);
app.use('/schedules', schedulesRouter);


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
  res.send(res.locals.message);
});

module.exports = app;
