const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   public
exports.register = asyncHandler(async (req,res,next) => {
    const {name, email, password, role} = req.body;
    
    //Create user
    const user = await User.create({
        name, email, password, role
    });

    sendTokenResponse(user, 200, res);
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
    const user = await User.findOne({email}).select('+password'); //password to be included to validate login
    if(!user){
        return next(new ErrorResponse('Invalid Credential', 401));
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return next(new ErrorResponse('Invalid Password', 401));
    }

    sendTokenResponse(user, 200, res);
});

//@desc     Get current logged in user 
//@route    GET /api/v1/auth/me
//@access   private 
exports.getMe = asyncHandler(async (req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({success:true, data:user});
});

// Get token from model, create cookie and send response 
const sendTokenResponse = (user, statusCode, res)=>{
    //Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), //30 Days from this time
        httpOnly: true,
    }

    if(process.env.NODE_ENV == 'production'){
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({success:true,token});
}


//@desc     Forgot password
//@route    POST /api/v1/auth/forgotpassword
//@access   public 
exports.forgotPassword = asyncHandler(async (req,res,next)=>{
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorResponse(`There is no user with that email ${req.body.email}`, 404));
    }

    //Reset token
    const resetToken = user.getResetPasswordToken();

    //Create reset url
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please maek a PUT request to: \n \n ${resetURL}`;

    console.log(resetToken, resetURL);

    try{
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            message
        });

        return res.status(200).json({success: true, data: 'Email Sent'});
    }catch(err){
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorResponse(`Email was not sent`, 500));
    }

    await user.save({validateBeforeSave: false});
});