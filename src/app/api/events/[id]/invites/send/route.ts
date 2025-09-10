import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { generateQRCodeDataURL } from '@/lib/qr-code';
import { sendEmail } from '@/lib/resend';
import { format } from 'date-fns';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId } = await params; // This is the event ID

    // Fetch the event and its invites
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        userId: session.user.id, // Ensure user owns the event
      },
      include: {
        invites: true, // Include all invites for this event
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    if (event.invites.length === 0) {
      return NextResponse.json({ message: 'No guests to send invitations to for this event.' }, { status: 200 });
    }

    let sentCount = 0;
    let failedCount = 0;
    const failedEmails: { email: string; error: string }[] = [];

    for (const invite of event.invites) {
      if (!invite.email) {
        failedCount++;
        failedEmails.push({ email: invite.guestName || 'Unknown Guest', error: 'No email provided' });
        continue;
      }

      try {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.id}`;
        const qrCodeDataURL = await generateQRCodeDataURL(inviteLink);

        const emailHtml = `
          <h1>Hello ${invite.guestName},</h1>
          <p>You are invited to ${event.title}!</p>
          <p>Date: ${format(new Date(event.date), 'PPP')}</p>
          <p>Location: ${event.location}</p>
          <p>Scan the QR code below for your digital invitation:</p>
          <img src="${qrCodeDataURL}" alt="QR Code for your invitation" />
          <p>Or click here: <a href="${inviteLink}">${inviteLink}</a></p>
          <p>We look forward to celebrating with you!</p>
          <p>Best regards,</p>
          <p>The WedVite Team</p>
        `;

        const emailResult = await sendEmail({
          to: invite.email,
          subject: `Your Invitation to ${event.title}`,
          html: emailHtml,
        });

        if (emailResult.success) {
          await prisma.invite.update({
            where: { id: invite.id },
            data: { sentAt: new Date() },
          });
          sentCount++;
        } else {
          failedCount++;
          failedEmails.push({ email: invite.email, error: emailResult.error || 'Unknown email error' });
        }
      } catch (emailError: unknown) {
        failedCount++;
        const errorMessage = emailError instanceof Error ? emailError.message : 'An unexpected error occurred during email sending.';
        failedEmails.push({ email: invite.email, error: errorMessage });
        console.error(`Failed to send email to ${invite.email}:`, emailError);
      }
    }

    return NextResponse.json({
      message: `Invitations sent: ${sentCount}, Failed: ${failedCount}`,
      sentCount,
      failedCount,
      failedEmails,
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Bulk send invitation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}