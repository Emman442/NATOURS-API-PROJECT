
const cookieParser = require('cookie-parser')
const cors = require('cors')
const axios = require('axios')
const path = require('path')
const express = require('express');
const app = express();
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const port = 3000;
const globalErrorHandler = require('./Controllers/errorController');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const AppError = require('./utils/appError');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200
}
app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin","http://localhost:8000")
  res.header("Access-Control-Allow-Credentials",true)
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-with, Content-Type, Accept")
  next()
})
app.use(cors(corsOptions))
app.set('view engine','pug')
app.set('views',path.join(__dirname, './views'))
//serving Static files
app.use(express.static(path.join(__dirname,'public')));
const xss = require('xss-clean');
//1.) Global middlewares
// 1.) SecurityHTTP headers
//app.use(helmet());
// 4.) Body parse, reading data from the body using req.body
app.use(express.json({ limit: '10kb' }));
// Data sanitization against NOsql query injection
app.use(mongoSanitize());
// Data Sanitization
app.use(xss());
//Prevent Parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratinsAverage',
      'maxGropSize',
      'difficulty',
    ],
  })
);




app.use(cookieParser())
// 3.) DEvelopment login
if (process.env.NODE_ENV === 'development') {
  //3rd party middlewares

  app.use(morgan('dev'));
}
//2.) Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP please try again later',
});
app.use('/api', limiter);

//requiring file system

app.use(express.json())
app.use(express.urlencoded({extended: true, limit: '10kb'}))
// middle ware
app.use((req, res, next) => {
  console.log('Hello from the middle Ware');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies)
  next();
});

app.use('/',viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
