import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import InlineError from '../components/shared/InlineError'

const FACILITY_TYPES = [
  { value: 'pharmacy', label: 'Independent Pharmacy' },
  { value: 'hospital_pharmacy', label: 'Hospital Pharmacy' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'primary_health_center', label: 'Primary Health Center' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'government_store', label: 'Government Medical Store' },
]

const CURRENCIES = ['NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'TZS', 'ETB', 'XOF', 'USD']

export default function OnboardingPage() {
  const { session, refreshFacility } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    name: '',
    facility_type: 'pharmacy',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    country: 'NG',
    postal_code: '',
    phone: '',
    email: '',
    registration_number: '',
    default_currency: 'NGN',
    near_expiry_threshold_days: 90,
  })

  function update(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!session?.user?.id) {
      setError('Your session has expired. Please sign in again.')
      return
    }

    setError(null)
    setLoading(true)

    const payload = {
      ...form,
      name: form.name.trim(),
      address_line1: form.address_line1.trim(),
      city: form.city.trim(),
      state_province: form.state_province.trim(),
      country: form.country.trim().toUpperCase(),
      near_expiry_threshold_days: Number(form.near_expiry_threshold_days),
      created_by: session.user.id,
    }

    const { error: facilityError } = await supabase
      .from('facilities')
      .insert(payload)

    if (facilityError) {
      setError(facilityError.message)
      setLoading(false)
      return
    }

    await refreshFacility()
    navigate('/dashboard')
  }

  return (
    <main className="setup-page">
      <section className="setup-shell fade-up">
        <header className="setup-header">
          <div className="brand-mark">MC</div>

          <div>
            <p className="eyebrow">MediChain Africa</p>
            <h1>Set up your facility</h1>
            <p>
              Create your facility profile. You can invite staff and configure
              inventory rules after setup.
            </p>
          </div>
        </header>

        <div className="setup-card">
          <InlineError message={error} />

          <form className="setup-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Facility name *</label>
              <input
                id="name"
                type="text"
                required
                placeholder="Eko Central Pharmacy"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="field">
                <label htmlFor="facilityType">Facility type *</label>
                <select
                  id="facilityType"
                  required
                  value={form.facility_type}
                  onChange={(event) => update('facility_type', event.target.value)}
                >
                  {FACILITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  value={form.default_currency}
                  onChange={(event) => update('default_currency', event.target.value)}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="address">Address *</label>
              <input
                id="address"
                type="text"
                required
                placeholder="14 Broad Street"
                value={form.address_line1}
                onChange={(event) => update('address_line1', event.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="field">
                <label htmlFor="city">City *</label>
                <input
                  id="city"
                  type="text"
                  required
                  value={form.city}
                  onChange={(event) => update('city', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="state">State / Province *</label>
                <input
                  id="state"
                  type="text"
                  required
                  value={form.state_province}
                  onChange={(event) => update('state_province', event.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label htmlFor="country">Country code *</label>
                <input
                  id="country"
                  type="text"
                  required
                  maxLength={2}
                  value={form.country}
                  onChange={(event) => update('country', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="registration">Registration number</label>
                <input
                  id="registration"
                  type="text"
                  placeholder="PCN / PPB / NAFDAC number"
                  value={form.registration_number}
                  onChange={(event) => update('registration_number', event.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+234..."
                  value={form.phone}
                  onChange={(event) => update('phone', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="email">Facility email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="expiryThreshold">
                Near-expiry alert threshold
              </label>
              <input
                id="expiryThreshold"
                type="number"
                min={7}
                max={365}
                value={form.near_expiry_threshold_days}
                onChange={(event) =>
                  update('near_expiry_threshold_days', event.target.value)
                }
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Creating facility…
                </>
              ) : (
                'Create facility'
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
