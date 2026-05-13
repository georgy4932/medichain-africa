import { useFacility } from '../hooks/useFacility'

/* ────────────────────────────────────────────────────────────────
   Analytics — Inactive operational intelligence modules.
   Modules show their structure + placeholder data.
   Never "coming soon." Always operational-looking.
──────────────────────────────────────────────────────────────── */

const MODULES = [
  {
    id: 'stock-movement',
    title: 'Stock Movement Trend',
    desc: 'Daily receipts vs. dispensed units over the last 30 days',
    accent: 'var(--primary)',
    bars: [
      { label: 'Week 1', in: 68, out: 45 },
      { label: 'Week 2', in: 82, out: 60 },
      { label: 'Week 3', in: 55, out: 70 },
      { label: 'Week 4', in: 91, out: 58 },
    ],
    type: 'dual-bar',
  },
  {
    id: 'expiry-forecast',
    title: 'Expiry Risk Forecast',
    desc: 'Projected batch expirations over the next 6 months',
    accent: 'var(--warning)',
    bars: [
      { label: 'Jan', value: 20 },
      { label: 'Feb', value: 45 },
      { label: 'Mar', value: 30 },
      { label: 'Apr', value: 75 },
      { label: 'May', value: 15 },
      { label: 'Jun', value: 50 },
    ],
    type: 'bar',
  },
  {
    id: 'fast-movers',
    title: 'Fast-Moving Medicines',
    desc: 'Highest consumption rate by unit volume this month',
    accent: 'var(--info)',
    rows: [
      { label: 'Amoxicillin 500mg', pct: 88 },
      { label: 'Artemether/Lumefantrine', pct: 74 },
      { label: 'Metformin 500mg', pct: 63 },
      { label: 'Paracetamol 500mg', pct: 55 },
      { label: 'ORS Sachets', pct: 42 },
    ],
    type: 'ranked',
  },
  {
    id: 'transfer-rate',
    title: 'Transfer Fulfillment Rate',
    desc: 'Percentage of transfer requests successfully fulfilled',
    accent: 'var(--success)',
    kpis: [
      { label: 'Requested',  value: '—' },
      { label: 'Approved',   value: '—' },
      { label: 'Fulfilled',  value: '—' },
      { label: 'Rejected',   value: '—' },
    ],
    type: 'kpi-grid',
  },
  {
    id: 'essential-coverage',
    title: 'Essential Medicine Coverage',
    desc: 'WHO Essential Medicines List coverage at this facility',
    accent: 'var(--purple)',
    rows: [
      { label: 'Anti-infectives', pct: 70 },
      { label: 'Analgesics',      pct: 85 },
      { label: 'Antimalarials',   pct: 60 },
      { label: 'Cardiovascular',  pct: 40 },
      { label: 'Antidiabetics',   pct: 55 },
    ],
    type: 'ranked',
  },
  {
    id: 'stockout-duration',
    title: 'Stockout Duration Analysis',
    desc: 'Average days out-of-stock per medicine category',
    accent: 'var(--danger)',
    bars: [
      { label: 'Antimalarials',  value: 0 },
      { label: 'Antibiotics',    value: 0 },
      { label: 'Analgesics',     value: 0 },
      { label: 'Antidiabetics',  value: 0 },
    ],
    type: 'bar',
  },
]

export default function AnalyticsPage() {
  const { facility } = useFacility()

  return (
    <div>
      <div className="page-top">
        <div>
          <div className="page-eyebrow">ANALYTICS</div>
          <div className="page-title">Analytics</div>
          <div className="page-subtitle">
            Operational intelligence activates as inventory data accumulates
          </div>
        </div>
        <div className="page-actions">
          <span style={{
            fontSize: 11, color: 'var(--text-muted)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '5px 10px',
          }}>
            {facility?.name ?? 'Facility'}
          </span>
        </div>
      </div>

      {/* Activation notice */}
      <div className="inline-alert alert-info" style={{ marginBottom: 18 }}>
        <span className="inline-alert-icon">ℹ</span>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>Analytics activate with inventory data</div>
          <div style={{ fontSize: 11 }}>
            These modules will populate automatically as you add inventory batches, process transfers, and record stock movements. The structure is already built — add stock to begin.
          </div>
        </div>
      </div>

      {/* Summary header row */}
      <div className="grid-4" style={{ marginBottom: 18 }}>
        <LockedKpi label="Total Batches Tracked" />
        <LockedKpi label="Avg. Days to Stockout" />
        <LockedKpi label="Transfer Success Rate" />
        <LockedKpi label="Expiry Loss Rate" />
      </div>

      {/* Module grid */}
      <div className="analytics-grid">
        {MODULES.map(m => (
          <ModuleCard key={m.id} module={m} />
        ))}
      </div>
    </div>
  )
}

