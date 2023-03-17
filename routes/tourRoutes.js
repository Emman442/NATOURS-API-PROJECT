const express = require('express');
const authController = require('../Controllers/authController');
const reviewrouter = require('./reviewRoutes');
//const { route } = require('../app')
const router = express.Router();
const tourController = require('../Controllers/tourcontroller');
// router.param('id',tourController.checkID)
router.use('/:tourId/reviews', reviewrouter);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    /*authController.restrictTo('admin','lead-guide'), */ tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    /*authController.restrictTo('admin','lead-guide'), */ tourController.uploadTourimages,
    tourController.resizeTourImages,
    tourController.UpdateTour
  )
  .delete(
    authController.protect,
    // authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );
// router.module('/:tourId/review').post(authController.protect, reviewController.createReview)

module.exports = router;
