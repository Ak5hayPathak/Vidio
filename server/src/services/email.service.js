import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Verify your email</h2>

      <p>Click the link below to verify your email address:</p>

      <a href="${verificationLink}">
        Verify Email
      </a>

      <p>This link expires in 30 minutes.</p>
    `,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset your Vidio password",
    html: `
      <h2>Reset your password</h2>

      <p>
        You requested to reset your Vidio password.
      </p>

      <p>
        Click the link below to create a new password:
      </p>

      <a href="${resetLink}">
        Reset Password
      </a>

      <p>
        This link expires in 15 minutes.
      </p>

      <p>
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    `,
  });
};

const sendEmailChangeVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.CLIENT_URL}/verify-email-change?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirm your new Vidio email",
    html: `
      <h2>Confirm your new email address</h2>

      <p>
        You requested to change the email address associated
        with your Vidio account.
      </p>

      <p>
        Click the link below to confirm your new email address:
      </p>

      <a href="${verificationLink}">
        Confirm New Email
      </a>

      <p>This link expires in 30 minutes.</p>

      <p>
        If you didn't request this change, you can safely ignore this email.
      </p>
    `,
  });
};

export {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmailChangeVerificationEmail,
};