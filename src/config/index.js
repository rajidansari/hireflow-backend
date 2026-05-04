import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV,

  db: {
    url:
      process.env.NODE_ENV === 'development'
        ? process.env.DATABASE_URL_LOCAL
        : process.env.DATABASE_URL_NEON,
  },
};

const required = ['DATABASE_URL_LOCAL', 'DATABASE_URL_NEON'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env vars :: ${key}`);
  }
}
