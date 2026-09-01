import React from 'react';
import type { Metadata } from 'next';
import { RegisterForm } from '../../../components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account | Arthora',
  description: 'Join Arthora for institutional-grade AI investment research.',
};

export default function RegisterPage() {
  return <RegisterForm redirectTo="/ai" />;
}
