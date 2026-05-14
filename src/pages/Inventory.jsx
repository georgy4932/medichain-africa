import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useFacility } from '../hooks/useFacility'
import {
  fmtDate, fmtCurrency, fmtNumber,
  expiryBadgeClass, fmtExpiryLabel, daysUntilExpiry,
  stockStatusClass, stockStatusLabel,
} from '../utils/formatters'
import { Modal, InlineError, EmptyState, Badge, SkeletonRow, ContextCard } from '../components/shared'

const STORAGE_CONDS = ['room_temperature','cool','refrigerated','frozen','controlled_room','protect_from_light','protect_from_moisture']
const MOVEMENT_TYPES = [
  { value: 'receipt',         label: 'Receipt — stock received from supplier' },
  { value: 'dispensed',       label: 'Dispensed — issued to patient or facility' },
  { value: 'adjustment',      label: 'Manual adjustment' },
  { value: 'expired_removal', label: 'Expired removal' },
  { value: 'return',          label: 'Return to supplier' },
]
const FILTER_OPTIONS = [
  { key: 'all',      label: 'All stock' },
  { key: 'low',      label: 'Low stock',    chip: 'chip-warning' },
  { key: 'out',      label: 'Out of stock', chip: 'chip-danger'  },
  { key: 'expiring', label: 'Near expiry',  chip: 'chip-warning' },
  { key: 'reserved', label: 'Reserved'                           },
]

