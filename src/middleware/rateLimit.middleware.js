import { rateLimit } from 'express-rate-limit';

export const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

export const standardLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});
