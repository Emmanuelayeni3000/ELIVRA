import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';

// Define a schema for input validation
const addGuestSchema = z.object({
  name: z.string().min(1, 'Guest name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { // Changed eventId to id
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // Changed eventId to id
    const body = await request.json();
    const { name, email, phone } = addGuestSchema.parse(body);

    // Verify that the event belongs to the logged-in user
    const event = await prisma.event.findUnique({
      where: {
        id: id, // Changed eventId to id
        userId: session.user.id,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    const newGuest = await prisma.invite.create({ // Using Invite model for guests
      data: {
        guestName: name,
        email: email || null, // Store null if email is empty string
        phone: phone || null, // Store null if phone is empty string
        eventId: id, // Changed eventId to id
        qrCode: 'temp-qr-code-' + Math.random().toString(36).substring(7), // Placeholder QR code
        rsvpStatus: 'pending',
      },
    });

    return NextResponse.json({ message: 'Guest added successfully', guest: newGuest }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Add guest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}