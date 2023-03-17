const sharp = require('sharp');
const express = require('express');
const multer = require('multer');
const User = require('../models/usermodel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../Controllers/handlerFactory');
const APIFeatures = require('../utils/apifeatures');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
// const multerStorage = multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'public/img/users')
//   },
//   filename: (req,file,cb)=>{
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })
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
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = async(req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next()
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users,
    },
  });
});
exports.getUser = factory.getOne(User);
exports.createUser = catchAsync((req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route is not yet defined Please use /signup instead',
  });
});
exports.updateUser = factory.UpdateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateMe = catchAsync(async (req, res, next) => {
  //1.) create Error if user POSTs password Data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password Updates please use /updateMypassword',
        400
      )
    );
  }
  // 2.)Update user current document
  // const userId = mongoose.Types.ObjectId(req.user.id);
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
// exports.deleteMe = catchAsync(async(req,res,next)=>{
//     await User.findByIdAndUpdate(req.user.id, {active: false})
//     res.status(201).json({
//         status:'success',
//         data: null
//     })
// })
