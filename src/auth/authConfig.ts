import { AuthorizationCode } from 'simple-oauth2'
import { env } from '../env'

const authUrl = new URL(env.catalystoneAuthUrl)
const tokenUrl = new URL(env.catalystoneTokenUrl)

export const oauthClient = new AuthorizationCode({
  client: {
    id: env.catalystoneClientId,
    secret: env.catalystoneClientSecret,
  },
  auth: {
    tokenHost: authUrl.origin,
    authorizePath: authUrl.pathname,
    tokenPath: tokenUrl.pathname,
  },
})

export const authParams = {
  redirectUri: env.catalystoneRedirectUri,
  scope: env.catalystoneScope,
}
