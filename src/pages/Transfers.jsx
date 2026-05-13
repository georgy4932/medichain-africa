import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useFacility } from '../hooks/useFacility'
import {
  fmtDate, fmtRelative, fmtNumber,
  transferStatusClass, transferStatusLabel, urgencyClass,
} from '../utils/formatters'
import { Modal, InlineError, EmptyState, Badge, SpinnerCenter, TransferPipeline, ContextCard } from '../components/shared'

const TABS = [
  { key: 'all',      label: 'All' },
  { key: 'incoming', label: 'Incoming' },
  { key: 'outgoing', label: 'Outgoing' },
  { key: 'active',   label: 'Active' },
]

export default function TransfersPage() {
  const { facilityId } = useFacility()
  const location       = useLocation()
  const prefill        = location.state?.prefill ?? null

  const [transfers, setTransfers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState('all')
  const [newOpen,   setNewOpen]   = useState(!!prefill)
  const [action,    setAction]    = useState(null)

  useEffect(() => { if (facilityId) load() }, [facilityId, tab])

  async function load() {
    setLoading(true)
    let q = supabase
      .from('transfer_requests')
      .select(`id,status,urgency,quantity_requested,quantity_approved,quantity_fulfilled,reason,notes,created_at,
        medicines(generic_name,strength),
        requesting:requesting_facility_id(id,name,city),
        supplying:supplying_facility_id(id,name,city)`)
      .or(`requesting_facility_id.eq.${facilityId},supplying_facility_id.eq.${facilityId}`)
      .order('created_at', { ascending: false })

    if (tab === 'incoming') q = q.eq('supplying_facility_id', facilityId)
    if (tab === 'outgoing') q = q.eq('requesting_facility_id', facilityId)
    if (tab === 'active')   q = q.in('status', ['pending','approved','in_transit'])

    const { data } = await q
    setTransfers(data ?? [])
    setLoading(false)
  }

  return (
    <div>
      <div className="page-top">
        <div>
          <div className="page-eyebrow">TRANSFER REQUESTS</div>
          <div className="page-title">Stock Transfers</div>
          <div className="page-subtitle">Request, manage, and track medicine transfers between facilities</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setNewOpen(true)}>+ New request</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-chips" style={{ marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.key} className={`chip ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <SpinnerCenter /> : transfers.length === 0 ? (
        <EmptyState
          title="No transfer requests"
          description="Transfer requests allow you to move medicine stock between facilities in the network."
          actions={<button className="btn btn-primary btn-sm" onClick={() => setNewOpen(true)}>Create request</button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {transfers.map(t => (
            <TransferCard
              key={t.id}
              transfer={t}
              facilityId={facilityId}
              onAction={act => setAction({ type: act, transfer: t })}
            />
          ))}
        </div>
      )}

      {newOpen && (
        <NewTransferModal
          facilityId={facilityId}
          prefill={prefill}
          onClose={() => setNewOpen(false)}
          onSuccess={() => { setNewOpen(false); load() }}
        />
      )}

      {action && (
        <ActionModal
          action={action}
          facilityId={facilityId}
          onClose={() => setAction(null)}
          onSuccess={() => { setAction(null); load() }}
        />
      )}
    </div>
  )
}

