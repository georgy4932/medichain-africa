import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'

import AuthPage from './pages/Auth'
import OnboardingPage from './pages/Onboarding'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/Dashboard'
import InventoryPage from './pages/Inventory'
import AlertsPage from './pages/Alerts'
import SearchPage from './pages/Search'
import TransfersPage from './pages/Transfers'
import StaffPage from './pages/Staff'
import AnalyticsPage from './pages/Analytics'
import SettingsPage from './pages/Settings'

function Spinner() {
  return (
    <div className="app-loading">
      <div className="spinner spinner-lg" />
    </div>
  )
}

function RequireAuth({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <Spinner />
  if (!session) return <Navigate to="/auth" replace />

  return children
}

function RequireFacility({ children }) {
  const { facility, loading } = useAuth()

  if (loading) return <Spinner />
  if (!facility) return <Navigate to="/onboarding" replace />

  return children
}

function AppRoutes() {
  const { session, facility, loading } = useAuth()

  if (loading) return <Spinner />

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          session ? (
            <Navigate to={facility ? '/dashboard' : '/onboarding'} replace />
          ) : (
            <AuthPage />
          )
        }
      />

      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            {facility ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <OnboardingPage />
            )}
          </RequireAuth>
        }
      />

      <Route
        path="/"
        element={
          <RequireAuth>
            <RequireFacility>
              <AppShell />
            </RequireFacility>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="transfers" element={<TransfersPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
