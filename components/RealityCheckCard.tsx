import React from 'react'
import { XOctagon, CheckCircle2, Database, ExternalLink } from 'lucide-react'

interface RealityCheckCardProps {
  claimObj: {
    allegation: string;
    reality: string;
    citation?: {
      publisher?: string;
      url?: string;
      rating?: string;
    };
  }
}

export function RealityCheckCard({ claimObj }: RealityCheckCardProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex-1 bg-rose-950/20 border border-rose-900/30 rounded-lg p-5">
          <h4 className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <XOctagon className="w-4 h-4" /> The Viral Claim
          </h4>
          <p className="text-rose-200/80 text-sm leading-relaxed">&quot;{claimObj.allegation}&quot;</p>
        </div>
        <div className="flex-1 bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-5">
          <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Ground Truth
          </h4>
          <p className="text-emerald-200/80 text-sm leading-relaxed">{claimObj.reality}</p>
        </div>
      </div>

      {claimObj.citation?.publisher && (
        <div>
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Direct Source Evidence</h4>
          <a href={claimObj.citation.url || '#'} target="_blank" rel="noopener noreferrer" className="block bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-lg transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2 rounded-md border border-slate-700">
                  <Database className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <span className="text-slate-200 font-medium block group-hover:text-sky-400 transition-colors">{claimObj.citation.publisher}</span>
                  <span className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                    Publisher Rating: <span className="font-bold text-slate-300">{claimObj.citation.rating || 'N/A'}</span>
                  </span>
                </div>
              </div>
              {claimObj.citation.url && <ExternalLink className="w-5 h-5 text-slate-600 group-hover:text-sky-400 transition-colors" />}
            </div>
          </a>
        </div>
      )}
    </div>
  )
}
