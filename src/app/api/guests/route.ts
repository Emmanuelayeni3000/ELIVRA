import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { generateQRCodeDataURL } from '@/lib/qr-code';

const createGuestSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  guestName: z.string().min(1, 'Guest name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
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
      include: { event: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Normalize rsvpStatus to uppercase variants expected by UI
    guests = guests.map(g => ({
      ...g,
      rsvpStatus: g.rsvpStatus
        ? g.rsvpStatus.toUpperCase().replace('ACCEPTED', 'CONFIRMED')
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
    const { eventId, guestName, email, phone } = createGuestSchema.parse(body);

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

    // Generate QR code
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteId}`;
    const qrCode = await generateQRCodeDataURL(inviteLink);

  const newGuest = await prisma.invite.create({
      data: {
        id: inviteId,
        guestName,
        email: email || null,
        phone: phone || null,
        qrCode,
        eventId,
    rsvpStatus: 'PENDING',
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ message: 'Guest added successfully', guest: newGuest }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Create guest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}