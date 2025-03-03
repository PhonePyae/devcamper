const express = require('express');
const {getCourses, getCourse, addCourse} = require('../controllers/courses');
const router = express.Router({ mergeParams: true }); // mergeParams is used to merge the url parameters from the parent router with the child router

router.route('/').get(getCourses).post(addCourse);
router.route('/:id').get(getCourse);

module.exports = router;