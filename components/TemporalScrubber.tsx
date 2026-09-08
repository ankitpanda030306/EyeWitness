'use client'

import React, { useMemo, useState } from 'react'

interface TemporalScrubberProps {
  hasAnomalies: boolean
}

export function TemporalScrubber({ hasAnomalies }: TemporalScrubberProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const dataPoints = useMemo(() => {
    const points = Array.from({ length: 20 }, (_, i) => ({
      index: i,
      height: Math.random() * 30 + 10, // Base height 10-40%
      isAnomaly: false,
      timestamp: `0:${(i * 2).toString().padStart(2, '0')}`
    }))

    if (hasAnomalies) {
      // Pick another random anomaly in the second half
      const randomAnomaly = Math.floor(Math.random() * 6) + 12 
      points[randomAnomaly].isAnomaly = true
      points[randomAnomaly].height = Math.random() * 20 + 70

      // Specifically spike around 0:14 (index 7)
      points[7].isAnomaly = true
      points[7].height = 95
      points[7].timestamp = "0:14"
      
      // Maybe a little tail for index 8
      points[8].isAnomaly = true
      points[8].height = 65
    }

    return points
  }, [hasAnomalies])

  return (
    <div className="w-full mt-8 bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-inner relative">
      <div className="flex justify-between items-end h-32 gap-1 relative">
        {dataPoints.map((point) => (
          <div
            key={point.index}
            onMouseEnter={() => setHoveredIndex(point.index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`flex-1 rounded-t-sm transition-all duration-300 cursor-pointer relative ${
              point.isAnomaly ? 'bg-rose-500' : 'bg-emerald-500'
            } hover:opacity-75`}
            style={{ height: `${point.height}%` }}
          >
            {/* Tooltip */}
            {hoveredIndex === point.index && (
              <div 
                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-100 text-xs py-2 px-3 rounded-md shadow-xl whitespace-nowrap z-20 pointer-events-none border border-slate-700 font-mono"
                style={{ 
                  // simple adjustment for first/last elements to prevent clipping
                  transform: point.index < 3 ? 'translateX(0)' : point.index > 16 ? 'translateX(-100%)' : 'translateX(-50%)',
                  left: point.index < 3 ? '0' : point.index > 16 ? '100%' : '50%'
                }}
              >
                <div className="font-bold text-sky-400 mb-1">Timestamp: {point.timestamp}</div>
                {point.isAnomaly ? (
                  <span className="text-rose-400">Audio/Visual Sync Anomaly Detected</span>
                ) : (
                  <span className="text-emerald-400">Authentic Segment</span>
                )}
                {/* Arrow */}
                <div 
                  className="absolute top-full border-4 border-transparent border-t-slate-800"
                  style={{
                    left: point.index < 3 ? '10%' : point.index > 16 ? '90%' : '50%',
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            )}
          </div>
        ))}
        
        {/* Playhead line (mock) */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-sky-500/50 left-1/3 shadow-[0_0_8px_rgba(14,165,233,0.8)] pointer-events-none"></div>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-xs text-slate-500 font-mono uppercase tracking-wider">
        <span>0:00</span>
        <span className="text-sky-500/70 animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          Temporal Synthetic Probability Scrubber
        </span>
        <span>0:40</span>
      </div>
    </div>
  )
}
