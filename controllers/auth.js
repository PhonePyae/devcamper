const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   public
exports.register = asyncHandler(async (req,res,next) => {
    const {name, email, password, role} = req.body;
    
    //Create user
    const user = await User.create({
        name, email, password, role
    });

    //Create toke
    const token = user.getSignedJwtToken();

    res.status(200).json({success: true, token: token})
});

//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   public
exports.login = asyncHandler(async (req,res,next) => {
    const {email, password} = req.body;
    
    //Validate email & password
    if(!email || !password){
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    //Check if user found
    const user = await User.findOne({email}).select('+password');
    if(!user){
        return next(new ErrorResponse('Invalid Credential', 401));
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return next(new ErrorResponse('Invalid Password', 401));
    }

    //Create toke
    const token = user.getSignedJwtToken();

    res.status(200).json({success: true, token: token})
});