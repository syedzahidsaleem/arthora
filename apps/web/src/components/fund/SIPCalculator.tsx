'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Slider } from '../ui/slider';
import { formatINR } from '@arthora/shared';

interface SIPCalculatorProps {
  initialCAGR?: number;
}

const MONTHLY_TICKS = [
  { value: 500, label: '₹500' },
  { value: 25000, label: '₹25k' },
  { value: 50000, label: '₹50k' },
  { value: 75000, label: '₹75k' },
  { value: 100000, label: '₹1L' },
];

const HORIZON_TICKS = [
  { value: 1, label: '1Y' },
  { value: 5, label: '5Y' },
  { value: 10, label: '10Y' },
  { value: 20, label: '20Y' },
  { value: 30, label: '30Y' },
];

const RATE_TICKS = [
  { value: 5, label: '5%' },
  { value: 12, label: '12%' },
  { value: 18, label: '18%' },
  { value: 24, label: '24%' },
  { value: 30, label: '30%' },
];

export function SIPCalculator({ initialCAGR = 14.0 }: SIPCalculatorProps) {
  const [monthlyAmount, setMonthlyAmount] = useState(10000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(initialCAGR > 0 ? Number(initialCAGR.toFixed(1)) : 14.0);

  // SIP Compound Formula
  const r = rate / 100 / 12;
  const n = years * 12;
  const totalInvested = monthlyAmount * n;
  const futureValue =
    r > 0
      ? monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
      : totalInvested;
  const totalReturns = Math.max(0, Math.round(futureValue - totalInvested));
  const finalCorpus = Math.round(futureValue);

  const chartData = [
    { name: 'Total Invested', value: totalInvested, color: '#6C63FF' },
    { name: 'Estimated Returns', value: totalReturns, color: '#00D084' },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#13141F] border border-white/[0.08] shadow-2xl space-y-6">
      <div className="border-b border-white/[0.08] pb-3">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Systematic Investment Plan (SIP) Calculator
        </h3>
        <p className="text-xs text-[#9B9BB4] mt-0.5">
          Simulate compound wealth creation by investing monthly in this mutual fund
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Inputs (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Monthly Investment Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#9B9BB4] uppercase font-mono">Monthly Investment</span>
              <span className="font-mono font-bold text-white text-sm tabular-nums">
                {formatINR(monthlyAmount)}
              </span>
            </div>

            <Slider
              value={[monthlyAmount]}
              max={100000}
              min={500}
              step={500}
              ticks={MONTHLY_TICKS}
              showTicks
              onValueChange={(vals) => setMonthlyAmount(vals[0])}
              aria-label="Monthly investment"
            />
          </div>

          {/* Investment Period Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#9B9BB4] uppercase font-mono">Investment Horizon</span>
              <span className="font-mono font-bold text-[#00D2FF] text-sm tabular-nums">
                {years} {years === 1 ? 'Year' : 'Years'}
              </span>
            </div>

            <Slider
              value={[years]}
              max={30}
              min={1}
              step={1}
              ticks={HORIZON_TICKS}
              showTicks
              onValueChange={(vals) => setYears(vals[0])}
              aria-label="Investment horizon"
            />
          </div>

          {/* Expected Return Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#9B9BB4] uppercase font-mono">Expected Annual Return (CAGR)</span>
              <span className="font-mono font-bold text-[#00D084] text-sm tabular-nums">
                {rate}%
              </span>
            </div>

            <Slider
              value={[rate]}
              max={30}
              min={5}
              step={0.5}
              ticks={RATE_TICKS}
              showTicks
              onValueChange={(vals) => setRate(vals[0])}
              aria-label="Expected return rate"
            />
          </div>
        </div>

        {/* Right Output & Donut (col-span-5) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0D0E1A] border border-white/[0.08] space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-[#9B9BB4] uppercase font-mono">
              Total Expected Corpus
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black bg-gradient-to-r from-[#6C63FF] via-[#00D2FF] to-[#00D084] bg-clip-text text-transparent tabular-nums">
              {formatINR(finalCorpus)}
            </div>
          </div>

          {/* Donut Visual */}
          <div className="h-36 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-[#13141F] border border-white/10 text-xs font-mono shadow-xl">
                          <span className="text-[#9B9BB4]">{d.name}: </span>
                          <span className="font-bold text-[#00D2FF] tabular-nums">{formatINR(d.value)}</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0D0E1A" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs font-mono">
            <div className="flex items-center justify-between text-[#9B9BB4]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]" />
                Invested Amount:
              </span>
              <span className="font-bold text-white tabular-nums">{formatINR(totalInvested)}</span>
            </div>

            <div className="flex items-center justify-between text-[#00D084]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00D084]" />
                Estimated Growth:
              </span>
              <span className="font-bold tabular-nums">{formatINR(totalReturns)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SIPCalculator;
