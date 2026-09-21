import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

export async function sendInvitationEmail(
  email: string,
  name: string,
  role: string,
  token: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const link = `${baseUrl}/complete-registration/${token}`;

  const roleLabel = role === "lecturer" ? "Lecturer" : "Student";

  const text = `Dear ${name},

You have been invited to join SAMS (Student Attendance Management System) as a ${roleLabel}.

Please click the link below to complete your account setup:
${link}

This invitation will expire in 3 days.

If you did not expect this invitation, you can ignore this email.

Best regards,
SAMS Team`;

  await transporter.sendMail({
    from: `"SAMS" <${process.env.NODEMAILER_USER}>`,
    to: email,
    subject: `Invitation to join SAMS as ${roleLabel}`,
    text,
  });
}

export async function sendStudentCredentialsEmail(
  email: string,
  name: string,
  registrationNumber: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const loginLink = `${baseUrl}/login`;

  const text = `Dear ${name},

Welcome to SAMS (Student Attendance Management System). Your student account has been created successfully.

You can now log in to the system using the credentials below:

Email: ${email}
Password: ${registrationNumber}

Please log in at: ${loginLink}

Keep your password safe. If you did not expect this email, you can ignore it.

Best regards,
SAMS Team`;

  await transporter.sendMail({
    from: `"SAMS" <${process.env.NODEMAILER_USER}>`,
    to: email,
    subject: "Your SAMS Student Account Has Been Created",
    text,
  });
}
