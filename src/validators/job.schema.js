import * as z from 'zod';

const createJobSchema = z.object({
  employer_id: z.uuid({ error: 'Employer id is required' }),
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

export { createJobSchema };
