import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface DeclinedInvitationProps {
  params: Promise<{
    token: string;
  }>;
}

export const dynamic = 'force-dynamic'; // Disable caching

export default async function DeclinedInvitationPage({ params }: DeclinedInvitationProps) {
  const { token } = await params;

  // Find the invitation by token
  let invite = await prisma.invite.findUnique({
    where: { qrCode: token },
    include: { event: true },
  });

  // Fallback: try to find by qrCode containing the token (old format)
  if (!invite) {
    invite = await prisma.invite.findFirst({
      where: {
        qrCode: { contains: token }
      },
      include: { event: true },
    });
  }

  // Fallback: try looking up by invite ID (legacy)
  if (!invite) {
    invite = await prisma.invite.findUnique({
      where: { id: token },
      include: { event: true },
    });
  }

  if (!invite || !invite.event) {
    notFound();
  }

  return (
    <div className="min-h-screen section-frame py-12 animate-fade-up-soft flex items-center justify-center">
      <Card className="w-full max-w-lg mx-auto wedding-elevated-card px-6 py-8 text-center space-y-6">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-royal-navy font-playfair-display">
            Invitation Declined
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 p-0">
          <div className="space-y-3">
            <p className="text-lg text-slate-gray font-inter">
              Hello {invite.guestName},
            </p>
            <p className="text-slate-gray font-inter">
              You have declined the invitation to:
            </p>
          </div>

          <div className="bg-pearl-beige/30 rounded-lg p-4 space-y-3">
            <h3 className="text-xl font-semibold text-royal-navy font-playfair-display">
              {invite.event.title}
            </h3>
            
            <div className="flex items-center justify-center gap-2 text-slate-gray">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {format(new Date(invite.event.date), 'EEEE, MMMM do, yyyy')}
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-slate-gray">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{invite.event.location}</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-gray font-inter">
              Thank you for letting us know. We understand and appreciate your response.
            </p>
            
            {invite.message && (
              <div className="bg-gold-foil/10 border border-gold-foil/20 rounded-lg p-3">
                <p className="text-sm text-slate-gray italic">
                  &ldquo;{invite.message}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <p className="text-xs text-slate-gray/70 font-inter mb-4">
              If you&apos;ve changed your mind, you can update your RSVP:
            </p>
            <Link href={`/rsvp/${token}`}>
              <Button variant="outline" className="btn-outline-gold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Update RSVP
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t border-royal-navy/10 font-inter">
            <p className="text-xs text-slate-gray">
              RSVP Status: <span className="font-semibold text-red-600">Declined</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}