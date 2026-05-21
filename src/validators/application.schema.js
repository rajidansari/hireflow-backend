import * as z from 'zod';

const applySchema = z.object({
  coverNote: z.string().optional(),
});

// get all application for a specific job
const jobApplicationsSchema = z.object({
  limit: z.coerce.number({ error: 'Limit must be of number type' }).max(30).default(12),
  page: z.coerce.number({ error: 'Page must be number' }).default(1),
  status: z.enum(['pending', 'reviewed', 'hired', 'rejected']).default('pending'),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});

const myApplicationsSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'hired', 'rejected']).optional(),
  limit: z.coerce.number({ error: 'Limit must be of number type' }).max(30).default(12),
  page: z.coerce.number({ error: 'Page must be of number type' }).default(1),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});

// update application status
const updateApplicationStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'hired', 'rejected'], {
    error: 'Invalid value for status',
  }),
});

export { applySchema, jobApplicationsSchema, myApplicationsSchema, updateApplicationStatusSchema };
