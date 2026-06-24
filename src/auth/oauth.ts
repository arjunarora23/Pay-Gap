import pkceChallenge from 'pkce-challenge'
import { env } from '../env'

export const ACCESS_TOKEN_KEY = 'c1_access_token'
const OAUTH_STATE_KEY = 'c1_oauth_state'
const PKCE_VERIFIER_KEY = 'c1_pkce_verifier'

export type TokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
}

function createRandomState(): string {
  const values = new Uint8Array(16)
  crypto.getRandomValues(values)
  return Array.from(values, (value) => value.toString(16).padStart(2, '0')).join('')
}

export async function startOAuthFlow(): Promise<void> {
  const { code_verifier, code_challenge } = await pkceChallenge(64, 'S256')
  const state = createRandomState()

  sessionStorage.setItem(PKCE_VERIFIER_KEY, code_verifier)
  sessionStorage.setItem(OAUTH_STATE_KEY, state)

  const authorizeUrl = new URL(env.catalystoneAuthUrl)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', env.catalystoneClientId)
  authorizeUrl.searchParams.set('client_secret', env.catalystoneClientSecret)
  authorizeUrl.searchParams.set('redirect_uri', env.catalystoneRedirectUri)
  authorizeUrl.searchParams.set('scope', env.catalystoneScope)
  authorizeUrl.searchParams.set('state', state)
  authorizeUrl.searchParams.set('code_challenge', code_challenge)
  authorizeUrl.searchParams.set('code_challenge_method', 'S256')

  window.location.assign(authorizeUrl.toString())
}

export async function exchangeCodeForToken(code: string, state: string): Promise<TokenResponse> {
  const storedState = sessionStorage.getItem(OAUTH_STATE_KEY)
  const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)

  if (!storedState || storedState !== state) {
    throw new Error('Invalid authorization state')
  }

  if (!codeVerifier) {
    throw new Error('Missing PKCE verifier')
  }

  const response = await fetch(env.catalystoneTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.catalystoneRedirectUri,
      client_id: env.catalystoneClientId,
      code_verifier: codeVerifier,
    }).toString(),
  })

  if (!response.ok) {
    throw new Error('Token exchange failed')
  }

  const tokenResponse = (await response.json()) as Partial<TokenResponse>

  if (
    typeof tokenResponse.access_token !== 'string' ||
    typeof tokenResponse.token_type !== 'string' ||
    typeof tokenResponse.expires_in !== 'number'
  ) {
    throw new Error('Invalid token response')
  }

  sessionStorage.removeItem(OAUTH_STATE_KEY)
  sessionStorage.removeItem(PKCE_VERIFIER_KEY)

  return {
    access_token: tokenResponse.access_token,
    token_type: tokenResponse.token_type,
    expires_in: tokenResponse.expires_in,
    refresh_token: tokenResponse.refresh_token,
    id_token: tokenResponse.id_token,
  }
}

export function getStoredToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function clearAuth(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(OAUTH_STATE_KEY)
  sessionStorage.removeItem(PKCE_VERIFIER_KEY)
}
