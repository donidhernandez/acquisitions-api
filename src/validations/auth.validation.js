import { z } from 'zod';

export const signUpSchema = z.object({
    name: z.string().min(2, 'Name is required').max(255, 'Name must be less than 255 characters').trim(),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(6, 'Password must be at least 6 characters long').max(128, 'Password must be less than 128 characters').trim(),
    role: z.enum(['user', 'admin']).default('user'),
});

export const signInSchema = z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required').trim(),
});