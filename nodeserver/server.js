const express = require('express');
const session = require('express-session');
const app = express();
const http = require('http');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto-js');
const spotify = require('./models/spotify_api.js');
const users_db = require('./models/users_db.js');
const artists_db = require('./models/artists_db.js')
const helpers = require('./js/helpers.js');
const User = require('./models/interfaces/users.js');
const path = require('path');
// const siteUrl = 'https://127.0.0.1';
const siteUrl = 'https://trackhunter-production.up.railway.app';
// const options = {
//   key: fs.readFileSync('crt/localhost-key.pem'),
//   cert: fs.readFileSync('crt/localhost.pem')
// };
require('dotenv').config()

console.log('DEBUG: SESSION_SECRET length is:', process.env.SESSION_SECRET ? process.env.SESSION_SECRET.length : 'NULL/UNDEFINED');
const MongoDBStore = require('connect-mongo');
const store = new MongoDBStore({
  mongoUrl: process.env.MONGO_URI,
  collection: 'sessions'
  // crypto: {
  //   secret: process.env.SESSION_SECRET,
  //   algorithm: 'aes-256-cbc',       
  // },
});

const buildFolderPath = path.join(__dirname, 'spotifinder');
app.use(express.static(buildFolderPath));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 365
  }
}));




// * * *  SECURITY ISSUE  * * *
// CORS should only be enabled for development (127.0.0.1:4200 -> 127.0.0.1:3000)

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "*");
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   next();
// });

  /*
  next() ensures the request continues to the next middleware in the stack. 
  If next() is not called, the request might hang indefinitely.
  */

helpers.connectToMongo();

// Live environment server
const PORT = process.env.PORT || 3000;
console.log('Starting server...')
app.listen(PORT, '0.0.0.0', () => {
    console.log('   Success: server listening on port ' + PORT);
});


// localhost server
// https.createServer(options, (req, res) => {
//   const host = req.headers.host;
//   // Spotify API mandates secure redirect URIs so site won't work using 'localhost', use 127.0.0.1 instead
//   if (host && host.includes('localhost')) {
//     res.writeHead(301, { Location: 'https://127.0.0.1${req.url}' });
//     return res.end();
//   }
//   app(req, res);
//   }).listen(443, '0.0.0.0', () => console.log('HTTPS server listening on port 443'));

// // Redirect server
// // ${req.url} preserves the original url subpage and params
// http.createServer((req, res) => {
//   res.writeHead(301, { Location: `https://127.0.0.1${req.url}` });
//   res.end();
// }).listen(80, '0.0.0.0', () => console.log("HTTP -> HTTPS redirect active"));




app.post('/add-remove-ban', async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ status: 'Fail', message: 'User not logged in' });

  const userId = req.session.userId;
  const artistId = req.body.artistId;
  try {
    await users_db.addRemoveBan(userId, artistId);
    return res.status(201).json({ status: 'Success', message: 'Created' });

  } catch (e) {
    console.log(e.name + ' in /add-remove-ban: ' + e.message);
    return res.status(500).json({ status: 'Fail', message: 'Database error'});
  }
});


app.post('/add-remove-bookmark', async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ status: 'Fail', message: 'User not logged in' });

  const userId = req.session.userId;
  const artistId = req.body.artistId;
  const trackId = req.body.trackId;
  try {
    await users_db.addRemoveBookmark(userId, artistId, trackId);
    return res.status(201).json({ status: 'Success', message: 'Created' } );

  } catch (e) {
    console.log(e.name + ' in /add-remove-bookmark: ' + e.message);
    return res.status(500).json({ status: 'Fail', message: 'Database error' });
  }
});


