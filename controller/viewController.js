const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get Tour Data from Collection
  const tours = await Tour.find();

  // 2) Build template

  // 3) Render that template using tour data

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('Tour Not Found', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLoginPage = (req, res) => {
  res.status(200).render('login', {
    title: 'Log Into Your Account'
  });
};

exports.getSignUpPage = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign Up! Create Your Account Now'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account'
  });
};
