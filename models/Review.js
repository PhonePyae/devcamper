const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for review'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
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

//Prevent user from submitting more than 1 review per bootcamp 
ReviewSchema.index({bootcamp:1, user:1},{unique:true});  

// Static Method: getAverageRating 
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
    // console.log(`Calculating average rating for bootcamp: ${bootcampId}`.blue);

    // Perform an aggregation query to calculate the average tuition cost
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId } // Match all courses with the given bootcamp ID
        },
        {
            $group: {
                _id: '$bootcamp', // Group courses by bootcamp ID
                averageRating: { $avg: '$rating' } // Calculate the average rating
            }
        }
    ]);

    try {
        // If aggregation returned a result, update the Bootcamp model with the new average rating
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating
        });
    } catch (err) {
        console.log(err); // Log any errors
    }
};

// Middleware: Call getAverageRating after saving a new review
ReviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.bootcamp); // Recalculate the average rating after saving a new review
});

// Middleware: Call getAverageCost before deleting a course
ReviewSchema.pre('findOneAndDelete', async function(next) {
    // Get the review that is being deleted
    const review = await this.model.findOne(this.getQuery());

    if (review) {
        await review.constructor.getAverageRating(revirew.bootcamp); // Recalculate the average rating before deleting the review
    }

    next(); // Move to the next middleware
});

module.exports = mongoose.model(' ', ReviewSchema);