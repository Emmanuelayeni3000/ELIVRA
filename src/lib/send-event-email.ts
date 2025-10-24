import { resend } from './resend';
import { generateQRCodeDataURL } from './qr-code';
import { getEmailTemplate } from './email-templates';

export type EmailType =
  | 'invitation'
  | 'rsvp-confirmation'
  | 'reminder'
  | 'rsvp-notification'
  | 'companion-invite';

interface SendEventEmailProps {
  type: EmailType;
  to: string;
  subject: string;
  baseUrl: string; // Added baseUrl
  data: {
    guestName: string;
    eventTitle: string;
    eventType?: string; // Added to determine which template to use
    eventDate?: string; // Made optional as not all emails need it
    eventLocation?: string; // Made optional
    eventDescription?: string;
    eventDressCode?: string; // Added for dress code
    rsvpLink?: string;
    response?: 'attending' | 'not-attending';
    additionalGuests?: number;
    dietaryRequirements?: string;
    specialInstructions?: string;
    guestCount?: number; // Added for notification email
    message?: string; // Added for notification email
    eventTime?: string; // Added for invitation email
    rsvpDate?: string; // Added for invitation email
    primaryGuestName?: string; // Added for companion guest emails
    companionInviteLink?: string; // Added for companion guest invite button
  };
}

export async function sendEventEmail({ type, to, subject, baseUrl, data }: SendEventEmailProps) {
  try {
    switch (type) {
      case 'invitation':
        if (!data.rsvpLink || !data.eventDate || !data.eventLocation || !data.eventTime || !data.rsvpDate) throw new Error('RSVP link, event date, time, location, and RSVP date are required for invitation emails');
        
        // Extract token from RSVP link to create invitation link
        const token = data.rsvpLink?.split('/rsvp/')[1] || '';
        const invitationLink = `${baseUrl}/invitation/${token}`;
        
        // Generate QR code for the smart invitation link
        const qrCodeDataURL = await generateQRCodeDataURL(invitationLink, 140);
        console.log('🔍 QR Code generated:', qrCodeDataURL ? 'Success' : 'Failed');
        console.log('🔍 QR Code length:', qrCodeDataURL?.length || 0);
        
        // Determine which template to use based on event type
        const templateName = data.eventType === 'burial' || data.eventType === 'funeral' ? 'burial-invitation' : 'event-invitation';

        const templateData: Record<string, string> = {
          'Guest Name': data.guestName,
          'Event Title': data.eventTitle,
          'Event Date': data.eventDate,
          'Event Time': data.eventTime,
          'Event Location': data.eventLocation,
          'RSVP Date': data.rsvpDate,
          'RSVP Link': data.rsvpLink,
          'Invitation Link': data.rsvpLink, // Use RSVP link for email button
          'QR Code': qrCodeDataURL, // QR code uses smart link
        };
        
        // Add dress code if provided
        if (data.eventDressCode) {
          templateData['Event Dress Code'] = data.eventDressCode;
        }
        
        const invitationHtml = getEmailTemplate(templateName, templateData, baseUrl);
        
        console.log('🔍 Template contains QR Code:', invitationHtml.includes('[QR Code]') ? 'Not replaced' : 'Replaced');
        await resend.emails.send({
          from: `Elivra <${process.env.RESEND_FROM_EMAIL}>`,
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
          from: `Elivra <${process.env.RESEND_FROM_EMAIL}>`,
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
          from: `Elivra <${process.env.RESEND_FROM_EMAIL}>`,
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
          from: `Elivra <${process.env.RESEND_FROM_EMAIL}>`,
          to: [to],
          subject,
          html: rsvpNotificationHtml,
        });
        break;

      case 'companion-invite':
        if (!data.primaryGuestName || !data.eventDate || !data.eventLocation || !data.companionInviteLink) {
          throw new Error('Primary guest name, event date, event location, and invite link are required for companion invite emails');
        }

        const companionTemplateData: Record<string, string> = {
          'Primary Guest Name': data.primaryGuestName,
          'Event Title': data.eventTitle,
          'Event Date': data.eventDate,
          'Event Location': data.eventLocation,
          'Event Time': data.eventTime ?? 'To be announced',
          'Personal Message': data.message ?? '',
          'Companion Invite Link': data.companionInviteLink,
        };

        const companionHtml = getEmailTemplate('companion-invite', companionTemplateData, baseUrl);
        await resend.emails.send({
          from: `Elivra <${process.env.RESEND_FROM_EMAIL}>`,
          to: [to],
          subject,
          html: companionHtml,
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
