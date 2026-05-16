import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { fmtRelative, fmtDate, fmtNumber } from '../utils/formatters'

// Quantity threshold above which a batch is auto-flagged
const FLAG_QTY_THRESHOLD = 5000

export default function AdminPage() {
  const { profile, signOut } = useAuth()
  const navigate    = useNavigate()
  const [tab,       setTab]       = useState('facilities')
  const [facilities, setFacilities] = useState([])
  const [flagged,   setFlagged]   = useState([])
  const [disputes,  setDisputes]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [acting,    setActing]    = useState(null)
  const [toast,     setToast]     = useState(null)

  // Guard — only system_admin can access
  useEffect(() => {
    if (profile && profile.role !== 'system_admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [profile, navigate])

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    await Promise.all([loadFacilities(), loadFlaggedInventory(), loadDisputes()])
    setLoading(false)
  }

  async function loadFacilities() {
    const { data } = await supabase
      .from('facilities')
      .select('id, name, facility_type, registration_number, city, state_province, country, is_verified, is_active, email, phone, created_at')
      .order('created_at', { ascending: false })
    setFacilities(data ?? [])
  }

  async function loadFlaggedInventory() {
    // Load batches over the quantity threshold that haven't been approved yet
    const { data } = await supabase
      .from('inventory_items')
      .select(`
        id, quantity_available, batch_number, created_at,
        medicines(generic_name, strength),
        facilities(id, name, is_verified)
      `)
      .gte('quantity_available', FLAG_QTY_THRESHOLD)
      .eq('is_active', true)
      .order('quantity_available', { ascending: false })
      .limit(50)
    setFlagged(data ?? [])
  }

  async function loadDisputes() {
    const { data } = await supabase
      .from('transfer_requests')
      .select(`
        id, status, urgency, quantity_requested, quantity_approved, created_at, notes, fulfilled_at,
        medicines(generic_name),
        requesting:requesting_facility_id(id, name),
        supplying:supplying_facility_id(id, name)
      `)
      .eq('status', 'disputed')
      .order('created_at', { ascending: false })
    setDisputes(data ?? [])
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function verifyFacility(id) {
    setActing(id)
    const { error } = await supabase
      .from('facilities')
      .update({ is_verified: true })
      .eq('id', id)
    if (!error) { showToast('Facility verified and added to the network'); await loadFacilities() }
    else showToast('Failed to verify: ' + error.message, 'error')
    setActing(null)
  }

  async function suspendFacility(id) {
    setActing(id)
    const { error } = await supabase
      .from('facilities')
      .update({ is_verified: false, is_active: false })
      .eq('id', id)
    if (!error) { showToast('Facility suspended and removed from network'); await loadFacilities() }
    else showToast('Failed to suspend: ' + error.message, 'error')
    setActing(null)
  }

  async function approveInventory(id) {
    setActing(id)
    // No special flag field yet — just acknowledge in UI. Future: add admin_approved bool
    showToast('Batch reviewed and cleared')
    setActing(null)
  }

  async function removeInventory(id) {
    setActing(id)
    const { error } = await supabase
      .from('inventory_items')
      .update({ is_active: false })
      .eq('id', id)
    if (!error) { showToast('Batch removed from network'); await loadFlaggedInventory() }
    else showToast('Failed to remove: ' + error.message, 'error')
    setActing(null)
  }

  async function resolveDispute(id, action) {
    setActing(id)
    const newStatus = action === 'resolve' ? 'fulfilled' : 'cancelled'
    const { error } = await supabase
      .from('transfer_requests')
      .update({ status: newStatus, notes: `Dispute resolved by admin: marked ${newStatus}` })
      .eq('id', id)
    if (!error) { showToast(`Dispute resolved — marked as ${newStatus}`); await loadDisputes() }
    else showToast('Failed: ' + error.message, 'error')
    setActing(null)
  }

  const pending   = facilities.filter(f => !f.is_verified && f.is_active !== false)
  const verified  = facilities.filter(f => f.is_verified)
  const suspended = facilities.filter(f => !f.is_active)

  const TABS = [
    { key: 'facilities', label: 'Facilities', count: pending.length, alert: pending.length > 0 },
    { key: 'inventory',  label: 'Flagged inventory', count: flagged.length, alert: flagged.length > 0 },
    { key: 'disputes',   label: 'Transfer disputes', count: disputes.length, alert: disputes.length > 0 },
  ]

  if (!profile || profile.role !== 'system_admin') return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '0 0 80px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 999,
          padding: '10px 16px', borderRadius: 'var(--r-md)',
          background: toast.type === 'error' ? 'var(--danger-dim)' : 'var(--success-dim)',
          border: `1px solid ${toast.type === 'error' ? 'var(--danger-border)' : 'var(--success-border)'}`,
          color: toast.type === 'error' ? 'var(--danger)' : 'var(--success)',
          fontSize: 13, fontWeight: 500,
          boxShadow: 'var(--shadow)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 0' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--primary)', marginBottom: 4 }}>
                MediChain Africa
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
                Admin Control Panel
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Network verification · Inventory review · Dispute resolution
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {pending.length > 0 && (
                <div style={{ padding: '6px 12px', background: 'var(--warning-dim)', border: '1px solid var(--warning-border)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--warning)', fontWeight: 600 }}>
                  ⚡ {pending.length} pending verification{pending.length !== 1 ? 's' : ''}
                </div>
              )}
              <button
                onClick={async () => { await signOut(); navigate('/auth') }}
                style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '5px 12px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.target.style.color = 'var(--danger)'; e.target.style.borderColor = 'var(--danger-border)' }}
                onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'var(--border)' }}
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginTop: 16 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '10px 18px', background: 'none', border: 'none',
                borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
                color: tab === t.key ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: tab === t.key ? 600 : 400,
                fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
              }}>
                {t.label}
                {t.count > 0 && (
                  <span style={{
                    background: t.alert ? 'var(--warning)' : 'var(--bg-active)',
                    color: t.alert ? '#07111f' : 'var(--text-muted)',
                    fontSize: 10, fontWeight: 700, padding: '1px 6px',
                    borderRadius: 99, minWidth: 18, textAlign: 'center',
                  }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px 0' }}>

        {/* FACILITIES TAB */}
        {tab === 'facilities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[
                { label: 'Total facilities', value: facilities.length, color: 'var(--primary)' },
                { label: 'Pending verification', value: pending.length, color: 'var(--warning)' },
                { label: 'Verified & active', value: verified.length, color: 'var(--success)' },
                { label: 'Suspended', value: suspended.length, color: 'var(--danger)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 18px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Pending verification */}
            {pending.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--warning)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⚡ Awaiting verification
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pending.map(f => <FacilityCard key={f.id} facility={f} status="pending" onVerify={verifyFacility} onSuspend={suspendFacility} acting={acting} />)}
                </div>
              </div>
            )}

            {/* Verified */}
            {verified.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--success)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ✓ Verified facilities
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {verified.map(f => <FacilityCard key={f.id} facility={f} status="verified" onVerify={verifyFacility} onSuspend={suspendFacility} acting={acting} />)}
                </div>
              </div>
            )}

            {/* Suspended */}
            {suspended.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--danger)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ✗ Suspended
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {suspended.map(f => <FacilityCard key={f.id} facility={f} status="suspended" onVerify={verifyFacility} onSuspend={suspendFacility} acting={acting} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FLAGGED INVENTORY TAB */}
        {tab === 'inventory' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Inventory batches with <strong style={{ color: 'var(--text-primary)' }}>{fmtNumber(FLAG_QTY_THRESHOLD)}+ units</strong> are flagged for review. Verify these are legitimate before they appear in network search results.
              </div>
            </div>

            {flagged.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--text-muted)', fontSize: 13 }}>
                No flagged inventory batches. The network looks clean.
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Facility</th>
                      <th>Batch</th>
                      <th>Quantity</th>
                      <th>Added</th>
                      <th>Verified?</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flagged.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{item.medicines?.generic_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.medicines?.strength}</div>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.facilities?.name}</td>
                        <td><span className="pill">{item.batch_number}</span></td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: 'var(--warning)' }}>
                            {fmtNumber(item.quantity_available)}
                          </span>
                          <div style={{ fontSize: 10, color: 'var(--warning)', marginTop: 1 }}>Above threshold</div>
                        </td>
                        <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtRelative(item.created_at)}</td>
                        <td>
                          {item.facilities?.is_verified
                            ? <span style={{ fontSize: 11, color: 'var(--success)' }}>✓ Yes</span>
                            : <span style={{ fontSize: 11, color: 'var(--warning)' }}>⚠ No</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-success btn-xs" onClick={() => approveInventory(item.id)} disabled={acting === item.id}>
                              Clear
                            </button>
                            <button className="btn btn-danger btn-xs" onClick={() => removeInventory(item.id)} disabled={acting === item.id}>
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* DISPUTES TAB */}
        {tab === 'disputes' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Transfer disputes occur when a requesting facility reports non-delivery after a supplier marked the transfer fulfilled. Review each case and resolve as fulfilled or cancelled.
              </div>
            </div>

            {disputes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--text-muted)', fontSize: 13 }}>
                No active transfer disputes. The network is operating cleanly.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {disputes.map(t => (
                  <div key={t.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--danger-border)', borderRadius: 'var(--r-lg)', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                          {t.medicines?.generic_name} — {fmtNumber(t.quantity_approved)} units
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>From </span>{t.supplying?.name}
                          <span style={{ color: 'var(--text-muted)' }}> → </span>{t.requesting?.name}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-dim)', border: '1px solid var(--danger-border)', borderRadius: 'var(--r-xs)', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Disputed
                      </span>
                    </div>
                    {t.notes && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-primary)', borderRadius: 'var(--r)', padding: '8px 12px', marginBottom: 12, fontStyle: 'italic' }}>
                        "{t.notes}"
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="btn btn-success btn-sm" onClick={() => resolveDispute(t.id, 'resolve')} disabled={acting === t.id}>
                        Mark fulfilled
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => resolveDispute(t.id, 'cancel')} disabled={acting === t.id}>
                        Mark cancelled
                      </button>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                        Raised {fmtRelative(t.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FacilityCard({ facility: f, status, onVerify, onSuspend, acting }) {
  const statusColor = { pending: 'var(--warning)', verified: 'var(--success)', suspended: 'var(--danger)' }[status]
  const statusLabel = { pending: 'Pending', verified: 'Verified', suspended: 'Suspended' }[status]

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
    }}>
      {/* Status dot */}
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />

      {/* Identity */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{f.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {f.facility_type?.replace(/_/g, ' ')} · {f.city}, {f.state_province}, {f.country}
        </div>
      </div>

      {/* Registration number */}
      <div style={{ minWidth: 160 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 3 }}>Reg number</div>
        {f.registration_number ? (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{f.registration_number}</span>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--danger)' }}>Not provided</span>
        )}
      </div>

      {/* Contact */}
      <div style={{ minWidth: 160 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 3 }}>Contact</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{f.email || f.phone || '—'}</div>
      </div>

      {/* Registered */}
      <div style={{ minWidth: 100 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 3 }}>Registered</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtRelative(f.created_at)}</div>
      </div>

      {/* Status badge */}
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: statusColor, background: `${statusColor}15`, border: `1px solid ${statusColor}30`, borderRadius: 'var(--r-xs)', padding: '2px 8px', flexShrink: 0 }}>
        {statusLabel}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {status === 'pending' && (
          <>
            <button className="btn btn-success btn-sm" onClick={() => onVerify(f.id)} disabled={acting === f.id || !f.registration_number}>
              {acting === f.id ? '…' : '✓ Verify'}
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onSuspend(f.id)} disabled={acting === f.id}>
              Suspend
            </button>
          </>
        )}
        {status === 'verified' && (
          <button className="btn btn-danger btn-sm" onClick={() => onSuspend(f.id)} disabled={acting === f.id}>
            Suspend
          </button>
        )}
        {status === 'suspended' && (
          <button className="btn btn-ghost btn-sm" onClick={() => onVerify(f.id)} disabled={acting === f.id}>
            Reinstate
          </button>
        )}
      </div>
    </div>
  )
}
