import { z } from 'zod';
import { isValidPhone } from '../phone';

export const LeadSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .optional()
    .default('ลูกค้าใหม่'),
  
  phone: z.string()
    .min(3, 'Contact info too short')
    .max(50, 'Contact info too long')
    .refine((v) => isValidPhone(v), 'Invalid phone number')
    .nullable()
    .optional(),
  
  line_id: z.string()
    .max(100)
    .nullable()
    .optional(),
  
  location: z.string()
    .max(200)
    .nullable()
    .optional(),
  
  bill_amount: z.coerce.number()
    .min(0, 'Bill amount cannot be negative')
    .default(0),
  
  system_size: z.coerce.number()
    .min(0)
    .nullable()
    .optional(),
  
  payback_years: z.coerce.number()
    .min(0)
    .nullable()
    .optional(),
  
  equipment_tier: z.string()
    .max(50)
    .nullable()
    .optional(),
  
  status: z.string()
    .max(50)
    .default('New (Chat)'),
  
  notes: z.string()
    .max(1000)
    .nullable()
    .optional(),
  
  // `lead_magnet` comes from /lead-magnets/[id]; the enum stays closed so a caller cannot
  // smuggle an arbitrary source string into the leads table.
  source: z.enum(['web', 'line', 'chat', 'line_login', 'Website Form', 'lead_magnet'])
    .optional()
    .default('chat'),
  
  chat_history: z.array(z.any())
    .nullable()
    .optional(),
  
  email: z.string()
    .email('Invalid email format')
    .nullable()
    .optional(),
  
  message: z.string()
    .max(1000)
    .optional(),
  
  access_token: z.string()
    .optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;
