const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

//protect routes
exports.protect = asyncHandler(async(req,res,next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        //set token from Barer Token in Header
        token = req.headers.authorization.split(' ')[1];
    }   
    // set token from cookie
    // else if(req.cookies.token){
    //     token = req.cookies.token;
    // }

    //Make sure token exists
    if(!token){
        return next(new ErrorResponse('Not authorized to access this route', 401)); 
    }

    try{
        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);

        req.user = await User.findById(decoded.id);

        next();
    }catch(err){
        return next(new ErrorResponse('Not authorized to access this route', 401)); 
    }
});

// Grant access to specific users
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ErrorResponse(`This user role ${req.user.role} is not authorized to access this route`, 403));
        }
        next();
    };
};