function LockedKpi({ label }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: 'var(--text-disabled)', fontSize: 20 }}>—</div>
      <div className="stat-desc">Awaiting data</div>
    </div>
  )
}

function ModuleCard({ module: m }) {
  return (
    <div className="module-card">
      <div className="module-header">
        <div>
          <div className="module-title">{m.title}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{m.desc}</div>
        </div>
        <span className="module-status locked">Inactive</span>
      </div>
      <div className="module-body">
        {m.type === 'bar' && <BarChart bars={m.bars} accent={m.accent} />}
        {m.type === 'dual-bar' && <DualBarChart bars={m.bars} accent={m.accent} />}
        {m.type === 'ranked' && <RankedList rows={m.rows} accent={m.accent} />}
        {m.type === 'kpi-grid' && <KpiGrid kpis={m.kpis} />}
      </div>
    </div>
  )
}

function BarChart({ bars, accent }) {
  const max = Math.max(...bars.map(b => b.value || 1))
  return (
    <div className="chart-placeholder">
      {bars.map(b => (
        <div key={b.label} className="chart-bar-row">
          <span style={{ width: 48, flex: 'none', textAlign: 'right' }}>{b.label}</span>
          <div className="chart-bar-track">
            <div
              className="chart-bar-fill"
              style={{
                width: `${((b.value || 0) / max) * 100}%`,
                background: b.value > 0 ? accent : 'var(--bg-elevated)',
                opacity: 0.45,
              }}
            />
          </div>
          <span style={{ width: 24, flex: 'none', fontFamily: 'var(--font-mono)' }}>
            {b.value > 0 ? b.value : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

function DualBarChart({ bars, accent }) {
  return (
    <div className="chart-placeholder">
      <div style={{ display: 'flex', gap: 12, marginBottom: 6, fontSize: 10, color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 3, background: accent, opacity: 0.5, display: 'inline-block', borderRadius: 99 }} />
          Received
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 3, background: 'var(--warning)', opacity: 0.5, display: 'inline-block', borderRadius: 99 }} />
          Dispensed
        </span>
      </div>
      {bars.map(b => (
        <div key={b.label} style={{ marginBottom: 5 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{b.label}</div>
          <div style={{ display: 'flex', gap: 3 }}>
            <div className="chart-bar-track" style={{ flex: 1 }}>
              <div className="chart-bar-fill" style={{ width: `${b.in}%`, background: accent, opacity: 0.4 }} />
            </div>
            <div className="chart-bar-track" style={{ flex: 1 }}>
              <div className="chart-bar-fill" style={{ width: `${b.out}%`, background: 'var(--warning)', opacity: 0.4 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function RankedList({ rows, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {rows.map((r, i) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--text-disabled)', width: 14, flex: 'none', fontFamily: 'var(--font-mono)' }}>
            {i + 1}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1, minWidth: 0 }} className="truncate">
            {r.label}
          </span>
          <div className="chart-bar-track" style={{ width: 80, flex: 'none' }}>
            <div className="chart-bar-fill" style={{ width: `${r.pct}%`, background: accent, opacity: 0.4 }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-disabled)', width: 28, flex: 'none', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
            —
          </span>
        </div>
      ))}
    </div>
  )
}

function KpiGrid({ kpis }) {
  return (
    <div className="grid-2" style={{ gap: 8 }}>
      {kpis.map(k => (
        <div key={k.label} style={{
          background: 'var(--bg-primary)', border: '1px solid var(--border-soft)',
          borderRadius: 'var(--radius)', padding: '10px 12px',
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-disabled)', marginBottom: 3 }}>
            {k.label}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-disabled)', letterSpacing: '-0.04em' }}>
            {k.value}
          </div>
        </div>
      ))}
    </div>
  )
}
