import * as z from 'zod';

const registerSchema = z
  .object({
    fullname: z.string().min(3, { error: 'Fullname must be atleast 3 characters long' }),
    email: z.email({ error: 'Not a valid email' }),
    password: z.string().min(8, { error: 'Password should be atleast 8 characters long' }),
    role: z.enum(['candidate', 'employer'], { error: 'Role must be from Candidate or Employer' }),
    companyName: z.string({ error: 'Company name is required' }).optional(),
    industry: z.string({ error: 'Company idustry is required' }).optional(),
    location: z.string({ error: 'Location is required' }).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'employer') {
      if (!data.companyName) {
        ctx.addIssue({
          code: 'custom',
          path: ['companyName'],
          message: 'Company name is required for employer',
        });
      }

      if (!data.industry) {
        ctx.addIssue({
          code: 'custom',
          path: ['industry'],
          message: 'Industry is required for employer',
        });
      }

      if (!data.location) {
        ctx.addIssue({
          code: 'custom',
          path: ['location'],
          message: 'Company location is required for employer',
        });
      }
    }
  });

const verifyEmailSchema = z.object({
  email: z.email({ error: 'Email is required' }),
  otp: z.string().length(6, { error: 'Invalid otp' }),
});

const loginSchema = z.object({
  email: z.email({ error: 'Email is required' }),
  password: z.string({ error: 'Password is required' }),
});

const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Email is required' }),
});

const verifyResetOtpSchema = z.object({
  email: z.email({ error: 'Email is required' }),
  otp: z
    .string({ error: 'Otp not provided' })
    .length(6, { error: 'Otp should be 6 characters long' }),
});

const resetPasswordSchema = z.object({
  password: z.string({ error: 'Password must be atleast 8 characters long' }),
});

export {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
};
