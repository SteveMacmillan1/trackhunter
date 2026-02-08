export interface Track {
  trackId: string,
  trackName: string,
  artistId: string,
  artistName: string,
  artistImgUrl: string,
  trackPreviewUrl: string,
  albumName: string,
  albumImgUrl: string,
  date: string
}

export const EMPTY_TRACK: Track = {
  trackId: '',
  trackName: '',
  artistId: '',
  artistName: '',
  artistImgUrl: '',
  trackPreviewUrl: '',
  albumName: '',
  albumImgUrl: '',
  date: ''
};