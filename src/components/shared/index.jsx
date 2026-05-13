import { useEffect } from 'react'

/* ── MODAL ── */
export function Modal({ title, subtitle, size = '', onClose, children, footer }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <div style={{ minWidth: 0 }}>
            <h2>{title}</h2>
            {subtitle && <div className="modal-header-sub">{subtitle}</div>}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

/* ── INLINE ALERTS ── */
export function InlineError({ message }) {
  if (!message) return null
  return (
    <div className="inline-alert alert-error">
      <span className="inline-alert-icon">⚠</span>
      <span>{message}</span>
    </div>
  )
}

export function InlineSuccess({ message }) {
  if (!message) return null
  return (
    <div className="inline-alert alert-success">
      <span className="inline-alert-icon">✓</span>
      <span>{message}</span>
    </div>
  )
}

export function InlineInfo({ message }) {
  if (!message) return null
  return (
    <div className="inline-alert alert-info">
      <span className="inline-alert-icon">ℹ</span>
      <span>{message}</span>
    </div>
  )
}

/* ── EMPTY STATE ── */
export function EmptyState({ title, description, actions }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" />
        </svg>
      </div>
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {actions && <div className="empty-state-actions">{actions}</div>}
    </div>
  )
}

/* ── SKELETON ── */
export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div className="skeleton skeleton-text" style={{ width: `${60 + (i * 13) % 35}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ width: '55%', height: 22, marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: '40%', height: 10 }} />
      <div className="skeleton skeleton-text" style={{ width: '70%', height: 10, marginTop: 4 }} />
    </div>
  )
}

/* ── SPINNER ── */
export function Spinner({ size = '' }) {
  return <div className={`spinner ${size}`} />
}

export function SpinnerCenter() {
  return <div className="spinner-center"><div className="spinner spinner-lg" /></div>
}

/* ── BADGE ── */
export function Badge({ className = '', children, dot = false }) {
  return (
    <span className={`badge ${dot ? 'badge-dot' : ''} ${className}`}>
      {children}
    </span>
  )
}

/* ── CONTEXT CARD ── */
export function ContextCard({ title, meta, children }) {
  return (
    <div className="context-card">
      {title && <div className="context-card-title">{title}</div>}
      {meta  && <div className="context-card-sub">{meta}</div>}
      {children}
    </div>
  )
}

/* ── INFO ROWS ── */
export function InfoRows({ rows }) {
  return (
    <div>
      {rows.map(([label, value], i) => (
        <div key={i} className="info-row">
          <span className="info-row-label">{label}</span>
          <span className="info-row-value">{value ?? '—'}</span>
        </div>
      ))}
    </div>
  )
}

/* ── SECTION SHELL ── */
export function SectionShell({ title, action, children }) {
  return (
    <div className="section-shell">
      <div className="section-shell-header">
        <span className="section-shell-title">{title}</span>
        {action}
      </div>
      <div>{children}</div>
    </div>
  )
}

/* ── STAT CARD ── */
export function StatCard({ label, value, desc, accent = '' }) {
  return (
    <div className={`stat-card ${accent ? `ac-${accent}` : ''}`}>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {desc && <div className="stat-sublabel">{desc}</div>}
    </div>
  )
}

/* ── TRANSFER PIPELINE ── */
const PIPELINE = ['Pending', 'Approved', 'In Transit', 'Fulfilled']
const STATUS_IDX = { pending: 0, approved: 1, in_transit: 2, fulfilled: 3 }

export function TransferPipeline({ status }) {
  const idx = STATUS_IDX[status] ?? -1
  if (['rejected', 'cancelled'].includes(status)) {
    return (
      <div className="pipeline-steps">
        <span className="pipeline-step" style={{ color: 'var(--danger)' }}>
          {status === 'rejected' ? 'Rejected' : 'Cancelled'}
        </span>
      </div>
    )
  }
  return (
    <div className="pipeline-steps">
      {PIPELINE.map((step, i) => (
        <span key={step}>
          <span className={`pipeline-step ${i < idx ? 'done' : ''} ${i === idx ? 'active' : ''}`}>
            {i < idx ? '✓ ' : ''}{step}
          </span>
          {i < PIPELINE.length - 1 && <span className="pipeline-sep">›</span>}
        </span>
      ))}
    </div>
  )
}
