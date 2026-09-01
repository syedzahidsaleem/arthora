import React from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '../../../components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | Arthora',
  description: 'Log in to your Arthora investment research account.',
};

export default function LoginPage() {
  return <LoginForm redirectTo="/ai" />;
}
