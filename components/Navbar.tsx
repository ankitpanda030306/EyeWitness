'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import logoImg from '../public/eyewitness-nav-logo.png'
import { Cpu, Database, FileText, Link2, Mic, LayoutDashboard, ShieldCheck, Image as ImageIcon, Menu, X, AlertCircle } from 'lucide-react'
import { HEALTH_ENDPOINT } from '@/lib/api'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/visual', label: 'Visual Forensics', icon: ImageIcon },
  { href: '/fact-check', label: 'Claim Check', icon: FileText },
  { href: '/reels', label: 'Reel Inspector', icon: Link2 },
  { href: '/voice', label: 'Voice Biometrics', icon: Mic },
]

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isApiUp, setIsApiUp] = useState<boolean | null>(null)

  // Close the menu on route navigation
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Ping API Health on load
  useEffect(() => {
    fetch(HEALTH_ENDPOINT)
      .then(res => setIsApiUp(res.ok))
      .catch(() => setIsApiUp(false))
  }, [])

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6">
      <div className="w-full flex items-center justify-between h-16 gap-4">

        {/* Left Side: Brand & Links */}
        <div className="flex items-center gap-5 min-w-0">
          <Link className="flex items-center gap-2.5 shrink-0 group" href="/">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-500/40 bg-slate-900 flex items-center justify-center shadow-sm shrink-0">
              <Image 
                src={logoImg}
                alt="EyeWitness Emblem" 
                className="w-full h-full object-cover shrink-0"
              />
            </div>
            <span className="text-slate-100 font-bold tracking-wider text-base uppercase font-sans group-hover:text-white transition-colors shrink-0">
              EyeWitness
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 shrink-0">
            {navLinks.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap rounded-lg transition-colors ${isActive
                      ? 'text-sky-400 bg-sky-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                >
                  <link.icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Side: Telemetry Badges */}
        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <div className="hidden lg:flex items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap bg-slate-900/80 border ${isApiUp === false ? 'border-rose-900/50' : 'border-slate-800'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isApiUp === false ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`} />
              <Cpu className={`w-3 h-3 ${isApiUp === false ? 'text-rose-500' : 'text-emerald-400'}`} />
              <span className="text-slate-300">API: <span className={`${isApiUp === false ? 'text-rose-500' : 'text-emerald-400'} font-bold`}>{isApiUp === false ? 'Offline' : isApiUp === true ? 'Online' : 'Checking'}</span></span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap bg-slate-900/80 border border-slate-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-300">Fact-Check: <span className="text-emerald-400 font-bold">Synced</span></span>
            </div>

            <div className="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap bg-slate-900/80 border border-slate-800 group/badge cursor-help">
              <ShieldCheck className="w-3 h-3 text-sky-400" />
              <span className="text-sky-300 font-bold">Zero-Knowledge</span>

              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded shadow-xl p-2 opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none text-[10px] text-slate-400 z-50 whitespace-normal">
                Ephemeral RAM-Only Processing &bull; 0 Bytes Stored &bull; Automatic Session Purge
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden w-full border-b border-slate-800 bg-[#050811]/95 backdrop-blur-xl px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-sky-400 bg-sky-500/10 border-l-2 border-sky-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'
                  }`}
                >
                  <link.icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  {link.label}
                </Link>
              )
            })}
          </nav>
          
          {/* Mobile Telemetry Indicators */}
          <div className="pt-4 mt-2 border-t border-slate-800/80 flex flex-col gap-2">
            <div className={`flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg border ${isApiUp === false ? 'border-rose-900/50' : 'border-slate-800/50'}`}>
              <div className="flex items-center gap-1.5">
                <Cpu className={`w-3.5 h-3.5 ${isApiUp === false ? 'text-rose-500' : 'text-emerald-400'}`} />
                <span>API Status</span>
              </div>
              <span className={`${isApiUp === false ? 'text-rose-500' : 'text-emerald-400'} font-bold flex items-center gap-1.5`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isApiUp === false ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`} />
                {isApiUp === false ? 'Offline' : isApiUp === true ? 'Online' : 'Checking'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800/50">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fact-Check</span>
              </div>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Synced
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800/50">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Zero-Knowledge</span>
              </div>
              <span className="text-sky-300 font-bold">Active</span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}