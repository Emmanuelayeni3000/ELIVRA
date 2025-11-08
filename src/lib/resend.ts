import { Resend } from 'resend';

// Use a placeholder API key during build time if not provided
const apiKey = process.env.RESEND_API_KEY || 're_placeholder_key_for_build';
export const resend = new Resend(apiKey);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async ({ to, subject, html, from = process.env.RESEND_FROM_EMAIL }: SendEmailOptions) => {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_placeholder_key_for_build') {
    throw new Error('RESEND_API_KEY is not defined in environment variables.');
  }

  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is not defined in environment variables.');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Elivra <${from}>`,
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