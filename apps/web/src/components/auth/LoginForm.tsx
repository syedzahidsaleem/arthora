'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@arthora/shared';
import { useAuthStore } from '../../store/authStore';
import { prewarmServer } from '../../lib/api/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { GoogleAuthButton } from './GoogleAuthButton';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo = '/ai' }: LoginFormProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    prewarmServer();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back to Arthora!');
      router.push(redirectTo);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Invalid email or password';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 text-[#222A2A]">
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-block px-2.5 py-0.5 rounded-md bg-neo-yellow text-black border-2 border-black text-xs font-mono font-black uppercase shadow-[1px_1px_0px_0px_#000] mb-1">
          Investor Access
        </div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-[#525866] font-bold">
          Enter your credentials to access your AI investment dashboard.
        </p>
      </div>

      <GoogleAuthButton mode="signin" redirectTo={redirectTo} />

      <div className="flex items-center justify-center my-4">
        <div className="flex-grow border-t-2 border-black/20" />
        <span className="shrink-0 px-3 text-xs uppercase tracking-wider font-mono font-bold text-[#525866] bg-white">
          Or continue with email
        </span>
        <div className="flex-grow border-t-2 border-black/20" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="font-black text-xs uppercase tracking-wider text-black">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#525866] pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="investor@example.com"
              className={`pl-10 ${errors.email ? 'border-neo-rust focus-visible:border-neo-rust' : ''}`}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-neo-rust font-mono font-bold">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-black text-xs uppercase tracking-wider text-black">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-mono font-bold text-[#EC4624] hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#525866] pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`pl-10 pr-10 ${errors.password ? 'border-neo-rust focus-visible:border-neo-rust' : ''}`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#525866] hover:text-black focus:outline-none transition-colors p-1"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-neo-rust font-mono font-bold">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 pt-0.5">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-2 border-black bg-white text-black accent-[#7BED9F] focus:ring-0 cursor-pointer"
          />
          <Label htmlFor="rememberMe" className="text-xs font-mono font-bold text-[#525866] cursor-pointer select-none">
            Remember this session
          </Label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting}
          className="w-full h-12 text-sm font-black uppercase tracking-wider mt-2 border-2 border-black shadow-neo hover:shadow-neo-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              <span>Authenticating...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </div>
          )}
        </Button>
      </form>

      <div className="text-center text-xs font-mono font-bold text-[#525866] pt-2">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-black text-[#EC4624] hover:underline">
          REGISTER HERE
        </Link>
      </div>
    </div>
  );
}

export default LoginForm;
