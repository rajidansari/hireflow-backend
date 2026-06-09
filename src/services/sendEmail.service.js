import { createTransport } from 'nodemailer';
import { config } from '../config/index.js';

const transporter = createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password,
  },
});

const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: 'Hireflow <rajidansari25@gmail.com>',
    to: email,
    subject: 'Verify your email',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 20px;">
      <div style="max-width: 500px; background: white; margin: auto; padding: 40px 30px; border-radius: 10px;">

        <h2 style="margin: 0; color: #111;">
          Verify Your Email
        </h2>

        <p style="margin-top: 20px; color: #555; font-size: 15px; line-height: 1.6;">
          Use the OTP below to verify your email address.
          This OTP is valid for <strong>15 minutes</strong>.
        </p>

        <div style="margin: 30px 0; text-align: center;">
          <span
            style="
              display: inline-block;
              letter-spacing: 8px;
              font-size: 32px;
              font-weight: bold;
              background: #f3f4f6;
              padding: 16px 24px;
              border-radius: 8px;
              color: #111;
            "
          >
            ${otp}
          </span>
        </div>

        <p style="color: #777; font-size: 14px; line-height: 1.6;">
          If you did not request this, you can safely ignore this email.
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 12px; color: #999; text-align: center;">
          Hireflow
        </p>

      </div>
    </div>
    `,
  });
};

// password reset otp send mail
const sendPasswordResetOtp = async (email, otp) => {
  await transporter.sendMail({
    from: 'Hireflow <rajidansari25@gmail.com>',
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 20px;">
        <div style="max-width: 500px; background: white; margin: auto; padding: 40px 30px; border-radius: 10px;">

          <h2 style="margin: 0; color: #111;">
            Password Reset Request
          </h2>

          <p style="margin-top: 20px; color: #555; font-size: 15px; line-height: 1.6;">
            We received a request to reset your password.
            Use the OTP below to continue.
            This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <div style="margin: 30px 0; text-align: center;">
            <span
              style="
                display: inline-block;
                letter-spacing: 8px;
                font-size: 32px;
                font-weight: bold;
                background: #f3f4f6;
                padding: 16px 24px;
                border-radius: 8px;
                color: #111;
              "
            >
              ${otp}
            </span>
          </div>

          <p style="color: #777; font-size: 14px; line-height: 1.6;">
            If you did not request a password reset, you can safely ignore this email.
            Your account will remain secure.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

          <p style="font-size: 12px; color: #999; text-align: center;">
            Hireflow
          </p>

        </div>
      </div>
    `,
  });
};

export { sendOtpEmail, sendPasswordResetOtp };
