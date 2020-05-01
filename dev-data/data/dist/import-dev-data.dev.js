"use strict";

var fs = require('fs');

var mongoose = require('mongoose');

var dotenv = require('dotenv');

var Tour = require('./../../models/tourModel');

var User = require('./../../models/userModel');

var Review = require('./../../models/reviewModel');

dotenv.config({
  path: './config.env'
});
var DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(console.log('DB Connection Successful')); //READ JSON FILE

var tours = JSON.parse(fs.readFileSync("".concat(__dirname, "/tours.json"), 'utf-8'));
var users = JSON.parse(fs.readFileSync("".concat(__dirname, "/users.json"), 'utf-8'));
var reviews = JSON.parse(fs.readFileSync("".concat(__dirname, "/reviews.json"), 'utf-8')); // console.log(tours);

var importData = function importData() {
  return regeneratorRuntime.async(function importData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(User.create(users, {
            validateBeforeSave: false
          }));

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(Review.create(reviews));

        case 5:
          _context.next = 7;
          return regeneratorRuntime.awrap(Tour.create(tours));

        case 7:
          console.log('Data successfully loaded!');
          _context.next = 12;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);

        case 12:
          process.exit();

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

var deleteData = function deleteData() {
  return regeneratorRuntime.async(function deleteData$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(Tour.deleteMany());

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.deleteMany());

        case 5:
          _context2.next = 7;
          return regeneratorRuntime.awrap(Review.deleteMany());

        case 7:
          console.log('Data successfully deleted!');
          _context2.next = 13;
          break;

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0);

        case 13:
          process.exit();

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);