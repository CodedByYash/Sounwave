export interface SpotifyArtist {
  id: string;
  name: String;
}

export interface SpotifyAlbumImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyAlbumImage[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  explicit: boolean;
  uri: string;
}

export interface SpotifySearchTrackResponse {
  tracks: { items: SpotifyTrack[] };
}

export interface NormalizedTrack {
  id: string;
  name: string;
  artist: string;
  duration_ms: number;
  explicit: boolean;
  album: string;
  image?: string;
  uri: string;
}

//spotifyArtist
//spotifyAlbumImage
//spotifyAlbum
//spotifyTrack
//spotifySearchTrackResponse
