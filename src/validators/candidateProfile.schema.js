import * as z from 'zod';

const updateCandidateProfileSchema = z.object({
  fullname: z.string({ error: 'Must be 3 characters long' }).optional(),
  headline: z.string().optional(),
  description: z.string().optional(),
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

export { updateCandidateProfileSchema };
