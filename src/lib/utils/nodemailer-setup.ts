import { Html } from 'next/document';
import nodemailer, { Transporter } from 'nodemailer';

interface MailOptions {
  to: string; // Receiver's email
  subject: string; // Email subject
  text: string; // Email body
}

const transporter: Transporter = nodemailer.createTransport({
  service: 'Gmail', // Replace with the desired service (e.g., Outlook, Yahoo)
  auth: {
    user: process.env.EMAIL_USER as string, // Your email address
    pass: process.env.EMAIL_PASSWORD as string // Your email password
  }
});

export const sendMail = async ({
  to,
  subject,
  text
}: MailOptions): Promise<any> => {
  const mailOptions = {
    from: process.env.EMAIL_USER as string, // Sender's email address
    to,
    subject,
    html: text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error: any) {
    throw new Error('Email could not be sent', error);
  }
};
