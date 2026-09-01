import React from 'react';
import { StockDetailView } from '@/components/stock/StockDetailView';

export async function generateStaticParams() {
  return [{ symbol: '_' }];
}

interface StockDetailPageProps {
  params: {
    symbol: string;
  };
}

export default function StockDetailPage({ params }: StockDetailPageProps) {
  return <StockDetailView symbol={params.symbol} />;
}
