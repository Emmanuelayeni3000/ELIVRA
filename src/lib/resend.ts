import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const sendInvitationEmail = async ({
  to,
  guestName,
  eventTitle,
  qrCodeData,
  eventDate,
  eventLocation
}: {
  to: string
  guestName: string
  eventTitle: string
  qrCodeData: string
  eventDate: string
  eventLocation: string
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'WedVite <noreply@wedvite.com>',
      to: [to],
      subject: `You're Invited: ${eventTitle}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1D3557; font-family: 'Playfair Display', serif;">
            ${eventTitle}
          </h1>
          
          <p>Dear ${guestName},</p>
          
          <p>You're cordially invited to celebrate with us!</p>
          
          <div style="background: #F5F0E6; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #1D3557; margin-top: 0;">Event Details</h3>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Location:</strong> ${eventLocation}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="${qrCodeData}" alt="Invitation QR Code" style="max-width: 200px;" />
            <p style="color: #666; font-size: 14px;">Scan this QR code to view your invitation</p>
          </div>
          
          <p>We can't wait to celebrate with you!</p>
          
          <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; color: #666; font-size: 12px;">
            <p>Sent with love via WedVite</p>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error('Failed to send email')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}