function TransferCard({ transfer: t, facilityId, onAction }) {
  const isRequesting = t.requesting?.id === facilityId
  const isSupplying  = t.supplying?.id  === facilityId

  return (
    <div className="card card-pad">
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Badge className={transferStatusClass(t.status)} dot>{transferStatusLabel(t.status)}</Badge>
          {t.urgency !== 'normal' && <Badge className={urgencyClass(t.urgency)}>{t.urgency}</Badge>}
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtRelative(t.created_at)}</span>
        </div>
        <TransferPipeline status={t.status} />
      </div>

      {/* Medicine + facilities */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          {t.medicines?.generic_name} · {t.medicines?.strength}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>
            <span style={{ color: 'var(--text-disabled)' }}>From</span>{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>{t.supplying?.name}</strong>
            {t.supplying?.city && ` · ${t.supplying.city}`}
          </span>
          <span style={{ color: 'var(--text-disabled)' }}>→</span>
          <span>
            <span style={{ color: 'var(--text-disabled)' }}>To</span>{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>{t.requesting?.name}</strong>
            {t.requesting?.city && ` · ${t.requesting.city}`}
          </span>
        </div>
      </div>

      {/* Quantities */}
      <div style={{ display: 'flex', gap: 20, fontSize: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Requested </span>
          <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{fmtNumber(t.quantity_requested)}</span>
        </div>
        {t.quantity_approved && (
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Approved </span>
            <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{fmtNumber(t.quantity_approved)}</span>
          </div>
        )}
        {t.quantity_fulfilled && (
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Fulfilled </span>
            <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>{fmtNumber(t.quantity_fulfilled)}</span>
          </div>
        )}
      </div>

      {t.reason && (
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>
          "{t.reason}"
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {isSupplying && t.status === 'pending' && (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => onAction('approve')}>Approve</button>
            <button className="btn btn-danger btn-sm" onClick={() => onAction('reject')}>Reject</button>
          </>
        )}
        {isSupplying && t.status === 'approved' && (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => onAction('in_transit')}>Mark in transit</button>
            <button className="btn btn-primary btn-sm" onClick={() => onAction('fulfill')}>Fulfill</button>
          </>
        )}
        {isSupplying && t.status === 'in_transit' && (
          <button className="btn btn-primary btn-sm" onClick={() => onAction('fulfill')}>Confirm fulfillment</button>
        )}
        {isRequesting && ['pending','approved','in_transit'].includes(t.status) && (
          <button className="btn btn-ghost btn-sm" onClick={() => onAction('cancel')}>Cancel request</button>
        )}
      </div>
    </div>
  )
}

/* ── NEW TRANSFER MODAL ── */
function NewTransferModal({ facilityId, prefill, onClose, onSuccess }) {
  const [facilities, setFacilities] = useState([])
  const [medicines,  setMedicines]  = useState([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [f, setF] = useState({
    supplying_facility_id: prefill?.supplying_facility_id ?? '',
    medicine_id:           prefill?.medicine_id           ?? '',
    quantity_requested:    '',
    urgency:               'normal',
    reason:                '',
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  useEffect(() => {
    supabase.from('facilities').select('id,name,city,country').eq('is_active', true)
      .then(({ data }) => setFacilities((data ?? []).filter(x => x.id !== facilityId)))
    supabase.from('medicines').select('id,generic_name,strength').eq('is_active', true).order('generic_name')
      .then(({ data }) => setMedicines(data ?? []))
  }, [facilityId])

  async function handleSubmit(e) {
    e.preventDefault(); setError(null); setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('transfer_requests').insert({
      requesting_facility_id: facilityId,
      supplying_facility_id:  f.supplying_facility_id,
      medicine_id:            f.medicine_id,
      quantity_requested:     Number(f.quantity_requested),
      urgency:                f.urgency,
      reason:                 f.reason || null,
      requested_by:           user.id,
      status:                 'pending',
    })
    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
  }

  return (
    <Modal title="New transfer request" subtitle="Stock will not be reserved until the supplying facility approves" onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" form="new-tr-form" type="submit" disabled={loading}>
          {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#07111f' }} /> Submitting…</> : 'Submit request'}
        </button>
      </>}
    >
      {prefill && (
        <div className="inline-alert alert-info">
          <span className="inline-alert-icon">ℹ</span>
          <span>Requesting from <strong>{prefill.supplying_name}</strong></span>
        </div>
      )}
      <InlineError message={error} />
      <form id="new-tr-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label>Supplying facility *</label>
          <select required value={f.supplying_facility_id} onChange={e => set('supplying_facility_id', e.target.value)}>
            <option value="">Select facility…</option>
            {facilities.map(x => <option key={x.id} value={x.id}>{x.name} — {x.city}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Medicine *</label>
          <select required value={f.medicine_id} onChange={e => set('medicine_id', e.target.value)}>
            <option value="">Select medicine…</option>
            {medicines.map(m => <option key={m.id} value={m.id}>{m.generic_name} · {m.strength}</option>)}
          </select>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Quantity needed *</label>
            <input type="number" required min={1} value={f.quantity_requested} onChange={e => set('quantity_requested', e.target.value)} />
          </div>
          <div className="field">
            <label>Urgency</label>
            <select value={f.urgency} onChange={e => set('urgency', e.target.value)}>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Reason for request</label>
          <textarea value={f.reason} onChange={e => set('reason', e.target.value)} placeholder="Why is this stock needed? (Stockout, patient demand, etc.)" />
        </div>
      </form>
    </Modal>
  )
}

/* ── ACTION MODALS ── */
function ActionModal({ action: { type, transfer }, facilityId, onClose, onSuccess }) {
  const [inventoryItems, setInventoryItems] = useState([])
  const [f,       setF]       = useState({ inventory_item_id: '', quantity: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (type === 'approve') {
      supabase.from('inventory_items')
        .select('id,batch_number,quantity_available,quantity_reserved,expiry_date')
        .eq('facility_id', facilityId)
        .eq('medicine_id', transfer.medicines?.id ?? transfer.medicine_id)
        .eq('is_active', true)
        .then(({ data }) => setInventoryItems(data ?? []))
    }
  }, [type])

  const TITLES = {
    approve:    'Approve transfer request',
    reject:     'Reject transfer request',
    cancel:     'Cancel transfer request',
    in_transit: 'Mark transfer as in transit',
    fulfill:    'Confirm transfer fulfillment',
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError(null); setLoading(true)

    let err
    if (type === 'approve') {
      const res = await supabase.rpc('approve_transfer_request', {
        p_request_id:        transfer.id,
        p_quantity_approved: Number(f.quantity),
        p_inventory_item_id: f.inventory_item_id,
      }); err = res.error
    } else if (type === 'reject') {
      const res = await supabase.rpc('reject_transfer_request', { p_request_id: transfer.id, p_notes: f.notes || null }); err = res.error
    } else if (type === 'cancel') {
      const res = await supabase.rpc('cancel_transfer_request', { p_request_id: transfer.id, p_notes: f.notes || null }); err = res.error
    } else if (type === 'in_transit') {
      const res = await supabase.rpc('mark_transfer_in_transit', { p_request_id: transfer.id, p_notes: f.notes || null }); err = res.error
    } else if (type === 'fulfill') {
      const res = await supabase.rpc('fulfill_transfer_request', {
        p_request_id:         transfer.id,
        p_quantity_fulfilled: Number(f.quantity),
        p_notes:              f.notes || null,
      }); err = res.error
    }

    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
  }

  const BTN = {
    approve: { label: 'Approve', cls: 'btn-primary' },
    reject:  { label: 'Reject',  cls: 'btn-danger' },
    cancel:  { label: 'Cancel request', cls: 'btn-danger' },
    in_transit: { label: 'Mark in transit', cls: 'btn-secondary' },
    fulfill: { label: 'Confirm fulfillment', cls: 'btn-primary' },
  }

  return (
    <Modal title={TITLES[type]} onClose={onClose} size="modal-sm"
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Back</button>
        <button className={`btn ${BTN[type].cls}`} form="action-form" type="submit" disabled={loading}>
          {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: type === 'approve' || type === 'fulfill' ? '#07111f' : undefined }} /> Processing…</> : BTN[type].label}
        </button>
      </>}
    >
      <ContextCard
        title={`${transfer.medicines?.generic_name} · ${transfer.medicines?.strength}`}
        meta={`Requested: ${fmtNumber(transfer.quantity_requested)} units${transfer.quantity_approved ? ` · Approved: ${fmtNumber(transfer.quantity_approved)}` : ''}`}
      />
      <InlineError message={error} />
      <form id="action-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {type === 'approve' && (
          <>
            <div className="field">
              <label>Select inventory batch to reserve *</label>
              <select required value={f.inventory_item_id} onChange={e => setF(p => ({ ...p, inventory_item_id: e.target.value }))}>
                <option value="">Choose batch…</option>
                {inventoryItems.map(i => (
                  <option key={i.id} value={i.id}>
                    Batch {i.batch_number} · {fmtNumber(i.quantity_available - i.quantity_reserved)} unreserved · exp {fmtDate(i.expiry_date)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Quantity to approve *</label>
              <input type="number" required min={1} max={transfer.quantity_requested}
                value={f.quantity} onChange={e => setF(p => ({ ...p, quantity: e.target.value }))} />
              <div className="field-hint">Max: {transfer.quantity_requested} (requested)</div>
            </div>
          </>
        )}
        {type === 'fulfill' && (
          <div className="field">
            <label>Quantity fulfilled *</label>
            <input type="number" required min={1} max={transfer.quantity_approved}
              value={f.quantity} onChange={e => setF(p => ({ ...p, quantity: e.target.value }))} />
            <div className="field-hint">Max: {transfer.quantity_approved} (approved)</div>
          </div>
        )}
        {['reject','cancel','in_transit'].includes(type) && (
          <div className="field">
            <label>Notes {type === 'reject' ? '(reason for rejection)' : '(optional)'}</label>
            <textarea value={f.notes} onChange={e => setF(p => ({ ...p, notes: e.target.value }))}
              placeholder={type === 'reject' ? 'Explain why this request cannot be fulfilled' : 'Any additional notes'} />
          </div>
        )}
      </form>
    </Modal>
  )
}
