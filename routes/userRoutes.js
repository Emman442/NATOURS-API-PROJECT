const express = require('express');
// const fs = require('fs');
// const multer = require('multer')
const authController = require('../Controllers/authController');
const userController = require('../Controllers/usercontroller');
const reviewController = require('../Controllers/reviewController');
const Reviewrouter = require('./reviewRoutes');
// const upload = multer({dest: 'public/img/users'})
router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
//Forgot and reset password!
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword); //.patch('/deleteMe', authController.protect, userController.deleteMe)
//router.patch('/updateMe', authController.protect, userController.updateMe)
router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
//protect al;l routes after this middle
router.use(authController.protect);
// router.use(authController.restrictTo('admin'))
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
// router.patch('/deleteMe', authController.protect, userController.deleteMe)
router.get('/:tourId/review').post(authController.protect);

module.exports = router;
