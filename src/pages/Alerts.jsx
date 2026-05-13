import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useFacility } from '../hooks/useFacility'
import { fmtDate, fmtRelative, alertTypeLabel, alertTypeClass } from '../utils/formatters'
import { Badge, EmptyState, SpinnerCenter } from '../components/shared'

const FILTER_TABS = [
  { key: 'active',       label: 'Active' },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'resolved',     label: 'Resolved' },
  { key: 'all',          label: 'All' },
]

const RECOMMENDED_ACTIONS = {
  out_of_stock:  'Search for this medicine at nearby facilities and create a transfer request.',
  low_stock:     'Review consumption rate and place a procurement order or request a transfer.',
  near_expiry:   'Consider running a promotion, transferring surplus to another facility, or planning disposal.',
  overstock:     'Review storage conditions and consider offering surplus to other facilities.',
}

export default function AlertsPage() {
  const { facilityId } = useFacility()
  const [alerts,  setAlerts]  = useState([])
  const [filter,  setFilter]  = useState('active')
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (facilityId) load() }, [facilityId, filter])

  async function load() {
    setLoading(true)
    let q = supabase
      .from('stock_alerts')
      .select('*, medicines(generic_name, strength, dosage_form), inventory_items(batch_number, expiry_date, quantity_available, reorder_level)')
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setAlerts(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    const patch = { status }
    if (status === 'acknowledged') patch.acknowledged_at = new Date().toISOString()
    if (status === 'resolved')     patch.resolved_at     = new Date().toISOString()
    await supabase.from('stock_alerts').update(patch).eq('id', id)
    load()
  }

  // Group active alerts by severity
  const critical  = alerts.filter(a => a.alert_type === 'out_of_stock')
  const warnings  = alerts.filter(a => a.alert_type === 'low_stock')
  const expiring  = alerts.filter(a => a.alert_type === 'near_expiry')
  const other     = alerts.filter(a => !['out_of_stock','low_stock','near_expiry'].includes(a.alert_type))

  const totalActive = alerts.filter(a => a.status === 'active').length

  return (
    <div>
      <div className="page-top">
        <div>
          <div className="page-eyebrow">STOCK ALERTS</div>
          <div className="page-title">Stock Alerts</div>
          <div className="page-subtitle">
            {totalActive > 0
              ? `${totalActive} active alert${totalActive !== 1 ? 's' : ''} require attention`
              : 'All stock levels are healthy'}
          </div>
        </div>
        <div className="page-actions">
          <div className="filter-chips">
            {FILTER_TABS.map(t => (
              <button key={t.key} className={`chip ${filter === t.key ? 'active' : ''}`} onClick={() => setFilter(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? <SpinnerCenter /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {alerts.length === 0 && (
            <EmptyState
              title={filter === 'active' ? 'No active alerts' : `No ${filter} alerts`}
              description={filter === 'active'
                ? 'All monitored stock is within healthy thresholds.'
                : 'No alerts found with this status.'}
            />
          )}

          {/* CRITICAL — Out of stock */}
          {critical.length > 0 && (
            <AlertGroup
              title="Critical — Out of Stock"
              accentColor="var(--danger)"
              alerts={critical}
              onAction={updateStatus}
            />
          )}

          {/* WARNING — Low stock */}
          {warnings.length > 0 && (
            <AlertGroup
              title="Warning — Low Stock"
              accentColor="var(--warning)"
              alerts={warnings}
              onAction={updateStatus}
            />
          )}

          {/* EXPIRY RISK */}
          {expiring.length > 0 && (
            <AlertGroup
              title="Expiry Risk"
              accentColor="var(--warning)"
              alerts={expiring}
              onAction={updateStatus}
            />
          )}

          {/* OTHER */}
          {other.length > 0 && (
            <AlertGroup
              title="Other Alerts"
              accentColor="var(--info)"
              alerts={other}
              onAction={updateStatus}
            />
          )}
        </div>
      )}
    </div>
  )
}

function AlertGroup({ title, accentColor, alerts, onAction }) {
  return (
    <div className="section-shell">
      <div className="section-shell-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor, flexShrink: 0 }} />
          <span className="section-shell-title">{title}</span>
          <span style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 99, padding: '1px 7px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600,
          }}>
            {alerts.length}
          </span>
        </div>
      </div>
      <div style={{ borderLeft: `2px solid ${accentColor}` }}>
        {alerts.map(a => (
          <AlertRow key={a.id} alert={a} onAction={onAction} />
        ))}
      </div>
    </div>
  )
}

function AlertRow({ alert: a, onAction }) {
  const rec = RECOMMENDED_ACTIONS[a.alert_type]
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: '14px 18px',
      borderBottom: '1px solid var(--border-soft)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <Badge className={alertTypeClass(a.alert_type)} dot>
            {alertTypeLabel(a.alert_type)}
          </Badge>
          {a.status !== 'active' && (
            <Badge className="badge-neutral">{a.status}</Badge>
          )}
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {fmtRelative(a.created_at)}
          </span>
        </div>

        {/* Medicine */}
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
          {a.medicines?.generic_name}
          {a.medicines?.strength && (
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
              {a.medicines.strength}
            </span>
          )}
        </div>

        {/* Alert message */}
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{a.message}</div>

        {/* Stock details */}
        {a.inventory_items && (
          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, flexWrap: 'wrap' }}>
            {a.inventory_items.batch_number && (
              <span>Batch: <span className="mono">{a.inventory_items.batch_number}</span></span>
            )}
            {a.inventory_items.quantity_available != null && (
              <span>Qty: <strong style={{ color: 'var(--text-secondary)' }}>{a.inventory_items.quantity_available}</strong></span>
            )}
            {a.inventory_items.expiry_date && (
              <span>Expiry: {fmtDate(a.inventory_items.expiry_date)}</span>
            )}
          </div>
        )}

        {/* Recommended action */}
        {rec && a.status === 'active' && (
          <div style={{
            fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-primary)',
            border: '1px solid var(--border-soft)', borderRadius: 'var(--r-sm)',
            padding: '6px 10px', lineHeight: 1.5,
          }}>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Recommended: </span>
            {rec}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flex: 'shrink-0', alignItems: 'center', marginTop: 2 }}>
        {a.status === 'active' && (
          <>
            <button className="btn btn-ghost btn-xs" onClick={() => onAction(a.id, 'acknowledged')}>
              Acknowledge
            </button>
            <button className="btn btn-success btn-xs" onClick={() => onAction(a.id, 'resolved')}>
              Resolve
            </button>
          </>
        )}
        {a.status === 'acknowledged' && (
          <button className="btn btn-success btn-xs" onClick={() => onAction(a.id, 'resolved')}>
            Resolve
          </button>
        )}
        {a.status === 'resolved' && (
          <span style={{ fontSize: 11, color: 'var(--success)' }}>✓ Resolved</span>
        )}
      </div>
    </div>
  )
}
