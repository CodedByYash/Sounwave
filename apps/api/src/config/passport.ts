import { Strategy as SpotifyStrategy } from 'passport-spotify';
import passport from 'passport';
import prisma from '@repo/db';

passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      callbackURL: process.env.SPOTIFY_REDIRECT_URI!,
    },
    async (accessToken, refreshToken, expires_in, profile, done) => {
      console.log('Spotify Strategy called with profile:', profile);
      try {
        let user = await prisma.user.upsert({
          where: { spotifyId: profile.id },
          update: {
            displayName: profile.displayName ?? profile.username ?? 'Unknown',
            accessToken,
            refreshToken,
          },
          create: {
            spotifyId: profile.id,
            displayName: profile.displayName ?? profile.username ?? 'Unknown',
            accessToken,
            refreshToken,
          },
        });
        console.log('User upserted:', user);
        if (!user) {
          console.error('User upsert failed, no user returned');
          return done(new Error('User upsert failed'));
        }
        done(null, user);
      } catch (err: unknown) {
        console.error('Error in SpotifyStrategy:', err);
        done(err as Error);
      }
    },
  ),
);
