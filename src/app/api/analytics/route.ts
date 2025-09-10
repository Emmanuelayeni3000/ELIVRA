import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface EventBreakdown {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  totalInvites: number;
  attending: number;
  notAttending: number;
  pending: number;
  guestCount: number;
  rsvpRate: number;
}

interface TrendData {
    date: string;
    attending: number;
    notAttending: number;
    total: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const timeframe = searchParams.get('timeframe') || '30'; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Base where clause for user's events
    const baseWhere = {
      userId: session.user.id,
      ...(eventId && { id: eventId }),
    };

    // Get event statistics
    const eventStats = await prisma.event.findMany({
      where: baseWhere,
      include: {
        _count: {
          select: {
            invites: true,
          },
        },
        invites: {
          select: {
            rsvpStatus: true,
            guestCount: true,
            rsvpAt: true,
            createdAt: true,
          },
        },
      },
    });

    // Calculate overall statistics
    const totalEvents = eventStats.length;
    let totalInvites = 0;
    let totalAttending = 0;
    let totalNotAttending = 0;
    let totalPending = 0;
    let totalGuests = 0;
    let rsvpRate = 0;

    const eventBreakdown: EventBreakdown[] = [];

    eventStats.forEach(event => {
      const eventInvites = event.invites.length;
      const attending = event.invites.filter(i => i.rsvpStatus === 'attending').length;
      const notAttending = event.invites.filter(i => i.rsvpStatus === 'not-attending').length;
      const pending = event.invites.filter(i => i.rsvpStatus === 'pending').length;
      const guestCount = event.invites
        .filter(i => i.rsvpStatus === 'attending')
        .reduce((sum, i) => sum + (i.guestCount || 1), 0);

      totalInvites += eventInvites;
      totalAttending += attending;
      totalNotAttending += notAttending;
      totalPending += pending;
      totalGuests += guestCount;

      eventBreakdown.push({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        totalInvites: eventInvites,
        attending,
        notAttending,
        pending,
        guestCount,
        rsvpRate: eventInvites > 0 ? ((attending + notAttending) / eventInvites * 100) : 0,
      });
    });

    // Calculate overall RSVP rate
    rsvpRate = totalInvites > 0 ? ((totalAttending + totalNotAttending) / totalInvites * 100) : 0;

    // Get RSVP trend data (last 30 days)
    const trendData: TrendData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0] || '';

      const dailyRSVPs = eventStats.flatMap(event => event.invites).filter(invite => {
        if (!invite.rsvpAt) return false;
        const rsvpDate = new Date(invite.rsvpAt).toISOString().split('T')[0];
        return rsvpDate === dateStr;
      });

      trendData.push({
        date: dateStr,
        attending: dailyRSVPs.filter(r => r.rsvpStatus === 'attending').length,
        notAttending: dailyRSVPs.filter(r => r.rsvpStatus === 'not-attending').length,
        total: dailyRSVPs.length,
      });
    }

    // Get recent activity
    const recentActivity = await prisma.invite.findMany({
      where: {
        event: {
          userId: session.user.id,
        },
        rsvpAt: {
          gte: startDate,
        },
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        rsvpAt: 'desc',
      },
      take: 10,
    });

    // Get upcoming events
    const upcomingEvents = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(),
        },
      },
      include: {
        _count: {
          select: {
            invites: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 5,
    });

    // Response rate by event type
    // const eventTypeStats = await prisma.event.groupBy({
    //   by: ['type'],
    //   where: {
    //     userId: session.user.id,
    //   },
    //   _count: {
    //     id: true,
    //   },
    // });

    return NextResponse.json({
      overview: {
        totalEvents,
        totalInvites,
        totalAttending,
        totalNotAttending,
        totalPending,
        totalGuests,
        rsvpRate: Math.round(rsvpRate * 100) / 100,
        responseRate: totalInvites > 0 ? Math.round(((totalAttending + totalNotAttending) / totalInvites) * 10000) / 100 : 0,
      },
      trends: {
        rsvpTrend: trendData,
        eventBreakdown,
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        guestName: activity.guestName,
        eventTitle: activity.event.title,
        rsvpStatus: activity.rsvpStatus,
        rsvpAt: activity.rsvpAt,
        guestCount: activity.guestCount,
      })),
      upcomingEvents: upcomingEvents.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location,
        inviteCount: event._count.invites,
      })),
      // eventTypes: eventTypeStats.map(stat => ({
      //   type: stat.type,
      //   count: stat._count.id,
      // })),
      timeframe: parseInt(timeframe),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}