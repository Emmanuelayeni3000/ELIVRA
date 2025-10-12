import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth'; // Import getServerSession
import { authOptions } from '@/lib/auth';

// Define a schema for input validation
const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  type: z.enum(['wedding', 'reception', 'shower', 'rehearsal', 'other']).default('wedding'),
  customType: z.string().optional(),
  date: z.string().min(1, 'Event date is required'),
  time: z.string().optional(),
  location: z.string().min(1, 'Event location is required'),
  description: z.string().optional(),
  hashtag: z.string().optional(),
  guestLimit: z.number().optional(),
  dressCode: z.string().optional(),
}).refine((data) => {
  if (data.type === 'other' && (!data.customType || data.customType.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Custom event type is required when "Other" is selected',
  path: ['customType'],
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
    const { title, type, customType, date, time, location, description, hashtag, guestLimit, dressCode } = createEventSchema.parse(body);

    // Get the first available template
    const defaultTemplate = await prisma.template.findFirst({
      where: { slug: 'classic' }
    });

    if (!defaultTemplate) {
      return NextResponse.json({ error: 'No template available' }, { status: 500 });
    }

    // Use customType if type is 'other', otherwise use the selected type
    const eventType = type === 'other' ? customType || 'other' : type;

    const newEvent = await prisma.event.create({
      data: {
        title,
        type: eventType,
        date: new Date(date),
        time: time || null,
        location,
        description: description || null,
        hashtag: hashtag || null,
        guestLimit: guestLimit || null,
        dressCode: dressCode || null,
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