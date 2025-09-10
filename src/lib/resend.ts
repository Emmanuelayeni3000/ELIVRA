import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async ({ to, subject, html, from = process.env.RESEND_FROM_EMAIL }: SendEmailOptions) => {
  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is not defined in environment variables.');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `WedVite <${from}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while sending email.';
    console.error('Send email exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
};