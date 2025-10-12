import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Schema for updating an event
const updateEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').optional(),
  type: z.enum(['wedding', 'reception', 'shower', 'rehearsal', 'other']).optional(),
  date: z.string().min(1, 'Event date is required').optional(),
  time: z.string().optional(),
  location: z.string().min(1, 'Event location is required').optional(),
  description: z.string().optional(),
  hashtag: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Ownership check: don't leak existence of events the user doesn't own
    if (event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error: unknown) {
    console.error('Fetch single event error:', error);
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
    const validatedData = updateEventSchema.parse(body);
    // Use updateMany to enforce ownership in the where clause (id is the unique key)
    const result = await prisma.event.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.type && { type: validatedData.type }),
        ...(validatedData.date && { date: new Date(validatedData.date) }),
        ...(validatedData.time && { time: validatedData.time }),
        ...(validatedData.location && { location: validatedData.location }),
        ...(validatedData.description && { description: validatedData.description }),
        ...(validatedData.hashtag !== undefined && { hashtag: validatedData.hashtag || null }),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updatedEvent = await prisma.event.findUnique({ where: { id } });

    return NextResponse.json({ message: 'Event updated successfully', event: updatedEvent }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Update event error:', error);
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
    const result = await prisma.event.deleteMany({ where: { id, userId: session.user.id } });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}