// Mongoose model for the Artists collection
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artistsSchema = new Schema({
    artistId: {
        type: String,
        required: true
    },
    artistName: {
        type: String,
        required: true
    },
    artistImgUrl: {
        type: String,
        required: false
    },
    // Design decision notes
    // Tracks are stored as sub-data within an Artist document
    // More efficient when there are tens of thousands of artists and millions of tracks
        // Slow to search through millions of track documents to find one track
        // Faster to search through tens of thousands of artist documents first, 
        // then a second search through their few hundred songs to find the track
    // Downside: every track search requires both trackID and artistID to complete
        // Small price for performance increase
    tracks: []
}, {timestamps: true});

const Artist = mongoose.model('Artist', artistsSchema);

module.exports = Artist;