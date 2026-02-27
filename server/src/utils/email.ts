import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  // Skip email sending in test environment
  if (process.env.NODE_ENV === 'test') {
    console.log(`[TEST MODE] Skipping email to ${email} with token ${token}`);
    return;
  }

  // Skip if SMTP is not configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
    console.log(`[WARNING] SMTP not configured, skipping email to ${email}`);
    return;
  }

  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/user/verify-email?token=${token}`;
    const name = email.split('@')[0]; // Extract name from email

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Email Verification Required - Complete Your Registration',
      html: `
        <h1>Welcome to Our Platform</h1>
        <p>Dear ${name},</p>
        <p>Thank you for registering with us. To ensure the security of your account and activate all features, please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email Address</a></p>
        <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This verification link will expire in 24 hours for security reasons.</p>
        <p>Best regards,<br>The Team</p>
      `,
    });
  } catch (error) {
    console.error(`[ERROR] Failed to send verification email to ${email}`);
    // Don't throw error - allow registration to proceed even if email fails
  }
}
