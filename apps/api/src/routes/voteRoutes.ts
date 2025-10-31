import { Router } from 'express';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { voteController } from '../controllers/votes';

const router = Router();

router.post('/rooms/:roomCode/tracks/:trackId/vote', ensureAuthenticated, voteController.castVote);

export default router;
