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
    await Promise.all([loadStats(), loadAlerts(), loadTransfers()])
    setLoading(false)
  }

  async function loadStats() {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, quantity_available, quantity_reserved, reorder_level, expiry_date, is_active')
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
      .select('*, medicines(generic_name)')
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

  const hasInventory = (stats?.total ?? 0) > 0
  const totalRisk =
    (stats?.lowStock ?? 0) +
    (stats?.outOfStock ?? 0) +
    (stats?.nearExpiry ?? 0)

  return (
    <div className="dashboard-page fade-up">
      <div className="page-header">
        <div>
          <h1>Command center</h1>
          <div className="page-title-sub">
            {facility?.name} · medicine visibility, risk, and transfer readiness
          </div>
        </div>

        <Link to="/inventory" className="btn btn-primary">
          Add stock
        </Link>
      </div>

      <section className="command-strip">
        <div>
          <strong>
            {hasInventory
              ? 'Inventory monitoring is active'
              : 'Start by adding your first stock batch'}
          </strong>
          <span>
            MediChain tracks stock risk, expiry exposure, and facility transfer readiness.
          </span>
        </div>

        <Link to="/search" className="btn btn-ghost btn-sm">
          Search network
        </Link>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Inventory health"
          value={hasInventory ? 'Live' : 'No data'}
          subtext={hasInventory ? `${stats.total} active batches monitored` : 'Add stock to activate health scoring'}
        />

        <StatCard
          label="Stock risk"
          value={totalRisk}
          subtext="Low stock, out of stock, and near-expiry items"
        />

        <StatCard
          label="Coverage"
          value={stats?.total ?? 0}
          subtext="Medicine batches currently tracked"
        />

        <StatCard
          label="Transfer flow"
          value={transfers.length}
          subtext="Pending, approved, or in-transit requests"
        />
      </section>

      <section className="dashboard-grid">
        <DashboardPanel
          title="Critical alerts"
          viewAllTo="/alerts"
          emptyText="No active stock risk detected yet. Alerts will appear when stock falls below reorder level or approaches expiry."
        >
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </DashboardPanel>

        <DashboardPanel
          title="Setup progress"
          viewAllTo="/inventory"
          emptyText=""
        >
          <div className="setup-progress">
            <SetupStep label="Facility profile created" done />
            <SetupStep label="Add first inventory batch" done={hasInventory} />
            <SetupStep label="Review stock alerts" done={alerts.length > 0} />
            <SetupStep label="Create or receive transfer request" done={transfers.length > 0} />
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Active transfers"
          viewAllTo="/transfers"
          emptyText="No transfer workflow is active yet. Requests will appear here when facilities request or approve medicine movement."
        >
          {transfers.map((transfer) => (
            <TransferRow key={transfer.id} transfer={transfer} />
          ))}
        </DashboardPanel>

        <DashboardPanel
          title="Recent stock movement"
          viewAllTo="/inventory"
          emptyText="No stock movement recorded yet. Receipts, adjustments, removals, and transfers will appear as operational history."
        >
          {null}
        </DashboardPanel>
      </section>
    </div>
  )
}

function StatCard({ label, value, subtext }) {
  return (
    <div className="stat-card">
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
        {hasItems ? children : <p className="panel-empty">{emptyText}</p>}
      </div>
    </div>
  )
}

function SetupStep({ label, done }) {
  return (
    <div className="setup-step">
      <span>{label}</span>
      <strong>{done ? 'Done' : 'Pending'}</strong>
    </div>
  )
}

function AlertRow({ alert }) {
  return (
    <div className="panel-row">
      <StatusBadge variant={getAlertStatus(alert.alert_type)}>
        {getAlertLabel(alert.alert_type)}
      </StatusBadge>

      <div>
        <div className="panel-row-title">
          {alert.medicines?.generic_name || 'Unknown medicine'}
        </div>
        <div className="panel-row-sub">{alert.message}</div>
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

      <div>
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