app.post('/process-login', async (req, res) => {
    const userEmail = req.body.userEmail;
    const userPassword = crypto.SHA1(req.body.userPassword);
    var emailResult;
    var userResult;

    // Fail fast if database operations have error(s)
    try {
      emailResult = await users_db.getUserByEmail(userEmail);
      userResult = await users_db.validateUser(userEmail, userPassword);

    } catch (e) {
      console.log(e.name + ' in /process-login: ' + e.message);
      return res.status(500).json({ status: 'Fail', message: 'Database Error' });
    }

    if (userResult) {
        // Login successful, set data to session
        req.session.authenticated = true;
        req.session.userEmail = userEmail;
        req.session.userId = userResult._id.toString();
        return res.status(200).json({
          message: "Login successful",
          status: "Success",
          userEmail: userEmail, 
          userId: userResult._id.toString()
        });
    } else if (!emailResult) {
        // Login failed, email doesn't exist
        return res.status(404).json({ status: "Fail", message: "Email not registered" });
    } else {
        // Login failed, wrong password
        return res.status(401).json({ status: "Fail", message: "Unauthorized" });
    }
});


app.post('/process-register', async (req, res) => {
    const userEmail = req.body.userEmail;
    const userPassword = req.body.userPassword;

    // Someone could technically POST a direct registration or manipulate the frontend 
    // to bypass validations, so check them again and reject as bad requests if they fail
    if (!helpers.emailVal(userEmail))
      return res.status(400).json({ status: "Fail", message: "Invalid Email Format" })
    if (!helpers.passwordVal(userPassword))
      return res.status(400).json({ status: "Fail", message: "Invalid Password Format" })

    // Check if email is already registered
    try {
      var user = await users_db.getUserByEmail(userEmail);
      if (!user) {
        // If email not registered, create (and return) new user
        // Encrypt password for db storage
        user = await users_db.addUser(userEmail, crypto.SHA1(userPassword));
        req.session.authenticated = true;
        req.session.userEmail = userEmail;
        req.session.userId = user._id.toString();
        return res.status(201).json({
          status: "Success",
          message: "New user created", 
          userEmail: userEmail, 
          userId: user._id.toString() 
        });
      } else {
          // If email already registered, send error
          return res.status(409).json({ status: "Fail", message: "Email already exists" });
      }

    } catch (e) {
      console.log(e.name + ' in /process-register: ' + e.message);
      res.status(500).json({ status: 'Fail', message: 'Database Error' });
    }   
});


app.post('/process-logout', (req, res) => {
  try {
      req.session.destroy(() => {
        res.status(200).json({ status: "Success", message: "Logged out" });
    });

  } catch (e) {
      console.log(e.name + ' in /process-logout: ' + e.message);
      res.status(500).json({ status: 'Fail', message: 'Server session error' });
  }
});


app.post('/get-seed-tracks', async (req, res) => {
    // Any route that could access Spotify API must first check if access token valid
    if (helpers.isAccessTokenInvalid(req.session.timeIssuedMs)) {
        let resp = await spotify.getAccessToken();
        req.session.accessToken = resp.access_token;
        req.session.timeIssuedMs = Date.now();
    }

    try {
        // Request artist/song search results from Spotify API
        const data = await spotify.getSeedTracks(req.body.query, req.session.accessToken);
        if (data.length < 1)   // Artist-song is too obscure (or gibberish search was submitted)
            throw new Error('Spotify could not find any results');
        if (!data)              // If Spotify API promise resolves but returns nothing
            throw new Error('Error retrieving data from Spotify API');
        res.status(200).json({
          status: "Success",
          message: "Seed tracks retrieved successfully",
          data: data
        });

    } catch (e) {
        console.log(e.name + ' in /get-seed-tracks: ' + e.message);
        return res.status(500).json({ status: "Fail", message: error.message });
    }
});


