import nodemailer from 'nodemailer';

import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS', 'SMTP_HOST', 'SMTP_PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName]?.trim() === '');

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables for email service:', missingEnvVars.join(', '));
  console.error('Please set these variables in your .env file');
}

// Configuração do transporter do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Test email configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Configuration Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

interface SendVerificationEmailParams {
  email: string;
  name: string;
  token: string;
}

interface SMTPError extends Error {
  code?: string;
}

export async function sendVerificationEmail({ email, name, token }: SendVerificationEmailParams) {
  if (missingEnvVars.length > 0) {
    console.warn('Email service is not properly configured. Skipping email send.');
    return;
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/api/users/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@yourapp.com',
    to: email,
    subject: 'Verify your email address',
    html: `
      <h1>Email Verification</h1>
      <p>Hello ${name},</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>If you did not request this verification, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    const smtpError = error as SMTPError;
    if (smtpError.code === 'EAUTH') {
      throw new Error('Email service authentication failed. Please check your SMTP credentials.');
    }
    throw new Error('Failed to send verification email');
  }
}