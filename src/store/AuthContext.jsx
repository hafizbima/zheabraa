import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import backend from './backend.js'
import { friendlyAuthError } from '../lib/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const unsub = backend.onAuthChange((u) => {
      setUser(u)
      setAuthReady(true)
    })
    return unsub
  }, [])

  // --- auth actions ---
  const login = useCallback(async (email, password) => {
    try {
      await backend.signIn(email, password)
      return { ok: true }
    } catch (e) {
      return { error: friendlyAuthError(e) }
    }
  }, [])

  const signup = useCallback(async (email, password, displayName) => {
    try {
      await backend.signUp(email, password, displayName)
      return { ok: true }
    } catch (e) {
      return { error: friendlyAuthError(e) }
    }
  }, [])

  const logout = useCallback(() => {
    backend.signOut().catch(console.error)
  }, [])

  const resetPassword = useCallback(async (email) => {
    try {
      await backend.resetPassword(email)
      return { ok: true }
    } catch (e) {
      return { error: friendlyAuthError(e) }
    }
  }, [])

  const value = useMemo(
    () => ({
      backendMode: backend.mode,
      user,
      authReady,
      login,
      signup,
      logout,
      resetPassword,
    }),
    [user, authReady, login, signup, logout, resetPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
