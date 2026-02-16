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

function getSiteUrl() {
    // return 'https://127.0.0.1';
    return 'https://trackhunter-production.up.railway.app'
}

/*
    /process-register user password validation checks
    The frontend has validation control but could technically be bypassed
    So registration without these requirements will return 400 Bad Request
        At least 1 lowercase
        At least 1 uppercase
        At least 1 number
        At least 1 special character
        8-16 character length

    It's more readable and maintainable to check if reqs are met indivdually
    Otherwise I think it'd have to use a brutal lookahead regex like:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
*/

function passwordVal(password) {
    return lowerCaseVal(password)   &&
        upperCaseVal(password)      &&
        numberVal(password)         &&
        specCharVal(password)       &&
        lengthVal(password);
}

function lowerCaseVal(password) {
    const pattern = /[a-z]/;
    return pattern.test(password);
}

function upperCaseVal(password) {
    const pattern = /[A-Z]/;
    return pattern.test(password);
}

function numberVal(password) {
    const pattern = /[0-9]/;
    return pattern.test(password);
}

function specCharVal(password) {
    const pattern = /[!-\/:-@[-`{-~]/;
    return pattern.test(password);
}

function lengthVal(password) {
    const pattern = /.{8,16}/;
    return pattern.test(password);
}

function emailVal(email) {
    const pattern = /^[a-zA-Z0-9_-]{1,30}@[a-zA-Z0-9_-]{1,30}\.[a-zA-Z]{2,6}$/;
    return pattern.test(email);
}
 


module.exports = {  
    connectToMongo,
    isAccessTokenInvalid,
    getSiteUrl,
    passwordVal,
    emailVal
}