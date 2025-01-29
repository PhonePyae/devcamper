const express = require('express');
const dotenv = require('dotenv');


// Load env vars 
dotenv.config({path:'./config/config.env'});

const app = express();

const PORT = process.env.PORT || 5001;

// Run the server
app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on PORT http://localhost:${PORT}/`));