import fetch from 'node-fetch';
import { SpotifySearchTrackResponse, SpotifyTrack } from '../types/spotify';

interface RoomSettings {
  maxTrackLength?: number;
  allowExplicit?: boolean;
}
export async function searchTracks(
  token: string,
  query: string,
  limit = 10,
  roomSettings: RoomSettings,
) {
  const res = await fetch(
    `${process.env.SPOTIFY_BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Spotify search failed:${res.statusText}`);
  }

  const data = (await res.json()) as SpotifySearchTrackResponse;

  let tracks = data.tracks.items.map((t: SpotifyTrack) => ({
    id: t.id,
    name: t.name,
    artists: t.artists.map((a) => a.name).join(', '),
    album: t.album.name,
    duration_ms: t.duration_ms,
    explicit: t.explicit,
    uri: t.uri,
    image: t.album.images?.[0]?.url,
  }));

  if (roomSettings) {
    tracks = tracks.filter((t) => {
      if (!roomSettings.allowExplicit && t.explicit) return false;

      if (roomSettings.maxTrackLength && t.duration_ms > roomSettings.maxTrackLength) return false;

      return true;
    });
  }
  return tracks;
}

export async function getTrack(token: string, trackId: string, roomSettings: RoomSettings) {
  const res = await fetch(`${process.env.SPOTIFY_BASE_URL}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Spotify get track failed: ${res.statusText}`);
  }

  const t = (await res.json()) as SpotifyTrack;

  const track = {
    id: t.id,
    name: t.name,
    album: t.album.name,
    image: t.album.images?.[0].url,
    artist: t.artists.map((a) => a.name).join(', '),
    explicit: t.explicit,
    uri: t.uri,
    duration_ms: t.duration_ms,
  };

  if (roomSettings) {
    if (!roomSettings.allowExplicit && track.explicit)
      throw new Error('Track is explicit nad not allowed in thos room');

    if (roomSettings.maxTrackLength && track.duration_ms > roomSettings.maxTrackLength)
      throw new Error('Track duration exceeds room limit');
  }
  return track;
}
