import express, { Request, Response } from "express";
import { roomJoiningSchema, roomSchema } from "../types/type";
import { roomCodeGenerator } from "../utils/roomCode";
import prisma from "@repo/db/client";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const parsed = roomSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid request", error: parsed.error });
    return;
  }

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
});

router.post("/:code/join", async (req, res) => {
  //@ts-ignore
  const auth = req.auth;
  const parsed = roomJoiningSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid code" });
    return;
  }
  const { code } = parsed.data;
  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) {
    res.status(401).json({ message: "Invalid room code" });
    return;
  }
  const response = await prisma.roomUser.create({
    data: {
      room_id: room.id,
      role: "GUEST",
      user_id: auth.id,
    },
  });

  res.status(200).json({ message: "Joined Successfully" });
});

router.post("/:code", (req, res) => {});

export default router;
