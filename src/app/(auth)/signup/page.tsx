'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

const signUpSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters long')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters long')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must be less than 100 characters'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setError(null);
    setSuccess(null);
    
    try {
      const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`;
      const { success: signUpSuccess, error: authError } = await signUp(
        values.email.trim().toLowerCase(), 
        values.password, 
        fullName
      );

      if (signUpSuccess) {
        router.push(`/verify-email?email=${encodeURIComponent(values.email.trim().toLowerCase())}`);
        return;
      } else {
        // Check if it's an auto sign-in failure after successful account creation
        if (authError && authError.includes('Account created successfully')) {
          setSuccess('Account created successfully! Please sign in with your new credentials.');
          setTimeout(() => {
            router.push('/signin');
          }, 3000);
        } else {
          setError(authError || 'Sign-up failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Sign-up form error:', error);
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
              Create your Elivra account.
            </h2>
            <p className="max-w-lg text-base text-pure-white/80">
              Design stunning invitations, manage guest lists, and send seamless reminders with everything built for a flawless celebration.
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
              <CardTitle className="font-playfair-display text-3xl text-[#1D3557]">Sign Up</CardTitle>
              <CardDescription className="text-sm text-slate-gray">
                Create an account to start planning your Event.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName" className="text-royal-navy font-inter">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    {...register('firstName')}
                    disabled={isSubmitting}
                    className="wedding-input"
                  />
                  {errors.firstName && <p className="text-sm text-blush font-inter">{errors.firstName.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName" className="text-royal-navy font-inter">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    {...register('lastName')}
                    disabled={isSubmitting}
                    className="wedding-input"
                  />
                  {errors.lastName && <p className="text-sm text-blush font-inter">{errors.lastName.message}</p>}
                </div>
              </div>
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
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600 font-inter text-center">{error}</p>
                  {error.includes('already exists') && (
                    <p className="mt-2 text-center text-xs text-red-500 font-inter">
                      <Link href="/signin" className="underline hover:text-red-700">
                        Sign in to your existing account
                      </Link>
                    </p>
                  )}
                </div>
              )}
              {success && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3">
                  <p className="text-sm text-green-600 font-inter text-center">{success}</p>
                </div>
              )}
              <Button type="submit" className="w-full bg-[#1D3557] text-[#ffffff] hover:bg-[#1D3557]/85" disabled={isSubmitting}>
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
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
              Already have an account?{' '}
              <Link href="/signin" className="font-medium text-royal-navy hover:underline">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
