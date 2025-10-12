import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Schema for updating a guest
const updateGuestSchema = z.object({
  guestName: z.string().min(1, 'Guest name is required').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  rsvpStatus: z.enum(['PENDING', 'CONFIRMED', 'DECLINED']).optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
  const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const guest = await prisma.invite.findUnique({ // Using Invite model for guests
      where: {
        id,
        event: { // Ensure user owns the event associated with the guest
          userId: session.user.id,
        },
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ guest }, { status: 200 });
  } catch (error: unknown) {
    console.error('Fetch single guest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
  const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateGuestSchema.parse(body);

  const updatedGuest = await prisma.invite.update({
      where: {
        id,
        event: {
          userId: session.user.id,
        },
      },
      data: {
        ...(validatedData.guestName !== undefined && { guestName: validatedData.guestName }),
        ...(validatedData.email !== undefined && { email: validatedData.email === '' ? null : validatedData.email }),
        ...(validatedData.rsvpStatus !== undefined && { rsvpStatus: validatedData.rsvpStatus }),
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ message: 'Guest updated successfully', guest: updatedGuest }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Update guest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
  const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateGuestSchema.parse(body);

  const updatedGuest = await prisma.invite.update({ // Using Invite model for guests
      where: {
        id,
        event: { // Ensure user owns the event associated with the guest
          userId: session.user.id,
        },
      },
      data: {
        ...(validatedData.guestName !== undefined && { guestName: validatedData.guestName }),
        ...(validatedData.email !== undefined && { email: validatedData.email === '' ? null : validatedData.email }),
        ...(validatedData.rsvpStatus !== undefined && { rsvpStatus: validatedData.rsvpStatus }),
      },
    });

    return NextResponse.json({ message: 'Guest updated successfully', guest: updatedGuest }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Update guest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
  const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.invite.delete({ // Using Invite model for guests
      where: {
        id,
        event: { // Ensure user owns the event associated with the guest
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ message: 'Guest deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Delete guest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}