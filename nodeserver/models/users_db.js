const User = require('./interfaces/users.js');
const Artist = require('./interfaces/artists.js');


async function addRemoveBookmark(userId, artistId, trackId) {
    // Retrieve logged in user's bookmarks from db
    const user = await User.findOne({ _id: userId });
    if (!user)
        throw new Error('Could not find user in db (or db connectivity issue)');

    var userBookmarks = user.bookmarkList;
    var matchFound = false;
    for (let i=0; i < userBookmarks.length; i++) {
        // Check all their bookmarks to see if the track is in there already
        if (userBookmarks[i].trackId == trackId) {
            // If so, remove it (without leaving a "hole" in the array)
            userBookmarks.splice(i, 1);
            matchFound = true;
            // Stop the loop since track was found
            break;
        }
    }
    // Add track if it wasn't found in user's existing bookmarks
    if (!matchFound)
        userBookmarks.push({ artistId: artistId, trackId: trackId });
    
    await user.save();
}


async function addRemoveBan(userId, artistId) {
    const user = await User.findOne({ _id: userId });
    if (!user)
        throw new Error('Could not find user in db (or db connectivity issue)');
    
        var userBanList = user.banList;
        var matchFound = false;
        for (let i=0; i < userBanList.length; i++) {
            if (userBanList[i] == artistId) {
                userBanList.splice(i, 1);
                matchFound = true;
                break;
            }
        }
        if (!matchFound)
            userBanList.push(artistId);

        await user.save();
    }


async function addUser(userEmail, userPassword) {
    // Duplicate user protection is done with a getUserByEmail() check on the registration form
    const user = new User({
        userEmail: userEmail,
        userPassword: userPassword
    })
    return await user.save();
}
    
    

// Used for login validation and existing user check before registrations
async function validateUser(userEmail, userPassword) {
    return await User.findOne({
        userEmail: userEmail,
        userPassword: userPassword
    })
}


// Used to test if email exists in db (toward required handling for asgn part 3)
async function getUserByEmail(userEmail) {
    return await User.findOne({ userEmail: userEmail })
}


async function getBookmarkedTracks(userId) {
    const user = await User.findOne({ _id: userId });
    if (!user)
        throw new Error('Could not find user in db (or db connectivity issue)');

    var bookmarkDataArr = [];
    var bookmarkData;
    var trackData;
    for (let bookmark of user.bookmarkList) {
        const artistData = await Artist.findOne({ artistId: bookmark.artistId })
        for (let track of artistData.tracks) {
            // Find the specific track within the Artist document
            if (bookmark.trackId == track.trackId)
                trackData = track;
        }

        bookmarkData = {
            artistId: artistData.artistId,
            artistName: artistData.artistName,
            trackId: trackData.trackId,
            trackName: trackData.trackName,
            trackPreviewUrl: trackData.trackPreviewUrl,
            albumName: trackData.albumName,
            albumImgUrl: trackData.albumImgUrl
        }

        bookmarkDataArr.push(bookmarkData)
    }
    return bookmarkDataArr;
    }


async function addViewedTrack(userId, artistId, trackId) {
    const user = await User.findOne({ _id: userId });
    if (!user)
        throw new Error('Could not find user in db (or db connectivity issue)');

    user.viewedList.push({
        artistId: artistId, 
        trackId: trackId,
        date: Date.now() });

    await user.save();
}


// Uses the same logic & procedure as getBookmarkedTracks(), see notes above
async function getViewedTracks(userId) {
    const user = await User.findOne({ _id: userId });
    if (!user) 
        throw new Error('Could not find user in db (or db connectivity issue)');

    var viewDataArr = [];
    var viewData;
    const listLen = user.viewedList.length;

    // Only provide the 50 most recently viewed tracks
    for (let i=listLen-1; i > listLen-51; i--) {
        if (i <= -1)
            break;
    
        var view = user.viewedList[i];
        var viewData;           
            const artist = await Artist.findOne({ artistId: view.artistId });
            for (let track of artist.tracks) {
                
                // Find the specific track in the Artist document
                if (view.trackId == track.trackId) 
                    trackData = track;
                
                viewData = {
                    trackId: track.trackId,
                    trackName: track.trackName,
                    trackPreviewUrl: track.trackPreviewUrl,
                    albumName: track.albumName,
                    albumImgUrl: track.albumImgUrl,
                    artistId: artist.artistId,
                    artistName: artist.artistName,
                    date: view.date   
                }
            }
        viewDataArr.push(viewData);
    }
    return viewDataArr;
}


