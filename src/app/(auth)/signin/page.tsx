'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react'; // Import icons

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

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const verified = searchParams.get('verified');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

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
    <div className="flex min-h-screen items-center justify-center bg-pearl-beige p-4">
      <Card className="w-full max-w-md shadow-stats-card bg-[#ffffff]">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center mb-4">
            <Image
              src="/Elivra-logo.png"
              alt="Elivra Logo"
              width={60}
              height={60}
              className="hover:opacity-80 transition-opacity duration-200"
              priority
            />
          </Link>
          <CardTitle className="text-3xl font-bold text-[#1D3557] font-playfair-display">Sign In</CardTitle>
          <CardDescription className="text-slate-gray font-inter">
            Enter your credentials to access your Elivra dashboard.
          </CardDescription>
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
            <div className="grid gap-2 relative">
              <Label htmlFor="password" className="text-royal-navy font-inter">Password</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                disabled={isSubmitting}
                className="wedding-input pr-10" // Add padding for the icon
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                style={{ top: '25px' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <p className="text-sm text-blush font-inter">{errors.password.message}</p>}
            </div>
            {verified === '1' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-600 font-inter text-center">
                  Email verified successfully! Please sign in to continue.
                </p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600 font-inter text-center">{error}</p>
                {error.includes('No account found') && (
                  <p className="text-xs text-red-500 font-inter text-center mt-2">
                    <Link href="/signup" className="underline hover:text-red-700">
                      Create a new account instead
                    </Link>
                  </p>
                )}
              </div>
            )}
            <Button type="submit" className="w-full bg-[#1D3557] text-[#ffffff] hover:bg-[#1D3557]/80" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-pearl-beige px-2 text-slate-gray">
                Or continue with
              </span>
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
  );
}
