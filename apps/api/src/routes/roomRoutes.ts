import express from 'express';
import { roomController } from '../controllers/roomController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const router = express.Router();

router.post('/create', ensureAuthenticated, roomController.createRoom);

router.post('/join', ensureAuthenticated, roomController.joinRoom);

router.get('/:code', ensureAuthenticated, roomController.getRoomDetails);

export default router;
