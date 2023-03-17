const Tour = require('../models/tourmodel');
const APIFeatures = require('../utils/apifeatures');
const AppError = require('../utils/appError');
const multer = require('multer')
const sharp = require('sharp')
const catchAsync = require('../utils/catchAsync');
const factory = require('../Controllers/handlerFactory');
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image, Please Upload Only images'), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTourimages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 }
])
// upload.single('image')
// upload.array('images',5)
//1.) Cover image
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next()
  const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1300)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  //2.) images
  req.body.images = []
  await Promise.all(
  req.file.images.map(async (file, i) => {
    const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
    await sharp(file.buffer)
      .resize(2000, 1300)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.images}`);

      req.body.images.push(fileName)

  }));
  next()
})
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.createTour = factory.createOne(Tour);
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews', fields: 'reviews rating user' });
// const tour = tours.find(el =>el.id ===id)
// if(!tour){
//     return res.status(404).json({
//         status:'fail',
//         message:'invalid ID'
//     })
// }
// res.status(200).json({
//     status:"success",
//     data:{
//         tour
//     }
// })

exports.UpdateTour = factory.UpdateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req,res,next)=>{
//     const tour = await Tour.findByIdAndDelete(req.params.id,req.body)
//     if(!tour){
//         return next(new AppError('No tour find with that ID',404))
//     }
//     res.status(204).json({
//         status:"success",
//         data: null
//     })
// })
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStats: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numToursStats: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
//tours-distance/233/center/34.111475,-118.112343/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 /*miles */ : distance / 6378.1//km
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide the latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  console.log(distance, lat, lng, unit);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});
exports.getDistances = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 /*miles */ : distance / 6378.1//km
  const multiplier = unit == 'mi' ? 0.000621371 : 0.001
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide the latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
      }
    }
  ])
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
})
