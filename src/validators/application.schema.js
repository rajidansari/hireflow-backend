import * as z from 'zod';

const applySchema = z.object({
  coverNote: z.string().optional(),
});

export { applySchema };
