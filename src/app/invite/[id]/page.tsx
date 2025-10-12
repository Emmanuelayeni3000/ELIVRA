import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { generateQRCodeDataURL } from '@/lib/qr-code';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import DownloadInviteCard from '@/components/download-invite-card';

interface InvitePageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic'; // Disable caching for this page

export default async function InvitePage({ params }: InvitePageProps) {
  const { id } = await params;

  const invite = await prisma.invite.findUnique({
    where: { id },
    include: {
      event: true,
    },
  });

  if (!invite || !invite.event) {
    notFound();
  }

  const normalizedStatus = invite.rsvpStatus?.toLowerCase();
  const rsvpToken = invite.qrCode?.includes('/')
    ? invite.qrCode.split('/').filter(Boolean).pop()
    : invite.qrCode;
  const effectiveToken = rsvpToken ?? invite.id;

  // Enforce RSVP-first flow: if guest hasn't responded, send them to the RSVP form
  if (!normalizedStatus || normalizedStatus === 'pending') {
    redirect(`/rsvp/${effectiveToken}`);
  }

  // Generate QR code data URL for display on the page - use smart invitation link
  const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${effectiveToken}`;
  const qrCodeDataURL = await generateQRCodeDataURL(invitationLink, 256); // Larger QR code for display

  return (
    <div className="min-h-screen section-frame py-12 animate-fade-up-soft flex items-center justify-center">
      <Card id="invitation-card" className="w-full max-w-3xl mx-auto wedding-elevated-card px-4 md:px-8 py-10 text-center space-y-8">
        <CardContent className="space-y-8 p-0">
          <div>
            <div className="accent-bar-gold mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-royal-navy font-playfair-display leading-tight tracking-tight">
                Dear {invite.guestName}!
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-slate-gray font-inter leading-relaxed">
              You&apos;re invited to {invite.event.type === 'wedding' ? 'the wedding celebration of' : `our ${invite.event.type}`}
            </p>
            <h2 className="text-5xl md:text-6xl font-bold text-gold-foil font-great-vibes leading-tight tracking-tight mt-4">
              {invite.event.title}
            </h2>
            {invite.event.hashtag && (
              <div className="mt-4">
                <span className="inline-block bg-gold-foil/10 text-gold-foil px-4 py-2 rounded-full text-lg font-medium border border-gold-foil/20">
                  #{invite.event.hashtag}
                </span>
              </div>
            )}
            {invite.message && (
              <p className="text-md text-slate-gray mt-6 italic font-inter max-w-xl mx-auto">&ldquo;{invite.message}&rdquo;</p>
            )}
          </div>

          <div className={`grid gap-6 md:gap-8 ${invite.event.dressCode ? 'md:grid-cols-2' : 'md:grid-cols-3'} font-inter text-slate-gray text-left`}>
            <div className="flex items-start gap-3">
              <CalendarDays className="h-6 w-6 text-royal-navy" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-gray/70 mb-1">Date</p>
                <p className="text-base font-medium text-royal-navy">{format(new Date(invite.event.date), 'PPP')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6 text-royal-navy" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-gray/70 mb-1">Location</p>
                <p className="text-base font-medium text-royal-navy">{invite.event.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 text-royal-navy" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-gray/70 mb-1">Time</p>
                <p className="text-base font-medium text-royal-navy">{invite.event.time || 'TBA'}</p>
              </div>
            </div>
            {invite.event.dressCode && (
              <div className="flex items-start gap-3">
                <span className="text-gold-foil text-xl">🎨</span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-gray/70 mb-1">Dress Code Colour</p>
                  <p className="text-base font-medium text-royal-navy">{invite.event.dressCode}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center space-y-5">
            <div className="relative">
              <Image
                src={qrCodeDataURL}
                alt="Invitation QR Code"
                width={256}
                height={256}
                className="border border-royal-navy/30 rounded-lg shadow-lg bg-white/70 backdrop-blur-sm"
              />
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-gold-sand/40 pointer-events-none" />
            </div>
            <p className="text-sm text-slate-gray font-inter">Scan this code for quick access to your invitation.</p>
            <div className="flex flex-wrap gap-3 justify-center download-exclude">
              <DownloadInviteCard 
                cardElementId="invitation-card" 
                inviteTitle={invite.event.title} 
              />
              {(!normalizedStatus || normalizedStatus === 'pending') && (
                <Link href={`/rsvp/${effectiveToken}`}>
                  <Button className="btn-gradient-primary text-sm font-medium">RSVP Now</Button>
                </Link>
              )}
              {normalizedStatus && normalizedStatus !== 'pending' && (
                <div className="text-center">
                  {normalizedStatus === 'attending' ? (
                    <>
                      <p className="text-sm text-green-600 font-medium">✓ RSVP Confirmed</p>
                      <p className="text-xs text-slate-gray">Thank you for celebrating with us—we&apos;ll see you there!</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-amber-600 font-medium">RSVP Recorded</p>
                      <p className="text-xs text-slate-gray">We&apos;re sorry you can&apos;t make it, but your response has been saved.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-royal-navy/10 font-inter">
            <p className="text-sm text-slate-gray">RSVP Status: <span className="font-semibold capitalize text-royal-navy">{normalizedStatus?.replace('-', ' ') || 'pending'}</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}