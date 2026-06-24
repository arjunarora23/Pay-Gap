import { createContext, useCallback, useContext, useMemo } from 'react'
import { AuthProvider as OAuthProvider, useAuthContext } from 'react-oauth2-code-pkce'
import { authConfig } from './authConfig'

type AuthContextValue = {
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function AuthBridge({ children }: { children: React.ReactNode }) {
  const { token, loginInProgress, logIn, logOut } = useAuthContext()

  const login = useCallback(() => {
    const state = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
      b.toString(16).padStart(2, '0'),
    ).join('')
    logIn(state)
  }, [logIn])

  const value = useMemo(
    () => ({
      accessToken: token || null,
      isAuthenticated: Boolean(token),
      isLoading: loginInProgress,
      login,
      logout: logOut,
    }),
    [token, loginInProgress, login, logOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <OAuthProvider authConfig={authConfig}>
      <AuthBridge>{children}</AuthBridge>
    </OAuthProvider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
