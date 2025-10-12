import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createGuestSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  guestName: z.string().min(1, 'Guest name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  guestLimit: z.number().min(1).max(10).default(1),
});

export async function GET() {
  try {
  const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // First fetch the user's events IDs to avoid relation filter issues
    const userEvents = await prisma.event.findMany({
      where: { userId },
      select: { id: true },
    });

    if (userEvents.length === 0) {
      return NextResponse.json({ guests: [] }, { status: 200 });
    }

    const eventIds = userEvents.map(e => e.id);

    let guests = await prisma.invite.findMany({
      where: { eventId: { in: eventIds } },
      select: {
        id: true,
        guestName: true,
        email: true,
        qrCode: true,
        message: true,
        sentAt: true,
        viewedAt: true,
        rsvpAt: true,
        rsvpStatus: true,
        guestCount: true,
        createdAt: true,
        updatedAt: true,
        eventId: true,
        event: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Normalize rsvpStatus to uppercase variants expected by UI
    guests = guests.map(g => ({
      ...g,
      rsvpStatus: g.rsvpStatus
        ? g.rsvpStatus.toLowerCase() === 'attending' 
          ? 'CONFIRMED'
          : g.rsvpStatus.toLowerCase() === 'not-attending' 
          ? 'DECLINED'
          : g.rsvpStatus.toUpperCase().replace('ACCEPTED', 'CONFIRMED')
        : 'PENDING',
    }));

    return NextResponse.json({ guests }, { status: 200 });
  } catch (error: unknown) {
    console.error('[GET /api/guests] Internal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, guestName, email, guestLimit } = createGuestSchema.parse(body);

    // Verify that the event belongs to the current user
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: session.user.id,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    // Generate unique invite ID for QR code
    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Store token for smart routing; use RSVP link when sending communications
    const rsvpToken = inviteId;

  const newGuest = await prisma.invite.create({
      data: {
        id: inviteId,
        guestName,
        email: email || null,
        qrCode: rsvpToken,
        eventId,
        guestLimit, // Add guest limit
        rsvpStatus: 'pending',
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Guest added successfully',
      guest: newGuest,
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Create guest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}