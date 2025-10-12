import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEventEmail } from '@/lib/send-event-email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find the invite and make sure it belongs to the user's event
    const invite = await prisma.invite.findFirst({
      where: {
        id,
        event: {
          userId: session.user.id,
        },
      },
      include: {
        event: true,
      },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if guest has already responded
    if (invite.rsvpStatus && invite.rsvpStatus !== 'pending') {
      return NextResponse.json(
        { error: 'Guest has already responded' },
        { status: 400 }
      );
    }

    // Send reminder email
    try {
      await sendEventEmail({
        type: 'reminder',
        to: invite.email || '',
        subject: `Reminder: ${invite.event.title} - Please RSVP`,
        baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        data: {
          guestName: invite.guestName,
          eventTitle: invite.event.title,
          eventDate: invite.event.date.toISOString(),
          eventLocation: invite.event.location,
          rsvpLink: `${process.env.NEXTAUTH_URL}/rsvp/${invite.qrCode}`,
        },
      });

      // Create reminder record
      await prisma.reminder.create({
        data: {
          inviteId: invite.id,
          eventId: invite.eventId,
          type: 'rsvp',
          message: 'RSVP reminder sent',
          status: 'sent',
        },
      });

      return NextResponse.json({ 
        message: 'Reminder sent successfully',
        sentTo: invite.email,
        guestName: invite.guestName
      });

    } catch (emailError) {
      console.error('Error sending reminder email:', emailError);
      
      // Create failed reminder record
      await prisma.reminder.create({
        data: {
          inviteId: invite.id,
          eventId: invite.eventId,
          type: 'rsvp',
          message: 'RSVP reminder failed to send',
          status: 'failed',
        },
      });

      return NextResponse.json(
        { error: 'Failed to send reminder email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
}