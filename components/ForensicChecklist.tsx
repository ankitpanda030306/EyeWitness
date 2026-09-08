import React from 'react'
import { Info, CheckCircle2, XOctagon } from 'lucide-react'

export interface ForensicCheck {
  label: string;
  passed: boolean;
  inverse?: boolean;
}

interface ForensicChecklistProps {
  checks: ForensicCheck[];
}

export function ForensicChecklist({ checks }: ForensicChecklistProps) {
  return (
    <div className="w-full mt-6">
      <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-4">
        <Info className="w-4 h-4 text-sky-400" />
        Forensic Explainer Breakdown
      </h4>
      <div className="space-y-3">
        {checks.map((check, i) => {
          const isGood = check.inverse ? !check.passed : check.passed
          return (
            <div key={i} className="flex items-start gap-3 bg-slate-950/80 p-4 rounded-lg border border-slate-800/50">
              {isGood ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XOctagon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              )}
              <span className={`text-sm ${isGood ? 'text-slate-300' : 'text-rose-200 font-medium'}`}>{check.label}</span>
              
              {check.inverse && check.passed && (
                <span className="ml-auto text-[10px] font-mono text-rose-500 border border-rose-500/30 px-2 py-0.5 rounded bg-rose-500/10 uppercase">
                  Flagged Anomalous
                </span>
              )}
              {!check.inverse && !check.passed && (
                <span className="ml-auto text-[10px] font-mono text-rose-500 border border-rose-500/30 px-2 py-0.5 rounded bg-rose-500/10 uppercase">
                  Failed Verification
                </span>
              )}
              {isGood && (
                <span className="ml-auto text-[10px] font-mono text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/10 uppercase">
                  Clear
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
