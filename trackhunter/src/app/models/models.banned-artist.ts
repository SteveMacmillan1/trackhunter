export interface BannedArtist {
  artistId: string,
  artistName: string,
  artistImgUrl: string,
  date: string
}

export const EMPTY_BANNED_ARTIST: BannedArtist = {
  artistId: '',
  artistName: '',
  artistImgUrl: '',
  date: ''
};