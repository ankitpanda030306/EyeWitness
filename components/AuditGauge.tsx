import React from 'react'
import { CheckCircle2, AlertTriangle, XOctagon } from 'lucide-react'

interface AuditGaugeProps {
  score: number; // 0 to 100
}

export const getScoreTheme = (score: number) => {
  if (score >= 80) return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-[0_0_40px_-10px_rgba(52,211,153,0.3)]', icon: <CheckCircle2 className="w-8 h-8 text-emerald-400" />, label: 'VERIFIED AUTHENTIC' }
  if (score >= 40) return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-[0_0_40px_-10px_rgba(251,191,36,0.3)]', icon: <AlertTriangle className="w-8 h-8 text-amber-400" />, label: 'MISLEADING / PARTIALLY ALTERED' }
  return { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)]', icon: <XOctagon className="w-8 h-8 text-rose-500" />, label: 'FABRICATED / DEBUNKED FAKE' }
}

export function AuditGauge({ score }: AuditGaugeProps) {
  const theme = getScoreTheme(score)
  
  return (
    <div className="flex items-center gap-6 bg-slate-950/50 p-4 rounded-2xl border border-slate-800 shrink-0">
      <div className="flex flex-col">
        <span className={`text-xs font-bold tracking-widest uppercase ${theme.color} mb-1 text-right`}>{theme.label}</span>
        <span className="text-slate-400 text-xs text-right">AUTHENTICITY CONFIDENCE</span>
      </div>
      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className={theme.color} strokeWidth="3" strokeDasharray={`${Math.max(0, Math.min(100, score))}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-black font-mono ${theme.color}`}>{Math.round(score)}%</span>
        </div>
      </div>
    </div>
  )
}
