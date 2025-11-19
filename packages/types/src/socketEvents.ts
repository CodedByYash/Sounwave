import { CHANNELS } from './channels';

export interface ClientToServerEvents {
  // room events
  ping: () => void;
  'room:join': (roomId: string) => void;
  'room:leave': (roomId: string) => void;

  // music events
  'music:play': (trackId: string, position: number) => void;
  'music:pause': () => void;
  'music:seek': (position: number) => void;

  // chat events
  'chat:message': (payload: { roomId: string; message: string }) => void;
}

export interface ServerToClientEvents {
  // room events
  pong: () => void;
  'room:userJoined': (roomId: string) => void;
  'room:userLeft': (roomId: string) => void;

  // music events
  'music:play': (trackId: string, position: number) => void;
  'music:pause': () => void;
  'music:seek': (position: number) => void;

  // chat events
  'chat:message': (payload: ChatPayload) => void;
}

export interface InterServerEvents {
  'sync:music:play': (roomId: string, trackId: string, position: number) => void;
  'sync:music:pause': (roomId: string) => void;
}

export interface SocketData {
  userId?: string;
  roomId?: string;
}

export interface ChatPayload {
  roomId: string;
  userId: string;
  message: string;
}

export interface RoomPayload {
  event: 'room:joined' | 'room:userLeft';
  roomId: string;
  userId: string;
}

export interface MusicPayload {
  action: 'play' | 'pause' | 'resume' | 'seek';
  roomId: string;
  trackId?: string;
  position?: number;
}

export interface ChannelPayloadMap {
  [CHANNELS.CHAT_EVENTS]: ChatPayload;
  [CHANNELS.ROOM_EVENTS]: RoomPayload;
  [CHANNELS.MUSIC_SYNC]: MusicPayload;
}
