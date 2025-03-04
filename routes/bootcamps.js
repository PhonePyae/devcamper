const express = require('express');
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getbootcampsWithinRadius, bootcampPhotoUpload } = require('../controllers/bootcamps');

// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

router.use('/:bootcampId/courses', courseRouter); // Re-route into other resource routers

router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getbootcampsWithinRadius);

router.route('/:id/photo').put(bootcampPhotoUpload);

module.exports = router;