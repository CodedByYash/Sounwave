import prisma from '@repo/db';
import passport from 'passport';
import { Strategy as SpotifyStratergy } from 'passport-spotify';

passport.use(
  new SpotifyStratergy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      callbackURL: process.env.CALLBACK_URL as string,
    },
    async (accessToken, refreshToken, expires_in, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: {
            spotify_id: profile.id,
          },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              spotify_id: profile.id,
              accessToken,
              refreshToken,
              display_name: profile.displayName,
            },
          });
        } else {
          await prisma.user.update({
            where: {
              spotify_id: profile.id,
            },
            data: {
              accessToken,
              refreshToken,
            },
          });
        }
        return done(null, user);
      } catch (err: unknown) {
        return done(null);
      }
    },
  ),
);
