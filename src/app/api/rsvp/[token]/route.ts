import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEventEmail } from '@/lib/send-event-email';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invite = await prisma.invite.findUnique({
      where: { qrCode: token },
      include: {
        event: true,
      },
    });

    if (!invite) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid invitation token' }),
        { status: 404 }
      );
    }

    if (invite.event.date < new Date()) {
      return new NextResponse(
        JSON.stringify({ error: 'This event has already passed' }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        guest: { // Keep 'guest' key for API response consistency
          id: invite.id,
          name: invite.guestName,
          email: invite.email,
          rsvpStatus: invite.rsvpStatus,
          invitationToken: invite.qrCode,
        },
        event: {
          id: invite.event.id,
          title: invite.event.title,
          date: invite.event.date,
          location: invite.event.location,
          description: invite.event.description,
        },
      })
    );
  } catch (error) {
    console.error('Error fetching RSVP details:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { response, guestCount, dietaryRequirements, message } = body;

    const invite = await prisma.invite.findUnique({
      where: { qrCode: token },
      include: {
        event: true,
      },
    });

    if (!invite) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid invitation token' }),
        { status: 404 }
      );
    }

    if (invite.event.date < new Date()) {
      return new NextResponse(
        JSON.stringify({ error: 'This event has already passed' }),
        { status: 400 }
      );
    }

    const updatedInvite = await prisma.invite.update({
      where: { id: invite.id },
      data: {
        rsvpStatus: response,
        guestCount: guestCount || 1,
        dietaryRequirements,
        message: message, // Use message from body for rsvpMessage
        rsvpAt: new Date(),
      },
    });

    // Send confirmation email to guest
    await sendEventEmail({
      type: 'rsvp-confirmation',
      to: invite.email,
      subject: `RSVP Confirmation - ${invite.event.title}`,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL as string, // Add baseUrl
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
        response,
        additionalGuests: guestCount,
        dietaryRequirements,
      },
    });

    // Notify event owner
    const eventOwner = await prisma.user.findUnique({
      where: { id: invite.event.userId },
    });

    if (eventOwner?.email) {
      await sendEventEmail({
        type: 'rsvp-notification',
        to: eventOwner.email,
        subject: `New RSVP Response - ${invite.event.title}`,
        baseUrl: process.env.NEXT_PUBLIC_APP_URL as string, // Add baseUrl
        data: {
          guestName: invite.guestName,
          eventTitle: invite.event.title,
          response,
          guestCount,
          message,
        },
      });
    }

    return new NextResponse(
      JSON.stringify({
        message: 'RSVP submitted successfully',
        guest: updatedInvite, // Keep 'guest' key for API response consistency
      })
    );
  } catch (error) {
    console.error('Error processing RSVP:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}