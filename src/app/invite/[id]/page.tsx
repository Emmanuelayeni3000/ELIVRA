import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { generateQRCodeDataURL } from '@/lib/qr-code';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, CalendarDays, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

interface InvitePageProps {
  params: Promise<{
    id: string;
  }>;
}

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

  // Generate QR code data URL for display on the page
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.id}`;
  const qrCodeDataURL = await generateQRCodeDataURL(inviteLink, 256); // Larger QR code for display

  async function copyLink() {
    'use server';
    // Intentionally left blank – placeholder: copying handled client-side normally via navigator.clipboard.
  }

  return (
    <div className="min-h-screen section-frame py-12 animate-fade-up-soft flex items-center justify-center">
      <Card className="w-full max-w-3xl mx-auto wedding-elevated-card px-4 md:px-8 py-10 text-center space-y-8">
        <CardContent className="space-y-8 p-0">
          <div>
            <div className="accent-bar-gold mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-royal-navy font-playfair-display leading-tight tracking-tight">
                You&apos;re Invited!
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-slate-gray font-inter leading-relaxed">To the wedding celebration of</p>
            <h2 className="text-5xl md:text-6xl font-bold text-gold-foil font-great-vibes leading-tight tracking-tight mt-4">
              {invite.event.title}
            </h2>
            {invite.message && (
              <p className="text-md text-slate-gray mt-6 italic font-inter max-w-xl mx-auto">&ldquo;{invite.message}&rdquo;</p>
            )}
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-3 font-inter text-slate-gray text-left">
            <div className="flex items-start gap-3 md:col-span-1">
              <CalendarDays className="h-6 w-6 text-royal-navy" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-gray/70 mb-1">Date</p>
                <p className="text-base font-medium text-royal-navy">{format(new Date(invite.event.date), 'PPP')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:col-span-1">
              <MapPin className="h-6 w-6 text-royal-navy" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-gray/70 mb-1">Location</p>
                <p className="text-base font-medium text-royal-navy">{invite.event.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:col-span-1">
              <Clock className="h-6 w-6 text-royal-navy" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-gray/70 mb-1">Time</p>
                <p className="text-base font-medium text-royal-navy">{invite.event.time || 'TBA'}</p>
              </div>
            </div>
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
            <div className="flex flex-wrap gap-3 justify-center">
              
              <Button
                type="button"
                className="btn-outline-gold text-sm flex items-center gap-2"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = qrCodeDataURL;
                  a.download = `invite-${invite.id}.png`;
                  a.click();
                }}
              >
                <Download className="h-4 w-4" /> Download QR
              </Button>
              <Link href={`/rsvp/${invite.id}`}>
                <Button className="btn-gradient-primary text-sm font-medium">RSVP Now</Button>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-royal-navy/10 font-inter">
            <p className="text-sm text-slate-gray">RSVP Status: <span className="font-semibold capitalize text-royal-navy">{invite.rsvpStatus}</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}