import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/invites/export?eventId=xxx
// Returns CSV of invites for the authenticated user's event
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const eventId = searchParams.get('eventId');
		if (!eventId) {
			return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
		}

		// Verify event ownership
		const event = await prisma.event.findFirst({
			where: { id: eventId, userId: session.user.id },
			select: { id: true, title: true }
		});
		if (!event) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		const invites = await prisma.invite.findMany({
			where: { eventId },
			orderBy: { createdAt: 'asc' },
		});

		// CSV Header
		const headers = [
			'invite_id',
			'guest_name',
			'email',
			'guest_count',
			'rsvp_status',
			'sent_at',
			'viewed_at',
			'rsvp_at'
		];

		const escape = (val: unknown) => {
			if (val === null || val === undefined) return '';
			const str = String(val);
			if (/[",\n]/.test(str)) {
				return '"' + str.replace(/"/g, '""') + '"';
			}
			return str;
		};

			const rows = invites.map(inv => {
				const anyInv = inv as Record<string, unknown>;
				const guestCount = (typeof anyInv.guestCount === 'number') ? anyInv.guestCount : 1;
				return [
					inv.id,
					inv.guestName,
					inv.email || '',
					guestCount,
					inv.rsvpStatus || 'pending',
					inv.sentAt ? inv.sentAt.toISOString() : '',
					inv.viewedAt ? inv.viewedAt.toISOString() : '',
					inv.rsvpAt ? inv.rsvpAt.toISOString() : '',
				].map(escape).join(',');
			});

		const csv = [headers.join(','), ...rows].join('\n');
		const fileName = `wedvite-invites-${event.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-${new Date().toISOString().slice(0,10)}.csv`;

		return new NextResponse(csv, {
			status: 200,
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="${fileName}"`,
				'Cache-Control': 'no-store'
			}
		});
	} catch (error) {
		console.error('Export invites error:', error);
		return NextResponse.json({ error: 'Failed to export invites' }, { status: 500 });
	}
}
