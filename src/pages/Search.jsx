import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useFacility } from '../hooks/useFacility'
import { fmtDate, fmtNumber, facilityTypeLabel } from '../utils/formatters'
import { EmptyState, Badge } from '../components/shared'

const DOSAGE_FORMS = ['','tablet','capsule','syrup','suspension','injection','infusion','cream','ointment','drops','inhaler','suppository','patch','powder','other']

export default function SearchPage() {
  const { facilityId, facility } = useFacility()
  const navigate = useNavigate()

  const [query,    setQuery]   = useState('')
  const [country,  setCountry] = useState(facility?.country ?? '')
  const [state,    setState]   = useState('')
  const [city,     setCity]    = useState('')
  const [dosage,   setDosage]  = useState('')
  const [results,  setResults] = useState(null)
  const [loading,  setLoading] = useState(false)
  const [searched, setSearched]= useState(false)

  async function handleSearch(e) {
    e?.preventDefault()
    if (!query.trim() && !state.trim() && !city.trim()) return
    setLoading(true)
    setSearched(true)

    // Uses medicine_search RPC — never queries inventory_items or the view directly
    const { data, error } = await supabase.rpc('medicine_search', {
      p_query:       query   || null,
      p_country:     country || null,
      p_state:       state   || null,
      p_city:        city    || null,
      p_dosage_form: dosage  || null,
      p_limit:       50,
      p_offset:      0,
    })

    setResults(error ? [] : (data ?? []))
    setLoading(false)
  }

  function requestTransfer(result) {
    navigate('/transfers', {
      state: {
        prefill: {
          medicine_id:           result.medicine_id,
          medicine_name:         result.generic_name,
          supplying_facility_id: result.facility_id,
          supplying_name:        result.facility_name,
        }
      }
    })
  }

  const ownResults   = results?.filter(r => r.facility_id === facilityId) ?? []
  const otherResults = results?.filter(r => r.facility_id !== facilityId) ?? []

  return (
    <div>
      <div className="page-top">
        <div>
          <div className="page-eyebrow">MEDICINE SEARCH</div>
          <div className="page-title">Medicine Availability Search</div>
          <div className="page-subtitle">
            Search stock availability across all participating facilities
          </div>
        </div>
      </div>

      {/* Search panel */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Main search */}
          <div className="search-field" style={{ width: '100%' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by generic name or brand (e.g. Amoxicillin, Coartem, Metformin…)"
              style={{ paddingLeft: 36, fontSize: 14, padding: '10px 14px 10px 36px' }}
            />
          </div>

          {/* Location + dosage row */}
          <div className="grid-4">
            <div className="field">
              <label>Country</label>
              <input value={country} onChange={e => setCountry(e.target.value)} placeholder="NG" />
            </div>
            <div className="field">
              <label>State / Province</label>
              <input value={state} onChange={e => setState(e.target.value)} placeholder="Lagos" />
            </div>
            <div className="field">
              <label>City</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Ikeja" />
            </div>
            <div className="field">
              <label>Dosage form</label>
              <select value={dosage} onChange={e => setDosage(e.target.value)}>
                {DOSAGE_FORMS.map(f => (
                  <option key={f} value={f}>{f ? f.charAt(0).toUpperCase() + f.slice(1) : 'Any form'}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 140 }}>
              {loading
                ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#07111f' }} /> Searching…</>
                : 'Search availability'}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {!searched && (
        <EmptyState
          title="Search for medicine availability"
          description="Enter a medicine name and optional location filters to find stock across all participating facilities in the network."
        />
      )}

      {searched && !loading && results?.length === 0 && (
        <EmptyState
          title="No results found"
          description="No facilities have this medicine available in the searched area. Try broadening your location filters or checking a different medicine name."
        />
      )}

      {results && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} found
            {otherResults.length > 0 && ` · ${otherResults.length} facilities you can request from`}
          </div>

          {/* Own facility results */}
          {ownResults.length > 0 && (
            <div className="section-shell">
              <div className="section-shell-header">
                <span className="section-shell-title">Your Facility</span>
              </div>
              <ResultTable results={ownResults} onRequest={null} />
            </div>
          )}

          {/* Other facility results */}
          {otherResults.length > 0 && (
            <div className="section-shell">
              <div className="section-shell-header">
                <span className="section-shell-title">Available at Other Facilities</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Contact details shared after transfer request is submitted
                </span>
              </div>
              <ResultTable results={otherResults} onRequest={requestTransfer} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ResultTable({ results, onRequest }) {
  return (
    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
      <table>
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Facility</th>
            <th>Location</th>
            <th>Available</th>
            <th>Earliest Expiry</th>
            <th>Batches</th>
            <th>Status</th>
            {onRequest && <th></th>}
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>
                <div className="td-primary">{r.generic_name}</div>
                <div className="td-muted">
                  {r.brand_name ? `${r.brand_name} · ` : ''}
                  {r.strength} {r.dosage_form}
                </div>
              </td>
              <td>
                <div className="td-primary truncate" style={{ maxWidth: 160 }}>{r.facility_name}</div>
                <div className="td-muted">{facilityTypeLabel(r.facility_type)}</div>
              </td>
              <td className="td-muted">{r.city}, {r.state_province}</td>
              <td>
                <span style={{
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--primary)',
                }}>
                  {fmtNumber(r.total_available)}
                </span>
                <div className="td-muted">unreserved units</div>
              </td>
              <td className="td-muted">{fmtDate(r.earliest_expiry_date)}</td>
              <td>
                <span className="pill">{r.batch_count} batch{r.batch_count !== 1 ? 'es' : ''}</span>
              </td>
              <td>
                {r.facility_is_verified
                  ? <Badge className="badge-success" dot>Verified</Badge>
                  : <Badge className="badge-neutral">Unverified</Badge>
                }
              </td>
              {onRequest && (
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onRequest(r)}
                  >
                    Request transfer
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
