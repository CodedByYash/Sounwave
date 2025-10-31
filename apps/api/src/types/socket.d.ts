import 'socket.io';
import 'http';

declare module 'http' {
  interface IncomingMessage {
    session?: Record<string, any>;
    user: Express.User;
  }
}
