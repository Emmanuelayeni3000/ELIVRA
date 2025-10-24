import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { sendEventEmail } from '@/lib/send-event-email';

const inviteInclude = {
  event: true,
  companionInvites: true,
} as const;

interface InviteWithRelations {
  id: string;
  guestName: string;
  email: string | null;
  qrCode: string;
  guestLimit: number | null;
  guestCount: number | null;
  rsvpStatus: string | null;
  message: string | null;
  eventId: string;
  event: {
    id: string;
    title: string;
    date: Date;
    location: string;
    description: string | null;
    guestLimit: number | null;
    time: string | null;
    userId: string;
  };
  companionInvites: Array<{ id: string; email: string; token: string }>;
}

type CompanionInviteRecord = { id: string; email: string; token: string };

type CompanionDelegate = {
  findMany: (args: unknown) => Promise<CompanionInviteRecord[]>;
  create: (args: unknown) => Promise<CompanionInviteRecord>;
  deleteMany: (args: unknown) => Promise<unknown>;
};

async function findInviteByToken(token: string): Promise<InviteWithRelations | null> {
  let invite = await prisma.invite.findUnique({
    where: { qrCode: token },
    include: inviteInclude,
  });

  if (!invite) {
    invite = await prisma.invite.findFirst({
      where: {
        qrCode: {
          contains: token,
        },
      },
      include: inviteInclude,
    });
  }

  if (!invite) {
    invite = await prisma.invite.findUnique({
      where: { id: token },
      include: inviteInclude,
    });
  }

  return invite as InviteWithRelations | null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invite = await findInviteByToken(token);

    if (!invite || !invite.event) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 });
    }

    if (invite.event.date < new Date()) {
      return NextResponse.json({ error: 'This event has already passed' }, { status: 400 });
    }

    return NextResponse.json({
      guest: {
        id: invite.id,
        name: invite.guestName,
        email: invite.email,
        rsvpStatus: invite.rsvpStatus,
        invitationToken: invite.qrCode,
        guestLimit: invite.guestLimit ?? invite.event.guestLimit ?? undefined,
        guestCount: invite.guestCount ?? undefined,
        companionEmails: invite.companionInvites.map((companion) => companion.email),
      },
      event: {
        id: invite.event.id,
        title: invite.event.title,
        date: invite.event.date,
        location: invite.event.location,
        description: invite.event.description,
        guestLimit: invite.event.guestLimit,
      },
    });
  } catch (error) {
    console.error('Error fetching RSVP details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { response, bringingGuests, guestCount, guestEmails, message } = body as {
      response: 'attending' | 'not-attending';
      bringingGuests?: 'yes' | 'no';
      guestCount?: number;
      guestEmails?: string[];
      message?: string;
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: 'Application URL is not configured.' }, { status: 500 });
    }

    const invite = await findInviteByToken(token);

    if (!invite || !invite.event) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 });
    }

    if (invite.event.date < new Date()) {
      return NextResponse.json({ error: 'This event has already passed' }, { status: 400 });
    }

    const inviteGuestLimit = invite.guestLimit ?? invite.event.guestLimit ?? 0;
    const maxAllowedGuests = Math.max(0, inviteGuestLimit);
    const bringingGuestsSelected = bringingGuests === 'yes';
    const requestedGuestCount = Math.max(0, guestCount ?? 0);
    const additionalGuests = bringingGuestsSelected ? requestedGuestCount : 0;

    if (response === 'attending') {
      if (bringingGuestsSelected && maxAllowedGuests === 0) {
        return NextResponse.json(
          { error: 'This invitation does not include additional guests.' },
          { status: 400 }
        );
      }

      if (bringingGuestsSelected && additionalGuests === 0) {
        return NextResponse.json(
          { error: 'Please select how many guests you will bring.' },
          { status: 400 }
        );
      }

      if (additionalGuests > maxAllowedGuests) {
        return NextResponse.json(
          {
            error: `You can bring up to ${maxAllowedGuests} guest${maxAllowedGuests === 1 ? '' : 's'}.`,
          },
          { status: 400 }
        );
      }
    }

    const trimmedGuestEmails = bringingGuestsSelected && Array.isArray(guestEmails)
      ? guestEmails
          .map((email) => (typeof email === 'string' ? email.trim() : ''))
          .filter((email) => email.length > 0)
      : [];

    let companionEmailEntries: Array<{ original: string; normalized: string }> = [];

    if (response === 'attending' && bringingGuestsSelected) {
      if (trimmedGuestEmails.length !== additionalGuests) {
        return NextResponse.json(
          { error: `Please provide exactly ${additionalGuests} guest email${additionalGuests === 1 ? '' : 's'}.` },
          { status: 400 }
        );
      }

      const invalidEmails = trimmedGuestEmails.filter(
        (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      );

      if (invalidEmails.length > 0) {
        return NextResponse.json(
          {
            error: `Invalid guest email${invalidEmails.length === 1 ? '' : 's'} supplied: ${invalidEmails.join(', ')}`,
          },
          { status: 400 }
        );
      }

      companionEmailEntries = trimmedGuestEmails.map((email) => ({
        original: email,
        normalized: email.toLowerCase(),
      }));

      const duplicateEmails = companionEmailEntries.filter(
        (entry, index) =>
          companionEmailEntries.findIndex((candidate) => candidate.normalized === entry.normalized) !== index
      );

      if (duplicateEmails.length > 0) {
        return NextResponse.json(
          {
            error: `Duplicate guest email${duplicateEmails.length === 1 ? '' : 's'} supplied: ${duplicateEmails
              .map((entry) => entry.original)
              .join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    const { updatedInvite, companionInvites } = await prisma.$transaction(async (tx) => {
      const companionDelegate = (tx as unknown as { companionInvite: CompanionDelegate }).companionInvite;

      const updated = await tx.invite.update({
        where: { id: invite.id },
        data: {
          rsvpStatus: response,
          guestCount: response === 'attending' ? additionalGuests : 0,
          message: message ?? null,
          rsvpAt: new Date(),
        },
      });

      if (response !== 'attending' || additionalGuests === 0) {
        await companionDelegate.deleteMany({ where: { inviteId: invite.id } });
        return { updatedInvite: updated, companionInvites: [] as Array<{ originalEmail: string; token: string }> };
      }

      const existingCompanions = await companionDelegate.findMany({
        where: { inviteId: invite.id },
      });

      const existingByEmail = new Map(existingCompanions.map((companion) => [companion.email, companion]));
      const emailsToKeep = new Set<string>();
      const inviteRecords: Array<{ originalEmail: string; token: string }> = [];

      for (const entry of companionEmailEntries) {
        const existingCompanion = existingByEmail.get(entry.normalized);

        if (existingCompanion) {
          emailsToKeep.add(existingCompanion.email);
          inviteRecords.push({ originalEmail: entry.original, token: existingCompanion.token });
          continue;
        }

        const createdCompanion = await companionDelegate.create({
          data: {
            inviteId: invite.id,
            email: entry.normalized,
            token: randomUUID(),
          },
        });

        emailsToKeep.add(createdCompanion.email);
        inviteRecords.push({ originalEmail: entry.original, token: createdCompanion.token });
      }

      const companionsToDelete = existingCompanions.filter(
        (companion) => !emailsToKeep.has(companion.email)
      );

      if (companionsToDelete.length > 0) {
        await companionDelegate.deleteMany({
          where: {
            id: {
              in: companionsToDelete.map((companion) => companion.id),
            },
          },
        });
      }

      return { updatedInvite: updated, companionInvites: inviteRecords };
    });

    if (invite.email) {
      await sendEventEmail({
        type: 'rsvp-confirmation',
        to: invite.email,
        subject: `RSVP Confirmation - ${invite.event.title}`,
        baseUrl,
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
          additionalGuests,
        },
      });
    }

    if (response === 'attending' && companionInvites.length > 0) {
      const eventDateFormatted = new Date(invite.event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      await Promise.all(
        companionInvites.map(({ originalEmail, token }) =>
          sendEventEmail({
            type: 'companion-invite',
            to: originalEmail,
            subject: `${invite.guestName} invited you to ${invite.event.title}`,
            baseUrl,
            data: {
              guestName: invite.guestName,
              primaryGuestName: invite.guestName,
              eventTitle: invite.event.title,
              eventDate: eventDateFormatted,
              eventLocation: invite.event.location,
              eventTime: invite.event.time ?? '',
              message: message || '',
              companionInviteLink: `${baseUrl}/invitation/companion/${token}`,
            },
          })
        )
      );
    }

    const eventOwner = await prisma.user.findUnique({
      where: { id: invite.event.userId },
    });

    if (eventOwner?.email) {
      await sendEventEmail({
        type: 'rsvp-notification',
        to: eventOwner.email,
        subject: `New RSVP Response - ${invite.event.title}`,
        baseUrl,
        data: {
          guestName: invite.guestName,
          eventTitle: invite.event.title,
          response,
          guestCount: response === 'attending' ? 1 + additionalGuests : 0,
          message: message ?? '',
        },
      });
    }

    return NextResponse.json({
      message: 'RSVP submitted successfully',
      guest: updatedInvite,
    });
  } catch (error) {
    console.error('Error processing RSVP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}