const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');  // Prevent NoSQL Injection
const helmet = require('helmet'); // Adding Security Headers
const xssClean = require('xss-clean'); // XSS Protection
const expressRateLimit = require('express-rate-limit'); //Rate limiting
const hpp = require('hpp'); // Prevent Hpp pollution
const cors = require('cors'); //CORS  
const path = require('path');

// Load env vars 
dotenv.config({path:'./config/config.env'});

// Connect to database
connectDB();

// Route files  
const bootcamps =  require('./routes/bootcamps');
const courses = require('./routes/courses'); 
const auth = require('./routes/auth');
const users  = require('./routes/users');
const reviews  = require('./routes/reviews');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//File Uploading middleware
app.use(fileupload());

// Sanitize data 
app.use(mongoSanitize()); // example use case {"email": {"$gt":""}, "password": "asdfhij"}

//Security header
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"], // Allows inline scripts
                styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"], // Allow inline styles
            },
        },
    })
);


//Prevent XSS Attack 
app.use(xssClean ());

//Rate limiting
const limiter = expressRateLimit({
    windowMs : 10 * 60 * 1000, //10 mins
    max: 100 //per request 
}); 

app.use(limiter);

//Prevent Http Params Pollution 
app.use(hpp());

//Enable CORS
app.use(cors());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users); 
app.use('/api/v1/reviews', reviews); 

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Run the server
const server = app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on PORT http://localhost:${PORT}/`.yellow.bold));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
});