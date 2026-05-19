// src/pages/Status.jsx
// Platform status page — public, no auth required

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function StatusPage() {
  const [dbStatus,  setDbStatus]  = useState('checking')
  const [authStatus, setAuthStatus] = useState('checking')
  const [checked,   setChecked]   = useState(null)

  useEffect(() => {
    checkServices()
  }, [])

  async function checkServices() {
    const now = new Date()

    // Check database
    try {
      const { error } = await supabase.from('medicines').select('id').limit(1)
      setDbStatus(error ? 'degraded' : 'operational')
    } catch {
      setDbStatus('degraded')
    }

    // Check auth
    try {
      const { error } = await supabase.auth.getSession()
      setAuthStatus(error ? 'degraded' : 'operational')
    } catch {
      setAuthStatus('degraded')
    }

    setChecked(now)
  }

  const allOperational = dbStatus === 'operational' && authStatus === 'operational'
  const anyDegraded    = dbStatus === 'degraded'    || authStatus === 'degraded'

  const SERVICES = [
    { name: 'Medicine Network',      desc: 'Real-time availability search across verified facilities', status: dbStatus },
    { name: 'Facility Authentication', desc: 'Sign in, registration, and session management',          status: authStatus },
    { name: 'Transfer Pipeline',     desc: 'Stock redistribution requests and approvals',              status: dbStatus },
    { name: 'Shortage Alerts',       desc: 'Automatic alert generation and email notifications',       status: dbStatus },
    { name: 'Inventory Management',  desc: 'Batch tracking, quantity updates, and audit trail',        status: dbStatus },
    { name: 'Admin Control Panel',   desc: 'Facility verification and dispute resolution',             status: dbStatus },
  ]

  function StatusDot({ status }) {
    const colors = { operational: '#22c55e', degraded: '#ef4444', checking: '#f5a524' }
    return (
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: colors[status] || '#4a6d8c',
        animation: status === 'checking' ? 'pulse 1.5s infinite' : 'none',
        flexShrink: 0,
      }} />
    )
  }

  function StatusLabel({ status }) {
    const config = {
      operational: { label: 'Operational',  color: '#22c55e' },
      degraded:    { label: 'Degraded',     color: '#ef4444' },
      checking:    { label: 'Checking…',    color: '#f5a524' },
    }
    const c = config[status] || config.checking
    return (
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11, fontWeight: 600,
        color: c.color,
        background: `${c.color}15`,
        border: `1px solid ${c.color}30`,
        borderRadius: 3, padding: '2px 8px',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {c.label}
      </span>
    )
  }

  return (
    <>
      <style>{`
        .st *, .st *::before, .st *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .st {
          font-family: 'DM Sans', -apple-system, sans-serif;
          background: #050f1a;
          color: #f0f6ff;
          line-height: 1.6;
          min-height: 100vh;
          overflow-y: auto;
        }
        .st::before {
          content: ''; position: fixed; inset: 0;
          background-image: linear-gradient(rgba(25,194,181,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(25,194,181,0.02) 1px,transparent 1px);
          background-size: 48px 48px; pointer-events: none; z-index: 0;
        }
        .st-nav { position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:56px;background:rgba(5,15,26,0.95);backdrop-filter:blur(20px);border-bottom:1px solid #1a3050; }
        .st-brand { display:flex;align-items:center;gap:9px;text-decoration:none; }
        .st-logo { width:26px;height:26px;background:#19c2b5;border-radius:5px;display:flex;align-items:center;justify-content:center; }
        .st-logo svg { width:12px;height:12px;color:#050f1a; }
        .st-name { font-size:14px;font-weight:600;color:#f0f6ff;letter-spacing:-0.02em; }
        .st-tag { font-size:11px;color:#4a6d8c;margin-left:4px; }
        .st-back { font-size:13px;color:#8bb4d4;text-decoration:none;display:flex;align-items:center;gap:5px;transition:color 0.15s; }
        .st-back:hover { color:#f0f6ff; }
        .st-body { max-width:720px;margin:0 auto;padding:88px 48px 96px;position:relative;z-index:1; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .st-footer { border-top:1px solid #1a3050;padding:24px 48px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;position:relative;z-index:1; }
        .st-footer-brand { font-size:12px;color:#4a6d8c; }
        .st-footer-links { display:flex;gap:16px; }
        .st-footer-links a { font-size:11.5px;color:#4a6d8c;text-decoration:none;transition:color 0.15s; }
        .st-footer-links a:hover { color:#8bb4d4; }
        @media (max-width:640px) {
          .st-nav { padding:0 24px; }
          .st-body { padding:80px 24px 64px; }
          .st-footer { padding:20px 24px;flex-direction:column;align-items:flex-start; }
        }
      `}</style>

      <div className="st">
        <nav className="st-nav">
          <a href="/ng" className="st-brand">
            <div className="st-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg></div>
            <span className="st-name">Orela Nigeria</span>
            <span className="st-tag">/ Status</span>
          </a>
          <a href="/ng" className="st-back">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to site
          </a>
        </nav>

        <div className="st-body">

          {/* Overall status banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '20px 24px',
            background: allOperational ? 'rgba(34,197,94,0.06)' : anyDegraded ? 'rgba(239,68,68,0.06)' : 'rgba(245,165,36,0.06)',
            border: `1px solid ${allOperational ? 'rgba(34,197,94,0.2)' : anyDegraded ? 'rgba(239,68,68,0.2)' : 'rgba(245,165,36,0.2)'}`,
            borderRadius: 10, marginBottom: 40,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8, flexShrink: 0,
              background: allOperational ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {allOperational ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                  <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              )}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f6ff', marginBottom: 2 }}>
                {dbStatus === 'checking'
                  ? 'Checking system status…'
                  : allOperational
                  ? 'All systems operational'
                  : 'Service disruption detected'}
              </div>
              <div style={{ fontSize: 12, color: '#8bb4d4' }}>
                {checked
                  ? `Last checked ${checked.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · orela.africa/ng`
                  : 'Checking now…'}
              </div>
            </div>
            <button
              onClick={checkServices}
              style={{
                marginLeft: 'auto', flexShrink: 0,
                background: 'none', border: '1px solid #1a3050',
                borderRadius: 5, padding: '6px 12px',
                fontSize: 12, color: '#8bb4d4', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.color='#f0f6ff'; e.target.style.borderColor='#223a58' }}
              onMouseLeave={e => { e.target.style.color='#8bb4d4'; e.target.style.borderColor='#1a3050' }}
            >
              Refresh
            </button>
          </div>

          {/* Service list */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4a6d8c', marginBottom: 14 }}>
              Platform services
            </div>
            <div style={{ background: '#0a1828', border: '1px solid #1a3050', borderRadius: 10, overflow: 'hidden' }}>
              {SERVICES.map((svc, i) => (
                <div key={svc.name} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px',
                  borderBottom: i < SERVICES.length - 1 ? '1px solid #1a3050' : 'none',
                }}>
                  <StatusDot status={svc.status} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f0f6ff', marginBottom: 1 }}>{svc.name}</div>
                    <div style={{ fontSize: 11.5, color: '#4a6d8c' }}>{svc.desc}</div>
                  </div>
                  <StatusLabel status={svc.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4a6d8c', marginBottom: 14 }}>
              Infrastructure
            </div>
            <div style={{ background: '#0a1828', border: '1px solid #1a3050', borderRadius: 10, overflow: 'hidden' }}>
              {[
                { name: 'Database',    provider: 'Supabase · eu-west-2 London',  status: dbStatus },
                { name: 'Frontend',   provider: 'Vercel · Global CDN',           status: 'operational' },
                { name: 'Email',      provider: 'Resend · US East',              status: 'operational' },
              ].map((inf, i) => (
                <div key={inf.name} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 20px',
                  borderBottom: i < 2 ? '1px solid #1a3050' : 'none',
                }}>
                  <StatusDot status={inf.status} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f6ff' }}>{inf.name}</span>
                    <span style={{ fontSize: 11.5, color: '#4a6d8c', marginLeft: 10 }}>{inf.provider}</span>
                  </div>
                  <StatusLabel status={inf.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Incident history placeholder */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4a6d8c', marginBottom: 14 }}>
              Recent incidents
            </div>
            <div style={{
              background: '#0a1828', border: '1px solid #1a3050',
              borderRadius: 10, padding: '32px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, color: '#22c55e', marginBottom: 4 }}>✓ No incidents reported</div>
              <div style={{ fontSize: 12, color: '#4a6d8c' }}>All systems have been operating normally.</div>
            </div>
          </div>

          {/* Report issue */}
          <div style={{
            marginTop: 40, padding: '16px 20px',
            background: '#0a1828', border: '1px solid #1a3050',
            borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f6ff', marginBottom: 2 }}>Experiencing an issue?</div>
              <div style={{ fontSize: 12, color: '#4a6d8c' }}>Contact us if you're seeing problems not reflected here.</div>
            </div>
            <a href="mailto:hello@orela.africa" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', background: '#19c2b5', color: '#050f1a',
              fontSize: 13, fontWeight: 600, borderRadius: 5,
              textDecoration: 'none', flexShrink: 0,
            }}>
              Report issue
            </a>
          </div>
        </div>

        <footer className="st-footer">
          <div className="st-footer-brand">Orela Nigeria · Medicine availability infrastructure</div>
          <div style={{fontSize:11,color:'#1e3a52',marginBottom:6}}>© 2026 Orela Network. All rights reserved.</div>
          <div className="st-footer-links">
            <a href="/ng">Home</a>
            <a href="/ng/docs">Docs</a>
            <a href="/ng/privacy">Privacy</a>
            <a href="mailto:hello@orela.africa">Contact</a>
          </div>
        </footer>
      </div>
    </>
  )
}
