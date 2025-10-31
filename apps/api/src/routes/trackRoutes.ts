import { Router } from 'express';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { trackController } from '../controllers/trackController';

const router = Router();

router.post('/room/:code/tracks', ensureAuthenticated, trackController.addTrack);

router.get('/room/:code/tracks', ensureAuthenticated, trackController.getQueue);

router.delete('/room/:code/tracks/:id', ensureAuthenticated, trackController.removeTrack);

router.post('/room/:code/tracks/:id/vote', ensureAuthenticated, trackController.voteTrack);

export default router;
