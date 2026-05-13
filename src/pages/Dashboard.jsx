import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useFacility } from '../hooks/useFacility'
import {
  fmtRelative, fmtNumber, daysUntilExpiry,
  alertTypeLabel, alertTypeClass, alertDotClass,
  transferStatusClass, transferStatusLabel,
} from '../utils/formatters'
import { Badge } from '../components/shared'

const SETUP_STEPS = [
  { key: 'facility',   label: 'Facility profile created' },
  { key: 'inventory',  label: 'First inventory batch added' },
  { key: 'alerts',     label: 'Stock alert thresholds active' },
  { key: 'transfer',   label: 'Transfer network connected' },
]

export default function DashboardPage() {
  const { facility, facilityId, expiryThreshold } = useFacility()
  const [stats,     setStats]     = useState(null)
  const [alerts,    setAlerts]    = useState([])
  const [transfers, setTransfers] = useState([])
  const [movements, setMovements] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => { if (facilityId) loadAll() }, [facilityId])

  async function loadAll() {
    setLoading(true)
    await Promise.all([loadStats(), loadAlerts(), loadTransfers(), loadMovements()])
    setLoading(false)
  }

  async function loadStats() {
    const { data } = await supabase
      .from('inventory_items')
      .select('quantity_available, quantity_reserved, reorder_level, expiry_date')
      .eq('facility_id', facilityId).eq('is_active', true)
    if (!data) return
    const u = i => i.quantity_available - i.quantity_reserved
    setStats({
      total:      data.length,
      units:      data.reduce((s, i) => s + u(i), 0),
      lowStock:   data.filter(i => u(i) > 0 && u(i) < i.reorder_level).length,
      outOfStock: data.filter(i => i.quantity_available === 0).length,
      nearExpiry: data.filter(i => { const d = daysUntilExpiry(i.expiry_date); return d !== null && d >= 0 && d <= expiryThreshold }).length,
    })
  }

  async function loadAlerts() {
    const { data } = await supabase
      .from('stock_alerts')
      .select('*, medicines(generic_name)')
      .eq('facility_id', facilityId).eq('status', 'active')
      .order('created_at', { ascending: false }).limit(6)
    setAlerts(data ?? [])
  }

  async function loadTransfers() {
    const { data } = await supabase
      .from('transfer_requests')
      .select('id,status,urgency,quantity_requested,created_at,medicines(generic_name),requesting:requesting_facility_id(name),supplying:supplying_facility_id(name)')
      .or(`requesting_facility_id.eq.${facilityId},supplying_facility_id.eq.${facilityId}`)
      .in('status', ['pending', 'approved', 'in_transit'])
      .order('created_at', { ascending: false }).limit(5)
    setTransfers(data ?? [])
  }

  async function loadMovements() {
    const { data } = await supabase
      .from('inventory_movements')
      .select('id,movement_type,quantity_change,performed_at,inventory_items(medicines(generic_name))')
      .eq('facility_id', facilityId)
      .order('performed_at', { ascending: false }).limit(8)
    setMovements(data ?? [])
  }

  const hasInventory = stats && stats.total > 0
  const setupDone = {
    facility: true,
    inventory: hasInventory,
    alerts: hasInventory,
    transfer: transfers.length > 0,
  }

  return (
    <div>
      {/* ── Page top ── */}
      <div className="page-top">
        <div>
          <div className="page-eyebrow">Rx Operations Dashboard</div>
          <div className="page-title">
            {facility?.name ?? 'Dashboard'}
            {facility && !facility.is_verified && (
              <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--warning)', marginLeft: 12 }}>
                · Unverified
              </span>
            )}
          </div>
          <div className="page-subtitle">
            {facility?.city}, {facility?.country}
            {facility?.near_expiry_threshold_days && ` · ${facility.near_expiry_threshold_days}-day expiry window`}
          </div>
        </div>
        <div className="page-actions">
          <Link to="/inventory" className="btn btn-primary">+ Add stock</Link>
          <Link to="/search"    className="btn btn-ghost">Search network</Link>
        </div>
      </div>

      {/* ── Setup prompt (zero state) ── */}
      {!hasInventory && !loading && (
        <div className="card card-pad" style={{ marginBottom: 20, borderColor: 'var(--primary-border)', background: 'var(--primary-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                Start by adding your first stock batch
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                MediChain tracks stock risk, expiry exposure, and facility transfer readiness.
              </div>
            </div>
            <Link to="/inventory" className="btn btn-primary btn-sm">Add first batch →</Link>
          </div>
        </div>
      )}

      {/* ── Stat cards — RxDesk style ── */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <StatCard
          label="Inventory Health"
          value={loading ? '—' : hasInventory ? `${stats.total}` : 'No data'}
          sub={loading ? '' : hasInventory ? `${fmtNumber(stats.units)} unreserved units` : 'Add stock to activate health scoring'}
          accent="ac-teal"
        />
        <StatCard
          label="Stock Risk"
          value={loading ? '—' : `${(stats?.lowStock ?? 0) + (stats?.outOfStock ?? 0)}`}
          sub={loading ? '' : `Low stock · out of stock, near-expiry items`}
          accent="ac-warning"
        />
        <StatCard
          label="Coverage"
          value={loading ? '—' : `${stats?.total ?? 0}`}
          sub="Medicine batches currently tracked"
          accent="ac-info"
        />
        <StatCard
          label="Transfer Flow"
          value={loading ? '—' : `${transfers.length}`}
          sub="Pending, approved, or in-transit requests"
          accent="ac-purple"
        />
      </div>

      {/* ── Two-column row ── */}
      <div className="grid-2" style={{ marginBottom: 16 }}>

        {/* Critical Alerts */}
        <div className="section-shell">
          <div className="section-shell-header">
            <span className="section-shell-title">Critical alerts</span>
            <Link to="/alerts" className="btn btn-xs btn-ghost">View all</Link>
          </div>
          {alerts.length === 0 ? (
            <div style={{ padding: '24px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--success)', marginBottom: 3 }}>✓ No active stock risk detected</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Alerts appear when stock falls below reorder level or approaches expiry.</div>
            </div>
          ) : alerts.map(a => (
            <div key={a.id} className="activity-item">
              <div className={`activity-dot ${alertDotClass(a.alert_type)}`} />
              <div className="activity-text" style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>
                  {a.medicines?.generic_name}
                </span>
                {' '}
                <Badge className={alertTypeClass(a.alert_type)}>{alertTypeLabel(a.alert_type)}</Badge>
                {a.message && <div style={{ marginTop: 2, fontSize: 11, color: 'var(--text-muted)' }}>{a.message}</div>}
              </div>
              <div className="activity-time">{fmtRelative(a.created_at)}</div>
            </div>
          ))}
        </div>

        {/* Setup Progress */}
        <div className="section-shell">
          <div className="section-shell-header">
            <span className="section-shell-title">Setup progress</span>
            <Link to="/settings" className="btn btn-xs btn-ghost">View all</Link>
          </div>
          {SETUP_STEPS.map(step => (
            <div key={step.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 18px', borderBottom: '1px solid var(--border-soft)',
              fontSize: 12.5,
            }}>
              <span style={{ color: setupDone[step.key] ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                {step.label}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: setupDone[step.key] ? 'var(--success)' : 'var(--text-disabled)',
              }}>
                {setupDone[step.key] ? 'Done' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Transfers ── */}
      {transfers.length > 0 && (
        <div className="section-shell" style={{ marginBottom: 16 }}>
          <div className="section-shell-header">
            <span className="section-shell-title">Active transfers</span>
            <Link to="/transfers" className="btn btn-xs btn-ghost">View all</Link>
          </div>
          {transfers.map(t => (
            <div key={t.id} className="activity-item">
              <div className="activity-dot" />
              <div className="activity-text" style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>
                  {t.medicines?.generic_name}
                </span>
                {' '}
                <Badge className={transferStatusClass(t.status)}>{transferStatusLabel(t.status)}</Badge>
                <div style={{ marginTop: 2, fontSize: 11, color: 'var(--text-muted)' }}>
                  Qty {t.quantity_requested}
                  {t.urgency !== 'normal' && <span style={{ color: 'var(--warning)', marginLeft: 6 }}>· {t.urgency}</span>}
                </div>
              </div>
              <div className="activity-time">{fmtRelative(t.created_at)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Recent Stock Movement ── */}
      <div className="section-shell">
        <div className="section-shell-header">
          <span className="section-shell-title">Recent stock movement</span>
          <Link to="/inventory" className="btn btn-xs btn-ghost">Inventory</Link>
        </div>
        {movements.length === 0 ? (
          <div style={{ padding: '24px 18px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            No stock movements recorded.{' '}
            <Link to="/inventory" style={{ color: 'var(--primary)' }}>Add your first batch.</Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Movement</th>
                <th>Quantity</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(m => {
                const isIn = m.quantity_change > 0
                return (
                  <tr key={m.id}>
                    <td className="td-primary">{m.inventory_items?.medicines?.generic_name ?? '—'}</td>
                    <td><span className="pill" style={{ textTransform: 'capitalize' }}>{m.movement_type?.replace(/_/g, ' ')}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, color: isIn ? 'var(--success)' : 'var(--danger)' }}>
                      {isIn ? '+' : ''}{fmtNumber(m.quantity_change)}
                    </td>
                    <td className="td-muted">{fmtRelative(m.performed_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`stat-card ${accent}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sublabel">{sub}</div>}
    </div>
  )
}
