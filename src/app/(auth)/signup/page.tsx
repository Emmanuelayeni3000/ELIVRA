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
import GoogleSignInButton from '@/components/ui/GoogleSignInButton';

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
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
    const { success, error: authError } = await signUp(values.email, values.password, values.name);

    if (success) {
      router.push('/dashboard');
    } else {
      setError(authError || 'An unexpected error occurred during sign-up.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-pearl-beige p-4">
      <Card className="w-full max-w-md shadow-stats-card bg-[#ffffff]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-[#1D3557] font-playfair-display">Sign Up</CardTitle>
          <CardDescription className="text-slate-gray font-inter">
            Create an account to start planning your wedding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-royal-navy font-inter">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
                disabled={isSubmitting}
                className="wedding-input"
              />
              {errors.name && <p className="text-sm text-blush font-inter">{errors.name.message}</p>}
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
            {error && <p className="text-center text-sm text-blush font-inter">{error}</p>}
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
