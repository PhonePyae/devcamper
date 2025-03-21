const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//@desc     Get all courses
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@access   Public
exports.getCourses = asyncHandler(async (req,res,next)=>{
    
    if(req.params.bootcampId){
        // if bootcampId is present in the url, find courses for that bootcamp
        const courses = await Course.find({bootcamp: req.params.bootcampId});
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    }else{
        // if bootcampId is not present in the url, find all courses
        res.status(200).json(res.advancedResults);
    }
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


//@desc     Add course
//@route    POST /api/v1/bootcamps/:bootcampId/courses
//@access   Private
exports.addCourse = asyncHandler(async (req,res,next)=>{
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    //Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next (new ErrorResponse(`User with User ID ${req.user.id} is not authorized to add  this course.`, 401));
    } 

    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404));
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    })
});


//@desc     Upate course
//@route    PUT /api/v1/courses/:id
//@access   Private
exports.updateCourse = asyncHandler(async (req,res,next)=>{
    let course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
    }

    //Make sure user is course owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next (new ErrorResponse(`User with User ID ${req.user.id} is not authorized to update this course ${course._id}.`, 401));
    } 

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: course
    })
});

//@desc     Delete course
//@route    DELETE /api/v1/courses/:id
//@access   Private
exports.deleteCourse = asyncHandler(async (req,res,next)=>{
    const course = await Course.findById(req.params.id);

    //Make sure user is course owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next (new ErrorResponse(`User with User ID ${req.user.id} is not authorized to delete this course ${course._id}.`, 401));
    } 

    if(!course){
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
    }

    await Course.deleteOne(); 

    res.status(200).json({
        success: true,
        data: {}
    })
});


