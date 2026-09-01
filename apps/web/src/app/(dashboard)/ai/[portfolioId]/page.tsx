import React from 'react';
import { PortfolioDetailView } from '@/components/ai/PortfolioDetailView';

export async function generateStaticParams() {
  return [{ portfolioId: '_' }];
}

interface PortfolioDetailPageProps {
  params: {
    portfolioId: string;
  };
}

export default function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  return <PortfolioDetailView portfolioId={params.portfolioId} />;
}
