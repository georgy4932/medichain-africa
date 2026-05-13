import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useFacility } from '../../hooks/useFacility'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/inventory', icon: '□', label: 'Inventory' },
  { to: '/alerts', icon: '!', label: 'Alerts' },
  { to: '/search', icon: '⌕', label: 'Search' },
  { to: '/transfers', icon: '⇄', label: 'Transfers' },
  { to: '/analytics', icon: '▥', label: 'Analytics' },
  { to: '/staff', icon: '◉', label: 'Staff' },
  { to: '/settings', icon: '⚙', label: 'Settings' },
]

export default function AppShell() {
  const { signOut, profile } = useAuth()
  const { facility } = useFacility()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="brand-mark">M</div>
            <div>
              <h2>MediChain</h2>
              <p>Africa</p>
            </div>
          </div>

          {facility && (
            <div className="facility-card">
              <span>Current facility</span>
              <strong>{facility.name}</strong>
              <small>{facility.city}, {facility.country}</small>
            </div>
          )}

          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'sidebar-link active' : 'sidebar-link'
                }
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-user">
          <div>
            <strong>{profile?.full_name || 'MediChain User'}</strong>
            <span>{facility?.staffRole?.replace('_', ' ') || 'Team member'}</span>
          </div>

          <button className="btn btn-ghost btn-sm btn-full" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
