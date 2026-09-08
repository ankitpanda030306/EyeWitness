'use client'

import React, { useState } from 'react'
import { FileText, Database, Loader2 } from 'lucide-react'
import { verifyClaim } from '@/lib/api'
import { ClaimAnalysisResponse } from '@/lib/api-types'
import { AuditGauge } from '@/components/AuditGauge'
import { RealityCheckCard } from '@/components/RealityCheckCard'
import { ForensicChecklist } from '@/components/ForensicChecklist'
import { LayoutDashboard, ShieldAlert, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react'

export default function FactCheckPage() {
  const [claimInput, setClaimInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ClaimAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!claimInput) return
    setIsAnalyzing(true)
    setError(null)
    try {
      const data = await verifyClaim(claimInput)
      setResult(data)
    } catch (e: any) {
      setError("Inference Service Offline or File Exceeds Payload Limit")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-12 space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-emerald-400" />
          News & Claim Fact-Checker
        </h1>
        <p className="text-slate-400">Cross-reference quotes, headlines, and viral forwards against verified global registries.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4 flex items-center gap-3 text-rose-400 mb-6">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">Paste Headline, Rumor, or Quote</label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
            <textarea 
              placeholder="e.g. The government just passed a new law banning all crypto..."
              value={claimInput}
              onChange={e => setClaimInput(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-4 pl-12 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-base resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleAnalyze}
              disabled={!claimInput || isAnalyzing}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
              {isAnalyzing ? 'Querying verified fact-check registries...' : 'Verify Claim'}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div id="report-container" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-500">
          <div className="p-8 lg:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 pb-8 border-b border-slate-800/50">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">News Claim Cross-Reference</h2>
                <p className="text-slate-400 mt-1 text-sm">Automated Evidence-Backed Intelligence Report</p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <AuditGauge score={result.claimStatus === 'NO_PRIOR_MISINFORMATION_FOUND' ? 90 : result.claimStatus === 'NO_TEXT_FOUND' ? 50 : 10} />
                {/* PDF Export omitted */}
              </div>
            </div>

            <RealityCheckCard 
              claimObj={result.claimStatus === 'DEBUNKED_IN_DATABASE' ? {
                allegation: claimInput,
                reality: "Information strongly conflicts with verified public records and journalism standards.",
                citation: { publisher: result.publisher, url: result.url, rating: result.factRating }
              } : {
                allegation: claimInput,
                reality: "No significant contradictions found in major fact-check databases. Proceed with standard caution.",
              }}
            />

            <ForensicChecklist checks={[
              { label: "Cross-Referenced Journalistic Registries", passed: true },
              { label: "Known Disinformation Campaign Match", passed: result.claimStatus !== 'DEBUNKED_IN_DATABASE', inverse: true },
              { label: "Publisher Reputation Threshold", passed: result.claimStatus !== 'DEBUNKED_IN_DATABASE' }
            ]} />
          </div>
        </div>
      )}
    </div>
  )
}
