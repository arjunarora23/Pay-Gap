import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import pkceChallenge from 'pkce-challenge'
import { authParams, oauthClient } from './authConfig'
import { env } from '../env'

const TOKEN_KEY = 'oauth_access_token'
const VERIFIER_KEY = 'oauth_code_verifier'
const STATE_KEY = 'oauth_state'

type AuthContextValue = {
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY),
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const returnedState = params.get('state')
    const storedState = sessionStorage.getItem(STATE_KEY)
    const verifier = sessionStorage.getItem(VERIFIER_KEY)

    if (!code || !verifier || returnedState !== storedState) return

    setIsLoading(true)
    fetch(env.catalystoneTokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: authParams.redirectUri,
        client_id: env.catalystoneClientId,
        client_secret: env.catalystoneClientSecret,
        code_verifier: verifier,
      }),
    })
      .then((r) => r.json())
      .then((data: { access_token?: string }) => {
        if (data.access_token) {
          sessionStorage.setItem(TOKEN_KEY, data.access_token)
          setAccessToken(data.access_token)
        }
      })
      .finally(() => {
        sessionStorage.removeItem(VERIFIER_KEY)
        sessionStorage.removeItem(STATE_KEY)
        window.history.replaceState({}, '', window.location.pathname)
        setIsLoading(false)
      })
  }, [])

  const login = useCallback(async () => {
    const { code_challenge, code_verifier } = await pkceChallenge()
    const state = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
      b.toString(16).padStart(2, '0'),
    ).join('')
    sessionStorage.setItem(VERIFIER_KEY, code_verifier)
    sessionStorage.setItem(STATE_KEY, state)
    // PKCE params (code_challenge, code_challenge_method) are valid OAuth2 extension fields
    // but absent from @types/simple-oauth2's authorizeURL signature
    const authUrl = oauthClient.authorizeURL(
      Object.assign({ redirect_uri: authParams.redirectUri, scope: authParams.scope, state }, {
        code_challenge,
        code_challenge_method: 'S256',
      }) as Parameters<typeof oauthClient.authorizeURL>[0],
    )
    window.location.href = authUrl
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setAccessToken(null)
  }, [])

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isLoading,
      login,
      logout,
    }),
    [accessToken, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
