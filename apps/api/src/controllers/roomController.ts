import { Request, Response } from 'express';
import { roomJoiningSchema, roomSchema, getRoomDetailsSchema } from '../types/type';
import prisma from '@repo/db';
import { nanoid } from 'nanoid';

export const roomController = {
  async createRoom(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'User not authenticated' });

      const parsed = roomSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid request', error: parsed.error });
      }
      const code = await nanoid(6).toUpperCase();
      const { settings } = parsed.data;
      const room = await prisma.room.create({
        data: {
          code,
          host_user_id: userId,
          settings: settings || {},
        },
      });

      const addHost = await prisma.roomUser.create({
        data: {
          role: 'HOST',
          room_id: room.id,
          user_id: userId,
        },
      });

      return res.status(201).json({
        message: 'Room created successfully',
        room: {
          id: room.id,
          code: room.code,
          hostUserId: room.host_user_id,
          createdAt: room.created_at,
        },
      });
    } catch (error) {
      console.error('Error creating room:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  async joinRoom(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const parsed = roomJoiningSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid code' });
      }
      const { code } = parsed.data;

      const room = await prisma.room.findUnique({ where: { code } });
      if (!room) {
        return res.status(401).json({ message: 'Room not found' });
      }

      const alreadyJoined = await prisma.roomUser.findUnique({
        where: {
          room_id_user_id: {
            room_id: room.id,
            user_id: user.id,
          },
        },
      });
      if (alreadyJoined) {
        return res.status(400).json({ message: 'Already Joined the Room' });
      }
      const newMember = await prisma.roomUser.create({
        data: {
          room_id: room.id,
          user_id: user.id,
          role: 'GUEST',
        },
      });

      return res
        .status(200)
        .json({ message: `Joined room ${room.code} successfully`, member: newMember });
    } catch (error) {
      console.error('Error joining room:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  async getRoomDetails(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      const parsed = getRoomDetailsSchema.safeParse(req.params);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid data' });
      }

      const { code } = parsed.data;

      const room = await prisma.room.findUnique({
        where: { code },
        include: {
          host: {
            select: {
              id: true,
              displayName: true,
              imageUrl: true,
            },
          },
          members: {
            include: { user: { select: { id: true, displayName: true, imageUrl: true } } },
          },
          tracks: true,
        },
      });

      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      return res.status(200).json({
        message: 'Successfully fetched rooms',
        room: {
          id: room.id,
          code: room.code,
          host: room.host,
          members: room.members.map((m) => ({
            id: m.id,
            name: m.user.displayName,
            role: m.role,
          })),
          tracksCount: room.tracks.length,
          createdAt: room.created_at,
          settings: room.settings,
        },
      });
    } catch (error) {
      console.error('Error fetching room details:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
};
