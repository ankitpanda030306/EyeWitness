'use client'

import React, { useState } from 'react'
import { Link2, Activity, Loader2, Search } from 'lucide-react'
import { verifyReel } from '@/lib/api'
import { ReelAnalysisResponse } from '@/lib/api-types'
import { AuditGauge } from '@/components/AuditGauge'
import { RealityCheckCard } from '@/components/RealityCheckCard'
import { ForensicChecklist } from '@/components/ForensicChecklist'
import { TerminalLoader, AnalysisStage } from '@/components/TerminalLoader'
import { TemporalScrubber } from '@/components/TemporalScrubber'
import { LayoutDashboard, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function ReelsPage() {
  const [urlInput, setUrlInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStage, setCurrentStage] = useState<AnalysisStage>('extracting')
  const [result, setResult] = useState<ReelAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!urlInput) return
    setIsAnalyzing(true)
    setCurrentStage('extracting')
    setResult(null)
    setError(null)

    const stageTimer1 = setTimeout(() => setCurrentStage('analyzing'), 1200)
    const stageTimer2 = setTimeout(() => setCurrentStage('verifying'), 2500)

    try {
      const data = await verifyReel(urlInput)
      setResult(data)
    } catch (e: any) {
      setError("Inference Service Offline or File Exceeds Payload Limit")
    } finally {
      clearTimeout(stageTimer1)
      clearTimeout(stageTimer2)
      setCurrentStage('complete')
      setTimeout(() => setIsAnalyzing(false), 500)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-12 space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center justify-center gap-3">
          <Link2 className="w-8 h-8 text-amber-400" />
          Social Reel Inspector
        </h1>
        <p className="text-slate-400">Run a tri-factor audit on social media videos tracking visual integrity, audio sync, and context mismatch.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl min-h-[380px] flex flex-col justify-center transition-all duration-500">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4 flex items-center gap-3 text-rose-400 mb-6">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {isAnalyzing ? (
          <div className="w-full animate-in fade-in zoom-in-95 duration-500">
            <TerminalLoader stage={currentStage} />
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500 w-full">
            <label className="block text-sm font-medium text-slate-300">Target URL (TikTok, YouTube Shorts, X/Twitter, Instagram)</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="url"
              placeholder="https://..."
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-4 pl-12 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono text-base"
            />
          </div>
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleAnalyze}
              disabled={!urlInput || isAnalyzing}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
              {isAnalyzing ? 'Scraping metadata & analyzing streams...' : 'Analyze Post'}
            </button>
          </div>
          </div>
        )}
      </div>

      {result && !isAnalyzing && (
        <div id="report-container" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-500">
          <div className="p-8 lg:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 pb-8 border-b border-slate-800/50">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Social Media Authenticity Audit</h2>
                <p className="text-slate-400 mt-1 text-sm">Automated Evidence-Backed Intelligence Report</p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <AuditGauge score={result.overallVerdict === 'AUTHENTIC' ? 95 : result.overallVerdict === 'SUSPICIOUS' ? 55 : result.overallVerdict === 'SYNTHETIC' ? 15 : 50} />
                {/* PDF Export omitted */}
              </div>
            </div>

            {/* Video Metadata Banner */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg mb-8">
              <span className="text-xs text-slate-500 uppercase tracking-wider block mb-2">Video Metadata Extracted</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm"><span className="text-slate-400 block">Title:</span> <span className="text-slate-200">{result.platformMetadata?.title || 'N/A'}</span></div>
                <div className="text-sm"><span className="text-slate-400 block">Author:</span> <span className="text-slate-200">{result.platformMetadata?.author || 'N/A'}</span></div>
                <div className="text-sm"><span className="text-slate-400 block">Duration:</span> <span className="text-slate-200">{result.platformMetadata?.durationSec ? `${result.platformMetadata.durationSec}s` : 'N/A'}</span></div>
              </div>
            </div>

            {/* Temporal Analysis Scrubber */}
            <div className="mb-8">
              <TemporalScrubber hasAnomalies={result.overallVerdict !== 'AUTHENTIC'} />
            </div>

            {result.newsFactCheck?.claimStatus === 'DEBUNKED_IN_DATABASE' && (
              <div className="mb-8">
                <RealityCheckCard 
                  claimObj={{
                    allegation: "Post claims contain manipulated or false narratives",
                    reality: "Fact-checkers have debunked this claim associated with the video context.",
                    citation: { publisher: result.newsFactCheck.publisher, url: result.newsFactCheck.url, rating: result.newsFactCheck.factRating }
                  }}
                />
              </div>
            )}

            <ForensicChecklist checks={[
              { label: "Temporal Realism (Audio/Lip Sync)", passed: result.overallVerdict !== 'SYNTHETIC' },
              { label: "Visual Consistency & Artifact Density", passed: result.overallVerdict === 'AUTHENTIC' },
              { label: "Context Integrity & Metadata Alignment", passed: result.overallVerdict !== 'SYNTHETIC' },
              { label: "Contextual Mismatch Alert", passed: result.overallVerdict !== 'SYNTHETIC', inverse: true }
            ]} />
          </div>
        </div>
      )}
    </div>
  )
}
