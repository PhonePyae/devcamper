const express = require('express');
const {protect} = require('../middleware/auth');
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getbootcampsWithinRadius, bootcampPhotoUpload } = require('../controllers/bootcamps');

// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

router.use('/:bootcampId/courses', courseRouter); // Re-route into other resource routers

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, createBootcamp);
router.route('/:id').get(getBootcamp).put(protect, updateBootcamp).delete(protect, deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getbootcampsWithinRadius);

router.route('/:id/photo').put(protect, bootcampPhotoUpload);

module.exports = router;