import { Request, Response } from 'express';
import { addTrackSchema, getQueueSchema, removeTrackSchema, voteTrackSchema } from '../types/type';
import { getTrack } from '../services/spotifyServices';
import { queueService } from '../services/queueService';
import prisma from '@repo/db';

export const trackController = {
  async addTrack(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user || !user.accessToken) {
        return res.status(401).json({ message: 'User not Authenticated' });
      }
      const parsed = addTrackSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid request data' });
      }

      const { code, spotifyTrackId, roomSettings } = parsed.data;

      const room = await prisma.room.findUnique({
        where: { code },
      });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      const fetchedTrack = await getTrack(user.accessToken, spotifyTrackId, roomSettings);
      if (!fetchedTrack) {
        return res.status(404).json({ message: 'Failed to fetch track data' });
      }

      await queueService.addTrack(room.code, fetchedTrack, user.id);

      return res.status(200).json({ message: 'Track added to queue successfully' });
    } catch (error) {
      console.error('Error while adding track to queue', error);
      return res.status(500).json({ message: 'Internal Server error' });
    }
  },

  async getQueue(req: Request, res: Response) {
    try {
      const parsed = getQueueSchema.safeParse(req.params);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid request params' });
      }

      const { code } = parsed.data;

      const room = await prisma.room.findUnique({ where: { code } });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      const queue = queueService.getQueue(room.id);

      return res.status(200).json({ message: 'Queue fetched successfully', queue });
    } catch (error) {
      console.error('Error while retriving queue', error);
      return res.status(500).json({ message: 'Internal Serever error' });
    }
  },

  async removeTrack(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user || !user.spotifyId) {
        return res.status(401).json({ message: 'User not Authenticated' });
      }
      const parsed = removeTrackSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid request body' });
      }

      const { code, spotifyTrackId } = parsed.data;

      const room = await prisma.room.findUnique({
        where: {
          code,
        },
      });

      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      const roomUser = await prisma.roomUser.findFirst({
        where: {
          room_id: room.id,
          user_id: user.id,
        },
      });

      if (!roomUser) {
        return res.status(403).json({ message: 'You are not part of this room' });
      }

      await queueService.removeTrack(room.id, spotifyTrackId);

      return res.status(200).json({ message: 'Track removed successfully' });
    } catch (error) {
      console.error('Error while removing track from queue', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async voteTrack(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user || !user.spotifyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const parsed = voteTrackSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid request body' });
      }

      const { spotifyTrackId, voteType, code } = parsed.data;

      const room = await prisma.room.findUnique({
        where: { code },
      });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      let newScore: number;
      if (voteType === 'UPVOTE') {
        newScore = await queueService.upvoteTrack(room.id, spotifyTrackId);
      } else {
        newScore = await queueService.downvoteTrack(room.id, spotifyTrackId);
      }

      return res
        .status(200)
        .json({ message: `Successfully ${voteType.toLowerCase()}d track`, newScore });
    } catch (error) {
      console.error('Error while voting track', error);
      return res.status(500).json({ message: 'Internal Server error' });
    }
  },
};
