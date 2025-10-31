import prisma from '@repo/db';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export const requiredHostForRoom = (roomIdParam = 'code'): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ ok: false, message: 'Unauthorized' });
        return;
      }

      const roomIdentifier =
        (req.params as any)[roomIdParam] || req.body.roomId || req.query.roomId;
      if (!roomIdentifier) {
        res.status(400).json({ ok: false, message: 'Missing room Identifier' });
        return;
      }

      const room = await prisma.room.findFirst({
        where: { OR: [{ id: roomIdentifier }, { code: roomIdentifier }] },
        select: { id: true },
      });

      if (!room) {
        res.status(404).json({ ok: false, message: 'Room not found' });
        return;
      }

      const membership = await prisma.roomUser.findFirst({
        where: {
          room_id: room.id,
          user_id: user.id,
        },
        select: {
          role: true,
        },
      });

      if (!membership || !membership.role) {
        res.status(403).json({ ok: false, message: 'Forbidden Host role required' });
      }

      (req as any).membership = membership;
      return next();
    } catch (err) {
      return next(err);
    }
  };
};
