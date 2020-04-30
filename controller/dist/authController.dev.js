"use strict";

var _require = require('util'),
    promisify = _require.promisify;

var crypto = require('crypto');

var jwt = require('jsonwebtoken');

var rateLimit = require('express-rate-limit');

var User = require('./../models/userModel');

var catchAsync = require('./../utils/catchAsync');

var AppError = require('./../utils/appError');

var sendEmail = require('./../utils/email');

var signToken = function signToken(id) {
  return jwt.sign({
    id: id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

var createSendToken = function createSendToken(user, statusCode, res) {
  var token = signToken(user._id);
  var cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
  user.password = undefined;
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: user
    }
  });
};

exports.signup = catchAsync(function _callee(req, res, next) {
  var newUser;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(User.create(req.body));

        case 2:
          newUser = _context.sent;
          createSendToken(newUser, 201, res);

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.login = catchAsync(function _callee2(req, res, next) {
  var _req$body, email, password, user;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, email = _req$body.email, password = _req$body.password; //1) Check if email and password exist

          if (!(!email || !password)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next(new AppError('Please provide an password and email', 400)));

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select('+password'));

        case 5:
          user = _context2.sent;
          _context2.t0 = !user;

          if (_context2.t0) {
            _context2.next = 11;
            break;
          }

          _context2.next = 10;
          return regeneratorRuntime.awrap(user.correctPassword(password, user.password));

        case 10:
          _context2.t0 = !_context2.sent;

        case 11:
          if (!_context2.t0) {
            _context2.next = 13;
            break;
          }

          return _context2.abrupt("return", next(new AppError('Incorrect email or password', 401)));

        case 13:
          //3) If Okay Send the Token back..
          createSendToken(user, 200, res);

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  });
});

exports.logout = function (req, res) {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(function _callee3(req, res, next) {
  var token, decoded, currUser;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))) {
            _context3.next = 6;
            break;
          }

          _context3.next = 3;
          return regeneratorRuntime.awrap(req.headers.authorization.split(' ')[1]);

        case 3:
          token = _context3.sent;
          _context3.next = 7;
          break;

        case 6:
          if (req.cookies.jwt) {
            token = req.cookies.jwt;
          }

        case 7:
          if (token) {
            _context3.next = 9;
            break;
          }

          return _context3.abrupt("return", next(new AppError('You are logged Not logged in. Please Log In to get access.', 401)));

        case 9:
          _context3.next = 11;
          return regeneratorRuntime.awrap(promisify(jwt.verify)(token, process.env.JWT_SECRET));

        case 11:
          decoded = _context3.sent;
          _context3.next = 14;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 14:
          currUser = _context3.sent;

          if (currUser) {
            _context3.next = 17;
            break;
          }

          return _context3.abrupt("return", next(new AppError('User belonging to the token does not exist', 401)));

        case 17:
          if (!currUser.changedPasswordAfter(decoded.iat)) {
            _context3.next = 19;
            break;
          }

          return _context3.abrupt("return", next(new AppError('User Recently changed Password', 401)));

        case 19:
          //GRANT ACCESS TO PROTECTED ROUTE
          req.user = currUser;
          res.locals.user = currUser;
          next();

        case 22:
        case "end":
          return _context3.stop();
      }
    }
  });
});

exports.restrictTo = function () {
  for (var _len = arguments.length, roles = new Array(_len), _key = 0; _key < _len; _key++) {
    roles[_key] = arguments[_key];
  }

  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

exports.forgotPassword = catchAsync(function _callee4(req, res, next) {
  var user, resetToken, resetURL, message;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 2:
          user = _context4.sent;

          if (user) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", next(new AppError('There is no user with email address.', 404)));

        case 5:
          // 2) Generate the random reset token
          resetToken = user.createPasswordResetToken();
          _context4.next = 8;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 8:
          // 3) Send it to user's email
          resetURL = "".concat(req.protocol, "://").concat(req.get('host'), "/api/v1/users/resetPassword/").concat(resetToken);
          message = "Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ".concat(resetURL, ".\nIf you didn't forget your password, please ignore this email!");
          _context4.prev = 10;
          _context4.next = 13;
          return regeneratorRuntime.awrap(sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message: message
          }));

        case 13:
          res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
          });
          _context4.next = 23;
          break;

        case 16:
          _context4.prev = 16;
          _context4.t0 = _context4["catch"](10);
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          _context4.next = 22;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 22:
          return _context4.abrupt("return", next(new AppError('There was an error sending the email. Try again later!'), 500));

        case 23:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[10, 16]]);
});
exports.resetPassword = catchAsync(function _callee5(req, res, next) {
  var hashedToken, user, token;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          // 1) Get User based on the token
          hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
          _context5.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: {
              $gt: Date.now()
            }
          }));

        case 3:
          user = _context5.sent;

          if (user) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", next(new AppError('Token is invalid or has expired', 400)));

        case 6:
          user.password = req.body.password;
          user.passwordConfirm = req.body.passwordConfirm;
          user.passwordResetExpires = undefined;
          user.passwordResetToken = undefined;
          _context5.next = 12;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 12:
          // 3) Update changedPasswordAt property for the user
          // 4) Log the user in send JWT
          token = signToken(user._id);
          res.status(201).json({
            status: 'success',
            token: token,
            data: {
              user: user
            }
          });

        case 14:
        case "end":
          return _context5.stop();
      }
    }
  });
});
exports.updatePassword = catchAsync(function _callee6(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id).select('+password'));

        case 2:
          user = _context6.sent;

          if (user.correctPassword(req.body.currentPassword, user.password)) {
            _context6.next = 5;
            break;
          }

          return _context6.abrupt("return", next(new AppError('Wrong Current Password. Please Submit your request again', 400)));

        case 5:
          // 3) If so, update password
          user.password = req.body.updatedPassword;
          user.passwordConfirm = req.body.updatedPassword;
          _context6.next = 9;
          return regeneratorRuntime.awrap(user.save());

        case 9:
          // 4) Log user in, send JWT
          createSendToken(user, 201, res);

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  });
});
exports.limitLogin = rateLimit({
  max: 3,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in the hour'
}); // Only For Rendered Pages

exports.isLoggedIn = function _callee7(req, res, next) {
  var decoded, currUser;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          if (!req.cookies.jwt) {
            _context7.next = 19;
            break;
          }

          _context7.prev = 1;
          _context7.next = 4;
          return regeneratorRuntime.awrap(promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET));

        case 4:
          decoded = _context7.sent;
          _context7.next = 7;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 7:
          currUser = _context7.sent;

          if (currUser) {
            _context7.next = 10;
            break;
          }

          return _context7.abrupt("return", next(new AppError('User belonging to the token does not exist', 401)));

        case 10:
          if (!currUser.changedPasswordAfter(decoded.iat)) {
            _context7.next = 12;
            break;
          }

          return _context7.abrupt("return", next(new AppError('User Recently changed Password', 401)));

        case 12:
          //GRANT ACCESS TO PROTECTED ROUTE
          res.locals.user = currUser;
          return _context7.abrupt("return", next());

        case 16:
          _context7.prev = 16;
          _context7.t0 = _context7["catch"](1);
          return _context7.abrupt("return", next());

        case 19:
          next();

        case 20:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[1, 16]]);
};

exports.restrictTo = function () {
  for (var _len2 = arguments.length, roles = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    roles[_key2] = arguments[_key2];
  }

  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};