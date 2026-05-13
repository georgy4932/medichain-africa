import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useFacility } from '../hooks/useFacility'
import {
  fmtDate,
  fmtCurrency,
  fmtNumber,
  getExpiryStatus,
  daysUntilExpiry,
} from '../utils/formatters'
import StatusBadge from '../components/shared/StatusBadge'
import Modal from '../components/shared/Modal'
import EmptyState from '../components/shared/EmptyState'
import InlineError from '../components/shared/InlineError'

const STORAGE_CONDITIONS = [
  'room_temperature',
  'cool',
  'refrigerated',
  'frozen',
  'controlled_room',
  'protect_from_light',
  'protect_from_moisture',
]

const MOVEMENT_TYPES = [
  { value: 'receipt', label: 'Receipt (stock in)' },
  { value: 'dispensed', label: 'Dispensed (stock out)' },
  { value: 'adjustment', label: 'Manual adjustment' },
  { value: 'expired_removal', label: 'Expired removal' },
  { value: 'return', label: 'Return to supplier' },
]

export default function InventoryPage() {
  const { facilityId, facility, isFacilityAdmin } = useFacility()

  const [items, setItems] = useState([])
  const [medicines, setMedicines] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const loadInventory = useCallback(async () => {
    if (!facilityId) return

    setLoading(true)

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*, medicines(generic_name, dosage_form, strength), suppliers(name)')
      .eq('facility_id', facilityId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading inventory:', error.message)
      setItems([])
      setLoading(false)
      return
    }

    setItems(data ?? [])
    setLoading(false)
  }, [facilityId])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  useEffect(() => {
    async function loadFormData() {
      const { data: medicineData, error: medicineError } = await supabase
        .from('medicines')
        .select('id, generic_name, dosage_form, strength')
        .eq('is_active', true)
        .order('generic_name')

      if (medicineError) {
        console.error('Error loading medicines:', medicineError.message)
      } else {
        setMedicines(medicineData ?? [])
      }

      if (!facilityId) return

      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('facility_id', facilityId)
        .order('name')

      if (supplierError) {
        console.error('Error loading suppliers:', supplierError.message)
      } else {
        setSuppliers(supplierData ?? [])
      }
    }

    loadFormData()
  }, [facilityId])

  const filteredItems = items.filter((item) => {
    const query = search.toLowerCase().trim()

    if (!query) return true

    return (
      item.medicines?.generic_name?.toLowerCase().includes(query) ||
      item.brand_name?.toLowerCase().includes(query) ||
      item.batch_number?.toLowerCase().includes(query)
    )
  })

  function openAdjustModal(item) {
    setSelectedItem(item)
    setShowAdjustModal(true)
  }

  function openEditModal(item) {
    setSelectedItem(item)
    setShowEditModal(true)
  }

  function closeItemModal() {
    setSelectedItem(null)
    setShowAdjustModal(false)
    setShowEditModal(false)
  }

  return (
    <div className="inventory-page fade-up">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <div className="page-title-sub">
            {items.length} active batch{items.length !== 1 ? 'es' : ''} ·{' '}
            {facility?.default_currency}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          Add stock
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrap">
          <span className="search-icon">⌕</span>
          <input
            placeholder="Search by medicine, brand, or batch number…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="spinner spinner-lg" />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="□"
          title="No inventory items"
          message="Add your first stock batch to begin tracking medicine availability."
        />
      ) : (
        <div className="card inventory-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Available</th>
                  <th>Reorder at</th>
                  <th>Expiry</th>
                  <th>Selling price</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => {
                  const unreserved =
                    Number(item.quantity_available ?? 0) -
                    Number(item.quantity_reserved ?? 0)

                  const days = daysUntilExpiry(item.expiry_date)
                  const isBelowReorder = unreserved < Number(item.reorder_level ?? 0)

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="table-primary-cell">
                          {item.medicines?.generic_name || 'Unknown medicine'}
                        </div>
                        <div className="table-secondary-cell">
                          {item.brand_name || item.medicines?.dosage_form || 'No brand'} ·{' '}
                          {item.medicines?.strength || 'No strength'}
                        </div>
                      </td>

                      <td>
                        <span className="tag">{item.batch_number}</span>
                      </td>

                      <td>
                        <div className="table-primary-cell">
                          {fmtNumber(unreserved)}
                        </div>

                        {Number(item.quantity_reserved ?? 0) > 0 && (
                          <div className="reserved-note">
                            {fmtNumber(item.quantity_reserved)} reserved
                          </div>
                        )}
                      </td>

                      <td className={isBelowReorder ? 'reorder-warning' : 'reorder-normal'}>
                        {fmtNumber(item.reorder_level)}
                      </td>

                      <td>
                        <StatusBadge variant={getExpiryStatus(item.expiry_date)}>
                          {days !== null && days < 0
                            ? 'Expired'
                            : fmtDate(item.expiry_date)}
                        </StatusBadge>
                      </td>

                      <td>
                        {fmtCurrency(
                          item.selling_price,
                          facility?.default_currency,
                        )}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openAdjustModal(item)}
                          >
                            Adjust
                          </button>

                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEditModal(item)}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddInventoryModal
          facilityId={facilityId}
          medicines={medicines}
          suppliers={suppliers}
          currency={facility?.default_currency}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadInventory()
          }}
        />
      )}

      {showAdjustModal && selectedItem && (
        <AdjustQuantityModal
          item={selectedItem}
          onClose={closeItemModal}
          onSuccess={() => {
            closeItemModal()
            loadInventory()
          }}
        />
      )}

      {showEditModal && selectedItem && (
        <EditMetadataModal
          item={selectedItem}
          suppliers={suppliers}
          isFacilityAdmin={isFacilityAdmin}
          currency={facility?.default_currency}
          onClose={closeItemModal}
          onSuccess={() => {
            closeItemModal()
            loadInventory()
          }}
        />
      )}
    </div>
  )
}

