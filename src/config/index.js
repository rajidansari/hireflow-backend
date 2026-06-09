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

  jwt: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    resetTokenKey: process.env.JWT_RESET_SECRET,
  },

  smtp:
    process.env.NODE_ENV === 'production'
     ? {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          password: process.env.SMTP_PASS,
        }
      : {
          host: process.env.SMTP_HOST_DEV,
          port: process.env.SMTP_PORT_DEV,
          user: process.env.SMTP_USER_DEV,
          password: process.env.SMTP_PASS_DEV,
        },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_SECRET_KEY,
  },
};

const required = [
  'DATABASE_URL_NEON',
  'ACCESS_TOKEN_KEY',
  'REFRESH_TOKEN_KEY',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env vars :: ${key}`);
  }
}
