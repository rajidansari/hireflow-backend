import * as z from 'zod';

const getAllNotificationsSchema = z.object({
  limit: z.coerce.number().int().max(50).default(20),
  page: z.coerce.number().int().default(1),
});

export { getAllNotificationsSchema };
