import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useFacility } from '../hooks/useFacility'
import { fmtDate, getTransferStatus } from '../utils/formatters'
import StatusBadge from '../components/shared/StatusBadge'
import Modal from '../components/shared/Modal'
import EmptyState from '../components/shared/EmptyState'
import InlineError from '../components/shared/InlineError'

const TABS = ['all', 'incoming', 'outgoing', 'pending']

const URGENCY_VARIANTS = {
  normal: 'neutral',
  urgent: 'warning',
  critical: 'danger',
}

export default function TransfersPage() {
  const { facilityId } = useFacility()
  const location = useLocation()

  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [actionModal, setActionModal] = useState(null)

  const prefill = location.state?.prefill ?? null

  const loadTransfers = useCallback(async () => {
    if (!facilityId) return

    setLoading(true)

    let query = supabase
      .from('transfer_requests')
      .select(`
        *,
        medicines(generic_name, strength),
        requesting:requesting_facility_id(name, city),
        supplying:supplying_facility_id(name, city)
      `)
      .or(`requesting_facility_id.eq.${facilityId},supplying_facility_id.eq.${facilityId}`)
      .order('created_at', { ascending: false })

    if (tab === 'incoming') {
      query = query.eq('supplying_facility_id', facilityId)
    }

    if (tab === 'outgoing') {
      query = query.eq('requesting_facility_id', facilityId)
    }

    if (tab === 'pending') {
      query = query.eq('status', 'pending')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading transfers:', error.message)
      setTransfers([])
      setLoading(false)
      return
    }

    setTransfers(data ?? [])
    setLoading(false)
  }, [facilityId, tab])

  useEffect(() => {
    loadTransfers()
  }, [loadTransfers])

  useEffect(() => {
    if (prefill) {
      setShowNewModal(true)
    }
  }, [prefill])

  return (
    <div className="transfers-page fade-up">
      <div className="page-header">
        <div>
          <h1>Stock transfers</h1>
          <div className="page-title-sub">
            Request and manage medicine transfers between facilities
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
          New request
        </button>
      </div>

      <div className="filter-group">
        {TABS.map((item) => (
          <button
            key={item}
            className={`btn btn-sm ${tab === item ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(item)}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="spinner spinner-lg" />
        </div>
      ) : transfers.length === 0 ? (
        <EmptyState
          icon="⇄"
          title="No transfers"
          message="No transfer requests found."
        />
      ) : (
        <div className="transfer-list">
          {transfers.map((transfer) => (
            <TransferCard
              key={transfer.id}
              transfer={transfer}
              facilityId={facilityId}
              onAction={setActionModal}
            />
          ))}
        </div>
      )}

      {showNewModal && (
        <NewTransferModal
          facilityId={facilityId}
          prefill={prefill}
          onClose={() => setShowNewModal(false)}
          onSuccess={() => {
            setShowNewModal(false)
            loadTransfers()
          }}
        />
      )}

      {actionModal && (
        <TransferActionModal
          action={actionModal}
          facilityId={facilityId}
          onClose={() => setActionModal(null)}
          onSuccess={() => {
            setActionModal(null)
            loadTransfers()
          }}
        />
      )}
    </div>
  )
}

function TransferCard({ transfer, facilityId, onAction }) {
  const isRequesting = transfer.requesting_facility_id === facilityId
  const isSupplying = transfer.supplying_facility_id === facilityId

  const oppositeFacility = isRequesting
    ? transfer.supplying
    : transfer.requesting

  return (
    <article className="transfer-card">
      <div className="transfer-card-content">
        <div className="transfer-badges">
          <StatusBadge variant={getTransferStatus(transfer.status)}>
            {transfer.status?.replace('_', ' ') || 'unknown'}
          </StatusBadge>

          {transfer.urgency && transfer.urgency !== 'normal' && (
            <StatusBadge variant={URGENCY_VARIANTS[transfer.urgency] || 'neutral'}>
              {transfer.urgency}
            </StatusBadge>
          )}
        </div>

        <div className="transfer-title">
          {transfer.medicines?.generic_name || 'Unknown medicine'}
          {transfer.medicines?.strength ? ` · ${transfer.medicines.strength}` : ''}
        </div>

        <div className="transfer-route">
          {isRequesting ? 'You requested from ' : 'Request from '}
          <strong>{oppositeFacility?.name || 'Unknown facility'}</strong>
          {!isRequesting && oppositeFacility?.city ? ` (${oppositeFacility.city})` : ''}
        </div>

        <div className="transfer-meta">
          Requested: {transfer.quantity_requested}
          {transfer.quantity_approved ? ` · Approved: ${transfer.quantity_approved}` : ''}
          {transfer.quantity_fulfilled ? ` · Fulfilled: ${transfer.quantity_fulfilled}` : ''}
          {' · '}
          {fmtDate(transfer.created_at)}
        </div>

        {transfer.reason && (
          <div className="transfer-reason">
            Reason: {transfer.reason}
          </div>
        )}
      </div>

      <div className="transfer-actions">
        {isSupplying && transfer.status === 'pending' && (
          <>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onAction({ type: 'approve', transfer })}
            >
              Approve
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={() => onAction({ type: 'reject', transfer })}
            >
              Reject
            </button>
          </>
        )}

        {isSupplying && transfer.status === 'approved' && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onAction({ type: 'in_transit', transfer })}
          >
            Mark in transit
          </button>
        )}

        {isSupplying && ['approved', 'in_transit'].includes(transfer.status) && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onAction({ type: 'fulfill', transfer })}
          >
            Fulfill
          </button>
        )}

        {isRequesting && ['pending', 'approved', 'in_transit'].includes(transfer.status) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onAction({ type: 'cancel', transfer })}
          >
            Cancel
          </button>
        )}
      </div>
    </article>
  )
}

function NewTransferModal({ facilityId, prefill, onClose, onSuccess }) {
  const [facilities, setFacilities] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    supplying_facility_id: prefill?.supplying_facility_id ?? '',
    medicine_id: prefill?.medicine_id ?? '',
    quantity_requested: '',
    urgency: 'normal',
    reason: '',
  })

  useEffect(() => {
    async function loadFormOptions() {
      const { data: facilityData, error: facilityError } = await supabase
        .from('facilities')
        .select('id, name, city, country')
        .eq('is_active', true)
        .order('name')

      if (facilityError) {
        console.error('Error loading facilities:', facilityError.message)
      } else {
        setFacilities((facilityData ?? []).filter((facility) => facility.id !== facilityId))
      }

      const { data: medicineData, error: medicineError } = await supabase
        .from('medicines')
        .select('id, generic_name, strength')
        .eq('is_active', true)
        .order('generic_name')

      if (medicineError) {
        console.error('Error loading medicines:', medicineError.message)
      } else {
        setMedicines(medicineData ?? [])
      }
    }

    loadFormOptions()
  }, [facilityId])

  function update(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError(null)
    setLoading(true)

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user?.id) {
      setError('Your session has expired. Please sign in again.')
      setLoading(false)
      return
    }

    const { error: transferError } = await supabase
      .from('transfer_requests')
      .insert({
        requesting_facility_id: facilityId,
        supplying_facility_id: form.supplying_facility_id,
        medicine_id: form.medicine_id,
        quantity_requested: Number(form.quantity_requested),
        urgency: form.urgency,
        reason: form.reason.trim() || null,
        requested_by: userData.user.id,
        status: 'pending',
      })

    if (transferError) {
      setError(transferError.message)
      setLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <Modal
      title="New transfer request"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary"
            form="new-transfer-form"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Submitting…
              </>
            ) : (
              'Submit request'
            )}
          </button>
        </>
      }
    >
      {prefill && (
        <div className="alert-banner alert-banner-info" role="status">
          <div className="alert-icon alert-icon-info">i</div>
          <div className="alert-message alert-message-info">
            Requesting from <strong>{prefill.supplying_name}</strong>
          </div>
        </div>
      )}

      <InlineError message={error} />

      <form id="new-transfer-form" className="modal-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="supplyingFacility">Supplying facility *</label>
          <select
            id="supplyingFacility"
            required
            value={form.supplying_facility_id}
            onChange={(event) => update('supplying_facility_id', event.target.value)}
          >
            <option value="">Select facility…</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name} — {facility.city}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="transferMedicine">Medicine *</label>
          <select
            id="transferMedicine"
            required
            value={form.medicine_id}
            onChange={(event) => update('medicine_id', event.target.value)}
          >
            <option value="">Select medicine…</option>
            {medicines.map((medicine) => (
              <option key={medicine.id} value={medicine.id}>
                {medicine.generic_name} · {medicine.strength}
              </option>
            ))}
          </select>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="quantityRequested">Quantity needed *</label>
            <input
              id="quantityRequested"
              type="number"
              required
              min={1}
              value={form.quantity_requested}
              onChange={(event) => update('quantity_requested', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="urgency">Urgency</label>
            <select
              id="urgency"
              value={form.urgency}
              onChange={(event) => update('urgency', event.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="transferReason">Reason for request</label>
          <textarea
            id="transferReason"
            value={form.reason}
            onChange={(event) => update('reason', event.target.value)}
            placeholder="Explain why this stock is needed"
          />
        </div>
      </form>
    </Modal>
  )
}

function TransferActionModal({ action, facilityId, onClose, onSuccess }) {
  const { type, transfer } = action

  const [inventoryItems, setInventoryItems] = useState([])
  const [form, setForm] = useState({
    inventory_item_id: '',
    quantity: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadInventoryItems() {
      if (type !== 'approve') return

      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, batch_number, quantity_available, quantity_reserved, expiry_date')
        .eq('facility_id', facilityId)
        .eq('medicine_id', transfer.medicine_id)
        .eq('is_active', true)
        .order('expiry_date', { ascending: true })

      if (error) {
        console.error('Error loading inventory items:', error.message)
        setInventoryItems([])
        return
      }

      setInventoryItems(data ?? [])
    }

    loadInventoryItems()
  }, [type, facilityId, transfer.medicine_id])

  function update(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError(null)
    setLoading(true)

    let result

    if (type === 'approve') {
      result = await supabase.rpc('approve_transfer_request', {
        p_request_id: transfer.id,
        p_quantity_approved: Number(form.quantity),
        p_inventory_item_id: form.inventory_item_id,
      })
    }

    if (type === 'reject') {
      result = await supabase.rpc('reject_transfer_request', {
        p_request_id: transfer.id,
        p_notes: form.notes.trim() || null,
      })
    }

    if (type === 'cancel') {
      result = await supabase.rpc('cancel_transfer_request', {
        p_request_id: transfer.id,
        p_notes: form.notes.trim() || null,
      })
    }

    if (type === 'in_transit') {
      result = await supabase.rpc('mark_transfer_in_transit', {
        p_request_id: transfer.id,
        p_notes: form.notes.trim() || null,
      })
    }

    if (type === 'fulfill') {
      result = await supabase.rpc('fulfill_transfer_request', {
        p_request_id: transfer.id,
        p_quantity_fulfilled: Number(form.quantity),
        p_notes: form.notes.trim() || null,
      })
    }

    if (result?.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    onSuccess()
  }

  const titleMap = {
    approve: 'Approve transfer request',
    reject: 'Reject transfer request',
    cancel: 'Cancel transfer request',
    in_transit: 'Mark as in transit',
    fulfill: 'Fulfill transfer request',
  }

  const buttonLabelMap = {
    approve: 'Approve',
    reject: 'Reject',
    cancel: 'Cancel request',
    in_transit: 'Mark in transit',
    fulfill: 'Confirm fulfillment',
  }

  const buttonClassMap = {
    approve: 'btn-primary',
    reject: 'btn-danger',
    cancel: 'btn-danger',
    in_transit: 'btn-secondary',
    fulfill: 'btn-primary',
  }

  return (
    <Modal
      title={titleMap[type]}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Back
          </button>

          <button
            className={`btn ${buttonClassMap[type]}`}
            form="transfer-action-form"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Processing…
              </>
            ) : (
              buttonLabelMap[type]
            )}
          </button>
        </>
      }
    >
      <div className="item-summary-card">
        <div className="item-summary-title">
          {transfer.medicines?.generic_name || 'Unknown medicine'}
          {transfer.medicines?.strength ? ` · ${transfer.medicines.strength}` : ''}
        </div>

        <div className="item-summary-sub">
          Requested: {transfer.quantity_requested} units
          {transfer.quantity_approved ? ` · Approved: ${transfer.quantity_approved}` : ''}
        </div>
      </div>

      <InlineError message={error} />

      <form id="transfer-action-form" className="modal-form" onSubmit={handleSubmit}>
        {type === 'approve' && (
          <>
            <div className="field">
              <label htmlFor="inventoryBatch">Select inventory batch *</label>
              <select
                id="inventoryBatch"
                required
                value={form.inventory_item_id}
                onChange={(event) => update('inventory_item_id', event.target.value)}
              >
                <option value="">Choose batch…</option>
                {inventoryItems.map((item) => {
                  const unreserved =
                    Number(item.quantity_available ?? 0) -
                    Number(item.quantity_reserved ?? 0)

                  return (
                    <option key={item.id} value={item.id}>
                      Batch {item.batch_number} — {unreserved} unreserved · expires{' '}
                      {fmtDate(item.expiry_date)}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="field">
              <label htmlFor="approveQuantity">Quantity to approve *</label>
              <input
                id="approveQuantity"
                type="number"
                required
                min={1}
                max={transfer.quantity_requested}
                value={form.quantity}
                onChange={(event) => update('quantity', event.target.value)}
              />
            </div>
          </>
        )}

        {type === 'fulfill' && (
          <div className="field">
            <label htmlFor="fulfilledQuantity">Quantity fulfilled *</label>
            <input
              id="fulfilledQuantity"
              type="number"
              required
              min={1}
              max={transfer.quantity_approved}
              value={form.quantity}
              onChange={(event) => update('quantity', event.target.value)}
            />
          </div>
        )}

        {['reject', 'cancel', 'in_transit'].includes(type) && (
          <div className="field">
            <label htmlFor="actionNotes">
              Notes {type === 'reject' ? '(reason for rejection)' : ''}
            </label>
            <textarea
              id="actionNotes"
              value={form.notes}
              onChange={(event) => update('notes', event.target.value)}
              placeholder={
                type === 'reject'
                  ? 'Explain why this request is being rejected'
                  : 'Optional notes'
              }
            />
          </div>
        )}
      </form>
    </Modal>
  )
}
