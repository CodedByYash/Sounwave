import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/errorHandler';
import { sessionMiddleware } from './config/session';
import routes from './routes/index';
import passport from 'passport';
import session from 'express-session';
import './config/passport';
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

app.use(sessionMiddleware);
// app.use(
//   session({
//     secret: process.env.SESSION_SESSION!,
//     resave: false,
//     saveUninitialized: false,
//   }),
// );

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) return done(null, false);

    done(null, {
      id: user.id,
      email: user.email ?? undefined,
      spotifyId: user.spotifyId,
      displayName: user.displayName,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  } catch (err: unknown) {
    done(err as Error);
  }
});

app.use('/api/auth', authRouter);
app.use('/api', routes);
app.use(errorMiddleware);
