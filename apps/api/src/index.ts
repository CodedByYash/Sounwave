import { app } from './app';
import 'dotenv/config';
import http from 'http';
import { initSocket } from './socket';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

initSocket(server)
  .then(() => console.log('✅ Socket.io initialized'))
  .catch((err) => console.error('❌ Socket.io init failed', err));

const SocketPORT = process.env.SocketPORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app
  .listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  })
  .on('error', (err) => {
    console.error('Failed to start server:', err);
  });
