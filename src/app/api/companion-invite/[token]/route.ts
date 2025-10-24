import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

const companionInclude = {
  invite: {
    include: {
      event: true,
    },
  },
} as const;

type CompanionInvitePayload = {
  email: string;
  invite: {
    id: string;
    guestName: string;
    event: {
      id: string;
      title: string;
      date: Date;
      time: string | null;
      location: string;
      description: string | null;
      guestLimit: number | null;
    };
  };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const companionDelegate = (prisma as unknown as {
      companionInvite: {
        findUnique: (args: unknown) => Promise<CompanionInvitePayload | null>;
      };
    }).companionInvite;

    const companionInvite = (await companionDelegate.findUnique({
      where: { token },
      include: companionInclude,
    } as unknown)) as CompanionInvitePayload | null;

    if (!companionInvite || !companionInvite.invite || !companionInvite.invite.event) {
      return NextResponse.json({ error: 'Invalid companion invite link' }, { status: 404 });
    }

    const event = companionInvite.invite.event;

    return NextResponse.json({
      companion: {
        email: companionInvite.email,
      },
      primaryGuest: {
        id: companionInvite.invite.id,
        name: companionInvite.invite.guestName,
      },
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        description: event.description,
        guestLimit: event.guestLimit,
      },
    });
  } catch (error) {
    console.error('Error fetching companion invite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