// Uses the same logic & procedure as getBookmarkedTracks(), see notes above
async function getBannedArtists(userId) {
    const user = await User.findOne({ _id: userId });
    if (!user)
        throw new Error('Could not find user in db (or db connectivity issue)');

    var artistDataArr = [];
    var artistData;
    for (let artistId of user.banList) {
        const artist = await Artist.findOne({ artistId: artistId });
        artistData = {
            artistId: artist.artistId,
            artistName: artist.artistName,
            artistImgUrl: artist.artistImgUrl,
            dateBanned: artist.updatedAt
        }
        artistDataArr.push(artistData);
    }

    return artistDataArr;
}
    

// Recommended tracks are checked for 4 qualities:
    // Must have 30 second track preview (all users)
    // Must not have 2 or more contributing artists (logged in users)
    // Must not have already been viewed by user (logged in users)
    // Must not be from artist user has banned (logged in users)
async function filterRecTracks(userId, viewedTracksSess, recTracks) {
    var validatedTracks = [];
    for (let recTrack of recTracks) {
        var isTrackValid = true;

        // All users: Forbid tracks without preview clip
        if (!recTrack.trackPreviewUrl) 
            continue;

        // Forbid tracks with 2 or more contributing artists
        // * * * Recommendations are canned now due to endpoint deprecation, so skip this check * * *
        // if (track.album.artists[1]) {
        //     // console.log('Track filtered! (Two or more contributing Artists');
        //     continue;
        // }
        
        // Only for logged in users 
        if (userId) {
            const user = await User.findOne({ _id: userId });
            if (user.viewedList) {
              var viewedTracks = user.viewedList ?? [];
              var viewedTrackCount = 0;
              for (let viewedTrack of viewedTracks) {
                  viewedTrackCount++;
                  // Forbid tracks that the user has already seen
                      // (Works on Spotify trackId so same track on different album may still appear)
                  if (recTrack.trackId == viewedTrack.trackId) {
                      isTrackValid = false;
                      break;
                  }
              }
            }
            
            // Skip to next result track item if this one has already been confirmed invalid
            if (!isTrackValid)
                continue;

            if (user.bannedArtists) {
              var bannedArtists = user.banList;
              for (let bannedArtist of bannedArtists) {
                  // Forbid tracks from artists user has banned
                  if (recTrack.artistId == bannedArtist) {
                      isTrackValid = false;
                      break;
                  }
              }
            }

        // For logged out users
        } else {
          if (viewedTracksSess) {
            for (let viewedTrack of viewedTracksSess) {
              if (viewedTrack.trackId == recTrack.trackId) {
                isTrackValid = false;
              }
            }
          }
        }

        // Add the track to an array if it passes all checks
        if (isTrackValid) 
            validatedTracks.push(recTrack);
        
        // Return the array when 4 valid tracks are found
        if (validatedTracks.length == 4) 
            return validatedTracks;
        
    }
    // Return the array if less than 4 valid tracks are found
    return validatedTracks;
}


async function resetViewedTracks(userEmail) {
    const user = await User.findOne({ userEmail: userEmail });
    if (!user)
        throw new Error('Could not find user in db (or db connectivity issue)');

    user.viewedList = [];
    user.save();
}


module.exports = {
    addRemoveBookmark,
    addRemoveBan,
    addUser,
    validateUser,
    getUserByEmail,
    getBookmarkedTracks,
    addViewedTrack,
    getViewedTracks,
    getBannedArtists,
    filterRecTracks,
    resetViewedTracks
}