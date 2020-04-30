"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var multer = require('multer');

var sharp = require('sharp');

var Tour = require('./../models/tourModel');

var catchAsync = require('./../utils/catchAsync');

var AppError = require('./../utils/appError');

var factory = require('./handlerFactory'); //ROUTE Handlers - Functions for the module....//
//For getting all Tours from the database


var multerStorage = multer.memoryStorage();

var multerFilter = function multerFilter(req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

var upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadTourImages = upload.fields([{
  name: 'imageCover',
  maxCount: 1
}, {
  name: 'images',
  maxCount: 3
}]);
exports.resizeTourImages = catchAsync(function _callee2(req, res, next) {
  var imageCoverFilename;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log(req.files);

          if (!(!req.files.imageCover || !req.files.images)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next());

        case 3:
          // 1) Cover Image
          imageCoverFilename = "tours-".concat(req.params.id, "-").concat(Date.now(), "-cover.jpeg");
          _context2.next = 6;
          return regeneratorRuntime.awrap(sharp(req.file.imageCover[0].buffer).resize(2000, 1333).toFormat('jpeg').jpeg({
            quality: 90
          }).toFile("public/img/tours/".concat(imageCoverFilename)));

        case 6:
          req.body.imageCover = imageCoverFilename; // 2) Images

          req.body.images = [];
          _context2.next = 10;
          return regeneratorRuntime.awrap(Promise.all(req.files.images.map(function _callee(file, i) {
            var filename;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    filename = "tour-".concat(req.params.id, "-").concat(Date.now(), "-").concat(i + 1, ".jpeg");
                    _context.next = 3;
                    return regeneratorRuntime.awrap(sharp(file.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({
                      quality: 90
                    }).toFile("public/img/tours/".concat(imageCoverFilename)));

                  case 3:
                    req.body.images.push(filename);

                  case 4:
                  case "end":
                    return _context.stop();
                }
              }
            });
          })));

        case 10:
          next();

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  });
});

exports.aliasTopTours = function (req, res, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price'; // req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.getTour = factory.getOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getTourStats = catchAsync(function _callee3(req, res, next) {
  var stats;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(Tour.aggregate([{
            $match: {
              ratingsAverage: {
                $gte: 4.5
              }
            }
          }, {
            $group: {
              _id: null,
              numTours: {
                $sum: 1
              },
              numRatings: {
                $sum: '$ratingsQuality'
              },
              avgRating: {
                $avg: '$ratingsAverage'
              },
              avgPrice: {
                $avg: '$price'
              },
              minPrice: {
                $min: '$price'
              },
              maxPrice: {
                $max: '$price'
              }
            }
          }]));

        case 2:
          stats = _context3.sent;
          res.status(200).json({
            status: 'Success',
            message: "Stats Down Below:- ",
            data: {
              stats: stats
            }
          });

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.getMonthlyPlan = catchAsync(function _callee4(req, res, next) {
  var year, plan;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          year = req.params.year * 1;
          _context4.next = 3;
          return regeneratorRuntime.awrap(Tour.aggregate([{
            $unwind: '$startDates'
          }, {
            $match: {
              startDates: {
                $gte: new Date("".concat(year, "-01-01")),
                $lte: new Date("".concat(year, "-12-31"))
              }
            }
          }, {
            $group: {
              _id: {
                $month: '$startDates'
              },
              numTourStarts: {
                $sum: 1
              },
              tours: {
                $push: '$name'
              }
            }
          }, {
            $addFields: {
              month: '$_id'
            }
          }, {
            $project: {
              _id: 0
            }
          }, {
            $sort: {
              numTourStarts: -1
            }
          }, {
            $limit: 12
          }]));

        case 3:
          plan = _context4.sent;
          res.status(200).json({
            status: 'Success',
            message: "Plan Down Below:- ",
            data: {
              plan: plan
            }
          });

        case 5:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // exports.deleteTour = catchAsync(async (req, res, next) => {
//   await Tour.findByIdAndDelete(req.params.id);
//   const tours = await Tour.find();
//   res.status(200).json({
//     status: 'Success',
//     message: `Tour with the ID ${req.params.id} has been delete`,
//     data: {
//       tours
//     }
//   });
//   next();
// });
// /tours-within/:distance/center/:latlng/unit/:unit

exports.getToursWithin = catchAsync(function _callee5(req, res, next) {
  var _req$params, distance, latlng, unit, _latlng$split, _latlng$split2, lat, lng, radius, tours;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _req$params = req.params, distance = _req$params.distance, latlng = _req$params.latlng, unit = _req$params.unit;
          _latlng$split = latlng.split(','), _latlng$split2 = _slicedToArray(_latlng$split, 2), lat = _latlng$split2[0], lng = _latlng$split2[1];
          radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

          if (!lat || !lng) {
            next(new AppError('Please provide latitude and longitudes.', 400));
          }

          _context5.next = 6;
          return regeneratorRuntime.awrap(Tour.find({
            startLocation: {
              $geoWithin: {
                $centerSphere: [[lng, lat], radius]
              }
            }
          }));

        case 6:
          tours = _context5.sent;
          res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
              data: tours
            }
          });

        case 8:
        case "end":
          return _context5.stop();
      }
    }
  });
});
exports.getDistances = catchAsync(function _callee6(req, res, next) {
  var _req$params2, latlng, unit, _latlng$split3, _latlng$split4, lat, lng, multiplier, distances;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _req$params2 = req.params, latlng = _req$params2.latlng, unit = _req$params2.unit;
          _latlng$split3 = latlng.split(','), _latlng$split4 = _slicedToArray(_latlng$split3, 2), lat = _latlng$split4[0], lng = _latlng$split4[1];
          multiplier = unit === 'mi' ? 0.000621371 : 0.001;

          if (!lat || !lng) {
            next(new AppError('Please provide latitude and longitudes.', 400));
          }

          _context6.next = 6;
          return regeneratorRuntime.awrap(Tour.aggregate([{
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: [lng * 1, lat * 1]
              },
              distanceField: 'distance',
              distanceMultiplier: multiplier
            }
          }, {
            $project: {
              distance: 1,
              name: 1
            }
          }]));

        case 6:
          distances = _context6.sent;
          res.status(200).json({
            status: 'success',
            results: distances.length,
            data: {
              data: distances
            }
          });

        case 8:
        case "end":
          return _context6.stop();
      }
    }
  });
});