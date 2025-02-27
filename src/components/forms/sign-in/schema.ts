import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().email('You must give a valid email'),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(64, { message: 'Your password cannot be longer than 64 characters' })
    .refine((value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''), {
      message:
        'Your password can only contain letters, numbers, underscores, dots, or dashes',
    }),
});
