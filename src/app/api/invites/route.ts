import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateQRCode } from '@/lib/qr-code';
import { sendEventEmail } from '@/lib/send-event-email';

// GET /api/invites - Get all invites for user's events
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: {
      event: { userId: string };
      eventId?: string;
      rsvpStatus?: string;
    } = {
      event: {
        userId: session.user.id,
      },
    };

    if (eventId) {
      whereClause.eventId = eventId;
    }

    if (status) {
      whereClause.rsvpStatus = status;
    }

    // Get total count
    const total = await prisma.invite.count({ where: whereClause });

    // Get invites with pagination
    const invites = await prisma.invite.findMany({
      where: whereClause,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { guestName: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate statistics
    const stats = await prisma.invite.groupBy({
      by: ['rsvpStatus'],
      where: whereClause,
      _count: {
        rsvpStatus: true,
      },
    });

    const statistics = {
      total,
      attending: stats.find(s => s.rsvpStatus === 'attending')?._count.rsvpStatus || 0,
      notAttending: stats.find(s => s.rsvpStatus === 'not-attending')?._count.rsvpStatus || 0,
      pending: stats.find(s => s.rsvpStatus === 'pending')?._count.rsvpStatus || 0,
    };

    return NextResponse.json({
      invites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statistics,
    });
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invites' },
      { status: 500 }
    );
  }
}

// POST /api/invites - Create new invites
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, guests, sendEmail = false } = await request.json();

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

    // Create invites
    const createdInvites = [];
    const errors = [];

    for (const guest of guests) {
      try {
        // Check if guest already exists for this event
        const existingInvite = await prisma.invite.findFirst({
          where: {
            eventId,
            email: guest.email,
          },
        });

        if (existingInvite) {
          errors.push({
            email: guest.email,
            error: 'Guest already invited to this event',
          });
          continue;
        }

        // Generate unique QR code
        const qrCode = await generateQRCode(`${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

        const invite = await prisma.invite.create({
          data: {
            eventId,
            guestName: guest.name,
            email: guest.email,
            // phone field removed (not in schema)
            guestCount: guest.guestCount || 1,
            qrCode,
            rsvpStatus: 'pending',
          },
          include: { event: true },
        });

        createdInvites.push(invite);

        // Send email if requested
        if (sendEmail) {
          if (!invite.email) {
            errors.push({ email: '(missing)', error: 'Invite has no email, cannot send' });
          } else {
            const rsvpLink = `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${invite.id}`; // Use invite id for link
            await sendEventEmail({
              type: 'invitation',
              to: invite.email, // safe: guarded above
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
                rsvpLink,
                rsvpDate: new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error creating invite for ${guest.email}:`, error);
        errors.push({
          email: guest.email,
          error: 'Failed to create invite',
        });
      }
    }

    return NextResponse.json({
      message: `Created ${createdInvites.length} invites successfully`,
      invites: createdInvites,
      errors: errors.length > 0 ? errors : undefined,
      statistics: {
        created: createdInvites.length,
        failed: errors.length,
        total: guests.length,
      },
    });
  } catch (error) {
    console.error('Error creating invites:', error);
    return NextResponse.json(
      { error: 'Failed to create invites' },
      { status: 500 }
    );
  }
}

// DELETE /api/invites - Bulk delete invites
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inviteIds } = await request.json();

    if (!Array.isArray(inviteIds) || inviteIds.length === 0) {
      return NextResponse.json({ error: 'Invalid invite IDs' }, { status: 400 });
    }

    // Verify all invites belong to user's events
    const invites = await prisma.invite.findMany({
      where: {
        id: { in: inviteIds },
        event: {
          userId: session.user.id,
        },
      },
    });

    if (invites.length !== inviteIds.length) {
      return NextResponse.json({ error: 'Some invites not found or unauthorized' }, { status: 403 });
    }

    // Delete invites
    const result = await prisma.invite.deleteMany({
      where: {
        id: { in: inviteIds },
      },
    });

    return NextResponse.json({
      message: `Deleted ${result.count} invites successfully`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Error deleting invites:', error);
    return NextResponse.json(
      { error: 'Failed to delete invites' },
      { status: 500 }
    );
  }
}
