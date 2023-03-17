const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tour = require('./../../models/tourmodel')
const User = require('./../../models/usermodel')
const Review = require('./../../models/reviewModel')
dotenv.config({path: './config.env'})

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)

mongoose.connect(DB,{useNewUrlParser:true}).then(()=>{
//connect(DB,{useNewUrlParser:true}).then(con=>{
    console.log ("DB connection successfully")
})

//read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'))
//IMPORT DATA TO DB
const importData = async ()=>{
    try {
      await Tour.create(tours)  
      await User.create(users,{validateBeforeSave: false})  
      await Review.create(reviews)  
      console.log('Data Successfully loaded')
    } catch (error) {
        console.log(error)
    }
}
// DELETE ALL DATA FROM DB
const deleteData = async () =>{
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('Deleted successfully')
    } catch (error) {
        console.log(error)
    }
}
if(process.argv[2] === '--import'){
    importData()
}else if(process.argv[2] === '--delete'){
    deleteData()
}

console.log(process.argv)