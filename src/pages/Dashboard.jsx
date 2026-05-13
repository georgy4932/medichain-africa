import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useFacility } from '../hooks/useFacility'
import {
  fmtDate,
  daysUntilExpiry,
  getAlertLabel,
  getAlertStatus,
  getTransferStatus,
} from '../utils/formatters'
import StatusBadge from '../components/shared/StatusBadge'

export default function DashboardPage() {
  const { facility, facilityId } = useFacility()

  const [stats, setStats] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!facilityId) return
    loadDashboard()
  }, [facilityId])

  async function loadDashboard() {
    setLoading(true)

    await Promise.all([
      loadStats(),
      loadAlerts(),
      loadTransfers(),
    ])

    setLoading(false)
  }

  async function loadStats() {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        id,
        quantity_available,
        quantity_reserved,
        reorder_level,
        expiry_date,
        is_active,
        medicines(generic_name)
      `)
      .eq('facility_id', facilityId)
      .eq('is_active', true)

    if (error) {
      console.error('Error loading dashboard stats:', error.message)
      setStats(null)
      return
    }

    const inventory = data ?? []

    const total = inventory.length

    const lowStock = inventory.filter((item) => {
      const available =
        Number(item.quantity_available ?? 0) -
        Number(item.quantity_reserved ?? 0)

      return available > 0 && available < Number(item.reorder_level ?? 0)
    }).length

    const outOfStock = inventory.filter((item) => {
      const available =
        Number(item.quantity_available ?? 0) -
        Number(item.quantity_reserved ?? 0)

      return available <= 0
    }).length

    const nearExpiry = inventory.filter((item) => {
      const days = daysUntilExpiry(item.expiry_date)
      const threshold = facility?.near_expiry_threshold_days ?? 90

      return days !== null && days >= 0 && days <= threshold
    }).length

    setStats({
      total,
      lowStock,
      outOfStock,
      nearExpiry,
    })
  }

  async function loadAlerts() {
    const { data, error } = await supabase
      .from('stock_alerts')
      .select('*, medicines(generic_name)')
      .eq('facility_id', facilityId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error loading dashboard alerts:', error.message)
      setAlerts([])
      return
    }

    setAlerts(data ?? [])
  }

  async function loadTransfers() {
    const { data, error } = await supabase
      .from('transfer_requests')
      .select('*, medicines(generic_name), facilities!requesting_facility_id(name)')
      .or(`requesting_facility_id.eq.${facilityId},supplying_facility_id.eq.${facilityId}`)
      .in('status', ['pending', 'approved', 'in_transit'])
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error loading dashboard transfers:', error.message)
      setTransfers([])
      return
    }

    setTransfers(data ?? [])
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  return (
    <div className="dashboard-page fade-up">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="page-title-sub">
            {facility?.name} · {facility?.city}
          </div>
        </div>

        <Link to="/inventory" className="btn btn-primary">
          Add stock
        </Link>
      </div>

      <section className="stats-grid">
        <StatCard
          label="Total items"
          value={stats?.total ?? 0}
          subtext="Active inventory batches"
          tone="info"
        />

        <StatCard
          label="Low stock"
          value={stats?.lowStock ?? 0}
          subtext="Below reorder level"
          tone="warning"
        />

        <StatCard
          label="Out of stock"
          value={stats?.outOfStock ?? 0}
          subtext="Zero units available"
          tone="danger"
        />

        <StatCard
          label="Near expiry"
          value={stats?.nearExpiry ?? 0}
          subtext={`Within ${facility?.near_expiry_threshold_days ?? 90} days`}
          tone="success"
        />
      </section>

      <section className="dashboard-grid">
        <DashboardPanel
          title="Active alerts"
          viewAllTo="/alerts"
          emptyText="No active alerts. Good work."
        >
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </DashboardPanel>

        <DashboardPanel
          title="Active transfers"
          viewAllTo="/transfers"
          emptyText="No pending transfer requests."
        >
          {transfers.map((transfer) => (
            <TransferRow key={transfer.id} transfer={transfer} />
          ))}
        </DashboardPanel>
      </section>
    </div>
  )
}

function StatCard({ label, value, subtext, tone }) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{subtext}</div>
    </div>
  )
}

function DashboardPanel({ title, viewAllTo, emptyText, children }) {
  const hasItems = Array.isArray(children)
    ? children.length > 0
    : Boolean(children)

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h3>{title}</h3>
        <Link to={viewAllTo}>View all</Link>
      </div>

      <div className="panel-list">
        {hasItems ? children : (
          <p className="panel-empty">{emptyText}</p>
        )}
      </div>
    </div>
  )
}

function AlertRow({ alert }) {
  return (
    <div className="panel-row">
      <StatusBadge variant={getAlertStatus(alert.alert_type)}>
        {getAlertLabel(alert.alert_type)}
      </StatusBadge>

      <div className="panel-row-content">
        <div className="panel-row-title">
          {alert.medicines?.generic_name || 'Unknown medicine'}
        </div>
        <div className="panel-row-sub">
          {alert.message}
        </div>
      </div>
    </div>
  )
}

function TransferRow({ transfer }) {
  return (
    <div className="panel-row">
      <StatusBadge variant={getTransferStatus(transfer.status)}>
        {transfer.status?.replace('_', ' ') || 'unknown'}
      </StatusBadge>

      <div className="panel-row-content">
        <div className="panel-row-title">
          {transfer.medicines?.generic_name || 'Unknown medicine'}
        </div>
        <div className="panel-row-sub">
          Qty: {transfer.quantity_requested} · {fmtDate(transfer.created_at)}
        </div>
      </div>
    </div>
  )
}
