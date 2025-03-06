const express = require('express');
const {protect} = require('../middleware/auth');
const {getCourses, getCourse, addCourse, updateCourse, deleteCourse} = require('../controllers/courses');
const router = express.Router({ mergeParams: true }); // mergeParams is used to merge the url parameters from the parent router with the child router

const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');

router.route('/').get(advancedResults(Course,{path: 'bootcamp', select: 'name description' }),getCourses).post(protect, addCourse);
router.route('/:id').get(getCourse).put(protect, updateCourse).delete(protect, deleteCourse);

module.exports = router;