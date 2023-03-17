const Tour = require('../models/tourmodel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const User = require('../models/usermodel')
exports.getOverview = catchAsync(async(req,res,next)=>{
    //1.) Get Tour data from collection 
    const tours = await Tour.find()
    //2) Build Template
    //3.)//Render that template using that tourdata from 1
    res.status(200).render('overview',{
        tours,
        title: 'All Tours'
    })

})
exports.getTour = catchAsync(async(req,res)=>{
    //get the data for the requested tour(including reviws and tour guides)
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields:'review rating user'
    })
    if(!tour){
      return next(new AppError('There is no tour with that name', 404))
    }
    //2.) Build the templates 
    //3.) Render templates using data from step1
    res.status(200).render('tour',{
      title: `${tour.name} Tour`,
      tour
    })
  })
exports.login = catchAsync(async(req,res,next)=>{
    res.status(200).render('login',{
        title: 'Login'
    })
  })
exports.getAccount = (req,res,next)=>{
  res.status(200).render('account',{
    title: 'Your account'
  })
}
exports.updateUserData = catchAsync(async(req,res)=>{
  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    name: req.body.name,
    email: req.body.email
  },{
    new: true,
    runValidators: true
  })
  res.status(200).render('account',{
    title: 'Your account',
    user: updatedUser
  })
})
exports.signup = catchAsync(async(req,res)=>{
  res.status(200).render('signup', {
    title: 'Create Your account'
  })
})