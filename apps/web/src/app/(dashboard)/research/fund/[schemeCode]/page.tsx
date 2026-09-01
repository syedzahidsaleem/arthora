import React from 'react';
import { FundDetailView } from '@/components/fund/FundDetailView';

export async function generateStaticParams() {
  return [{ schemeCode: '_' }];
}

interface FundDetailPageProps {
  params: {
    schemeCode: string;
  };
}

export default function FundDetailPage({ params }: FundDetailPageProps) {
  return <FundDetailView schemeCode={params.schemeCode} />;
}
