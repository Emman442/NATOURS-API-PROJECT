const mongoose = require('mongoose')
const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('../Controllers/handlerFactory')
exports.setTourUsersIds = (req,res,next)=>{
    //Allow nested Routes
    if(!req.body.tour) req.body.tour = req.params.tourId
    if(!req.body.user) req.body.tour = req.user.id
    next()
}
exports.createReview = factory.createOne(Review)
exports.getReviews = catchAsync(async(req,res)=>{ 
    let filter={};
    if(req.params.tourId) filter={tour: req.params.tourId}
    const Reviews = await Review.find().populate()
    res.status(200).json({
        status: 'success',
        data: {
            Reviews
        }
    })
})
exports.getReview = factory.getOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.updateReview = factory.UpdateOne(Review)
