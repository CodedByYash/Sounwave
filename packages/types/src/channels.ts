export const CHANNELS = {
  MUSIC_SYNC: 'music_sync',
  ROOM_EVENTS: 'room_event',
  CHAT_EVENTS: 'chat_event',
} as const;

export type Channel = keyof typeof CHANNELS;
