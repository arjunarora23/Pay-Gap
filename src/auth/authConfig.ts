import type { TAuthConfig } from 'react-oauth2-code-pkce'
import { env } from '../env'

export const authConfig: TAuthConfig = {
  clientId: env.catalystoneClientId,
  authorizationEndpoint: env.catalystoneAuthUrl,
  tokenEndpoint: env.catalystoneTokenUrl,
  redirectUri: env.catalystoneRedirectUri,
  scope: env.catalystoneScope,
  autoLogin: false,
  storage: 'session',
}
