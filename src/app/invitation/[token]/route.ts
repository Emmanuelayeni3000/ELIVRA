import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// Smart invitation router - checks RSVP status and redirects appropriately
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: rawToken } = await params;
    const token = rawToken.includes('/')
      ? rawToken.split('/').filter(Boolean).pop() || rawToken
      : rawToken;

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

    if (!invite) {
      // Invalid token - redirect to a not found page
      redirect('/404');
    }

    // Check RSVP status and redirect accordingly
    const rsvpStatus = invite.rsvpStatus?.toLowerCase();

    if (!rsvpStatus || rsvpStatus === 'pending') {
      // No RSVP yet or pending - show RSVP form
  redirect(`/rsvp/${token}`);
    }

    if (rsvpStatus === 'attending' || rsvpStatus === 'accepted') {
      redirect(`/invite/${invite.id}`);
    }

    if (rsvpStatus === 'not-attending' || rsvpStatus === 'declined') {
      redirect(`/invite/${invite.id}`);
    }

    // Any other status - default to RSVP form
    redirect(`/rsvp/${token}`);

  } catch (error) {
    console.error('Error in smart invitation redirect:', error);
    redirect('/404');
  }
}