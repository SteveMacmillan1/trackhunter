const mongoose = require('mongoose');
require('dotenv').config({quiet: true})

// Contain mongoose.connect and console.log's here to prevent some clutter
function connectToMongo() {
    console.log('Connecting to mongodb atlas cluster...')
    mongoose.connect(process.env.MONGO_URI)
    .then((result) => console.log('   Success: connected to mongodb'))
    .catch((err) => console.log('   Failed to connect to mongodb: ' + err))
}

// Spotify API access tokens are valid for 60 minutes
// This function runs at the top of any route where a user might interact with Spotify API
    // spotify_api.getAccessToken() is run in the route if token refresh is needed
function isAccessTokenInvalid(timeIssuedMs) {
    var tokenAge = Date.now() - timeIssuedMs;
    return (timeIssuedMs == undefined || tokenAge - 3540000 > 0);
    // Token is invalid if timeIssuedMs has never been assigned
    // Also (considered) invalid if it's 59 minutes or older
}



module.exports = {  
    connectToMongo,
    isAccessTokenInvalid
}