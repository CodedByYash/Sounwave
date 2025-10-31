import { Server } from 'socket.io';
import http from 'http';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';

let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

export const initSocket = async (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));

  console.log('✅ Redis adapter connected for Socket.io');

  io.use((socket, next) => {
    const session = socket.request.session;
    if (session?.passport?.user) next();
    else next(new Error('Unauthorized'));
  });
};
