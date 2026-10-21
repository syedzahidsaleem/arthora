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
    watch,
    setValue,
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

  const passwordVal = watch('password') || '';
  const strengthScore = [
    passwordVal.length >= 8,
    /[A-Z]/.test(passwordVal),
    /[0-9]/.test(passwordVal),
    /[^A-Za-z0-9]/.test(passwordVal),
  ].filter(Boolean).length;

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
        <div className="inline-block px-2.5 py-0.5 rounded bg-neo-cyan text-black border border-black text-xs font-mono font-black uppercase shadow-[1px_1px_0px_0px_#000] mb-1">
          New Investor
        </div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          Create Account
        </h1>
        <p className="text-xs sm:text-sm text-[#A0A0B2] font-medium">
          Join smart Indian investors leveraging institutional AI research.
        </p>
      </div>

      <GoogleAuthButton mode="signup" redirectTo={redirectTo} />

      <div className="flex items-center justify-center my-4">
        <div className="flex-grow border-t-2 border-black/40 dark:border-white/15" />
        <span className="shrink-0 px-3 text-xs uppercase tracking-wider font-mono font-bold text-[#A0A0B2] bg-[#161620]">
          Or register with email
        </span>
        <div className="flex-grow border-t-2 border-black/40 dark:border-white/15" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="font-bold text-xs uppercase tracking-wider text-white">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0B2] pointer-events-none" />
            <Input
              id="name"
              type="text"
              placeholder="e.g. Ramesh Kumar"
              className={`pl-10 ${errors.name ? 'border-[#FF4D6D] focus-visible:border-[#FF4D6D]' : ''}`}
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-[#FF4D6D] font-mono font-bold">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="font-bold text-xs uppercase tracking-wider text-white">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0B2] pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="investor@example.com"
              className={`pl-10 ${errors.email ? 'border-[#FF4D6D] focus-visible:border-[#FF4D6D]' : ''}`}
              {...register('email')}
            />
          </div>
          {watch('email') && watch('email').length > 2 && !watch('email').includes('@') && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-[#A0A0B2]">Quick:</span>
              {['@gmail.com', '@outlook.com', '@yahoo.com'].map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setValue('email', `${watch('email')}${domain}`, { shouldValidate: true })}
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1C1C26] border border-black text-[#A0A0B2] hover:bg-neo-cyan hover:text-black hover:border-black transition-colors"
                >
                  {domain}
                </button>
              ))}
            </div>
          )}
          {errors.email && (
            <p className="text-xs text-[#FF4D6D] font-mono font-bold">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="font-bold text-xs uppercase tracking-wider text-white">
            Password (min 8 chars)
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0B2] pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`pl-10 pr-10 ${errors.password ? 'border-[#FF4D6D] focus-visible:border-[#FF4D6D]' : ''}`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A0A0B2] hover:text-white focus:outline-none transition-colors p-1"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordVal.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 rounded-sm border border-black transition-colors ${
                      strengthScore >= level
                        ? strengthScore === 1
                          ? 'bg-[#FF4D6D]'
                          : strengthScore === 2
                          ? 'bg-neo-yellow'
                          : strengthScore === 3
                          ? 'bg-neo-cyan'
                          : 'bg-neo-lime'
                        : 'bg-[#252533]'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] font-mono font-bold text-[#A0A0B2] uppercase">
                Strength:{' '}
                <span className="text-white">
                  {strengthScore === 0 && 'Too Short'}
                  {strengthScore === 1 && 'Weak'}
                  {strengthScore === 2 && 'Fair'}
                  {strengthScore === 3 && 'Good'}
                  {strengthScore === 4 && 'Institutional Strong'}
                </span>
              </p>
            </div>
          )}
          {errors.password && (
            <p className="text-xs text-[#FF4D6D] font-mono font-bold">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="font-bold text-xs uppercase tracking-wider text-white">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0B2] pointer-events-none" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-[#FF4D6D] focus-visible:border-[#FF4D6D]' : ''}`}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A0A0B2] hover:text-white focus:outline-none transition-colors p-1"
              tabIndex={-1}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-[#FF4D6D] font-mono font-bold">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="secondary"
          disabled={isSubmitting}
          className="w-full h-12 text-sm font-black uppercase tracking-wider mt-2 border-2 border-black shadow-neo hover:shadow-neo-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              <span>Creating Account...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </div>
          )}
        </Button>
      </form>

      <div className="text-center text-xs font-mono text-[#A0A0B2] pt-2">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-neo-yellow hover:underline">
          LOGIN HERE
        </Link>
      </div>
    </div>
  );
}

export default RegisterForm;
