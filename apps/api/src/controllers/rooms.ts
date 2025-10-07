import { Request, Response } from 'express';
import { roomJoiningSchema, roomSchema } from '../types/type';

import { roomCodeGenerator } from '../utils/roomCode';
import prisma from '@repo/db';

export const RoomCreation = async (req: Request, res: Response) => {
  //@ts-ignore
  const auth = req.auth;
  const parsed = roomSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid request', error: parsed.error });
    return;
  }
  try {
    const code = await roomCodeGenerator(6);
    const { host_spotify_id, is_active, settings } = parsed.data;
    const room = await prisma.room.create({
      data: {
        code,
        host_spotify_id,
        createdAt: new Date(),
        is_active,
        settings,
      },
    });

    res
      .status(200)
      .json({
        roomCode: room.code,
        roomId: room.id,
      })
      .location(`/rooms/${room.id}`);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const RoomJoin = async (req: Request, res: Response) => {
  //@ts-ignore
  const auth = req.auth;
  const parsed = roomJoiningSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid code' });
    return;
  }
  try {
    const { code } = parsed.data;

    const room = await prisma.room.findUnique({ where: { code } });
    if (!room) {
      res.status(401).json({ message: 'Invalid room code' });
      return;
    }

    const Joined = await prisma.roomUser.findFirst({
      where: {
        user_id: auth.id,
        room_id: room?.id,
      },
    });
    if (Joined) {
      res.status(400).json({ message: 'Already Joined the Room' });
      return;
    }
    const response = await prisma.roomUser.create({
      data: {
        room_id: room.id,
        role: 'GUEST',
        user_id: auth.id,
      },
      select: { role: true },
    });

    res.status(200).json({ message: 'Joined Successfully', response });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const ListRooms = async (req: Request, res: Response) => {
  //@ts-ignore
  const auth = req.auth;

  const response = await prisma.user.findFirst({
    where: { id: auth.id },
    select: {
      rooms: true,
    },
  });

  res.status(200).json({ message: 'Successfully fetched rooms', response });
};
