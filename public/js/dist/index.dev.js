"use strict";

require("@babel/polyfill");

var _mapbox = require("./mapbox");

var _login = require("./login");

var _updateSettings = require("./updateSettings");

/* eslint-disable */
var logOutBtn = document.querySelector('.nav__el--logout');
var mapBox = document.getElementById('map');
var loginForm = document.querySelector('.form');
var userDataForm = document.querySelector('.form-user-data');
var userPasswordForm = document.querySelector('.form-user-password');

if (mapBox) {
  var locations = JSON.parse(document.getElementById('map').dataset.locations);
  (0, _mapbox.displayMap)(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    (0, _login.login)(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', _login.logout);
if (userDataForm) userDataForm.addEventListener('submit', function (e) {
  e.preventDefault();
  var name = document.getElementById('name').value;
  var email = document.getElementById('email').value;
  var photo = document.getElementById('photo').files[0];
  (0, _updateSettings.updateSettings)({
    name: name,
    email: email,
    photo: photo
  }, 'data');
});
if (userPasswordForm) userPasswordForm.addEventListener('submit', function _callee(e) {
  var passwordCurrent, password, passwordConfirm;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          e.preventDefault();
          passwordCurrent = document.getElementById('password-current').value;
          password = document.getElementById('password').value;
          passwordConfirm = document.getElementById('password-confirm').value;
          _context.next = 6;
          return regeneratorRuntime.awrap((0, _updateSettings.updateSettings)({
            passwordCurrent: passwordCurrent,
            password: password,
            passwordConfirm: passwordConfirm
          }, 'password'));

        case 6:
          document.getElementById('password-current').value = '';
          document.getElementById('password').value = '';
          document.getElementById('password-confirm').value = '';

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
});