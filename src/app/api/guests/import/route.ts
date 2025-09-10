import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateQRCodeDataURL } from '@/lib/qr-code';

// Define a schema for a single guest row in CSV
const guestCsvSchema = z.object({
  name: z.string().min(1, 'Guest name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const eventId = formData.get('eventId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No CSV file uploaded' }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Verify the event exists and belongs to the user
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: session.user.id,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Parse CSV file
    const csvText = await file.text();
    const lines = csvText.split('\n');
    if (lines.length === 0 || !lines[0]) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }
    const headersLine = lines[0];
    const headers = headersLine.split(',').map(h => h.trim().toLowerCase());

    // Find the column indices
    const nameIndex = headers.findIndex(h => h.includes('name'));
    const emailIndex = headers.findIndex(h => h.includes('email'));
    const phoneIndex = headers.findIndex(h => h.includes('phone'));

    if (nameIndex === -1) {
      return NextResponse.json({ 
        error: 'CSV must contain a name column' 
      }, { status: 400 });
    }

    const guestsToCreate = [];
    const errors: Array<{ row: number; details: string | z.ZodIssue[] }> = [];

    // Process each row (skip header)
    for (let i = 1; i < lines.length; i++) {
  const current = lines[i];
  if (current === undefined) continue;
  const line = current.trim();
      if (!line) continue; // Skip empty lines

      const row = line.split(',').map(cell => cell.trim());
      
      try {
        const guestData = {
          name: row[nameIndex] || '',
          email: emailIndex !== -1 ? row[emailIndex] || '' : '',
          phone: phoneIndex !== -1 ? row[phoneIndex] || '' : '',
        };

        // Validate guest data
        const validatedGuest = guestCsvSchema.parse(guestData);

        // Generate QR code for the invite
        const qrCode = await generateQRCodeDataURL(`${process.env.NEXTAUTH_URL}/rsvp/invite-${eventId}-${i}`);

        guestsToCreate.push({
          guestName: validatedGuest.name,
          email: validatedGuest.email || null,
          phone: validatedGuest.phone || null,
          eventId: eventId,
          qrCode: qrCode,
          rsvpStatus: 'PENDING',
        });
      } catch (validationError: unknown) {
        if (validationError instanceof z.ZodError) {
          errors.push({ row: i + 1, details: validationError.issues });
        } else {
          errors.push({ row: i + 1, details: 'Unknown validation error' });
        }
      }
    }

    if (guestsToCreate.length === 0) {
      return NextResponse.json({ 
        error: 'No valid guests to import', 
        details: errors 
      }, { status: 400 });
    }

    // Bulk create guests
    const result = await prisma.invite.createMany({
      data: guestsToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json({ 
      message: `Successfully imported ${result.count} guests`,
      importedCount: result.count,
      errors: errors.length > 0 ? errors : undefined
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Import guests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
