import { useFacility } from '../hooks/useFacility'
import { Link } from 'react-router-dom'

const INTELLIGENCE_MODULES = [
  {
    id: 'essential-coverage',
    title: 'Essential Medicine Coverage',
    desc: 'WHO Essential Medicines List coverage score for this facility and surrounding network',
    accent: 'var(--primary)',
    type: 'ranked',
    rows: [
      { label: 'Anti-infectives',  pct: 70 },
      { label: 'Antimalarials',    pct: 60 },
      { label: 'Analgesics',       pct: 85 },
      { label: 'Cardiovascular',   pct: 40 },
      { label: 'Antidiabetics',    pct: 55 },
    ],
  },
  {
    id: 'shortage-signals',
    title: 'Emerging Shortage Signals',
    desc: 'Medicines approaching stockout across network facilities in your area',
    accent: 'var(--danger)',
    type: 'bar',
    bars: [
      { label: 'Week 1', value: 0 },
      { label: 'Week 2', value: 0 },
      { label: 'Week 3', value: 0 },
      { label: 'Week 4', value: 0 },
    ],
  },
  {
    id: 'expiry-redistribution',
    title: 'Expiry Redistribution Forecast',
    desc: 'Near-expiry stock available for redistribution to prevent wastage',
    accent: 'var(--warning)',
    type: 'bar',
    bars: [
      { label: '0–30d',  value: 0 },
      { label: '31–60d', value: 0 },
      { label: '61–90d', value: 0 },
    ],
  },
  {
    id: 'transfer-fulfillment',
    title: 'Transfer Fulfillment Rate',
    desc: 'Percentage of redistribution requests successfully completed',
    accent: 'var(--success)',
    type: 'kpi-grid',
    kpis: [
      { label: 'Requests sent',     value: '—' },
      { label: 'Approved',          value: '—' },
      { label: 'Fulfilled',         value: '—' },
      { label: 'Fulfillment rate',  value: '—' },
    ],
  },
  {
    id: 'fast-movers',
    title: 'Fast-Moving Medicines',
    desc: 'Highest consumption rate — early signals of upcoming supply pressure',
    accent: 'var(--info)',
    type: 'ranked',
    rows: [
      { label: 'Amoxicillin 500mg',          pct: 88 },
      { label: 'Artemether/Lumefantrine',    pct: 74 },
      { label: 'Metformin 500mg',            pct: 63 },
      { label: 'Paracetamol 500mg',          pct: 55 },
      { label: 'ORS Sachets',                pct: 42 },
    ],
  },
  {
    id: 'network-availability',
    title: 'Network Availability Trend',
    desc: 'Medicine availability across connected facilities over time',
    accent: 'var(--purple)',
    type: 'dual-bar',
    bars: [
      { label: 'Week 1', in: 0, out: 0 },
      { label: 'Week 2', in: 0, out: 0 },
      { label: 'Week 3', in: 0, out: 0 },
      { label: 'Week 4', in: 0, out: 0 },
    ],
  },
]

export default function AnalyticsPage() {
  const { facility } = useFacility()

  return (
    <div>
      <div className="page-top">
        <div>
          <div className="page-eyebrow">My Facility · Supply Intelligence</div>
          <div className="page-title">Supply Intelligence</div>
          <div className="page-subtitle">
            Operational analytics activate as inventory and transfer data accumulates
          </div>
        </div>
        <div className="page-actions">
          <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '5px 10px' }}>
            {facility?.name ?? 'Facility'}
          </span>
        </div>
      </div>

      {/* Activation notice */}
      <div className="card card-pad" style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Intelligence modules activate with network data
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            These modules populate automatically as your facility adds inventory, processes transfers, and participates in the medicine network. Add stock and connect with other facilities to begin generating supply intelligence.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Link to="/inventory" className="btn btn-primary btn-sm">Add inventory</Link>
          <Link to="/search"    className="btn btn-ghost btn-sm">Search network</Link>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Availability Score',       sub: 'Essential medicine coverage index' },
          { label: 'Network Shortage Risk',    sub: 'Emerging signals in your area' },
          { label: 'Redistribution Potential', sub: 'Near-expiry units available' },
          { label: 'Transfer Fulfillment',     sub: 'Request completion rate' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-value" style={{ color: 'var(--text-disabled)', fontSize: 20 }}>—</div>
            <div className="stat-label">{k.label}</div>
            <div className="stat-sublabel">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Intelligence modules */}
      <div className="analytics-grid">
        {INTELLIGENCE_MODULES.map(m => (
          <ModuleCard key={m.id} module={m} />
        ))}
      </div>
    </div>
  )
}

