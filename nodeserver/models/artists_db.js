const Artist = require('./interfaces/artists.js');
const spotify = require('./spotify_api.js');

async function getArtist(artistId) {
    return await Artist.findOne({ artistId: artistId });
}

async function addArtist(artistId, accessToken) {
// Request the Artist's Spotify API data (specifically needed for artist/band img)
    const artist = await spotify.getArtist(artistId, accessToken);
    // Then add to db
    const newArtist = new Artist({
        artistId: artistId,
        artistName: artist.name,
        artistImgUrl: artist.images[0].url,
    })

    await newArtist.save();
    return newArtist;

}

async function addTrack(track, accessToken) {
    // Get the artist
    var artist = await this.getArtist(track.artistId);
    if (!artist) {
        // If doesn't exist, create a new Artist document
        artist = await this.addArtist(track.artistId, accessToken);
    }

    // Check if the Artist document already contains this track
    for (let artistTrack of artist.tracks) {
        if (artistTrack.trackId == track.trackId)
            return null;   
    }

    // If not, add the track to the artist document
    artist.tracks.push({
        trackId: track.trackId,
        trackName: track.trackName,
        trackPreviewUrl: track.trackPreviewUrl,
        albumName: track.albumName,
        albumImgUrl: track.albumImgUrl
    });

    await artist.save();
}

module.exports = {
    getArtist,
    addTrack,
    addArtist
}