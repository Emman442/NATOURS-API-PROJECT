const express = require('express');
const authController = require('../Controllers/authController');
const router = express.Router({ mergeParams: true });
const reviewController = require('../Controllers/reviewController');
router.use(authController.protect);
router.post(
  '/createreview',
  authController.protect,
  reviewController.setTourUsersIds,
  reviewController.createReview
);
router.get('/getreviews', reviewController.getReviews);
// router.get('/get-review/:id', reviewController.getReview);
router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(
    // authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );
module.exports = router;
