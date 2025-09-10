import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEventEmail } from '@/lib/send-event-email';

// POST /api/invites/send-bulk
// Body: { eventId: string, guestIds: string[], message?: string }
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { eventId, guestIds } = await request.json();

    if (!eventId || !Array.isArray(guestIds) || guestIds.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Fetch invites (only those belonging to event & user)
    const invites = await prisma.invite.findMany({
      where: {
        id: { in: guestIds },
        eventId: eventId,
        event: { userId: session.user.id },
      },
    });

    if (invites.length === 0) {
      return NextResponse.json({ error: 'No valid invites found' }, { status: 400 });
    }

    const results: Array<{ id: string; email: string; status: string; error?: string }> = [];

    for (const invite of invites) {
      try {
        if (!invite.email) {
          results.push({ id: invite.id, email: '(missing)', status: 'failed', error: 'Invite has no email' });
          continue;
        }
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${invite.id}`;
        await sendEventEmail({
          type: 'invitation',
          to: invite.email, // non-null after guard
          subject: `You're Invited: ${event.title}`,
          baseUrl: process.env.NEXT_PUBLIC_APP_URL as string,
          data: {
            guestName: invite.guestName,
            eventTitle: event.title,
            eventDate: new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            }),
            eventTime: event.time || '',
            eventLocation: event.location,
            rsvpLink: inviteLink,
            rsvpDate: new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          }
        });

        // Mark as sent if not already
        if (!invite.sentAt) {
          await prisma.invite.update({
            where: { id: invite.id },
            data: { sentAt: new Date() }
          });
        }

  results.push({ id: invite.id, email: invite.email, status: 'sent' });
      } catch (e) {
        console.error('Failed sending invite', invite.id, e);
  results.push({ id: invite.id, email: invite.email || '(missing)', status: 'failed', error: e instanceof Error ? e.message : 'Unknown error' });
      }
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.length - sent;

    return NextResponse.json({
      message: `Processed ${results.length} invites (${sent} sent, ${failed} failed)`,
      summary: { total: results.length, sent, failed },
      results
    });
  } catch (error) {
    console.error('Bulk send error:', error);
    return NextResponse.json({ error: 'Failed to send bulk invitations' }, { status: 500 });
  }
}
