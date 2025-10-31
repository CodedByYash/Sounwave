import prisma from '@repo/db';
import { Request, Response } from 'express';
import { getQueueKey, redis } from '../services/queueService';

type VoteType = 'UPVOTE' | 'DOWNVOTE';

export const voteController = {
  async castVote(req: Request, res: Response) {
    try {
      const { roomCode, trackId } = req.params;
      const { vote_type }: { vote_type: VoteType } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: missing user' });
      }

      const track = await prisma.track.findFirst({ where: { id: trackId } });

      if (!track) {
        res.status(404).json({ message: 'track does not track' });
        return;
      }

      const existingVote = await prisma.vote.findUnique({
        where: {
          track_id_user_id: { track_id: trackId, user_id: userId },
        },
      });

      let delta = 0;
      if (!existingVote) {
        delta = vote_type === 'UPVOTE' ? 1 : -1;
      } else if (existingVote.vote_type === vote_type) {
        return res.status(400).json({ message: 'You have already voted this way.' });
      } else {
        delta = vote_type === 'UPVOTE' ? 2 : -2;
      }

      const updatedVote = await prisma.vote.upsert({
        where: { track_id_user_id: { track_id: trackId, user_id: userId } },
        update: { vote_type },
        create: { track_id: trackId, user_id: userId, room_id: track.room_id, vote_type },
      });

      const queueKey = getQueueKey(track.room_id);
      await redis.zincrby(queueKey, delta, track.spotify_id);

      return res.status(200).json({
        message: 'Vote recorded successfully.',
        vote: updatedVote,
        scoreChange: delta,
      });
    } catch (error) {
      console.error('Error casting vote:', error);
      return res.status(500).json({ message: 'Internal server error', error });
    }
  },
};
