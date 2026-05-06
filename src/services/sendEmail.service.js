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
    from: 'jobportal@noreply.com',
    to: email,
    subject: 'Verify your email',
    text: `This otp is only valid for 15 minutes. \n ${otp}`,
  });
};

export { sendOtpEmail };
