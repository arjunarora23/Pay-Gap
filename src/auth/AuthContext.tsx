import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ACCESS_TOKEN_KEY, clearAuth, getStoredToken, startOAuthFlow } from './oauth'

type AuthState = {
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

type AuthContextValue = AuthState & {
  login: () => Promise<void>
  logout: () => void
  setAccessToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setAccessTokenState(getStoredToken())
    setIsLoading(false)
  }, [])

  const setAccessToken = (token: string | null) => {
    if (token) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
    } else {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    }

    setAccessTokenState(token)
  }

  const login = async () => {
    await startOAuthFlow()
  }

  const logout = () => {
    clearAuth()
    setAccessTokenState(null)
  }

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isLoading,
      login,
      logout,
      setAccessToken,
    }),
    [accessToken, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
