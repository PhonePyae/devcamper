const express = require('express');
const {protect,authorize} = require('../middleware/auth');
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getbootcampsWithinRadius, bootcampPhotoUpload } = require('../controllers/bootcamps');

// Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter); 
router.use('/:bootcampId/reviews', reviewRouter); 

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, authorize('publisher','admin'), createBootcamp);
router.route('/:id').get(getBootcamp).put(protect, authorize('publisher','admin'), updateBootcamp).delete(protect, authorize('publisher','admin'), deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getbootcampsWithinRadius);

router.route('/:id/photo').put(protect, authorize('publisher','admin'), bootcampPhotoUpload);

module.exports = router;