import * as z from 'zod';

const updateEmployerProfileSchema = z.object({
  fullname: z.string().min(3, { error: 'fullname must be atleast 3 characters long' }).optional(),
  companyName: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
});

export { updateEmployerProfileSchema };
