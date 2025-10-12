import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { generateQRCodeDataURL } from '@/lib/qr-code';
import { sendEmail } from '@/lib/resend';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // This is the invite ID

    // Fetch the invite details
    const invite = await prisma.invite.findUnique({
      where: {
        id,
        event: { // Ensure user owns the event associated with the invite
          userId: session.user.id,
        },
      },
      include: {
        event: true, // Include event details for the email
      },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invitation not found or unauthorized' }, { status: 404 });
    }

    if (!invite.email) {
      return NextResponse.json({ error: 'Guest email not provided for this invitation' }, { status: 400 });
    }

  // Build links: button should go to RSVP, QR should use smart invitation router
  const rsvpLink = `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${invite.qrCode}`;
  const smartLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${invite.qrCode}`;
  const qrCodeDataURL = await generateQRCodeDataURL(smartLink);

    // Compose email HTML
    const emailHtml = `
      <h1>Hello ${invite.guestName},</h1>
      <p>You are invited to ${invite.event.title}!</p>
      <p>Date: ${new Date(invite.event.date).toLocaleDateString()}</p>
      <p>Location: ${invite.event.location}</p>
      <p>Please RSVP by [RSVP Date - TODO]</p>
  <img src="${qrCodeDataURL}" alt="QR Code for your invitation" />
  <p>Respond here: <a href="${rsvpLink}">${rsvpLink}</a></p>
      <p>We look forward to celebrating with you!</p>
      <p>Best regards,</p>
      <p>The WedVite Team</p>
    `;

    // Send email
    const emailResult = await sendEmail({
      to: invite.email,
      subject: `Your Invitation to ${invite.event.title}`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      return NextResponse.json({ error: emailResult.error || 'Failed to send email' }, { status: 500 });
    }

    // Update invite status (e.g., sentAt timestamp)
    await prisma.invite.update({
      where: { id: invite.id },
      data: { sentAt: new Date() },
    });

    return NextResponse.json({ message: 'Invitation sent successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Send invitation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}