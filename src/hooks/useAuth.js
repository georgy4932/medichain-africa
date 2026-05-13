import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [facility, setFacility] = useState(null)

  useEffect(() => {
    async function initAuth() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error loading session:', error.message)
        setSession(null)
        return
      }

      setSession(data.session ?? null)

      if (data.session?.user?.id) {
        await loadProfile(data.session.user.id)
      }
    }

    initAuth()

    const { data } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession)

      if (currentSession?.user?.id) {
        await loadProfile(currentSession.user.id)
      } else {
        setProfile(null)
        setFacility(null)
      }
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  async function loadProfile(userId) {
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('Error loading profile:', profileError.message)
      setProfile(null)
      setFacility(null)
      return
    }

    setProfile(userProfile)

    const { data: staffRecord, error: staffError } = await supabase
      .from('facility_staff')
      .select('facility_id, role, facilities(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (staffError) {
      console.error('Error loading facility:', staffError.message)
      setFacility(null)
      return
    }

    if (!staffRecord?.facilities) {
      setFacility(null)
      return
    }

    setFacility({
      ...staffRecord.facilities,
      staffRole: staffRecord.role,
    })
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return error
  }

  async function signUp(email, password, fullName) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    return error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    return error
  }

  async function refreshFacility() {
    if (!session?.user?.id) return
    await loadProfile(session.user.id)
  }

  const value = {
    session,
    profile,
    facility,
    signIn,
    signUp,
    signOut,
    refreshFacility,
    loading: session === undefined,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
} 
