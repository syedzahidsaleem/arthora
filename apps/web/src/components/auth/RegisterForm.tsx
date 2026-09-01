'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { GoogleAuthButton } from './GoogleAuthButton';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react';

const webRegisterSchema = z
  .object({
    name: z.string().min(1, 'Full name is required').max(100, 'Name cannot exceed 100 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type WebRegisterInput = z.infer<typeof webRegisterSchema>;

interface RegisterFormProps {
  redirectTo?: string;
}

export function RegisterForm({ redirectTo = '/ai' }: RegisterFormProps) {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WebRegisterInput>({
    resolver: zodResolver(webRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: WebRegisterInput) => {
    setIsSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created successfully! Welcome to Arthora.');
      router.push(redirectTo);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-content-primary">
          Create an account
        </h1>
        <p className="text-sm text-content-secondary">
          Join thousands of smart Indian investors leveraging AI research.
        </p>
      </div>

      <GoogleAuthButton mode="signup" redirectTo={redirectTo} />

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-surface-4" />
        <span className="bg-surface-2 px-3 text-xs uppercase tracking-wider text-content-muted">
          Or register with email
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-content-muted" />
            <Input
              id="name"
              type="text"
              placeholder="e.g. Ramesh Kumar"
              className={`pl-10 ${errors.name ? 'border-feedback-error focus-visible:ring-feedback-error' : ''}`}
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-feedback-error animate-fadeIn font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-content-muted" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={`pl-10 ${errors.email ? 'border-feedback-error focus-visible:ring-feedback-error' : ''}`}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-feedback-error animate-fadeIn font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password (min 8 chars)</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-content-muted" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`pl-10 pr-10 ${errors.password ? 'border-feedback-error focus-visible:ring-feedback-error' : ''}`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-content-muted hover:text-content-primary focus:outline-none transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-feedback-error animate-fadeIn font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-content-muted" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-feedback-error focus-visible:ring-feedback-error' : ''}`}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-3.5 text-content-muted hover:text-content-primary focus:outline-none transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-feedback-error animate-fadeIn font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gradient"
          disabled={isSubmitting}
          className="w-full h-11 text-base font-semibold shadow-lg shadow-brand-primary/25 mt-2"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Creating account...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-content-secondary">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-secondary hover:underline">
          Login here
        </Link>
      </div>
    </div>
  );
}

export default RegisterForm;
