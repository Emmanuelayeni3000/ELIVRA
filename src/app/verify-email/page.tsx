'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const status = searchParams.get('status');

  const statusMessage = (() => {
    if (status === 'expired') {
      return 'Your verification link has expired. Please sign in to request a new email.';
    }
    if (status === 'invalid') {
      return 'That verification link is invalid. Please check the link or request a new email.';
    }
    if (status === 'error') {
      return 'Something went wrong while verifying your email. Please try again.';
    }
    return null;
  })();

  return (
    <div className="flex min-h-screen items-center justify-center bg-pearl-beige p-4">
      <Card className="w-full max-w-md shadow-stats-card bg-white">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="flex justify-center">
            <Image
              src="/Elivra-logo.png"
              alt="Elivra Logo"
              width={60}
              height={60}
              className="hover:opacity-80 transition-opacity duration-200"
              priority
            />
          </Link>
          <CardTitle className="text-3xl font-bold text-royal-navy font-playfair-display">
            Please Verify Your Email
          </CardTitle>
          <CardDescription className="text-slate-gray font-inter">
            {email
              ? `We sent a verification link to ${email}.`
              : 'We sent you a verification link.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-slate-gray font-inter leading-relaxed">
            Click the button in the email we just sent to confirm your address and unlock your dashboard. If you don&apos;t
            see the email in your inbox, check your spam folder.
          </p>
          {statusMessage && (
            <div className="rounded-md border border-red-100 bg-red-50 p-4">
              <p className="text-sm text-red-600 font-inter">{statusMessage}</p>
            </div>
          )}
          <p className="text-sm text-slate-gray/80">
            Already verified?
            <Link href="/signin" className="ml-1 font-medium text-royal-navy hover:underline">
              Sign in here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
