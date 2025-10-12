import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all invites where qrCode contains a full URL instead of just a token
    const invitesToFix = await prisma.invite.findMany({
      where: {
        qrCode: {
          contains: '/rsvp/'
        }
      }
    });

    console.log(`Found ${invitesToFix.length} invites to fix`);

    let fixedCount = 0;
    for (const invite of invitesToFix) {
      // Extract token from URL - assume format is like "/rsvp/token" or "domain.com/rsvp/token"
      const urlParts = invite.qrCode.split('/rsvp/');
      if (urlParts.length > 1) {
        const token = urlParts[1];
        
        // Only update if token is not empty
        if (token && token.trim() !== '') {
          // Update the invite to store only the token
          await prisma.invite.update({
            where: { id: invite.id },
            data: { qrCode: token }
          });
        
          fixedCount++;
          console.log(`Fixed invite ${invite.id}: ${invite.qrCode} -> ${token}`);
        }
      }
    }

    return NextResponse.json({ 
      message: `Fixed ${fixedCount} invites`,
      fixedCount,
      totalFound: invitesToFix.length
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Fix invites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}