export default function InventoryPage() {
  const { facilityId, facility, isAdmin } = useFacility()
  const [items,     setItems]     = useState([])
  const [medicines, setMedicines] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')
  const [addOpen,   setAddOpen]   = useState(false)
  const [adjItem,   setAdjItem]   = useState(null)
  const [editItem,  setEditItem]  = useState(null)

  const load = useCallback(async () => {
    if (!facilityId) return
    setLoading(true)
    const { data } = await supabase
      .from('inventory_items')
      .select('*, medicines(generic_name, dosage_form, strength, therapeutic_class, essential_medicine), suppliers(name)')
      .eq('facility_id', facilityId).eq('is_active', true)
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }, [facilityId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    supabase.from('medicines').select('id, generic_name, dosage_form, strength').eq('is_active', true).order('generic_name')
      .then(({ data }) => setMedicines(data ?? []))
    if (facilityId)
      supabase.from('suppliers').select('id, name').eq('facility_id', facilityId)
        .then(({ data }) => setSuppliers(data ?? []))
  }, [facilityId])

  const filtered = items.filter(i => {
    const u = i.quantity_available - i.quantity_reserved
    const days = daysUntilExpiry(i.expiry_date)
    const q = search.toLowerCase()
    const matchSearch = !q || [i.medicines?.generic_name, i.brand_name, i.batch_number].some(v => v?.toLowerCase().includes(q))
    if (!matchSearch) return false
    if (filter === 'low')      return u > 0 && u < i.reorder_level
    if (filter === 'out')      return i.quantity_available === 0
    if (filter === 'expiring') return days !== null && days >= 0 && days <= (facility?.near_expiry_threshold_days ?? 90)
    if (filter === 'reserved') return i.quantity_reserved > 0
    return true
  })

  const counts = {
    all:      items.length,
    low:      items.filter(i => { const u = i.quantity_available - i.quantity_reserved; return u > 0 && u < i.reorder_level }).length,
    out:      items.filter(i => i.quantity_available === 0).length,
    expiring: items.filter(i => { const d = daysUntilExpiry(i.expiry_date); return d !== null && d >= 0 && d <= (facility?.near_expiry_threshold_days ?? 90) }).length,
    reserved: items.filter(i => i.quantity_reserved > 0).length,
  }

  return (
    <div>
      <div className="page-top">
        <div>
          <div className="page-eyebrow">My Facility · Inventory</div>
          <div className="page-title">Facility Inventory</div>
          <div className="page-subtitle">
            Your inventory powers local medicine availability intelligence — stock you add becomes visible to the network
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>+ Add stock</button>
        </div>
      </div>

      {/* Network framing banner */}
      {items.length > 0 && (
        <div className="inline-alert alert-info" style={{ marginBottom: 16 }}>
          <span className="inline-alert-icon">ℹ</span>
          <div style={{ fontSize: 12 }}>
            <strong>{items.length} active batch{items.length !== 1 ? 'es' : ''}</strong> published to the medicine availability network.
            Other verified facilities can locate and request this stock when facing shortages.
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              placeholder="Search medicine, brand, batch…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-chips">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f.key}
                className={`chip ${f.chip ?? ''} ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                {counts[f.key] > 0 && filter !== f.key && (
                  <span style={{ background: 'var(--bg-elevated)', borderRadius: 99, padding: '0 5px', fontSize: 10, marginLeft: 2 }}>
                    {counts[f.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Batch</th>
              <th>Status</th>
              <th title="Excludes stock reserved for pending transfers">Available</th>
              <th>Reorder at</th>
              <th>Expiry</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1,2,3,4,5].map(i => <SkeletonRow key={i} cols={8} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    title="No inventory items"
                    description="Add inventory to make your facility visible in the medicine availability network. Other verified facilities and clinics will be able to locate medicines at your facility and request transfers when they face shortages."
                    actions={<>
                      <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>Add stock batch</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setFilter('all')}>Clear filters</button>
                    </>}
                  />
                </td>
              </tr>
            ) : filtered.map(item => {
              const available = item.quantity_available - item.quantity_reserved
              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="td-primary truncate" style={{ maxWidth: 170 }}>
                        {item.medicines?.generic_name}
                      </div>
                      {item.medicines?.essential_medicine && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-dim)', border: '1px solid var(--primary-border)', borderRadius: 'var(--r-xs)', padding: '1px 4px', flexShrink: 0 }}>
                          ESSENTIAL
                        </span>
                      )}
                    </div>
                    <div className="td-muted">
                      {item.brand_name ? `${item.brand_name} · ` : ''}
                      {item.medicines?.strength} {item.medicines?.dosage_form}
                    </div>
                  </td>
                  <td><span className="pill">{item.batch_number}</span></td>
                  <td>
                    <Badge className={stockStatusClass(available, item.reorder_level)} dot>
                      {stockStatusLabel(available, item.reorder_level)}
                    </Badge>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 12 }}
                      title="Excludes stock reserved for pending transfers">
                      {fmtNumber(available)}
                    </span>
                    {item.quantity_reserved > 0 && (
                      <div style={{ fontSize: 10, color: 'var(--warning)', marginTop: 1 }}>
                        {item.quantity_reserved} reserved for transfer
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: available < item.reorder_level ? 'var(--warning)' : 'var(--text-muted)' }}>
                      {item.reorder_level}
                    </span>
                  </td>
                  <td>
                    <Badge className={expiryBadgeClass(item.expiry_date)}>
                      {fmtExpiryLabel(item.expiry_date)}
                    </Badge>
                  </td>
                  <td className="td-muted">
                    {item.selling_price
                      ? fmtCurrency(item.selling_price, facility?.default_currency)
                      : <span style={{ color: 'var(--text-disabled)', fontSize: 11 }}>Not set</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn btn-ghost btn-xs" onClick={() => setAdjItem(item)}>Adjust</button>
                      <button className="btn btn-ghost btn-xs" onClick={() => setEditItem(item)}>Edit</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {addOpen  && <AddModal  facilityId={facilityId} medicines={medicines} suppliers={suppliers} currency={facility?.default_currency} onClose={() => setAddOpen(false)}  onSuccess={() => { setAddOpen(false);  load() }} />}
      {adjItem  && <AdjModal  item={adjItem}  onClose={() => setAdjItem(null)}  onSuccess={() => { setAdjItem(null);  load() }} />}
      {editItem && <EditModal item={editItem} isAdmin={isAdmin} suppliers={suppliers} currency={facility?.default_currency} onClose={() => setEditItem(null)} onSuccess={() => { setEditItem(null); load() }} />}
    </div>
  )
}

function AddModal({ facilityId, medicines, suppliers, currency, onClose, onSuccess }) {
  const [f, setF] = useState({
    medicine_id: '', batch_number: '', expiry_date: '', quantity: '', reorder_level: 10,
    brand_name: '', supplier_id: '', manufacture_date: '', unit_cost: '', selling_price: '',
    storage_condition: 'room_temperature', storage_location: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault(); setError(null); setLoading(true)
    const { error: err } = await supabase.rpc('create_inventory_item', {
      p_facility_id:      facilityId,
      p_medicine_id:      f.medicine_id,
      p_batch_number:     f.batch_number,
      p_expiry_date:      f.expiry_date,
      p_quantity:         Number(f.quantity),
      p_reorder_level:    Number(f.reorder_level),
      p_brand_name:       f.brand_name       || null,
      p_supplier_id:      f.supplier_id      || null,
      p_manufacture_date: f.manufacture_date || null,
      p_unit_cost:        f.unit_cost        ? Number(f.unit_cost)    : null,
      p_selling_price:    f.selling_price    ? Number(f.selling_price): null,
      p_storage_condition:f.storage_condition,
      p_storage_location: f.storage_location || null,
      p_notes:            f.notes            || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
  }

  return (
    <Modal title="Add stock batch" subtitle="Stock you add becomes visible to the medicine availability network" onClose={onClose} size="modal-lg"
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" form="add-form" type="submit" disabled={loading}>
          {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#07111f' }}/> Adding…</> : 'Add to network'}
        </button>
      </>}
    >
      <InlineError message={error} />
      <form id="add-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div className="form-section-title">Medicine Identity</div>
          <div className="form-section" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Medicine *</label>
              <select required value={f.medicine_id} onChange={e => set('medicine_id', e.target.value)}>
                <option value="">Select from catalog…</option>
                {medicines.map(m => <option key={m.id} value={m.id}>{m.generic_name} — {m.strength} ({m.dosage_form})</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="field"><label>Batch number *</label><input required value={f.batch_number} onChange={e => set('batch_number', e.target.value)} placeholder="e.g. BT-2024-001" /></div>
              <div className="field"><label>Brand name</label><input value={f.brand_name} onChange={e => set('brand_name', e.target.value)} placeholder="Optional" /></div>
            </div>
          </div>
        </div>
        <div>
          <div className="form-section-title">Stock & Dates</div>
          <div className="form-section" style={{ marginTop: 12 }}>
            <div className="grid-2">
              <div className="field">
                <label>Initial quantity *</label>
                <input type="number" required min={0} value={f.quantity} onChange={e => set('quantity', e.target.value)} />
                <div className="field-hint">Units received — published to availability network</div>
              </div>
              <div className="field">
                <label>Reorder level</label>
                <input type="number" min={0} value={f.reorder_level} onChange={e => set('reorder_level', e.target.value)} />
                <div className="field-hint">Shortage alert fires below this quantity</div>
              </div>
            </div>
            <div className="grid-2">
              <div className="field"><label>Expiry date *</label><input type="date" required value={f.expiry_date} onChange={e => set('expiry_date', e.target.value)} /></div>
              <div className="field"><label>Manufacture date</label><input type="date" value={f.manufacture_date} onChange={e => set('manufacture_date', e.target.value)} /></div>
            </div>
          </div>
        </div>
        <div>
          <div className="form-section-title">Supply Chain</div>
          <div className="form-section" style={{ marginTop: 12 }}>
            <div className="grid-2">
              <div className="field"><label>Unit cost ({currency})</label><input type="number" min={0} step="0.01" value={f.unit_cost} onChange={e => set('unit_cost', e.target.value)} /></div>
              <div className="field"><label>Selling price ({currency})</label><input type="number" min={0} step="0.01" value={f.selling_price} onChange={e => set('selling_price', e.target.value)} /></div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Supplier</label>
                <select value={f.supplier_id} onChange={e => set('supplier_id', e.target.value)}>
                  <option value="">None / unknown</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Storage condition</label>
                <select value={f.storage_condition} onChange={e => set('storage_condition', e.target.value)}>
                  {STORAGE_CONDS.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label>Storage location</label><input value={f.storage_location} onChange={e => set('storage_location', e.target.value)} placeholder="e.g. Shelf B2, Cold Room 1" /></div>
          </div>
        </div>
      </form>
    </Modal>
  )
}

function AdjModal({ item, onClose, onSuccess }) {
  const [movType, setMovType] = useState('receipt')
  const [qty,     setQty]     = useState('')
  const [notes,   setNotes]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const isOut    = ['dispensed','expired_removal','return'].includes(movType)
  const available = item.quantity_available - item.quantity_reserved

  async function handleSubmit(e) {
    e.preventDefault(); setError(null); setLoading(true)
    const delta = isOut ? -Math.abs(Number(qty)) : Math.abs(Number(qty))
    const { error: err } = await supabase.rpc('update_inventory_quantity', {
      p_inventory_item_id: item.id,
      p_quantity_change:   delta,
      p_movement_type:     movType,
      p_notes:             notes || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
  }

  return (
    <Modal title="Adjust stock quantity" subtitle="All movements are logged to the inventory audit trail" onClose={onClose} size="modal-sm"
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" form="adj-form" type="submit" disabled={loading}>
          {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#07111f' }}/> Saving…</> : 'Save movement'}
        </button>
      </>}
    >
      <ContextCard title={item.medicines?.generic_name} meta={`Batch ${item.batch_number} · ${fmtNumber(available)} units available`} />
      <InlineError message={error} />
      <form id="adj-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label>Movement type *</label>
          <select required value={movType} onChange={e => setMovType(e.target.value)}>
            {MOVEMENT_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Quantity *</label>
          <input type="number" required min={1} value={qty} onChange={e => setQty(e.target.value)} placeholder={isOut ? 'Units going out' : 'Units coming in'} />
        </div>
        <div className="field">
          <label>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reference or reason for this movement" />
        </div>
      </form>
    </Modal>
  )
}

function EditModal({ item, isAdmin, suppliers, currency, onClose, onSuccess }) {
  const [f, setF] = useState({
    brand_name:        item.brand_name       ?? '',
    reorder_level:     item.reorder_level,
    expiry_date:       item.expiry_date,
    manufacture_date:  item.manufacture_date ?? '',
    supplier_id:       item.supplier_id      ?? '',
    storage_condition: item.storage_condition,
    storage_location:  item.storage_location ?? '',
    notes:             item.notes            ?? '',
    is_active:         item.is_active,
    unit_cost:         item.unit_cost        ?? '',
    selling_price:     item.selling_price    ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault(); setError(null); setLoading(true)
    const payload = {
      brand_name:       f.brand_name       || null,
      reorder_level:    Number(f.reorder_level),
      expiry_date:      f.expiry_date,
      manufacture_date: f.manufacture_date || null,
      supplier_id:      f.supplier_id      || null,
      storage_condition:f.storage_condition,
      storage_location: f.storage_location || null,
      notes:            f.notes            || null,
      is_active:        f.is_active,
      ...(isAdmin ? {
        unit_cost:    f.unit_cost    ? Number(f.unit_cost)    : null,
        selling_price:f.selling_price? Number(f.selling_price): null,
      } : {}),
    }
    const { error: err } = await supabase.from('inventory_items').update(payload).eq('id', item.id)
    if (err) { setError(err.message); setLoading(false); return }
    onSuccess()
  }

  return (
    <Modal title="Edit batch details" subtitle="Medicine identity and batch number cannot be changed after creation" onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" form="edit-form" type="submit" disabled={loading}>
          {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#07111f' }}/> Saving…</> : 'Save changes'}
        </button>
      </>}
    >
      <InlineError message={error} />
      <form id="edit-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="grid-2">
          <div className="field"><label>Brand name</label><input value={f.brand_name} onChange={e => set('brand_name', e.target.value)} /></div>
          <div className="field"><label>Supplier</label>
            <select value={f.supplier_id} onChange={e => set('supplier_id', e.target.value)}>
              <option value="">None</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-2">
          <div className="field"><label>Expiry date</label><input type="date" value={f.expiry_date} onChange={e => set('expiry_date', e.target.value)} /></div>
          <div className="field"><label>Reorder level</label><input type="number" min={0} value={f.reorder_level} onChange={e => set('reorder_level', e.target.value)} /></div>
        </div>
        {isAdmin && (
          <div className="grid-2">
            <div className="field"><label>Unit cost ({currency})</label><input type="number" min={0} step="0.01" value={f.unit_cost} onChange={e => set('unit_cost', e.target.value)} /></div>
            <div className="field"><label>Selling price ({currency})</label><input type="number" min={0} step="0.01" value={f.selling_price} onChange={e => set('selling_price', e.target.value)} /></div>
          </div>
        )}
        <div className="field"><label>Storage location</label><input value={f.storage_location} onChange={e => set('storage_location', e.target.value)} placeholder="Shelf, room, etc." /></div>
        <div className="field"><label>Notes</label><textarea value={f.notes} onChange={e => set('notes', e.target.value)} /></div>
        <label className="checkbox-row">
          <input type="checkbox" checked={f.is_active} onChange={e => set('is_active', e.target.checked)} />
          <span>Batch is active and visible in the medicine network</span>
        </label>
      </form>
    </Modal>
  )
}
