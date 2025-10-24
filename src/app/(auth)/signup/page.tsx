'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
          <CardTitle className="text-3xl font-bold text-[#1D3557] font-playfair-display">Sign Up</CardTitle>
          <CardDescription className="text-slate-gray font-inter">
            Create an account to start planning your wedding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600 font-inter text-center">{error}</p>
                {error.includes('already exists') && (
                  <p className="text-xs text-red-500 font-inter text-center mt-2">
                    <Link href="/signin" className="underline hover:text-red-700">
                      Sign in to your existing account
                    </Link>
                  </p>
                )}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-600 font-inter text-center">{success}</p>
              </div>
            )}
            <Button type="submit" className="w-full bg-[#1D3557] text-[#ffffff] hover:bg-[#1D3557]/80" disabled={isSubmitting}>
              {isSubmitting ? 'Signing Up...' : 'Sign Up'}
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
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-[#1D3557] hover:underline">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
