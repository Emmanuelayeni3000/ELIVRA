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
  capacity: z.number().optional(),
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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: 'Account not found. Please sign in again.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const take = Number.isFinite(limit) && limit && limit > 0 ? limit : undefined;

    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: 'desc',
      },
      ...(take && { take }),
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error: unknown) {
    console.error('Fetch events error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: 'Account not found. Please sign in again.' }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, customType, date, time, location, description, hashtag, capacity, dressCode } = createEventSchema.parse(body);

    // Get the first available template
    let defaultTemplate = await prisma.template.findFirst({
      where: { slug: 'classic' }
    });

    if (!defaultTemplate) {
      defaultTemplate = await prisma.template.create({
        data: {
          name: 'Classic Elegance',
          slug: 'classic',
          description: 'Timeless design with serif fonts and traditional layout',
          isPremium: false,
          styleConfig: {
            colors: {
              primary: '#1D3557',
              secondary: '#C9A368',
              background: '#FFFFFF',
              text: '#444444',
            },
            fonts: {
              heading: 'Playfair Display',
              body: 'Inter',
            },
            layout: 'centered',
          },
        },
      });
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
        guestLimit: capacity || null,
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
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}