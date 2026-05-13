import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useFacility } from '../hooks/useFacility'
import {
  fmtDate,
  getAlertLabel,
  getAlertStatus,
} from '../utils/formatters'
import StatusBadge from '../components/shared/StatusBadge'
import EmptyState from '../components/shared/EmptyState'

const FILTERS = ['active', 'acknowledged', 'resolved', 'all']

export default function AlertsPage() {
  const { facilityId } = useFacility()

  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')

  const loadAlerts = useCallback(async () => {
    if (!facilityId) return

    setLoading(true)

    let query = supabase
      .from('stock_alerts')
      .select(`
        *,
        medicines(generic_name, strength, dosage_form),
        inventory_items(batch_number, expiry_date)
      `)
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading stock alerts:', error.message)
      setAlerts([])
      setLoading(false)
      return
    }

    setAlerts(data ?? [])
    setLoading(false)
  }, [facilityId, filter])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  async function updateAlertStatus(id, status) {
    const payload =
      status === 'acknowledged'
        ? {
            status,
            acknowledged_at: new Date().toISOString(),
          }
        : {
            status,
            resolved_at: new Date().toISOString(),
          }

    const { error } = await supabase
      .from('stock_alerts')
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error(`Error updating alert to ${status}:`, error.message)
      return
    }

    loadAlerts()
  }

  const activeCount = alerts.filter((alert) => alert.status === 'active').length

  return (
    <div className="alerts-page fade-up">
      <div className="page-header">
        <div>
          <h1>Stock alerts</h1>
          <div className="page-title-sub">
            {activeCount} active alert{activeCount !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="filter-group">
          {FILTERS.map((item) => (
            <button
              key={item}
              className={`btn btn-sm ${filter === item ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(item)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="spinner spinner-lg" />
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon="✓"
          title="No alerts"
          message={`No ${filter} alerts found.`}
        />
      ) : (
        <div className="alert-list">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={() => updateAlertStatus(alert.id, 'acknowledged')}
              onResolve={() => updateAlertStatus(alert.id, 'resolved')}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AlertCard({ alert, onAcknowledge, onResolve }) {
  const alertStatus = getAlertStatus(alert.alert_type)

  return (
    <article className={`stock-alert-card stock-alert-card-${alertStatus}`}>
      <div className="stock-alert-content">
        <div className="stock-alert-badges">
          <StatusBadge variant={alertStatus}>
            {getAlertLabel(alert.alert_type)}
          </StatusBadge>

          {alert.status !== 'active' && (
            <StatusBadge variant="neutral">
              {alert.status}
            </StatusBadge>
          )}
        </div>

        <div className="stock-alert-title">
          {alert.medicines?.generic_name || 'Unknown medicine'}
          {alert.medicines?.strength ? ` · ${alert.medicines.strength}` : ''}
        </div>

        <div className="stock-alert-message">
          {alert.message}
        </div>

        <div className="stock-alert-meta">
          {alert.inventory_items?.batch_number && (
            <>Batch: {alert.inventory_items.batch_number} · </>
          )}
          {fmtDate(alert.created_at)}
        </div>
      </div>

      <div className="stock-alert-actions">
        {alert.status === 'active' && (
          <>
            <button className="btn btn-ghost btn-sm" onClick={onAcknowledge}>
              Acknowledge
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onResolve}>
              Resolve
            </button>
          </>
        )}

        {alert.status === 'acknowledged' && (
          <button className="btn btn-secondary btn-sm" onClick={onResolve}>
            Resolve
          </button>
        )}
      </div>
    </article>
  )
}
