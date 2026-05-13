import { useAuth } from './useAuth'

export function useFacility() {
  const { facility, profile } = useAuth()

  const staffRole = facility?.staffRole ?? null

  return {
    facility,
    facilityId: facility?.id ?? null,
    staffRole,
    isFacilityAdmin: staffRole === 'facility_admin',
    isSystemAdmin: profile?.role === 'system_admin',
  }
}
