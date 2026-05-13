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
    navigate('/auth')
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">MC</div>

          <div>
            <div className="brand-name">MediChain</div>
            <div className="brand-subtitle">Africa</div>
          </div>
        </div>

        {facility && (
          <div className="facility-card">
            <div className="eyebrow">Facility</div>
            <div className="facility-name">{facility.name}</div>
            <div className="facility-location">
              {facility.city}, {facility.country}
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div>
            <div className="user-name">
              {profile?.full_name || 'Medichain User'}
            </div>
            <div className="user-role">
              {facility?.staffRole?.replace('_', ' ') || 'Team member'}
            </div>
          </div>

          <button className="btn btn-ghost btn-sm btn-full" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
