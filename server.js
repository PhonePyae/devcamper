const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars 
dotenv.config({path:'./config/config.env'});

// Connect to database
connectDB();

// Route files  
const bootcamps =  require('./routes/bootcamps');
const courses = require('./routes/courses'); 

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//File Uploading middleware
app.use(fileupload());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

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