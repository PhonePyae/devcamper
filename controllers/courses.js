const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//@desc     Get all courses
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@access   Public
exports.getCourses = asyncHandler(async (req,res,next)=>{
    let query; // query variable

    if(req.params.bootcampId){
        query = Course.find({bootcamp: req.params.bootcampId}); // if bootcampId is present in the url, find courses for that bootcamp
    }else{
        query = Course.find(); // if bootcampId is not present in the url, find all courses
    }

    const courses = await query; // execute the query

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    })
});
