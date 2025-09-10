import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEventEmail, EmailType } from '@/lib/send-event-email';

interface ReminderResultSuccess { success: true; email: string | null; }
interface ReminderResultFail { success: false; email: string | null; error: string | undefined; }
type ReminderResult = ReminderResultSuccess | ReminderResultFail;

// POST /api/events/[id]/reminders - Send reminders for an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // unified dynamic param name
    const eventId = id;
    const { reminderType = 'general', targetAudience = 'pending' } = await request.json();

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.date < new Date()) {
      return NextResponse.json({ error: 'Cannot send reminders for past events' }, { status: 400 });
    }

    const whereClause: { eventId: string; rsvpStatus?: string } = { eventId };
    switch (targetAudience) {
      case 'pending': whereClause.rsvpStatus = 'pending'; break;
      case 'attending': whereClause.rsvpStatus = 'attending'; break;
      case 'all': break;
      default: whereClause.rsvpStatus = 'pending';
    }

    const invites = await prisma.invite.findMany({ where: whereClause, include: { event: true } });
    if (invites.length === 0) {
      return NextResponse.json({ message: 'No invites found for the specified criteria', sent: 0 });
    }

  const results: ReminderResult[] = await Promise.all(invites.map(async (invite): Promise<ReminderResult> => {
      if (!invite.email) return { success: false, email: invite.guestName, error: 'No email address' };
      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${invite.id}`;
      const emailType: EmailType = 'reminder';
      let subject: string;
      switch (reminderType) {
        case 'urgent': subject = `⏰ URGENT: Please respond - ${event.title}`; break;
        case 'final': subject = `📅 Final reminder - ${event.title}`; break;
        case 'event-tomorrow': subject = `🎉 Tomorrow's the day - ${event.title}`; break;
        default: subject = `📧 Reminder: ${event.title}`;
      }
      try {
        await sendEventEmail({
          type: emailType,
          to: invite.email,
          subject,
          baseUrl: process.env.NEXT_PUBLIC_APP_URL as string,
          data: {
            guestName: invite.guestName,
            eventTitle: event.title,
            eventDate: new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            eventTime: event.time || '',
            eventLocation: event.location,
            eventDescription: event.description || '',
            rsvpLink: inviteLink,
          },
        });
        return { success: true, email: invite.email };
      } catch (error) {
        console.error(`Failed to send reminder to ${invite.email}:`, error);
        return { success: false, email: invite.email, error: (error as Error).message };
      }
    }));

  const successful = results.filter((r): r is ReminderResultSuccess => r.success);
  const failed = results.filter((r): r is ReminderResultFail => !r.success);

    return NextResponse.json({
      message: `Sent ${successful.length} reminder(s) successfully`,
      sent: successful.length,
      failed: failed.length,
      details: {
        successful: successful.map(r => r.email),
  failed: failed.map(r => ({ email: r.email, error: r.error })),
      },
      targetAudience,
      reminderType,
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}

// GET /api/events/[id]/reminders - Get reminder statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const eventId = id;

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
      include: { invites: { select: { id: true, guestName: true, email: true, rsvpStatus: true, createdAt: true } } },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const stats = {
      totalInvites: event.invites.length,
      pending: event.invites.filter(i => i.rsvpStatus === 'pending').length,
      attending: event.invites.filter(i => i.rsvpStatus === 'attending').length,
      notAttending: event.invites.filter(i => i.rsvpStatus === 'not-attending').length,
    };

    const daysUntilEvent = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      event: { id: event.id, title: event.title, date: event.date, daysUntilEvent },
      stats,
      suggestions: { sendReminder: stats.pending > 0 },
    });
  } catch (error) {
    console.error('Error fetching reminder stats:', error);
    return NextResponse.json({ error: 'Failed to fetch reminder stats' }, { status: 500 });
  }
}
