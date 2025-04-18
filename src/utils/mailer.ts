import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  attachments,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: { filename: string; path: string }[];
}) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Brainboard" <no-reply@gmail.com>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const subject = 'Verify your email address';
    const html = `
        <h1>Welcome to Brainboard</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;margin-top: 20px;">Verify Email</a>
    `;
    return sendEmail({ to: email, subject, html });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    const subject = 'Reset your password';
    const html = `
        <h1>Reset your password</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>
    `;
    return sendEmail({ to: email, subject, html });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error(`Error sending password reset email: ${error.message}`);
  }
};