app.post('/get-result-tracks', async (req, res) => {
    // Any route that could access Spotify API must first check if access token valid
            // * * * SPOTIFY DEPRECATED ENDPOINT: recommendations are now canned * * * 
    // if (helpers.isAccessTokenInvalid(req.session.timeIssuedMs)) {
    //     let resp = await spotify.getAccessToken();
    //     req.session.accessToken = resp.access_token;
    //     req.session.timeIssuedMs = Date.now();
    // }

    // Obtain seed track id that user selected from search results
    const seedTrackId = req.body.seedTrackId;
    const popularity = req.body.popularity;
    const accessToken = req.body.accessToken;
    const userId = req.session.userId;
    const viewedTracks = req.session.viewedTracks;

    // Request batch of recommendations from Spotify API
    // Then filter them (for already viewed tracks, tracks missing key fields, etc.)
    try {
      var data = await spotify.getRecTracks(seedTrackId, popularity, accessToken);
      data = await users_db.filterRecTracks(userId, viewedTracks, data);
    } catch (e) {
      console.log(e.name + ' in /get-result-tracks: ' + e.message);
      return res.status(500).json({ status: 'Fail', message: 'Spotify API or track filtering error' });
    }


    // Spotify API promise completes but all tracks were filtered
    if (data.length < 1) {
        return res.status(200).json({ 
          status: "Success", 
          message: "No more results available",
          data: data
        });

    // For every filtered song recommendation, add it to the Artists db collection
    // Also add to user's viewed tracks
    } else {
        for (track of data) {
            await artists_db.addTrack(track, req.session.accessToken);

            // User is logged in, so add viewedTrack to db
            if (req.session.userId) {
                await users_db.addViewedTrack(req.session.userId, track.artistId, track.trackId)

            // Not logged in, so add viewedTrack to session
            } else {
              if (!req.session.viewedTracks)
                req.session.viewedTracks = [];  // Instantiate an array if value was undefined
              
              // Iterate session's viewedTracks to find if it's in there already: stop if/when it's found
              for (viewedTrack of req.session.viewedTracks) {
                var isTrackInSession = false;
                if (viewedTrack.trackId == track.trackId) {
                  isTrackInSession = true;
                  break;
                }
              }
              if (!isTrackInSession)
                req.session.viewedTracks.push(track);
            }
        }

      res.status(200).json({
        status: "Success",
        message: "Result tracks successfully retrieved",
        data: data
      });
    }

  });


app.get('/is-bookmarked', async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ status: 'Fail', message: 'User not logged in' });

  const userId = req.session.userId;
  const trackId = req.query.trackId;
  try {
    const isBookmarked = await users_db.isBookmarked(userId, trackId);
    res.status(200).json({ 
      status: 'Success',
      isBookmarked: isBookmarked,
      message: 'Bookmarked state successfully retrieved' 
  });

  } catch (e) {
    console.log(e.name + ' in /add-remove-bookmark: ' + e.message);
    res.status(500).json({ status: 'Fail', message: 'Database error' });
  }

});


app.get('/get-bookmarked-tracks', async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ status: 'Fail', message: 'User not logged in' });

  try {
    const data = await users_db.getBookmarkedTracks(req.session.userId);
    return res.status(200).json({
      status: "Success",
      message: "Bookmarked tracks successfully retrieved",
      data: data
    });

  } catch (e) {
    console.log(e.name + ' in /get-bookmarked-tracks: ' + e.message);
    return res.status(500).json({ status: 'Fail', message: 'Database error' });
  }
});


app.get('/get-viewed-tracks', async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ status: 'Fail', message: 'User not logged in' });

  try {
    const data = await users_db.getViewedTracks(req.session.userId);
    return res.status(200).json({
      status: "Success",
      message: "Viewed tracks successfully retrieved",
      data: data
    });

  } catch (e) {
    console.log(e.name + ' in /get-viewed-tracks: ' + e.message);
    return res.status(500).json({ status: 'Fail', message: 'Database error' });
  }
});


app.get('/get-banned-artists', async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ status: 'Fail', message: 'User not logged in' });

  try {
    const data = await users_db.getBannedArtists(req.session.userId);
    return res.status(200).json({
      status: "Success",
      message: "Banned artists successfully retrieved",
      data: data 
    });

  } catch (e) {
    console.log(e.name + ' in /get-banned-artists: ' + e.message);
    return res.status(500).json({ status: 'Fail', message: 'Database error' });
  }
});


