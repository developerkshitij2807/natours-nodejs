const express = require('express');

const router = express.Router();
const viewController = require('./../controller/viewController');
const authController = require('./../controller/authController');

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', viewController.getLoginPage);
router.get('/signup', viewController.getSignUpPage);
router.get('/me', authController.protect, viewController.getAccount);

module.exports = router;
