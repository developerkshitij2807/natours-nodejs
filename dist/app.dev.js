"use strict";

var path = require('path');

var express = require('express');

var morgan = require('morgan');

var rateLimit = require('express-rate-limit');

var helmet = require('helmet');

var mongoSanitize = require('express-mongo-sanitize');

var xss = require('xss-clean');

var hpp = require('hpp');

var cookieParser = require('cookie-parser');

var AppError = require('./utils/appError');

var globalErrorHandler = require('./controller/errorController'); // Routers


var tourRouter = require('./routes/tourRoutes.js');

var userRouter = require('./routes/userRoutes.js');

var reviewRouter = require('./routes/reviewRoutes.js');

var viewRouter = require('./routes/viewRoutes.js');

var app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express["static"](path.join(__dirname, 'public')));
app.use(express.json()); // Set security HTTP headers

app.use(helmet()); // Development Logging

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} // Limit requests from same API


var limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in the hour'
}); // App Limiters

app.use('/api', limiter);
app.use(express.json({
  limit: '10kb'
}));
app.use(cookieParser()); // Serving static files

app.use(function (req, res, next) {
  req.requestTime = new Date().toISOString(); // console.log(req.cookies);

  next();
}); //3. ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter); // Data Sanititzation agianst NoSQL query injection

app.use(mongoSanitize()); // Data Sanitization againt XSS

app.use(xss()); // HPP Prevention

app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));
app.all('*', function (req, res, next) {
  //  const err = new Error(`Can't find ${req.originalUrl} on the server`);
  //   err.status = 'fail';
  //   err.statusCode = 404;
  next(new AppError("Can't find ".concat(req.originalUrl, " on the server"), 404));
});
app.use(globalErrorHandler);
module.exports = app;