app.post('/reset-viewed-tracks', async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ status: 'Fail', message: 'User not logged in' });

  try {
    await users_db.resetViewedTracks(req.session.userEmail);
    return res.status(204).json({
      status: "Success",
      message: "Viewed tracks successfully reset"
    });

  } catch (e) {
    console.log(e.name + ' in /reset-viewed-tracks: ' + e.message);
    return res.status(500).json({ status: 'Fail', message: 'Server error' });
  }
});


app.post('/export-bookmarked-tracks', async(req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ status: 'Fail', message: 'User not logged in' });

  // Create new playlist with playlist name user typed, if available
  var playlistName = req.body.playlistName;
  const spotifyUserId = req.session.spotifyUserId;
  const accessToken = req.session.accessToken;

  try {
    if (playlistName == '')
      // Use a default playlist name if not available
      // playlistName = 'TrackHunter ' + Date.now().toString().split(' GMT')[0];
      playlistName = 'TrackHunter Export';
    const playlist = await (await spotify.createPlaylist(spotifyUserId, playlistName, accessToken)).json();

    // Retreive bookmarkedTrackId's, convert to spotify URIs, add them to new array
    var spotifyUris = { uris: [] };
    const bookmarkedTracks = await users_db.getBookmarkedTracks(req.session.userId);
    for (track of bookmarkedTracks) {
        spotifyUris.uris.push('spotify:track:' + track.trackId);
    }

    // Add tracks to Spotify playlist
    await spotify.addToPlaylist(playlist.id, spotifyUris, accessToken);

    // Delete tracks from user's bookmarks (as they're now exported to Spotify)
    var user = await User.findOne({_id: req.session.userId});
    user.bookmarkList = [];
    user.save();

    return res.status(200).json({
      status: "Success",
      message: "Successfully exported tracks to Spotify playlist",
      playlistId: playlist.id
    });

  } catch (e) {
    console.log(e.name + ' in \export-bookmarked-tracks: ' + e.message);
    return res.status(500).json({ status: 'Fail', message: 'Server or Database Error' });
  }
});


app.get('/get-spotify-permissions', async(req, res) => {    
  if (!req.session.userId)
    return res.status(401).json({ status: 'Fail', message: 'User not logged in' });

  return res.status(303).redirect('https://accounts.spotify.com/authorize?response_type=code&client_id=' + process.env.SPOTIFY_API_KEY + '&scope=playlist-modify-private&redirect_uri=' + siteUrl + '/bookmarked-tracks');
});


app.post('/auth-spotify-acc', async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ status: 'Fail', message: 'User not logged in' });

  try {
    var spotifyResp;
    // Any route that could access Spotify API must first check if access token valid
    if (helpers.isAccessTokenInvalid(req.session.timeIssuedMs)) {
        spotifyResp = await spotify.getAccessToken();
        req.session.accessToken = spotifyResp.access_token;
        req.session.timeIssuedMs = Date.now();
    }

    // Upgraded access token confirms user granted TrackHunter app permissions to their acc
    spotifyResp = await spotify.upgradeAccessToken(req.body.permissionCode);
    req.session.accessToken = spotifyResp.access_token;
    req.session.timeIssuedMs = Date.now();

    // We can now freely access their account's Spotify id
    var user = await spotify.getCurrentSpotifyUserId(req.session.accessToken);

    // Save it to session
    req.session.spotifyUserId = user.id;
    return res.status(200).json({ status: "Success", message: "App authourized to Spotify account" });

  } catch (e) {
    console.log(e.name + ' in \auth-spotify-acc: ' + e.message);
    return res.status(500).json({ status: 'Fail', message: 'Server or Spotify API Error' });
  }
});


app.use('*', function (req, res) {
    res.sendFile(path.join(buildFolderPath, 'index.html'));
  });










