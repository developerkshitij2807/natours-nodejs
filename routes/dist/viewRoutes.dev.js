"use strict";

var express = require('express');

var router = express.Router();

var viewController = require('./../controller/viewController');

var authController = require('./../controller/authController');

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', viewController.getLoginPage);
router.get('/signup', viewController.getSignUpPage);
router.get('/me', authController.protect, viewController.getAccount);
module.exports = router;