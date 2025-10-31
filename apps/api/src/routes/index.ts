import express from 'express';
import roomRoutes from './roomRoutes';
import { authMiddleware } from '../middlewares/sessionUser';
import trackRoutes from './trackRoutes';
import voteRoutes from './voteRoutes';

const router = express.Router();
router.use(authMiddleware);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Soundwave API' });
});

router.use('/rooms', roomRoutes);
router.use('/', trackRoutes);
router.use('/', voteRoutes);
export default router;
