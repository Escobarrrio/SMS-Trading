import { z } from 'zod';

export const PhoneSchema = z
  .string()
  .min(7)
  .max(20)
  .regex(/^[+0-9\s\-()]+$/g, 'Invalid phone number');

export const SendSMSSchema = z.object({
  to: PhoneSchema.optional(),
  recipients: z.array(PhoneSchema).optional(),
  message: z.string().min(1).max(160),
  campaignName: z.string().max(100).optional(),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  plan: z.enum(['starter', 'business', 'pro']),
});

export const ContactSchema = z.object({
  name: z.string().max(120).optional(),
  phone: PhoneSchema,
  tag: z.string().max(60).optional(),
});

export const BulkContactsSchema = z.object({
  contacts: z.array(ContactSchema).min(1),
});

export const BulkUploadSchema = z.object({
  recipients: z.array(PhoneSchema),
  message: z.string().min(1).max(160),
});

export const CampaignCreateSchema = z.object({
  name: z.string().min(1).max(100),
  message: z.string().min(1).max(160),
  recipients: z.array(PhoneSchema).optional(),
  tag: z.string().max(60).optional(),
  scheduleAt: z.string().datetime().optional(),
});

export type SendSMSInput = z.infer<typeof SendSMSSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type BulkUploadInput = z.infer<typeof BulkUploadSchema>;
export type ContactInput = z.infer<typeof ContactSchema>;
export type BulkContactsInput = z.infer<typeof BulkContactsSchema>;
export type CampaignCreateInput = z.infer<typeof CampaignCreateSchema>;
