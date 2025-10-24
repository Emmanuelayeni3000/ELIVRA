import { format } from 'date-fns';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { CalendarDays, Clock, MapPin, User } from 'lucide-react';

const companionInclude = {
  invite: {
    include: {
      event: true,
    },
  },
} as const;

interface CompanionInvitePayload {
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
}

export const dynamic = 'force-dynamic';

export default async function CompanionInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
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

  if (!companionInvite) {
    notFound();
  }

  const event = companionInvite.invite.event;
  const formattedDate = format(new Date(event.date), 'EEEE, MMMM do, yyyy');

  return (
    <div className="min-h-screen bg-pearl-beige/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl wedding-elevated-card shadow-stats-card">
        <CardHeader className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gold-foil font-medium">Special Guest Invitation</p>
          <CardTitle className="text-4xl font-bold text-royal-navy font-playfair-display">
            {event.title}
          </CardTitle>
          <p className="text-base text-slate-gray font-inter">
            You&apos;ve been invited to celebrate alongside {companionInvite.invite.guestName}.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 font-inter text-royal-navy">
            <div className="flex items-start gap-3">
              <CalendarDays className="h-6 w-6" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-gray/70">Date</p>
                <p className="text-base font-semibold">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-gray/70">Time</p>
                <p className="text-base font-semibold">{event.time || 'To be announced'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-gray/70">Location</p>
                <p className="text-base font-semibold">{event.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-6 w-6" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-gray/70">Primary Guest</p>
                <p className="text-base font-semibold">{companionInvite.invite.guestName}</p>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="p-6 rounded-xl bg-pearl-beige/60 border border-gold-sand/30 text-left">
              <h3 className="text-royal-navy font-semibold font-inter mb-2">Event Notes</h3>
              <p className="text-slate-gray text-sm leading-relaxed">{event.description}</p>
            </div>
          )}

          <div className="border-t border-royal-navy/10 pt-6 text-center text-sm text-slate-gray font-inter">
            <p>
              Coordinate any questions with {companionInvite.invite.guestName}. We can&apos;t wait to celebrate with you!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
