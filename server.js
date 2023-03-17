const dotenv = require('dotenv')
const mongoose = require('mongoose')
dotenv.config({path: './config.env'})
const app = require('./app')
process.on('uncaughtException',err=>{
    console.log(err.name,err.message)
    console.log('UNCAUGHT EXCEPTION')
    // process.exit(1)
        process.exit(1)
})
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)

mongoose.connect(DB,{useNewUrlParser:true}).then(con=>{
//connect(DB,{useNewUrlParser:true}).then(con=>{
   // console.log(con.connections)
    console.log ("DB connection successfully")
})
    //dotenv.config({path: './config.env'})
//const app = require('./app')

 const port = 8000//process.env.PORT || 3000
const server = app.listen(port,function(){
    console.log('Running on port 3000')
})
//HANDLING UNHANDLED REJECTIONS
process.on('unhandledRejection',err=>{
    console.log(err.name,err.message)
    // process.exit(1)
    server.close(()=>{
        process.exit(1)
    })
    console.log('UNHANDLED REJECTION! SHUTTING DOWN...')
})
