import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params;
  const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || request.nextUrl.origin;

  const buildRedirect = (path: string) => NextResponse.redirect(new URL(path, baseUrl));

  if (!token) {
    return buildRedirect('/verify-email?status=invalid');
  }

  try {
    const existingToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!existingToken || existingToken.expiresAt < new Date()) {
      if (existingToken) {
        await prisma.emailVerificationToken.delete({ where: { id: existingToken.id } });
      }
      return buildRedirect('/verify-email?status=expired');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: existingToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.deleteMany({
        where: { userId: existingToken.userId },
      }),
    ]);

    return buildRedirect('/signin?verified=1');
  } catch (error) {
    console.error('Email verification error:', error);
    return buildRedirect('/verify-email?status=error');
  }
}
