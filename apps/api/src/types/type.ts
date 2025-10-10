import z from 'zod';

export const roomSchema = z.object({
  host_user_id: z.string().trim().min(6).max(400),
  is_active: z.boolean(),
  settings: z.object({}),
});

export const roomJoiningSchema = z.object({
  code: z.string().min(6).max(6),
});
