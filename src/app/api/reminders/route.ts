import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEventEmail } from '@/lib/send-event-email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, inviteIds, reminderType, customMessage } = await request.json();

    // Validate event ownership
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: session.user.id,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get invites (guests)
    const invites = await prisma.invite.findMany({
      where: {
        id: { in: inviteIds },
        eventId: eventId,
      },
      include: {
        event: true,
      },
    });

    if (invites.length === 0) {
      return NextResponse.json({ error: 'No valid guests found' }, { status: 400 });
    }

    const results = [];

    for (const invite of invites) {
      try {
        // Determine reminder message based on type
        let reminderMessage = '';
        let emailSubject = '';

        switch (reminderType) {
          case 'general':
            emailSubject = `Reminder: ${event.title}`;
            reminderMessage = `This is a friendly reminder about ${event.title}. We look forward to celebrating with you!`;
            break;
          case 'rsvp':
            emailSubject = `RSVP Reminder: ${event.title}`;
            reminderMessage = `We haven't received your RSVP yet for ${event.title}. Please let us know if you'll be joining us!`;
            break;
          case 'deadline':
            emailSubject = `RSVP Deadline Approaching: ${event.title}`;
            reminderMessage = `The RSVP deadline for ${event.title} is approaching. Please respond by the deadline to help us with planning.`;
            break;
          case 'final':
            emailSubject = `Final Reminder: ${event.title}`;
            reminderMessage = `This is our final reminder about ${event.title}. We're excited to celebrate with you soon!`;
            break;
          default:
            emailSubject = `Reminder: ${event.title}`;
            reminderMessage = customMessage || `This is a reminder about ${event.title}. We look forward to seeing you there!`;
        }

        // Use custom message if provided
        if (customMessage) {
          reminderMessage = customMessage;
        }

        if (!invite.email) {
          results.push({
            inviteId: invite.id,
            guestName: invite.guestName,
            email: invite.email,
            status: 'failed',
            reminderType,
            error: 'Guest has no email address on file',
          });
          continue;
        }

        // Send reminder email
        await sendEventEmail({
          type: 'reminder',
          to: invite.email,
          subject: emailSubject,
          baseUrl: process.env.NEXT_PUBLIC_APP_URL as string,
          data: {
            guestName: invite.guestName,
            eventTitle: invite.event.title,
            eventDate: new Date(invite.event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            eventLocation: invite.event.location,
          },
        });

        // Create reminder record
        await prisma.reminder.create({
          data: {
            inviteId: invite.id,
            eventId: eventId,
            type: reminderType,
            message: reminderMessage,
            sentAt: new Date(),
            status: 'sent',
          },
        });

        results.push({
          inviteId: invite.id,
          guestName: invite.guestName,
          email: invite.email,
          status: 'sent',
          reminderType,
        });
      } catch (error) {
        console.error(`Failed to send reminder to ${invite.email}:`, error);
        results.push({
          inviteId: invite.id,
          guestName: invite.guestName,
          email: invite.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failCount = results.filter(r => r.status === 'failed').length;

    return NextResponse.json({
      message: `Reminders processed: ${successCount} sent, ${failCount} failed`,
      results,
      summary: {
        total: results.length,
        sent: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

  const whereClause: { eventId?: string | { in: string[] } } = {};

    if (eventId) {
      // Verify event ownership
      const event = await prisma.event.findFirst({
        where: {
          id: eventId,
          userId: session.user.id,
        },
      });

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      whereClause.eventId = eventId;
    } else {
      // Get all events for the user
      const userEvents = await prisma.event.findMany({
        where: { userId: session.user.id },
        select: { id: true },
      });

      whereClause.eventId = {
        in: userEvents.map(e => e.id),
      };
    }

    const [reminders, total] = await Promise.all([
      prisma.reminder.findMany({
        where: whereClause,
        include: {
          invite: {
            select: {
              id: true,
              guestName: true,
              email: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              date: true,
            },
          },
        },
        orderBy: {
          sentAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reminder.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      reminders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}
