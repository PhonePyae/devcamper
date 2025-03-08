const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced'] // enum is a validator that checks if the value is one of the specified values
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp', // reference to the Bootcamp model
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

// Static Method: getAverageCost
CourseSchema.statics.getAverageCost = async function(bootcampId) {
    console.log(`Calculating average cost for bootcamp: ${bootcampId}`.blue);

    // Perform an aggregation query to calculate the average tuition cost
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId } // Match all courses with the given bootcamp ID
        },
        {
            $group: {
                _id: '$bootcamp', // Group courses by bootcamp ID
                averageCost: { $avg: '$tuition' } // Calculate the average tuition cost
            }
        }
    ]);

    try {
        // If aggregation returned a result, update the Bootcamp model with the new average cost
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10 // Round to the nearest 10
        });
    } catch (err) {
        console.log(err); // Log any errors
    }
};

// Middleware: Call getAverageCost after saving a new course
CourseSchema.post('save', function() {
    this.constructor.getAverageCost(this.bootcamp); // Recalculate the average cost after saving a course
});

// Middleware: Call getAverageCost before deleting a course
CourseSchema.pre('findOneAndDelete', async function(next) {
    // Get the course that is being deleted
    const course = await this.model.findOne(this.getQuery());

    if (course) {
        await course.constructor.getAverageCost(course.bootcamp); // Recalculate the average cost before deleting the course
    }

    next(); // Move to the next middleware
});


module.exports = mongoose.model('Course', CourseSchema);