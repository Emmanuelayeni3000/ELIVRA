'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import GoogleSignInButton from '@/components/ui/GoogleSignInButton';

const signInSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const verified = searchParams.get('verified');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (values: SignInFormValues) => {
    setError(null);
    
    try {
      const { success, error: authError } = await signIn(values.email.trim().toLowerCase(), values.password);

      if (success) {
        router.push('/dashboard');
      } else {
        setError(authError || 'Sign-in failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Sign-in form error:', error);
      setError('A network error occurred. Please check your connection and try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-pearl-beige lg:flex-row">
      <div className="relative h-48 w-full overflow-hidden rounded-b-3xl bg-royal-navy/80 lg:h-auto lg:min-h-screen lg:w-1/2 lg:rounded-none">
        <Image
          src="/images/hero1.jpg"
          alt="Elegant wedding celebration"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-royal-navy/80" />
  <div className="relative z-10 flex h-full w-full flex-col justify-end gap-6 px-6 pb-10 pt-16 text-pure-white sm:px-10 lg:px-14 lg:-translate-y-8">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-gold-foil/80">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <Image src="/Elivra-logo.png" alt="Elivra Logo" width={32} height={32} />
            </span>
            Back to home
          </Link>
          <div className="space-y-4">
            <h2 className="font-playfair-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Welcome back to your celebration hub.
            </h2>
            <p className="max-w-lg text-base text-pure-white/80">
              Manage invitations, monitor RSVPs, and keep every detail on track with a dashboard designed for effortless planning.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
        <Card className="w-full max-w-md bg-white/90 shadow-stats-card backdrop-blur">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pearl-beige">
              <Image
                src="/Elivra-logo.png"
                alt="Elivra Logo"
                width={40}
                height={40}
                className="transition-opacity duration-200"
                priority
              />
            </div>
            <div className="space-y-2">
              <CardTitle className="font-playfair-display text-3xl text-[#1D3557]">Sign In</CardTitle>
              <CardDescription className="text-sm text-slate-gray">
                Enter your credentials to access your Elivra dashboard.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-royal-navy font-inter">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register('email')}
                  disabled={isSubmitting}
                  className="wedding-input"
                />
                {errors.email && <p className="text-sm text-blush font-inter">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-royal-navy font-inter">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    disabled={isSubmitting}
                    className="wedding-input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-royal-navy/60 transition hover:text-royal-navy"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-blush font-inter">{errors.password.message}</p>}
              </div>
              {verified === '1' && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3">
                  <p className="text-sm text-green-600 font-inter text-center">
                    Email verified successfully! Please sign in to continue.
                  </p>
                </div>
              )}
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600 font-inter text-center">{error}</p>
                  {error.includes('No account found') && (
                    <p className="mt-2 text-center text-xs text-red-500 font-inter">
                      <Link href="/signup" className="underline hover:text-red-700">
                        Create a new account instead
                      </Link>
                    </p>
                  )}
                </div>
              )}
              <Button type="submit" className="w-full bg-[#1D3557] text-[#ffffff] hover:bg-[#1D3557]/85" disabled={isSubmitting}>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-gray">Or continue with</span>
              </div>
            </div>
            <GoogleSignInButton />
            <p className="mt-4 text-center text-sm text-slate-gray font-inter">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-royal-navy hover:underline">
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-pearl-beige lg:flex-row">
        <div className="relative h-48 w-full overflow-hidden rounded-b-3xl bg-royal-navy/80 lg:h-auto lg:min-h-screen lg:w-1/2 lg:rounded-none">
          <div className="absolute inset-0 bg-royal-navy/80" />
          <div className="relative z-10 flex h-full w-full flex-col justify-end gap-6 px-6 pb-10 pt-16 text-pure-white sm:px-10 lg:px-14 lg:-translate-y-8">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-gold-foil/80">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 animate-pulse" />
              Loading...
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <Card className="w-full max-w-md bg-white/90 shadow-stats-card backdrop-blur animate-pulse">
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pearl-beige" />
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 rounded w-24 mx-auto" />
                <div className="h-4 bg-slate-200 rounded w-48 mx-auto" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-12 bg-slate-200 rounded" />
              <div className="h-12 bg-slate-200 rounded" />
              <div className="h-12 bg-slate-200 rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
