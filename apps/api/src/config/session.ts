import session from 'express-session';
import { RedisStore } from 'connect-redis';
import 'dotenv/config';
import { createClient } from 'redis';

console.log('🔄 Initializing Redis client...');

export const redisClient = createClient({
  url: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
});

redisClient.on('connect', () => console.log('✅ Redis connected successfully'));
redisClient.on('error', (err) => console.error('❌ Redis connection error:', err));

// Connect to Redis immediately
redisClient.connect().catch((err) => {
  console.error('❌ Failed to connect to Redis:', err);
});

export const sessionMiddleware = session({
  store: new RedisStore({
    client: redisClient,
    prefix: 'soundwave:',
  }),
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});
