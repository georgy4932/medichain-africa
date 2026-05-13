import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useFacility } from '../hooks/useFacility'
import { fmtDate, fmtNumber } from '../utils/formatters'
import EmptyState from '../components/shared/EmptyState'
import StatusBadge from '../components/shared/StatusBadge'

const DOSAGE_FORMS = [
  '',
  'tablet',
  'capsule',
  'syrup',
  'suspension',
  'injection',
  'infusion',
  'cream',
  'ointment',
  'drops',
  'inhaler',
  'suppository',
  'patch',
  'powder',
  'other',
]

export default function SearchPage() {
  const { facilityId, facility } = useFacility()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [country, setCountry] = useState(facility?.country ?? '')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [form, setForm] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSearch(event) {
    event?.preventDefault()

    if (!query.trim() && !state.trim() && !city.trim()) return

    setLoading(true)

    const { data, error } = await supabase.rpc('medicine_search', {
      p_query: query.trim() || null,
      p_country: country.trim() || null,
      p_state: state.trim() || null,
      p_city: city.trim() || null,
      p_dosage_form: form || null,
      p_limit: 50,
      p_offset: 0,
    })

    if (error) {
      console.error('Error searching medicines:', error.message)
      setResults([])
      setLoading(false)
      return
    }

    setResults(data ?? [])
    setLoading(false)
  }

  function requestTransfer(result) {
    navigate('/transfers', {
      state: {
        prefill: {
          medicine_id: result.medicine_id,
          medicine_name: result.generic_name,
          supplying_facility_id: result.facility_id,
          supplying_name: result.facility_name,
        },
      },
    })
  }

  return (
    <div className="search-page fade-up">
      <div className="page-header">
        <div>
          <h1>Find medicines</h1>
          <div className="page-title-sub">
            Search availability across participating facilities
          </div>
        </div>
      </div>

      <div className="search-panel">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrap search-input-large">
            <span className="search-icon">⌕</span>
            <input
              placeholder="Medicine name or brand, e.g. Amoxicillin, Coartem"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="country">Country</label>
              <input
                id="country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="NG"
              />
            </div>

            <div className="field">
              <label htmlFor="state">State / province</label>
              <input
                id="state"
                value={state}
                onChange={(event) => setState(event.target.value)}
                placeholder="Lagos"
              />
            </div>

            <div className="field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Ikeja"
              />
            </div>

            <div className="field">
              <label htmlFor="dosageForm">Dosage form</label>
              <select
                id="dosageForm"
                value={form}
                onChange={(event) => setForm(event.target.value)}
              >
                {DOSAGE_FORMS.map((item) => (
                  <option key={item || 'any'} value={item}>
                    {item ? item.charAt(0).toUpperCase() + item.slice(1) : 'Any'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary search-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Searching…
              </>
            ) : (
              'Search availability'
            )}
          </button>
        </form>
      </div>

      {results === null && (
        <EmptyState
          icon="⌕"
          title="Search for medicines"
          message="Enter a medicine name and location to find available stock across facilities."
        />
      )}

      {results !== null && results.length === 0 && (
        <EmptyState
          icon="□"
          title="No results"
          message="No facilities have this medicine in stock in that area."
        />
      )}

      {results !== null && results.length > 0 && (
        <section className="results-section">
          <div className="results-count">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </div>

          <div className="card search-results-card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Facility</th>
                    <th>Location</th>
                    <th>Available</th>
                    <th>Earliest expiry</th>
                    <th>Verified</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result, index) => {
                    const isOwnFacility = result.facility_id === facilityId

                    return (
                      <tr key={`${result.facility_id}-${result.medicine_id}-${index}`}>
                        <td>
                          <div className="table-primary-cell">
                            {result.generic_name || 'Unknown medicine'}
                          </div>
                          <div className="table-secondary-cell">
                            {result.brand_name || 'No brand'} · {result.strength || 'No strength'}{' '}
                            ({result.dosage_form || 'Unknown form'})
                          </div>
                        </td>

                        <td>
                          <div className="table-primary-cell">
                            {result.facility_name || 'Unknown facility'}
                          </div>
                          <div className="table-secondary-cell">
                            {result.facility_type?.replace(/_/g, ' ') || 'Facility'}
                          </div>
                        </td>

                        <td className="table-muted-cell">
                          {result.city}, {result.state_province}
                        </td>

                        <td>
                          <span className="availability-count">
                            {fmtNumber(result.total_available)}
                          </span>
                        </td>

                        <td className="table-muted-cell">
                          {fmtDate(result.earliest_expiry_date)}
                        </td>

                        <td>
                          {result.facility_is_verified ? (
                            <StatusBadge variant="success">Verified</StatusBadge>
                          ) : (
                            <StatusBadge variant="neutral">Unverified</StatusBadge>
                          )}
                        </td>

                        <td>
                          {isOwnFacility ? (
                            <span className="own-facility-label">
                              Your facility
                            </span>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => requestTransfer(result)}
                            >
                              Request
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
