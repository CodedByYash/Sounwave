import Redis from 'ioredis';
import session from 'express-session';
import connectRedis, { RedisStore } from 'connect-redis';

const RedisClient = new Redis(process.env.REDIS_URL || 'http://localhost:6379');

const store = new RedisStore({
  client: RedisClient,
  prefix: 'soundwave',
});

export const sessionMiddleware = session({
  store,
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
});

export { RedisClient };
