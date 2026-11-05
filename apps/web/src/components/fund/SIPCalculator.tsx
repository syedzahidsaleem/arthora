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
    { name: 'Total Invested', value: totalInvested, color: '#4FBBBC' },
    { name: 'Estimated Returns', value: totalReturns, color: '#7BED9F' },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-black shadow-neo space-y-6 text-[#222A2A] select-none">
      <div className="border-b-2 border-black pb-3">
        <h3 className="text-sm font-black text-black uppercase tracking-wider">
          Systematic Investment Plan (SIP) Calculator
        </h3>
        <p className="text-xs text-[#525866] font-mono font-bold mt-0.5">
          Simulate compound wealth creation by investing monthly in this mutual fund
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Inputs (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Monthly Investment Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-black uppercase font-mono">Monthly Investment</span>
              <span className="font-mono font-black text-black text-base tabular-nums bg-neo-yellow px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
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
              <span className="font-black text-black uppercase font-mono">Investment Horizon</span>
              <span className="font-mono font-black text-black text-base tabular-nums bg-neo-aqua px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
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
              <span className="font-black text-black uppercase font-mono">Expected Annual Return (CAGR)</span>
              <span className="font-mono font-black text-black text-base tabular-nums bg-neo-mint px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
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
        <div className="lg:col-span-5 p-5 rounded-2xl bg-neo-lilac border-2 border-black shadow-neo space-y-4 text-black">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-black uppercase tracking-wider">
              Total Expected Corpus
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-black tabular-nums">
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
                        <div className="p-2.5 rounded-xl bg-white border-2 border-black text-xs font-mono font-bold shadow-neo text-black">
                          <span>{d.name}: </span>
                          <span className="font-black tabular-nums">{formatINR(d.value)}</span>
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
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#000000" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t-2 border-black text-xs font-mono">
            <div className="flex items-center justify-between text-black font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-neo-aqua border border-black shadow-[1px_1px_0px_#000]" />
                Invested Amount:
              </span>
              <span className="font-black text-black tabular-nums">{formatINR(totalInvested)}</span>
            </div>

            <div className="flex items-center justify-between text-black font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-neo-mint border border-black shadow-[1px_1px_0px_#000]" />
                Estimated Growth:
              </span>
              <span className="font-black text-black tabular-nums">{formatINR(totalReturns)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SIPCalculator;
