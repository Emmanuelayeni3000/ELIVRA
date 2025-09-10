import { resend } from './resend';


import { getEmailTemplate } from './email-templates';

export type EmailType = 'invitation' | 'rsvp-confirmation' | 'reminder' | 'rsvp-notification';

interface SendEventEmailProps {
  type: EmailType;
  to: string;
  subject: string;
  baseUrl: string; // Added baseUrl
  data: {
    guestName: string;
    eventTitle: string;
    eventDate?: string; // Made optional as not all emails need it
    eventLocation?: string; // Made optional
    eventDescription?: string;
    rsvpLink?: string;
    response?: 'attending' | 'not-attending';
    additionalGuests?: number;
    dietaryRequirements?: string;
    specialInstructions?: string;
    guestCount?: number; // Added for notification email
    message?: string; // Added for notification email
    eventTime?: string; // Added for invitation email
    rsvpDate?: string; // Added for invitation email
  };
}

export async function sendEventEmail({ type, to, subject, baseUrl, data }: SendEventEmailProps) {
  try {
    switch (type) {
      case 'invitation':
        if (!data.rsvpLink || !data.eventDate || !data.eventLocation || !data.eventTime || !data.rsvpDate) throw new Error('RSVP link, event date, time, location, and RSVP date are required for invitation emails');
        const invitationHtml = getEmailTemplate('event-invitation', {
          'Guest Name': data.guestName,
          'Event Name': data.eventTitle,
          'Event Date': data.eventDate,
          'Event Time': data.eventTime,
          'Event Location': data.eventLocation,
          'RSVP Date': data.rsvpDate,
          'RSVP Link': data.rsvpLink,
        }, baseUrl); // Pass baseUrl here
        await resend.emails.send({
          from: 'Your Wedding <noreply@yourdomain.com>',
          to: [to],
          subject,
          html: invitationHtml,
        });
        break;

      case 'rsvp-confirmation':
        if (!data.response || !data.eventDate || !data.eventLocation) throw new Error('Response, event date, and location are required for RSVP confirmation emails');
        const rsvpConfirmationHtml = getEmailTemplate('rsvp-confirmation', {
          'Guest Name': data.guestName,
          'Event Title': data.eventTitle,
          'Event Date': data.eventDate,
          'Event Location': data.eventLocation,
          'Response': data.response,
        }, baseUrl); // Pass baseUrl here
        await resend.emails.send({
          from: 'Your Wedding <noreply@yourdomain.com>',
          to: [to],
          subject,
          html: rsvpConfirmationHtml,
        });
        break;

      case 'reminder':
        if (!data.eventDate || !data.eventLocation) throw new Error('Event date and location are required for reminder emails');
        const reminderHtml = getEmailTemplate('event-reminder', {
          'Guest Name': data.guestName,
          'Event Title': data.eventTitle,
          'Event Date': data.eventDate,
          'Event Location': data.eventLocation,
        }, baseUrl); // Pass baseUrl here
        await resend.emails.send({
          from: 'Your Wedding <noreply@yourdomain.com>',
          to: [to],
          subject,
          html: reminderHtml,
        });
        break;

      case 'rsvp-notification':
        if (!data.response) throw new Error('Response is required for RSVP notification emails');
        const rsvpNotificationHtml = getEmailTemplate('rsvp-notification', {
          'Guest Name': data.guestName,
          'Event Title': data.eventTitle,
          'Response': data.response,
          'Guest Count': data.guestCount ? data.guestCount.toString() : 'N/A',
          'Message': data.message || 'N/A',
        }, baseUrl); // Pass baseUrl here
        await resend.emails.send({
          from: 'Your Wedding <noreply@yourdomain.com>',
          to: [to],
          subject,
          html: rsvpNotificationHtml,
        });
        break;

      default:
        throw new Error(`Invalid email type: ${type}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
