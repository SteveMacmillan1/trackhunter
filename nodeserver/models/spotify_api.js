// POST request for access token using Spotify API client_id and client_secret

const siteURL = 'https://127.0.0.1';
require('dotenv').config({quiet: true})

// Valid for 60 minutes
async function getAccessToken() {
    var body = 'grant_type=client_credentials&client_id=' + process.env.SPOTIFY_API_KEY + '&client_secret=' + process.env.SPOTIFY_CLIENT_SECRET;

    var data = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    })
    return await data.json();
}


// The access token is upgraded & changed when a user grants permission to a third party app
    // This will run when user clicks "Add App Permissions" from the Bookmarked Tracks page
    // Valid for a renewed 60 minutes
async function upgradeAccessToken(code) {
    var body = 'grant_type=authorization_code&code=' + code + '&redirect_uri=' + siteURL + '/bookmarked-tracks';

    var data = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(process.env.SPOTIFY_API_KEY + ':' + process.env.SPOTIFY_CLIENT_SECRET)
        }
    })
    return await data.json();
}

// async function getRecTracks(seedTrackId, popularity, accessToken) {
    // * * * DEPRECATED BY SPOTIFY * * * 
//         var data = await fetch('https://api.spotify.com/v1/recommendations?seed_tracks=' + seedTrackId + '&limit=100', {
//           method: 'GET',
//           headers: {
//               'Content-Type': 'application/x-www-form-urlencoded',
//               'Authorization': 'Bearer ' + accessToken
//           }
//       })
//       return await data.json()
// }


async function getRecTracks() {
  const fs = require('fs').promises;
  const path = require('path');
  try {
    const data = await fs.readFile(path.join(__dirname, '..', 'recommendations.json'));
    return JSON.parse(data);
  } catch (error) {
    console.log('File read error: ' + error.message);
    throw error;
  }
}


// GET request search results for the given artist name and song title
async function getSeedTracks(query, accessToken) {
                                                          // Full search string passed as "artist"
                                                          // APIs artist: and track: attribues are buggy
    var data = await fetch('https://api.spotify.com/v1/search?q=' + query + '&type=track&limit=3', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + accessToken
        }
    })
    return await data.json();
}


// GET request for the specified Spotify artistId
    // Only used to retrieve the artist image for use in the Banned Artist page
async function getArtist(artistId, accessToken) {
    var data = await fetch('https://api.spotify.com/v1/artists/' + artistId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + accessToken
        }
    })
    return await data.json()
}


// POST request to create a new playlist on user's account
    // Requires upgraded access token
async function createPlaylist(spotifyUserId, name, accessToken) {
    var body = {
        name: name,
        public: false
    }
    var data = await fetch('https://api.spotify.com/v1/users/' + spotifyUserId + '/playlists', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    })
    return data;
}


// POST request to add tracks to a user's playlist
    // Requires upgraded access token
async function addToPlaylist(playlistId, spotifyUris, accessToken) {
    var body = spotifyUris;
    var data = await fetch('https://api.spotify.com/v1/playlists/' + playlistId + '/tracks', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    })
    return await data.json();
}


// GET request to obtain the logged in Spotify user's ID
    // Requires upgraded access token
async function getCurrentSpotifyUserId(accessToken) {
    var data = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    })
    return await data.json();
}


module.exports = {
    getAccessToken,
    upgradeAccessToken,
    getRecTracks,
    getSeedTracks,
    getArtist,
    createPlaylist,
    addToPlaylist,
    getCurrentSpotifyUserId
};