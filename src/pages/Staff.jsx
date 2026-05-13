import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useFacility } from '../hooks/useFacility'
import { fmtDate } from '../utils/formatters'
import StatusBadge from '../components/shared/StatusBadge'
import Modal from '../components/shared/Modal'
import EmptyState from '../components/shared/EmptyState'
import InlineError from '../components/shared/InlineError'

const STAFF_ROLES = [
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'inventory_staff', label: 'Inventory Staff' },
  { value: 'facility_admin', label: 'Facility Admin' },
]

export default function StaffPage() {
  const { facilityId, isFacilityAdmin } = useFacility()

  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const loadStaff = useCallback(async () => {
    if (!facilityId) return

    setLoading(true)

    const { data, error } = await supabase
      .from('facility_staff')
      .select('*, user_profiles(full_name, role)')
      .eq('facility_id', facilityId)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error loading staff:', error.message)
      setStaff([])
      setLoading(false)
      return
    }

    setStaff(data ?? [])
    setLoading(false)
  }, [facilityId])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  async function toggleActive(staffMember) {
    const { error } = await supabase
      .from('facility_staff')
      .update({ is_active: !staffMember.is_active })
      .eq('id', staffMember.id)

    if (error) {
      console.error('Error updating staff status:', error.message)
      return
    }

    loadStaff()
  }

  return (
    <div className="staff-page fade-up">
      <div className="page-header">
        <div>
          <h1>Staff</h1>
          <div className="page-title-sub">
            {staff.length} team member{staff.length !== 1 ? 's' : ''}
          </div>
        </div>

        {isFacilityAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Add staff
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="spinner spinner-lg" />
        </div>
      ) : staff.length === 0 ? (
        <EmptyState
          icon="◉"
          title="No staff yet"
          message="Add your team members to manage facility operations."
        />
      ) : (
        <div className="card staff-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  {isFacilityAdmin && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {staff.map((staffMember) => (
                  <tr key={staffMember.id}>
                    <td>
                      <div className="table-primary-cell">
                        {staffMember.user_profiles?.full_name || 'Unknown user'}
                      </div>
                    </td>

                    <td>
                      <span className="tag">
                        {staffMember.role?.replace(/_/g, ' ') || 'team member'}
                      </span>
                    </td>

                    <td className="table-muted-cell">
                      {fmtDate(staffMember.joined_at)}
                    </td>

                    <td>
                      <StatusBadge variant={staffMember.is_active ? 'success' : 'neutral'}>
                        {staffMember.is_active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </td>

                    {isFacilityAdmin && (
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleActive(staffMember)}
                        >
                          {staffMember.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <AddStaffModal
          facilityId={facilityId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            loadStaff()
          }}
        />
      )}
    </div>
  )
}

function AddStaffModal({ facilityId, onClose, onSuccess }) {
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('pharmacist')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()

    setError(null)
    setLoading(true)

    const cleanUserId = userId.trim()

    if (!cleanUserId) {
      setError('User ID is required.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('facility_staff')
      .insert({
        facility_id: facilityId,
        user_id: cleanUserId,
        role,
        is_active: true,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <Modal
      title="Add staff member"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary"
            form="add-staff-form"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Adding…
              </>
            ) : (
              'Add staff'
            )}
          </button>
        </>
      }
    >
      <div className="alert-banner alert-banner-info" role="status">
        <div className="alert-icon alert-icon-info">i</div>
        <div className="alert-message alert-message-info">
          For this MVP, the staff member must create an account first. Then add
          them here using their Supabase user ID.
        </div>
      </div>

      <InlineError message={error} />

      <form id="add-staff-form" className="modal-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="staffUserId">Staff user ID *</label>
          <input
            id="staffUserId"
            required
            placeholder="Paste their Supabase user UUID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="staffRole">Role</label>
          <select
            id="staffRole"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {STAFF_ROLES.map((staffRole) => (
              <option key={staffRole.value} value={staffRole.value}>
                {staffRole.label}
              </option>
            ))}
          </select>
        </div>

        <p className="form-help">
          Later, replace this with an invite-by-email flow using a Supabase Edge
          Function.
        </p>
      </form>
    </Modal>
  )
}