function AddInventoryModal({
  facilityId,
  medicines,
  suppliers,
  currency,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    medicine_id: '',
    batch_number: '',
    expiry_date: '',
    quantity: 0,
    reorder_level: 10,
    reorder_quantity: '',
    brand_name: '',
    supplier_id: '',
    manufacture_date: '',
    unit_cost: '',
    selling_price: '',
    storage_condition: 'room_temperature',
    storage_location: '',
    notes: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

    const { error: inventoryError } = await supabase.rpc('create_inventory_item', {
      p_facility_id: facilityId,
      p_medicine_id: form.medicine_id,
      p_batch_number: form.batch_number.trim(),
      p_expiry_date: form.expiry_date,
      p_quantity: Number(form.quantity),
      p_reorder_level: Number(form.reorder_level),
      p_reorder_quantity: form.reorder_quantity
        ? Number(form.reorder_quantity)
        : null,
      p_brand_name: form.brand_name.trim() || null,
      p_supplier_id: form.supplier_id || null,
      p_manufacture_date: form.manufacture_date || null,
      p_unit_cost: form.unit_cost ? Number(form.unit_cost) : null,
      p_selling_price: form.selling_price ? Number(form.selling_price) : null,
      p_storage_condition: form.storage_condition,
      p_storage_location: form.storage_location.trim() || null,
      p_notes: form.notes.trim() || null,
    })

    if (inventoryError) {
      setError(inventoryError.message)
      setLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <Modal
      title="Add stock batch"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary"
            form="add-inventory-form"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Adding…
              </>
            ) : (
              'Add batch'
            )}
          </button>
        </>
      }
    >
      <InlineError message={error} />

      <form id="add-inventory-form" className="modal-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="medicine">Medicine *</label>
          <select
            id="medicine"
            required
            value={form.medicine_id}
            onChange={(event) => update('medicine_id', event.target.value)}
          >
            <option value="">Select medicine…</option>
            {medicines.map((medicine) => (
              <option key={medicine.id} value={medicine.id}>
                {medicine.generic_name} — {medicine.strength} ({medicine.dosage_form})
              </option>
            ))}
          </select>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="batchNumber">Batch number *</label>
            <input
              id="batchNumber"
              required
              value={form.batch_number}
              onChange={(event) => update('batch_number', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="brandName">Brand name</label>
            <input
              id="brandName"
              value={form.brand_name}
              onChange={(event) => update('brand_name', event.target.value)}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="expiryDate">Expiry date *</label>
            <input
              id="expiryDate"
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={form.expiry_date}
              onChange={(event) => update('expiry_date', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="manufactureDate">Manufacture date</label>
            <input
              id="manufactureDate"
              type="date"
              value={form.manufacture_date}
              onChange={(event) => update('manufacture_date', event.target.value)}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="quantity">Initial quantity *</label>
            <input
              id="quantity"
              type="number"
              required
              min={0}
              value={form.quantity}
              onChange={(event) => update('quantity', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="reorderLevel">Reorder level</label>
            <input
              id="reorderLevel"
              type="number"
              min={0}
              value={form.reorder_level}
              onChange={(event) => update('reorder_level', event.target.value)}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="unitCost">Unit cost ({currency})</label>
            <input
              id="unitCost"
              type="number"
              min={0}
              step="0.01"
              value={form.unit_cost}
              onChange={(event) => update('unit_cost', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="sellingPrice">Selling price ({currency})</label>
            <input
              id="sellingPrice"
              type="number"
              min={0}
              step="0.01"
              value={form.selling_price}
              onChange={(event) => update('selling_price', event.target.value)}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="storageCondition">Storage condition</label>
            <select
              id="storageCondition"
              value={form.storage_condition}
              onChange={(event) => update('storage_condition', event.target.value)}
            >
              {STORAGE_CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="supplier">Supplier</label>
            <select
              id="supplier"
              value={form.supplier_id}
              onChange={(event) => update('supplier_id', event.target.value)}
            >
              <option value="">None / unknown</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="storageLocation">Storage location</label>
          <input
            id="storageLocation"
            placeholder="e.g. Shelf A3"
            value={form.storage_location}
            onChange={(event) => update('storage_location', event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
            placeholder="Any additional notes about this batch"
          />
        </div>
      </form>
    </Modal>
  )
}

function AdjustQuantityModal({ item, onClose, onSuccess }) {
  const [movementType, setMovementType] = useState('receipt')
  const [change, setChange] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isOutgoing = ['dispensed', 'expired_removal', 'return'].includes(movementType)

  async function handleSubmit(event) {
    event.preventDefault()

    setError(null)
    setLoading(true)

    const quantity = Math.abs(Number(change))
    const delta = isOutgoing ? -quantity : quantity

    const { error: quantityError } = await supabase.rpc('update_inventory_quantity', {
      p_inventory_item_id: item.id,
      p_quantity_change: delta,
      p_movement_type: movementType,
      p_notes: notes.trim() || null,
    })

    if (quantityError) {
      setError(quantityError.message)
      setLoading(false)
      return
    }

    onSuccess()
  }

  const currentUnreserved =
    Number(item.quantity_available ?? 0) -
    Number(item.quantity_reserved ?? 0)

  return (
    <Modal
      title="Adjust stock quantity"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary"
            form="adjust-quantity-form"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Saving…
              </>
            ) : (
              'Save adjustment'
            )}
          </button>
        </>
      }
    >
      <div className="item-summary-card">
        <div className="item-summary-title">
          {item.medicines?.generic_name || 'Unknown medicine'}
        </div>
        <div className="item-summary-sub">
          Batch {item.batch_number} · Current: {fmtNumber(currentUnreserved)} unreserved
        </div>
      </div>

      <InlineError message={error} />

      <form id="adjust-quantity-form" className="modal-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="movementType">Movement type *</label>
          <select
            id="movementType"
            required
            value={movementType}
            onChange={(event) => setMovementType(event.target.value)}
          >
            {MOVEMENT_TYPES.map((movement) => (
              <option key={movement.value} value={movement.value}>
                {movement.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="quantityChange">Quantity *</label>
          <input
            id="quantityChange"
            type="number"
            required
            min={1}
            value={change}
            onChange={(event) => setChange(event.target.value)}
            placeholder={isOutgoing ? 'Units going out' : 'Units coming in'}
          />
        </div>

        <div className="field">
          <label htmlFor="adjustmentNotes">Notes</label>
          <textarea
            id="adjustmentNotes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional reason or reference"
          />
        </div>
      </form>
    </Modal>
  )
}

function EditMetadataModal({
  item,
  suppliers,
  isFacilityAdmin,
  currency,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    brand_name: item.brand_name ?? '',
    reorder_level: item.reorder_level ?? 0,
    reorder_quantity: item.reorder_quantity ?? '',
    expiry_date: item.expiry_date ?? '',
    manufacture_date: item.manufacture_date ?? '',
    supplier_id: item.supplier_id ?? '',
    storage_condition: item.storage_condition ?? 'room_temperature',
    storage_location: item.storage_location ?? '',
    notes: item.notes ?? '',
    is_active: item.is_active,
    unit_cost: item.unit_cost ?? '',
    selling_price: item.selling_price ?? '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

    const payload = {
      brand_name: form.brand_name.trim() || null,
      reorder_level: Number(form.reorder_level),
      reorder_quantity: form.reorder_quantity
        ? Number(form.reorder_quantity)
        : null,
      expiry_date: form.expiry_date,
      manufacture_date: form.manufacture_date || null,
      supplier_id: form.supplier_id || null,
      storage_condition: form.storage_condition,
      storage_location: form.storage_location.trim() || null,
      notes: form.notes.trim() || null,
      is_active: form.is_active,
      ...(isFacilityAdmin
        ? {
            unit_cost: form.unit_cost ? Number(form.unit_cost) : null,
            selling_price: form.selling_price
              ? Number(form.selling_price)
              : null,
          }
        : {}),
    }

    const { error: updateError } = await supabase
      .from('inventory_items')
      .update(payload)
      .eq('id', item.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <Modal
      title="Edit item details"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary"
            form="edit-metadata-form"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </>
      }
    >
      <InlineError message={error} />

      <form id="edit-metadata-form" className="modal-form" onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="editBrandName">Brand name</label>
            <input
              id="editBrandName"
              value={form.brand_name}
              onChange={(event) => update('brand_name', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="editSupplier">Supplier</label>
            <select
              id="editSupplier"
              value={form.supplier_id}
              onChange={(event) => update('supplier_id', event.target.value)}
            >
              <option value="">None</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="editExpiryDate">Expiry date</label>
            <input
              id="editExpiryDate"
              type="date"
              value={form.expiry_date}
              onChange={(event) => update('expiry_date', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="editStorageCondition">Storage condition</label>
            <select
              id="editStorageCondition"
              value={form.storage_condition}
              onChange={(event) => update('storage_condition', event.target.value)}
            >
              {STORAGE_CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="editReorderLevel">Reorder level</label>
            <input
              id="editReorderLevel"
              type="number"
              min={0}
              value={form.reorder_level}
              onChange={(event) => update('reorder_level', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="editStorageLocation">Storage location</label>
            <input
              id="editStorageLocation"
              placeholder="e.g. Shelf A3"
              value={form.storage_location}
              onChange={(event) => update('storage_location', event.target.value)}
            />
          </div>
        </div>

        {isFacilityAdmin && (
          <div className="grid-2">
            <div className="field">
              <label htmlFor="editUnitCost">Unit cost ({currency})</label>
              <input
                id="editUnitCost"
                type="number"
                min={0}
                step="0.01"
                value={form.unit_cost}
                onChange={(event) => update('unit_cost', event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="editSellingPrice">Selling price ({currency})</label>
              <input
                id="editSellingPrice"
                type="number"
                min={0}
                step="0.01"
                value={form.selling_price}
                onChange={(event) => update('selling_price', event.target.value)}
              />
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="editNotes">Notes</label>
          <textarea
            id="editNotes"
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
          />
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => update('is_active', event.target.checked)}
          />
          <span>Item is active</span>
        </label>
      </form>
    </Modal>
  )
}
