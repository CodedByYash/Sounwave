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
      try {
        // upsert user in DB; store refreshToken (encrypted if possible)
        const user = await prisma.user.upsert({
          where: { spotifyId: profile.id },
          update: {
            displayName: profile.displayName ?? profile.username ?? 'Unknown',
            accessToken,
            refreshToken, // optional: consider encrypting refreshToken
          },
          create: {
            spotifyId: profile.id,
            displayName: profile.displayName ?? profile.username ?? 'Unknown',
            accessToken,
            refreshToken,
          },
        });
        if (!user) return done(null);

        // pass user object to serializeUser
        done(null, user);
      } catch (err: unknown) {
        done(err as Error);
      }
    },
  ),
);
