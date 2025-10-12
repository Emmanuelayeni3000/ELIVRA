import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get total events count
    const totalEvents = await prisma.event.count({
      where: { userId: user.id },
    });

    // Get total invites and RSVP statistics
    const invites = await prisma.invite.findMany({
      where: {
        event: {
          userId: user.id,
        },
      },
      select: {
        rsvpStatus: true,
        guestCount: true,
      },
    });

    const totalInvites = invites.length;
    const totalGuests = invites.reduce((acc, invite) => acc + (invite.guestCount || 1), 0);
    
    const rsvpStats = invites.reduce(
      (acc, invite) => {
        if (!invite.rsvpStatus || invite.rsvpStatus === 'pending') {
          acc.pending += invite.guestCount || 1;
        } else if (invite.rsvpStatus === 'accepted') {
          acc.accepted += invite.guestCount || 1;
        } else if (invite.rsvpStatus === 'declined') {
          acc.declined += invite.guestCount || 1;
        }
        return acc;
      },
      { pending: 0, accepted: 0, declined: 0 }
    );

    const totalResponses = rsvpStats.accepted + rsvpStats.declined;
    const responseRate = totalGuests > 0 ? Math.round((totalResponses / totalGuests) * 100) : 0;

    // Get recent notifications (recent RSVPs, reminders sent)
    const recentRSVPs = await prisma.invite.findMany({
      where: {
        event: {
          userId: user.id,
        },
        rsvpAt: {
          not: null,
        },
      },
      orderBy: {
        rsvpAt: 'desc',
      },
      take: 5,
      select: {
        guestName: true,
        rsvpStatus: true,
        rsvpAt: true,
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    // Get recent reminders sent
    const recentReminders = await prisma.reminder.findMany({
      where: {
        event: {
          userId: user.id,
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: 3,
      select: {
        type: true,
        sentAt: true,
        invite: {
          select: {
            guestName: true,
          },
        },
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalEvents,
        totalInvites,
        totalGuests,
        rsvpStats,
        responseRate,
      },
      notifications: {
        recentRSVPs,
        recentReminders,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}