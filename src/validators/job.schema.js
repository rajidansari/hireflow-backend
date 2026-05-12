import * as z from 'zod';

const createJobSchema = z.object({
  title: z.string({ error: 'Job title is required' }),
  description: z.string({ error: 'Job description is required' }),
  skills: z
    .array(z.string(), { error: 'Skills not provided, choose atleast 1 skill to move' })
    .nonempty(),
  location: z.string({ error: 'Location is required' }),
  salary_min: z.int({ error: 'Please mention minimum salary' }),
  salary_max: z.int({ error: 'Please mention maximum salary' }),
  status: z.enum(['draft', 'active', 'expired'], { error: 'Choose job status' }).optional(),
});

// get all job schema
const getAllJobSchema = z.object({
  title: z.string().min(3).optional(),
  skills: z
    .string()
    .transform(value =>
      value
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean)
    )
    .optional(),
  location: z.string().optional(),
  salary_min: z.coerce.number().optional(),
  salary_max: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(40).default(15),
  sort: z.enum(['newest', 'oldest', 'salary_high', 'salary_low']).default('newest'),
});

export { createJobSchema, getAllJobSchema };
