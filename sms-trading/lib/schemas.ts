import { z } from 'zod';

export const SendSMSSchema = z.object({
  to: z.string().min(10).max(15),
  message: z.string().min(1).max(160),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  plan: z.enum(['starter', 'business', 'pro']),
});

export const BulkUploadSchema = z.object({
  recipients: z.array(z.string()),
  message: z.string().min(1).max(160),
});

export type SendSMSInput = z.infer<typeof SendSMSSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type BulkUploadInput = z.infer<typeof BulkUploadSchema>;
