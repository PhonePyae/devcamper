const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//@desc     Get all reviews 
//@route    GET /api/v1/reviews
//@route    GET /api/v1/bootcamps/:bootcampId/reviews
//@access   Public
exports.getReviews = asyncHandler(async (req,res,next)=>{
    
    if(req.params.bootcampId){
        // if bootcampId is present in the url, find reviews for that bootcamp
        const reviews = await Review.find({bootcamp: req.params.bootcampId});
        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    }else{
        // if bootcampId is not present in the url, find all courses
        res.status(200).json(res.advancedResults);
    }
});