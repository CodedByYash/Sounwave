import Redis from 'ioredis';
import { NormalizedTrack } from '../types/spotify';

export interface QueueTrack extends NormalizedTrack {
  spotifyId: string;
  addedBy: string;
  addedAt: number;
  score: number;
}

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
});

export function getQueueKey(roomId: string) {
  return `room:${roomId}:queue`;
}

export function getTrackKey(roomId: string, spotifyId: string) {
  return `room:${roomId}:track:${spotifyId}`;
}

function log(message: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[QueueService] ${message}`);
  }
}

export const queueService = {
  async addTrack(roomId: string, track: NormalizedTrack, addedBy: string): Promise<void> {
    const queueKey = getQueueKey(roomId);
    const trackKey = getTrackKey(roomId, track.id);

    const exists = await redis.zscore(queueKey, track.id);
    if (exists) {
      console.log('Track already exists in queue.');
      return;
    }

    const queueTrack: QueueTrack = {
      ...track,
      spotifyId: track.id,
      addedBy,
      addedAt: Date.now(),
      score: 0,
    };

    try {
      await redis.hset(trackKey, {
        name: queueTrack.name,
        artists: queueTrack.artist,
        album: queueTrack.album,
        duration_ms: queueTrack.duration_ms.toString(),
        explicit: queueTrack.explicit ? 'true' : 'false',
        addedBy: queueTrack.addedBy,
        addedAt: Date.now().toString(),
        uri: queueTrack.uri,
        image: queueTrack.image ?? '',
      });

      await redis.zadd(queueKey, 0, queueTrack.id);

      log(`✅ Added ${queueTrack.name} to room ${roomId}`);
    } catch (error) {
      console.error('❌ Failed to add track:', error);
    }
  },

  async getQueue(roomId: string) {
    const queueKey = getQueueKey(roomId);

    // Get both track IDs and their scores
    const results = await redis.zrevrange(queueKey, 0, -1, 'WITHSCORES');

    const tracks: QueueTrack[] = [];
    for (let i = 0; i < results.length; i += 2) {
      const spotifyId = results[i];
      const score = Number(results[i + 1]);

      const data = await redis.hgetall(getTrackKey(roomId, spotifyId));
      if (Object.keys(data).length === 0) continue;

      tracks.push({
        spotifyId,
        id: spotifyId,
        name: data.name,
        artist: data.artist,
        album: data.album,
        duration_ms: Number(data.duration_ms),
        explicit: data.explicit === 'true',
        addedBy: data.addedBy,
        addedAt: Number(data.addedAt),
        uri: data.uri,
        image: data.image || '',
        score, // ✅ now reflects live vote count
      });
    }

    return tracks;
  },

  async upvoteTrack(roomId: string, spotifyId: string): Promise<number> {
    const queueKey = getQueueKey(roomId);
    const newScore = await redis.zincrby(queueKey, 1, spotifyId);
    log(`Track ${spotifyId} upvoted.New Score: ${newScore}`);
    return Number(newScore);
  },

  async downvoteTrack(roomId: string, spotifyId: string): Promise<number> {
    const queueKey = getQueueKey(roomId);
    const newScore = await redis.zincrby(queueKey, -1, spotifyId);
    log(`Track ${spotifyId} downvoted. New Socre: ${newScore}`);
    return Number(newScore);
  },

  async removeTrack(roomId: string, spotifyId: string): Promise<void> {
    const queueKey = getQueueKey(roomId);
    const trackKey = getTrackKey(roomId, spotifyId);

    await redis.multi().zrem(queueKey, spotifyId).del(trackKey).exec();
    log(`🗑️ Removed track ${spotifyId} from room ${roomId}`);
  },

  async popNextTrack(roomId: string): Promise<QueueTrack | null> {
    const queueKey = getQueueKey(roomId);
    const [topTrackId] = await redis.zrevrange(queueKey, 0, 0);

    if (!topTrackId) return null;

    const trackData = await redis.hgetall(getTrackKey(roomId, topTrackId));
    if (!trackData.name) return null;

    await this.removeTrack(roomId, topTrackId);

    const track: QueueTrack = {
      spotifyId: topTrackId,
      id: topTrackId,
      name: trackData.name,
      artist: trackData.artist,
      album: trackData.album,
      duration_ms: Number(trackData.duration_ms),
      explicit: trackData.explicit === 'true',
      addedBy: trackData.addedBy,
      addedAt: Number(trackData.addedAt),
      uri: trackData.uri,
      image: trackData.image,
      score: 0,
    };
    log(`🎵 Next track popped: ${track.name}`);
    return track;
  },

  async getTopTrack(roomId: string): Promise<QueueTrack | null> {
    const queueKey = getQueueKey(roomId);
    const [topId] = await redis.zrevrange(queueKey, 0, 0);
    if (!topId) return null;

    const data = await redis.hgetall(getTrackKey(roomId, topId));
    if (!data.name) return null;

    return {
      spotifyId: topId,
      id: topId,
      name: data.name,
      artist: data.artist,
      album: data.album,
      duration_ms: Number(data.duration_ms),
      explicit: data.explicit === 'true',
      addedBy: data.addedBy,
      addedAt: Number(data.addedAt),
      uri: data.uri,
      image: data.image ?? '',
      score: 0,
    };
  },
};
