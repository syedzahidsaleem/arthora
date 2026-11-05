import React from 'react';
import { FundDetailView } from '@/components/fund/FundDetailView';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [{ schemeCode: '_' }];
}

interface FundDetailPageProps {
  params: {
    schemeCode: string;
  };
}

export default function FundDetailPage({ params }: FundDetailPageProps) {
  const code = Number(params.schemeCode) || params.schemeCode;
  return <FundDetailView schemeCode={code} />;
}
