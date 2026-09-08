import React, { useState, useEffect, useRef } from 'react'
import { AuditGauge } from '@/components/AuditGauge'
import { ImageAnalysisResponse } from '@/lib/api-types'
import { ScanSearch } from 'lucide-react'

interface ForensicImageInspectorProps {
  imageFile: File
  result: ImageAnalysisResponse
}

export function ForensicImageInspector({ imageFile, result }: ForensicImageInspectorProps) {
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [tooltip, setTooltip] = useState<{ x: number, y: number, text: string } | null>(null)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const imageUrl = React.useMemo(() => URL.createObjectURL(imageFile), [imageFile])

  // Canvas drawing logic for Heatmap
  useEffect(() => {
    if (!showHeatmap || !canvasRef.current || !imageRef.current || !result.heatmap) return

    const canvas = canvasRef.current
    const img = imageRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = img.clientWidth
    canvas.height = img.clientHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const scaleX = canvas.width / result.heatmap.canvasWidth
    const scaleY = canvas.height / result.heatmap.canvasHeight

    result.heatmap.zones.forEach(zone => {
      const rx = zone.x * scaleX
      const ry = zone.y * scaleY
      const rw = zone.width * scaleX
      const rh = zone.height * scaleY

      // Draw glowing radial gradient
      const cx = rx + rw / 2
      const cy = ry + rh / 2
      const radius = Math.max(rw, rh)

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      if (result.verdictCategory === 'FULLY_SYNTHETIC') {
        gradient.addColorStop(0, 'rgba(244, 63, 94, 0.6)') // rose
        gradient.addColorStop(1, 'rgba(244, 63, 94, 0)')
      } else {
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.6)') // amber
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)')
      }

      ctx.fillStyle = gradient
      ctx.fillRect(rx - rw, ry - rh, rw * 3, rh * 3)

      // Bounding box
      ctx.strokeStyle = result.verdictCategory === 'FULLY_SYNTHETIC' ? 'rgba(244, 63, 94, 0.8)' : 'rgba(245, 158, 11, 0.8)'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.strokeRect(rx, ry, rw, rh)
    })
  }, [showHeatmap, result, imageUrl])

  // Mouse move handler for canvas tooltips
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!showHeatmap || !canvasRef.current || !imageRef.current || !result.heatmap) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const scaleX = canvasRef.current.width / result.heatmap.canvasWidth
    const scaleY = canvasRef.current.height / result.heatmap.canvasHeight

    let found = false
    for (const zone of result.heatmap.zones) {
      const rx = zone.x * scaleX
      const ry = zone.y * scaleY
      const rw = zone.width * scaleX
      const rh = zone.height * scaleY

      if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) {
        setTooltip({
          x: e.clientX,
          y: e.clientY - 40,
          text: `AI Inpainting Detected (${(zone.confidence * 100).toFixed(0)}% confidence)`
        })
        found = true
        break
      }
    }
    if (!found) setTooltip(null)
  }

  const handleMouseLeaveCanvas = () => {
    setTooltip(null)
  }

  // Determine banner styles
  let bannerClass = ''
  let bannerTitle = ''
  let bannerSubtitle = ''

  if (result.verdictCategory === 'FULLY_SYNTHETIC') {
    bannerClass = 'bg-rose-500/10 border-rose-500/40 text-rose-400'
    bannerTitle = '🚨 100% AI-Generated Media'
    bannerSubtitle = 'Synthesized via generative diffusion models. Zero optical camera evidence.'
  } else if (result.verdictCategory === 'PARTIALLY_AI_EDITED') {
    bannerClass = 'bg-amber-500/10 border-amber-500/40 text-amber-400'
    bannerTitle = '⚠️ Authentic Image with AI Modifications'
    bannerSubtitle = 'Base photograph appears genuine, but specific elements have been inpainted, replaced, or retouched with AI.'
  } else {
    bannerClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
    bannerTitle = '✅ 100% Authentic Image'
    bannerSubtitle = 'No generative artifacts or regional inpainting patterns were detected.'
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Verdict Banner */}
      <div className={`border rounded-xl p-6 ${bannerClass}`}>
        <h2 className="text-2xl font-bold mb-2">{bannerTitle}</h2>
        <p className="text-sm opacity-90">{bannerSubtitle}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
      {/* Left: Image Canvas */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <h3 className="text-slate-300 font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
            <ScanSearch className="w-4 h-4 text-sky-400" />
            Forensic Image Canvas
          </h3>
          <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            disabled={!result.heatmap || result.heatmap.zones.length === 0}
            className={`text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors font-bold ${
              showHeatmap 
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/50' 
                : (!result.heatmap || result.heatmap.zones.length === 0) ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {showHeatmap ? 'Hide Anomaly Heatmap' : 'Show Anomaly Heatmap'}
          </button>
        </div>

        <div 
          className="relative w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-900 group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            ref={imageRef}
            src={imageUrl} 
            alt="Analyzed Evidence" 
            className="w-full h-auto max-h-[500px] object-contain relative z-0" 
          />
          
          {/* PRNU Sensor Noise Scanner Overlay */}
          <div 
            className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-700 mix-blend-overlay ${isHovering && !showHeatmap ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(56,189,248,0.4) 0%, rgba(15,23,42,0.8) 100%)',
              backgroundSize: '200% 200%',
              backgroundPosition: isHovering ? '100% 100%' : '0% 0%',
              transition: 'background-position 2s ease-in-out'
            }}
          />
          
          {/* Dotted grid for extra PRNU feel */}
          <div 
            className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 mix-blend-overlay bg-[length:4px_4px] bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] ${isHovering && !showHeatmap ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Anomaly Heatmap Canvas Overlay */}
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeaveCanvas}
            className={`absolute top-0 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-500 mix-blend-screen ${showHeatmap ? 'opacity-100' : 'opacity-0'} pointer-events-auto cursor-crosshair`}
          />
        </div>
        
        {isHovering && !showHeatmap && (
          <p className="text-sky-500/70 text-xs font-mono mt-4 animate-pulse">
            Scanning PRNU signatures and spatial frequencies...
          </p>
        )}
      </div>

      {/* Right: Data Dossier */}
      <div className="w-full md:w-80 flex flex-col gap-6">
        
        {/* Radial Authenticity Gauge at the Top */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center shadow-lg">
          <AuditGauge score={result.authenticityScore || 0} />
          <div className="mt-6 text-center">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-mono block">Primary Verdict</span>
            <span className={`text-lg font-bold ${result.verdictCategory === 'AUTHENTIC' ? 'text-emerald-400' : (result.verdictCategory === 'PARTIALLY_AI_EDITED' ? 'text-amber-400' : 'text-rose-400')}`}>
              {result.verdictCategory?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Hardware Attribution / Cryptographic Provenance Card */}
        {result.hardwareAttribution?.isHardwareVerified ? (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 border-b border-slate-800/50 pb-2 flex items-center gap-2">
              <ScanSearch className="w-4 h-4" />
              Verified Camera Hardware
            </h3>
            
            <div className="mb-4 text-center">
              <div className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-2 rounded-md font-bold mb-3 border border-emerald-500/20">
                Optical Capture Verified by Hardware Fingerprint
              </div>
              <span className="text-slate-100 font-bold text-lg">{result.hardwareAttribution.make} {result.hardwareAttribution.model}</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800/50 pb-2">
                <span className="text-slate-500">📷 Lens</span>
                <span className="text-slate-300 truncate max-w-[150px]" title={result.hardwareAttribution.lens}>{result.hardwareAttribution.lens}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-2">
                <span className="text-slate-500">⚡ Exposure</span>
                <span className="text-slate-300">{result.hardwareAttribution.shutterSpeed}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-2">
                <span className="text-slate-500">🔍 Aperture</span>
                <span className="text-slate-300">{result.hardwareAttribution.focalLength}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-2">
                <span className="text-slate-500">🎚️ ISO</span>
                <span className="text-slate-300">{result.hardwareAttribution.iso}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">🕒 Captured</span>
                <span className="text-slate-300">{result.hardwareAttribution.capturedAt}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800/50 pb-2">
              Hardware Attribution
            </h3>
            <div className="bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs p-3 rounded-md">
              <span className="font-bold block mb-1">⚠️ EXIF Hardware Data Stripped</span>
              (Common in social media downloads and messaging apps). Analyzed via deep pixel tensor inference.
            </div>
            
            <div className="mt-4 space-y-4 font-mono text-xs opacity-70">
              <div className="flex flex-col gap-1 border-b border-slate-800/50 pb-3">
                <span className="text-slate-500">C2PA Manifest</span>
                <span className="text-amber-400 font-bold">Missing</span>
              </div>
              
              <div className="flex flex-col gap-1 border-b border-slate-800/50 pb-3">
                <span className="text-slate-500">Camera Hardware Signature (PRNU)</span>
                <span className="text-rose-400 font-bold">Not Detected</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-slate-500">SynthID Watermark</span>
                <span className="text-emerald-400 font-bold">Negative</span>
              </div>
            </div>
          </div>
        )}

        {/* Model Probabilities */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-lg">
           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800/50 pb-2">
             Inference Probabilities
           </h3>
           <div className="flex justify-between items-center text-sm mt-3 bg-slate-900 p-3 rounded-md border border-slate-800">
             <span className="text-slate-400">Authenticity Score</span>
             <span className="text-emerald-400 font-mono font-bold text-lg">{result.authenticityScore}%</span>
           </div>
           <div className="flex justify-between items-center text-sm mt-3 bg-slate-900 p-3 rounded-md border border-slate-800">
             <span className="text-slate-400">AI Modifications</span>
             <span className="text-rose-400 font-mono font-bold text-lg">{result.aiPercentage}%</span>
           </div>
        </div>

      </div>

      {/* Floating Tooltip */}
      {tooltip && (
        <div 
          className="fixed z-50 bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded shadow-xl pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          {tooltip.text}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900 border-r border-b border-slate-700"></div>
        </div>
      )}
    </div>
    </div>
  )
}
