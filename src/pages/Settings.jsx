import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useFacility } from '../hooks/useFacility'
import { useAuth } from '../hooks/useAuth'
import InlineError from '../components/shared/InlineError'

const SETTINGS_TABS = ['facility', 'profile']

export default function SettingsPage() {
  const { facility, facilityId, isFacilityAdmin } = useFacility()
  const { profile, refreshFacility } = useAuth()

  const [tab, setTab] = useState('facility')

  return (
    <div className="settings-page fade-up">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <div className="page-title-sub">
            Manage facility and account preferences
          </div>
        </div>
      </div>

      <div className="filter-group">
        {SETTINGS_TABS.map((item) => (
          <button
            key={item}
            className={`btn btn-sm ${tab === item ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(item)}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'facility' && facility && (
        <FacilitySettings
          facility={facility}
          facilityId={facilityId}
          isFacilityAdmin={isFacilityAdmin}
          onSave={refreshFacility}
        />
      )}

      {tab === 'profile' && profile && (
        <ProfileSettings profile={profile} />
      )}
    </div>
  )
}

function FacilitySettings({
  facility,
  facilityId,
  isFacilityAdmin,
  onSave,
}) {
  const [form, setForm] = useState({
    name: facility.name ?? '',
    phone: facility.phone ?? '',
    email: facility.email ?? '',
    website: facility.website ?? '',
    address_line1: facility.address_line1 ?? '',
    city: facility.city ?? '',
    state_province: facility.state_province ?? '',
    country: facility.country ?? '',
    near_expiry_threshold_days: facility.near_expiry_threshold_days ?? 90,
    default_currency: facility.default_currency ?? 'NGN',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  function update(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError(null)
    setSaved(false)
    setLoading(true)

    const { error: updateError } = await supabase
      .from('facilities')
      .update({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        website: form.website.trim() || null,
        address_line1: form.address_line1.trim(),
        city: form.city.trim(),
        state_province: form.state_province.trim(),
        country: form.country.trim().toUpperCase(),
        near_expiry_threshold_days: Number(form.near_expiry_threshold_days),
        default_currency: form.default_currency.trim().toUpperCase(),
      })
      .eq('id', facilityId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSaved(true)
    await onSave()
    setLoading(false)
  }

  return (
    <section className="settings-card">
      <div className="settings-card-header">
        <h3>Facility settings</h3>
        <p>Update facility identity, contact details, and inventory rules.</p>
      </div>

      {!isFacilityAdmin && (
        <div className="alert-banner alert-banner-info" role="status">
          <div className="alert-icon alert-icon-info">i</div>
          <div className="alert-message alert-message-info">
            Only facility admins can edit these settings.
          </div>
        </div>
      )}

      <InlineError message={error} />

      {saved && (
        <div className="alert-banner alert-banner-success" role="status">
          <div className="alert-icon alert-icon-success">✓</div>
          <div className="alert-message alert-message-success">
            Saved successfully.
          </div>
        </div>
      )}

      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="facilityName">Facility name</label>
          <input
            id="facilityName"
            required
            value={form.name}
            disabled={!isFacilityAdmin}
            onChange={(event) => update('name', event.target.value)}
          />
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="facilityPhone">Phone</label>
            <input
              id="facilityPhone"
              value={form.phone}
              disabled={!isFacilityAdmin}
              onChange={(event) => update('phone', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="facilityEmail">Email</label>
            <input
              id="facilityEmail"
              type="email"
              value={form.email}
              disabled={!isFacilityAdmin}
              onChange={(event) => update('email', event.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="facilityAddress">Address</label>
          <input
            id="facilityAddress"
            value={form.address_line1}
            disabled={!isFacilityAdmin}
            onChange={(event) => update('address_line1', event.target.value)}
          />
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="facilityCity">City</label>
            <input
              id="facilityCity"
              value={form.city}
              disabled={!isFacilityAdmin}
              onChange={(event) => update('city', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="facilityState">State / Province</label>
            <input
              id="facilityState"
              value={form.state_province}
              disabled={!isFacilityAdmin}
              onChange={(event) => update('state_province', event.target.value)}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="facilityCurrency">Currency</label>
            <input
              id="facilityCurrency"
              value={form.default_currency}
              disabled={!isFacilityAdmin}
              onChange={(event) => update('default_currency', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="expiryThreshold">Near-expiry threshold</label>
            <input
              id="expiryThreshold"
              type="number"
              min={7}
              max={365}
              value={form.near_expiry_threshold_days}
              disabled={!isFacilityAdmin}
              onChange={(event) =>
                update('near_expiry_threshold_days', event.target.value)
              }
            />
          </div>
        </div>

        {isFacilityAdmin && (
          <button
            type="submit"
            className="btn btn-primary settings-submit"
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
        )}
      </form>
    </section>
  )
}

function ProfileSettings({ profile }) {
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError(null)
    setSaved(false)
    setLoading(true)

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      })
      .eq('id', profile.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSaved(true)
    setLoading(false)
  }

  return (
    <section className="settings-card settings-card-narrow">
      <div className="settings-card-header">
        <h3>Your profile</h3>
        <p>Update your personal account details.</p>
      </div>

      <InlineError message={error} />

      {saved && (
        <div className="alert-banner alert-banner-success" role="status">
          <div className="alert-icon alert-icon-success">✓</div>
          <div className="alert-message alert-message-success">
            Profile updated.
          </div>
        </div>
      )}

      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="profileName">Full name</label>
          <input
            id="profileName"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="profilePhone">Phone</label>
          <input
            id="profilePhone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="profileRole">Role</label>
          <input
            id="profileRole"
            value={profile.role?.replace(/_/g, ' ') || 'user'}
            disabled
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary settings-submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" />
              Saving…
            </>
          ) : (
            'Save profile'
          )}
        </button>
      </form>
    </section>
  )
}
