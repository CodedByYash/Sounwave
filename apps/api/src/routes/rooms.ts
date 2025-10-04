import express from "express";
import { ListRooms, RoomCreation, RoomJoin } from "../controllers/rooms";

const router = express.Router();

router.post("/", RoomCreation);

router.post("/:code/join", RoomJoin);

router.post("/:code", ListRooms);

export default router;
