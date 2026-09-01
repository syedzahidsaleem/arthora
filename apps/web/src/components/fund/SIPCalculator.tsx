'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import * as Slider from '@radix-ui/react-slider';
import { formatINR } from '@arthora/shared';

interface SIPCalculatorProps {
  initialCAGR?: number;
}

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
    <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-6">
      <div className="border-b border-white/5 pb-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
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
              <span className="font-semibold text-[#9B9BB4] uppercase">Monthly Investment</span>
              <span className="font-mono font-bold text-white text-sm">
                {formatINR(monthlyAmount)}
              </span>
            </div>

            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[monthlyAmount]}
              max={100000}
              min={500}
              step={500}
              onValueChange={(vals) => setMonthlyAmount(vals[0])}
            >
              <Slider.Track className="bg-[#13141F] relative grow rounded-full h-2 overflow-hidden border border-white/5">
                <Slider.Range className="absolute bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-5 h-5 bg-white shadow-lg rounded-full hover:scale-110 focus:outline-none transition-transform cursor-grab active:cursor-grabbing"
                aria-label="Monthly investment"
              />
            </Slider.Root>
            <div className="flex justify-between text-[10px] font-mono text-[#9B9BB4]/60">
              <span>₹500</span>
              <span>₹25,000</span>
              <span>₹50,000</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* Investment Period Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#9B9BB4] uppercase">Investment Horizon</span>
              <span className="font-mono font-bold text-[#00D2FF] text-sm">
                {years} {years === 1 ? 'Year' : 'Years'}
              </span>
            </div>

            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[years]}
              max={30}
              min={1}
              step={1}
              onValueChange={(vals) => setYears(vals[0])}
            >
              <Slider.Track className="bg-[#13141F] relative grow rounded-full h-2 overflow-hidden border border-white/5">
                <Slider.Range className="absolute bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-5 h-5 bg-white shadow-lg rounded-full hover:scale-110 focus:outline-none transition-transform cursor-grab active:cursor-grabbing"
                aria-label="Investment horizon"
              />
            </Slider.Root>
            <div className="flex justify-between text-[10px] font-mono text-[#9B9BB4]/60">
              <span>1Y</span>
              <span>5Y</span>
              <span>10Y</span>
              <span>20Y</span>
              <span>30Y</span>
            </div>
          </div>

          {/* Expected Return Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#9B9BB4] uppercase">Expected Annual Return (CAGR)</span>
              <span className="font-mono font-bold text-[#00D084] text-sm">
                {rate}%
              </span>
            </div>

            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[rate]}
              max={30}
              min={5}
              step={0.5}
              onValueChange={(vals) => setRate(vals[0])}
            >
              <Slider.Track className="bg-[#13141F] relative grow rounded-full h-2 overflow-hidden border border-white/5">
                <Slider.Range className="absolute bg-[#00D084] h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-5 h-5 bg-white shadow-lg rounded-full hover:scale-110 focus:outline-none transition-transform cursor-grab active:cursor-grabbing"
                aria-label="Expected return rate"
              />
            </Slider.Root>
          </div>
        </div>

        {/* Right Output & Donut (col-span-5) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#13141F]/80 border border-white/5 space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#9B9BB4] uppercase">
              Total Expected Corpus
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold bg-gradient-to-r from-[#6C63FF] via-[#00D2FF] to-[#00D084] bg-clip-text text-transparent">
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
                        <div className="p-2 rounded-lg bg-[#13141F] border border-white/10 text-xs font-mono">
                          <span className="text-white">{d.name}: </span>
                          <span className="font-bold text-[#00D2FF]">{formatINR(d.value)}</span>
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
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#13141F" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5 text-xs font-mono">
            <div className="flex items-center justify-between text-[#9B9BB4]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]" />
                Invested Amount:
              </span>
              <span className="font-semibold text-white">{formatINR(totalInvested)}</span>
            </div>

            <div className="flex items-center justify-between text-[#00D084]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00D084]" />
                Estimated Growth:
              </span>
              <span className="font-bold">{formatINR(totalReturns)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
