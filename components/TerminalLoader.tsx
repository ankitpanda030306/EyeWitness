'use client'

import React, { useState, useEffect, useRef } from 'react'

export type AnalysisStage = 'extracting' | 'analyzing' | 'verifying' | 'complete'

interface TerminalLoaderProps {
  stage: AnalysisStage
}

const LOG_MESSAGES = [
  "> [SYS] Initializing dual-stream spatial tensors... [OK]",
  "> [SEC] Extracting C2PA cryptographic manifest... [NO SIGNATURE FOUND]",
  "> [AI] Querying SynthID watermark frequencies... [SCANNING]",
  "> [NET] Cross-referencing Google Fact Check registries... [AWAITING RESPONSE]",
  "> [SYS] Bootstrapping neural heuristic engine... [OK]",
  "> [AI] Analyzing temporal coherence and frame deltas... [PROCESSING]",
  "> [SEC] Verifying pixel continuity... [DONE]",
  "> [NET] Fetching updated threat signatures... [OK]",
  "> [SYS] Correlating biometric markers... [IN PROGRESS]",
  "> [AI] Executing generative footprint detection... [DONE]",
]

export function TerminalLoader({ stage }: TerminalLoaderProps) {
  const [logs, setLogs] = useState<string[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let currentIndex = 0
    let timeoutId: NodeJS.Timeout
    let isActive = true

    const addLog = () => {
      if (!isActive) return
      if (currentIndex < LOG_MESSAGES.length) {
        setLogs(prev => [...prev, LOG_MESSAGES[currentIndex]])
        currentIndex++
        const delay = Math.floor(Math.random() * (400 - 100 + 1) + 100)
        timeoutId = setTimeout(addLog, delay)
      } else {
        // Loop or add repetitive logs if it takes too long
        setLogs(prev => [...prev, `> [SYS] Polling process ${Math.floor(Math.random() * 1000)}... [WAITING]`])
        timeoutId = setTimeout(addLog, 800)
      }
    }

    timeoutId = setTimeout(addLog, 150)

    return () => {
      isActive = false
      clearTimeout(timeoutId)
    }
  }, [stage])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-64 flex flex-col w-full">
      <div className="flex items-center px-4 py-3 bg-slate-900 border-b border-slate-800 gap-2">
        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        <span className="ml-2 text-slate-500 text-xs font-mono font-medium uppercase tracking-wider">
          Terminal - {stage}
        </span>
      </div>
      <div className="p-4 overflow-y-auto flex-1 font-mono text-sm text-emerald-400 space-y-1">
        {logs.map((log, index) => (
          <div key={index} className="break-all">{log}</div>
        ))}
        <div className="animate-pulse">_</div>
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}
