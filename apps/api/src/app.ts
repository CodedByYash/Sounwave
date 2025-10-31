import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/errorHandler';
import { sessionMiddleware } from './config/session';
import routes from './routes/index';
import passport from 'passport';
import authRouter from './routes/auth';
import prisma from '@repo/db';

export const app = express();

const allowedOrigin = process.env.WEB_APP_ORIGIN || 'http://localhost:3000';

app.use(helmet());
app.use(morgan('combined'));
app.use(
  cors({
    origin: allowedOrigin,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID);
console.log('SPOTIFY_REDIRECT_URI:', process.env.SPOTIFY_REDIRECT_URI);
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session()); // Ensure this is after sessionMiddleware

passport.serializeUser((user: any, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  console.log('Deserializing user with id:', id);
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      console.error('User not found during deserialization');
      return done(null, false);
    }
    console.log('Deserialized user:', user);
    done(null, {
      id: user.id,
      email: user.email ?? undefined,
      spotifyId: user.spotifyId,
      displayName: user.displayName,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  } catch (err: unknown) {
    console.error('Deserialization error:', err);
    done(err as Error);
  }
});

app.use('/api/auth', authRouter);
app.use('/api', routes);
app.use(errorMiddleware);

// Log session data
app.use((req, res, next) => {
  console.log('Session data:', req.session);
  next();
});
