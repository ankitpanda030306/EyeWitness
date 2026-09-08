'use client'

import React, { useState, useRef } from 'react'
import { Mic, Activity, Loader2, FileAudio, Play } from 'lucide-react'
import { verifyVoice } from '@/lib/api'
import { VoiceAnalysisResponse } from '@/lib/api-types'
import { AuditGauge } from '@/components/AuditGauge'
import { ForensicChecklist } from '@/components/ForensicChecklist'
import { TerminalLoader, AnalysisStage } from '@/components/TerminalLoader'
import { TemporalScrubber } from '@/components/TemporalScrubber'
import { LayoutDashboard, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function VoicePage() {
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStage, setCurrentStage] = useState<AnalysisStage>('extracting')
  const [result, setResult] = useState<VoiceAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const handleAnalyze = async () => {
    if (!selectedAudio) return
    setIsAnalyzing(true)
    setCurrentStage('extracting')
    setResult(null)
    setError(null)

    const stageTimer1 = setTimeout(() => setCurrentStage('analyzing'), 1200)
    const stageTimer2 = setTimeout(() => setCurrentStage('verifying'), 2500)

    try {
      const data = await verifyVoice(selectedAudio)
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
          <Mic className="w-8 h-8 text-purple-400" />
          Speech & Audio Biometrics
        </h1>
        <p className="text-slate-400">Extract vocal tract characteristics to detect synthetic speech and AI cloning.</p>
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
            <div 
            className="border-2 border-dashed border-slate-700 hover:border-purple-500/50 bg-slate-950/50 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors"
            onClick={() => audioInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) setSelectedAudio(e.dataTransfer.files[0]) }}
          >
            <input type="file" ref={audioInputRef} hidden accept="audio/*" onChange={e => e.target.files?.[0] && setSelectedAudio(e.target.files[0])} />
            {selectedAudio ? (
              <div className="flex flex-col items-center gap-3 w-full max-w-md">
                <FileAudio className="w-12 h-12 text-purple-400" />
                <span className="text-slate-200 font-medium">{selectedAudio.name}</span>
                <div className="w-full h-12 bg-slate-900 rounded-md flex items-center justify-center overflow-hidden relative border border-slate-800 mt-2">
                  <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTTAgNWgzbDIgM2wyLTZsMiA2bDIgLTZsMiAzSDE1IiBmaWxsPSJub25lIiBzdHJva2U9IiNhODU1ZjciIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] bg-repeat-x bg-[length:30px_10px] bg-center" />
                  <Play className="w-5 h-5 text-purple-400 relative z-10" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-10">
                <Mic className="w-12 h-12 text-slate-500" />
                <span className="text-slate-300 font-medium text-lg">Upload audio for vocal tract analysis</span>
                <span className="text-slate-500 text-sm">Supports WAV, MP3, M4A, OGG</span>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleAnalyze}
              disabled={!selectedAudio || isAnalyzing}
              className="bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold px-8 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
              {isAnalyzing ? 'Extracting mel-frequency cepstral coefficients...' : 'Extract Speech Biometrics'}
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
                <h2 className="text-2xl font-bold text-slate-100">Acoustic Biometric Scan</h2>
                <p className="text-slate-400 mt-1 text-sm">Automated Evidence-Backed Intelligence Report</p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <AuditGauge score={result.voiceType === 'HUMAN_AUTHENTIC' ? 100 - result.cloningProbability : result.cloningProbability} />
                {/* PDF Export omitted */}
              </div>
            </div>

            {/* Audio Waveform / Scrubber */}
            <div className="mb-8">
              <TemporalScrubber hasAnomalies={result.voiceType !== 'HUMAN_AUTHENTIC'} />
            </div>

            <ForensicChecklist checks={[
              { label: "Vocal Tract Anatomy Consistency", passed: result.voiceType === 'HUMAN_AUTHENTIC' },
              { label: "Temporal Breathing Pattern Realism", passed: result.voiceType === 'HUMAN_AUTHENTIC' },
              { label: "Synthetic Glottal Pulse Detected", passed: result.voiceType === 'HUMAN_AUTHENTIC', inverse: true },
              { label: "Deepfake Vocoder Phase Anomalies", passed: result.voiceType === 'HUMAN_AUTHENTIC', inverse: true },
              { label: "Acoustic Flattening", passed: result.voiceType === 'HUMAN_AUTHENTIC', inverse: true }
            ]} />
            
            <div className="mt-8 bg-slate-950 border border-slate-800 p-4 rounded-lg text-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Cloning Probability Score</span>
              <span className={`text-2xl font-mono font-bold ${result.cloningProbability > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.cloningProbability.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
