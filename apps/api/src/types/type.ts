import z from 'zod';

export const roomSchema = z.object({
  settings: z.object({}),
});

export const roomJoiningSchema = z.object({
  code: z.string().min(6).max(6),
});

export const getRoomDetailsSchema = z.object({
  code: z.string().min(6).max(6),
});

export const addTrackSchema = z.object({
  code: z.string().min(6).max(6),
  spotifyTrackId: z.string().min(1),
  roomSettings: z.object({
    maxTrackLength: z.number().optional(),
    allowExplicit: z.boolean().optional(),
  }),
});

export const getQueueSchema = z.object({
  code: z.string().min(6).max(6),
});

export const removeTrackSchema = z.object({
  code: z.string().min(6).max(6),
  spotifyTrackId: z.string().min(1),
});

export const voteTrackSchema = z.object({
  spotifyTrackId: z.string().min(1),
  voteType: z.enum(['UPVOTE', 'DOWNVOTE']),
  code: z.string().min(6).max(6),
});
