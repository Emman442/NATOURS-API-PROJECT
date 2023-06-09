const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const User = require('../models/usermodel')
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength:[40, 'A name must have a length less than orequal to 40 characters'],
        minlength:[10, 'A name must have a length more than or equal to 10 characters'],
    },
    slug: String,
    duration:{
        type: Number,
        required: [true, 'a tour must have a duration']
    },
    maxGroupSize:{
        type: Number,
        required:[true,'tour must have a group size']
    },
    difficulty:{
        type: String,
        required: [true,'A tour must have a difficulty'],
        enum: {
            values: ['easy','medium','difficult'],
            message: 'Difficulty is either: easy,hard or difficult'
        }
    },
    ratingsAverage:{
        type: Number,
        default:4.5,
        min:[1,'Rating must be above 1.0'],
        max:[5,'Rating must be above 1.0'],
        set: val =>Math.round(val * 10)/10
    },
    ratingsQuantity:{
        type: Number,
        default: 0
    },
    price:{
        type:Number,
        required:[true, 'A tour must have a price']
    },
    priceDiscount:{
        type: Number,
        validate: {
            validator: function(val){
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below the regular price'
        }
        
        
        
    },
    summary: {
        type:String,
        trim: true,//remove white spaces in thee beginning and at the end of the message,
        required: [true,'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true,'A tour must have a cover image']
    },
    images: [String],
    createdAt:{
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation:{
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates:[Number],
        address: String,
        description:String
    },
    locations: [
        {
            type: {
                type:String,
                default:'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        
        }

    ],

},{
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
})
tourSchema.index({price: 1,ratingsAverage: -1})
tourSchema.index({slug: 1})
tourSchema.index({startLocation: '2dsphere'})
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7//arrow function does notn get the this keyword but need the this keyword thats why we are using normal function notation function(){}
})
//Document middleware runs before the save() command and .create() .insertMAny() wont trigger the document middleware
tourSchema.pre('save',function(next){
    this.slug = slugify(this.name, {lower: true})
    next()
})
// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id =>User.findById(id))
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })
// tourSchema.pre('save',function(next){
//     console.log('Will save document...')
//     next();
// })
// tourSchema.post('save', function(doc,next){
//     console.log(doc)
//     next()
// })
//Query Middleware
tourSchema.pre('find',function(next){
    this.find({secretTour: {$ne: true}})
    next()
})
tourSchema.pre('aggregate',function(next){
    console.log(this.pipeline)
    next()
})
//virtual populate
tourSchema.virtual('reviews',{
    ref: 'Review',
    foreignField:'tour',
    localField: '_id'
})
const Tour = mongoose.model('Tour',tourSchema)
module.exports = Tour