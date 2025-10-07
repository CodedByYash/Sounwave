import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get(
  '/spotify',
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'playlist-modify-public'],
  }),
);

router.get(
  '/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  },
);

export default router;
