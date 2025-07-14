const path = require('path')
const express = require('express');
const globalErrorController = require('./controllers/errorController')
const planRouter = require('./routes/planRoutes');
const userRouter = require('./routes/userRoutes');
const investmentRouter = require('./routes/investmentRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const paymentOptionRouter = require('./routes/paymentOptionRoutes');
const faqRouter = require('./routes/faqRoutes')
const copytradeRouter = require('./routes/copytradeRoutes')
const copytradeInvestmentRouter = require('./routes/copytradeInvestmentRoutes')
const statsRouter = require('./routes/statsRoutes')
const AppError = require('./utils/apError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp')
const cookieParser = require('cookie-parser');
const multer = require('multer')
const cors = require('cors');
const compression = require('compression')
const app = express();
const{ sequelize, Plan} = require('./models')

// app.use('/', async(req, res, next)=>{
//     try {
//         // await sequelize.authenticate();
//         const plans = await Plan.findAll();
//         return res.status(200).json({message: 'Plans fetched', plans:plans})
//         // return res.status(200).json({message:'Connection has been established successfully.'})
//         // console.log('Connection has been established successfully.');
//     } catch (error) {
//         return res.status(500).json({message:'failed to fetch plans', errors:error})
//         // return res.status(500).json({message:'Unable to connect to the database:', error:error})
       
//     }
// })

// Trust the first proxy
app.set('trust proxy', 1);

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'));

//Serve static files
// app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, 'public')))

const limiter = rateLimit({
    max:300,
    windowMs: 60 * 60 * 1000,
    message:"Too  many requests from this IP, please try again in an hour!"
});

const upload = multer();

//Implement cors
// app.use(cors())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,               // Allow credentials such as cookies
}));





// app.options('*', cors())
app.options('*', cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

//Set Security HTTP Headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

//Limit number of requests from same IP
app.use('/api', limiter)

app.use(compression())

//Body parser, read data from req.body into body
app.use(express.json());
app.use(cookieParser())

//Data Sanitization against xss attack
app.use(xss());
//Preventing Parameter Pollution Attack
app.use(hpp());

// Test Middleware 
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.get('referer'))
    // console.log(req.cookies.jwt)
    next();
})


//Mounting all routers
app.use('/api/v1/transactions', transactionRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/plans',  upload.none(), planRouter);
app.use('/api/v1/investments', upload.none(), investmentRouter);
app.use('/api/v1/paymentOptions', paymentOptionRouter);
app.use('/api/v1/faqs', upload.none(), faqRouter);
app.use('/api/v1/stats', statsRouter)
app.use('/api/v1/copytrades', copytradeRouter)
app.use('/api/v1/copytradeInvestments', copytradeInvestmentRouter)


//Not found route
app.all('*', (req, res, next)=>{
    return next(new AppError(`The requested URL ${req.originalUrl} was not found on this server!`, '', 404))
})

app.use(globalErrorController)

module.exports = app;