import * as z from 'zod';

export const userValidation = z.object({
  name: z.string(),
  email: z.string().email({ message: 'Invalid email address' }),
  telegramId: z.number(),
}).partial();
