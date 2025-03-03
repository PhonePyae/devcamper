const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
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
        // query = Course.find(); // if bootcampId is not present in the url, find all courses
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description' // select only name and description of the bootcamp
        }); // populate the bootcamp field with name and description
    }

    const courses = await query; // execute the query

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    })
});


//@desc     Get single course
//@route    GET /api/v1/courses/:id
//@access   Public
exports.getCourse = asyncHandler(async (req,res,next)=>{
    
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description' // select only name and description of the bootcamp
    });

    if(!course){
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: course
    })
});


//@desc     All course
//@route    POST /api/v1/bootcamps/:bootcampId/courses
//@access   Private
exports.addCourse = asyncHandler(async (req,res,next)=>{
    req.body.bootcamp = req.params.bootcampId;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404));
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    })
});
