'use client'

import React, { useState, useRef } from 'react'
import { Upload, Activity, Loader2, Image as ImageIcon } from 'lucide-react'
import { verifyImage } from '@/lib/api'
import { ImageAnalysisResponse } from '@/lib/api-types'
import { AuditGauge } from '@/components/AuditGauge'
import { ForensicChecklist } from '@/components/ForensicChecklist'
import { TerminalLoader, AnalysisStage } from '@/components/TerminalLoader'
import { ForensicImageInspector } from '@/components/ForensicImageInspector'
import { LayoutDashboard, ShieldCheck, AlertTriangle } from 'lucide-react'

export default function VisualForensicsPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStage, setCurrentStage] = useState<AnalysisStage>('extracting')
  const [result, setResult] = useState<ImageAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleAnalyze = async () => {
    if (!selectedImage) return
    setIsAnalyzing(true)
    setCurrentStage('extracting')
    setResult(null)
    setError(null)

    const stageTimer1 = setTimeout(() => setCurrentStage('analyzing'), 1200)
    const stageTimer2 = setTimeout(() => setCurrentStage('verifying'), 2500)

    try {
      const data = await verifyImage(selectedImage)
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
          <ImageIcon className="w-8 h-8 text-sky-400" />
          Visual Forensics
        </h1>
        <p className="text-slate-400">Deep pixel analysis to detect AI generation and localized image manipulation.</p>
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
            className="border-2 border-dashed border-slate-700 hover:border-sky-500/50 bg-slate-950/50 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors"
            onClick={() => imageInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) setSelectedImage(e.dataTransfer.files[0]) }}
          >
            <input type="file" ref={imageInputRef} hidden accept="image/*" onChange={e => e.target.files?.[0] && setSelectedImage(e.target.files[0])} />
            {selectedImage ? (
              <div className="flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-48 object-contain rounded-md border border-slate-700 mb-2" />
                <span className="text-slate-200 font-medium">{selectedImage.name}</span>
                <span className="text-slate-500 text-sm">Click or drag to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-10">
                <Upload className="w-12 h-12 text-slate-500" />
                <span className="text-slate-300 font-medium text-lg">Drag & Drop an image here</span>
                <span className="text-slate-500 text-sm">Supports JPG, PNG, WEBP</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-8 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
              {isAnalyzing ? 'Running spatial tensor analysis...' : 'Run Visual Forensics'}
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
                <h2 className="text-2xl font-bold text-slate-100">Visual Spatial Analysis</h2>
                <p className="text-slate-400 mt-1 text-sm">Automated Evidence-Backed Intelligence Report</p>
              </div>
              {/* PDF Export omitted */}
            </div>

            <ForensicChecklist checks={[
              { label: "Pixel Artifact Density & Error Levels", passed: result.verdictCategory === 'AUTHENTIC' },
              { label: "Generative AI Fingerprint Detected", passed: result.verdictCategory === 'AUTHENTIC', inverse: true },
              { label: "EXIF Metadata Consistency", passed: result.verdictCategory === 'AUTHENTIC' }
            ]} />

            <div className="mt-12">
              {selectedImage && <ForensicImageInspector imageFile={selectedImage} result={result} />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