function ModuleCard({ module: m }) {
  return (
    <div className="module-card">
      <div className="module-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.accent, flexShrink: 0 }} />
            <div className="module-title">{m.title}</div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 12 }}>{m.desc}</div>
        </div>
        <span className="module-status">Inactive</span>
      </div>
      <div className="module-body">
        {m.type === 'bar'      && <BarChart    bars={m.bars}  accent={m.accent} />}
        {m.type === 'dual-bar' && <DualBar     bars={m.bars}  accent={m.accent} />}
        {m.type === 'ranked'   && <RankedList  rows={m.rows}  accent={m.accent} />}
        {m.type === 'kpi-grid' && <KpiGrid     kpis={m.kpis} />}
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
          <span style={{ width: 44, flex: 'none', textAlign: 'right', fontSize: 10 }}>{b.label}</span>
          <div className="chart-bar-track">
            <div className="chart-bar-fill" style={{ width: `${((b.value || 0) / max) * 100}%`, background: b.value > 0 ? accent : 'var(--bg-elevated)', opacity: 0.4 }} />
          </div>
          <span style={{ width: 20, flex: 'none', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{b.value > 0 ? b.value : '—'}</span>
        </div>
      ))}
    </div>
  )
}

function DualBar({ bars, accent }) {
  return (
    <div className="chart-placeholder">
      <div style={{ display: 'flex', gap: 12, marginBottom: 6, fontSize: 10, color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 3, background: accent, opacity: 0.5, display: 'inline-block', borderRadius: 99 }} />Received
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 3, background: 'var(--warning)', opacity: 0.5, display: 'inline-block', borderRadius: 99 }} />Distributed
        </span>
      </div>
      {bars.map(b => (
        <div key={b.label} style={{ marginBottom: 5 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{b.label}</div>
          <div style={{ display: 'flex', gap: 3 }}>
            <div className="chart-bar-track" style={{ flex: 1 }}><div className="chart-bar-fill" style={{ width: `${b.in}%`, background: accent, opacity: 0.4 }} /></div>
            <div className="chart-bar-track" style={{ flex: 1 }}><div className="chart-bar-fill" style={{ width: `${b.out}%`, background: 'var(--warning)', opacity: 0.4 }} /></div>
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
          <span style={{ fontSize: 10, color: 'var(--text-disabled)', width: 14, flex: 'none', fontFamily: 'var(--font-mono)' }}>{i + 1}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1, minWidth: 0 }} className="truncate">{r.label}</span>
          <div className="chart-bar-track" style={{ width: 80, flex: 'none' }}>
            <div className="chart-bar-fill" style={{ width: `${r.pct}%`, background: accent, opacity: 0.4 }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-disabled)', width: 24, flex: 'none', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>—</span>
        </div>
      ))}
    </div>
  )
}

function KpiGrid({ kpis }) {
  return (
    <div className="grid-2" style={{ gap: 8 }}>
      {kpis.map(k => (
        <div key={k.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r)', padding: '10px 12px' }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-disabled)', marginBottom: 3 }}>{k.label}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-disabled)', letterSpacing: '-0.04em' }}>{k.value}</div>
        </div>
      ))}
    </div>
  )
}
