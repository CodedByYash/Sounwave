import { Router } from 'express';
import passport from 'passport';
import '../config/passport';

const router = Router();

router.get('/test', (req, res) => {
  res.json({ msg: 'Auth router working' });
});

router.get(
  '/spotify',
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'playlist-modify-public'],
  }),
);

router.get(
  '/spotify/callback',
  passport.authenticate('spotify', {
    session: true, // Ensure session is used
    failureRedirect: '/api/auth/failed',
  }),
  (req, res) => {
    console.log('Callback success handler reached, user:', req.user);
    if (req.user) {
      res.redirect(process.env.WEB_APP_ORIGIN || 'http://localhost:3000');
    } else {
      res.redirect('/api/auth/failed');
    }
  },
);

router.get('/api/auth/failed', (req, res) => {
  res
    .status(401)
    .json({ message: 'Authentication failed', error: 'Check server logs for details' });
});

router.get('/me', (req, res) => {
  console.log('Current user in session:', req.user);
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false });
  }
});

router.post('/logout', (req, res) => {
  req.logout(() => {
    // passport's logout callback (if any)
    req.session?.destroy(() => {
      res.clearCookie('connect.sid');
      res.status(200).json({ ok: true });
    });
  });
});

export default router;
