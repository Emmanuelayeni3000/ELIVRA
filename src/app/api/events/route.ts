import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth'; // Import getServerSession
import { authOptions } from '@/lib/auth';

// Define a schema for input validation
const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  date: z.string().min(1, 'Event date is required'),
  time: z.string().optional(),
  location: z.string().min(1, 'Event location is required'),
  description: z.string().optional(),
});

export async function GET() {
  try {
  const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error: unknown) {
    console.error('Fetch events error:', error);
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
    const { title, date, time, location, description } = createEventSchema.parse(body);

    // Get the first available template
    const defaultTemplate = await prisma.template.findFirst({
      where: { slug: 'classic' }
    });

    if (!defaultTemplate) {
      return NextResponse.json({ error: 'No template available' }, { status: 500 });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        time: time || null,
        location,
        description: description || null,
        userId: session.user.id,
        templateId: defaultTemplate.id,
      },
    });

    return NextResponse.json({ message: 'Event created successfully', event: newEvent }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}