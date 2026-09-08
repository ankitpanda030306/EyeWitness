'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import logoImg from '../public/eyewitness-dashboard-logo.png'
import { Eye, ShieldCheck, Database, Cpu, Image as ImageIcon, FileText, Link2, Mic, Activity, Clock } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col items-center p-6 lg:p-12 w-full max-w-6xl mx-auto space-y-12">
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight flex items-center justify-center gap-5">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-cyan-500/40 bg-slate-900 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.2)]">
            <Image 
              src={logoImg}
              alt="EyeWitness Emblem" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="uppercase font-sans tracking-widest flex items-center gap-3">
            EyeWitness
          </span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          The unified forensic intelligence platform for detecting deepfakes, synthetic audio, and cross-referencing global registries.
        </p>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <Link href="/visual" className="group bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl p-6 transition-all hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.2)]">
          <div className="bg-slate-950 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform border border-slate-800">
            <ImageIcon className="w-6 h-6 text-sky-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-sky-400 transition-colors">Visual Forensics</h3>
          <p className="text-sm text-slate-500">Analyze images for pixel manipulation, generative AI artifacts, and metadata inconsistencies.</p>
        </Link>
        
        <Link href="/fact-check" className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 transition-all hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]">
          <div className="bg-slate-950 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform border border-slate-800">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-emerald-400 transition-colors">Claim Check</h3>
          <p className="text-sm text-slate-500">Cross-reference textual claims, quotes, and headlines against verified global journalistic databases.</p>
        </Link>

        <Link href="/reels" className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl p-6 transition-all hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)]">
          <div className="bg-slate-950 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform border border-slate-800">
            <Link2 className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-amber-400 transition-colors">Reel Inspector</h3>
          <p className="text-sm text-slate-500">Run a tri-factor audit on social media videos tracking visual integrity, audio sync, and context mismatch.</p>
        </Link>

        <Link href="/voice" className="group bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-xl p-6 transition-all hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.2)]">
          <div className="bg-slate-950 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform border border-slate-800">
            <Mic className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-purple-400 transition-colors">Voice Biometrics</h3>
          <p className="text-sm text-slate-500">Extract vocal tract characteristics to detect synthetic speech, AI cloning, and deepfake vocoders.</p>
        </Link>
      </div>

      {/* Telemetry Metrics */}
      <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-8">
        <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-500" />
          Forensic Trust Architecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 flex items-center gap-4">
            <Cpu className="w-8 h-8 text-slate-600" />
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">DETECTION CORE</span>
              <span className="text-cyan-400 text-sm font-mono block">EyeWitness Neural Core v2.4</span>
              <span className="text-slate-400 text-xs block">Dual-Stream Spatial Transformer</span>
            </div>
          </div>
          <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-slate-600" />
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">VERIFICATION STANDARD</span>
              <span className="text-emerald-400 text-sm font-mono block">C2PA Cryptographic Protocol</span>
              <span className="text-slate-400 text-xs block">Ephemeral RAM Enclave (Zero-Log)</span>
            </div>
          </div>
          <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 flex items-center gap-4">
            <Clock className="w-8 h-8 text-slate-600" />
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">BENCHMARK PERFORMANCE</span>
              <span className="text-amber-400 text-sm font-mono block">~280ms Multi-Spectral Scan</span>
              <span className="text-slate-400 text-xs block">99.4% Calibrated Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}