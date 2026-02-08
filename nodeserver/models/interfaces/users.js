// Mongoose model for the Users collection
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    // App uses the _id string for ID, so no need for model to supply a custom userId field
    userPassword: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    banList: [String],
    bookmarkList: [{
        artistId: String,
        trackId: String,
        date: Number
    }],
    viewedList: [{
        artistId: String,
        trackId: String,
        date: Number
    }]
}, {timestamps: true});

const User = mongoose.model('User', usersSchema);

module.exports = User;