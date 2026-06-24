const requiredEnvVars = [
  'VITE_CATALYSTONE_AUTH_URL',
  'VITE_CATALYSTONE_TOKEN_URL',
  'VITE_CATALYSTONE_CLIENT_ID',
  'VITE_CATALYSTONE_REDIRECT_URI',
  'VITE_CATALYSTONE_SCOPE',
] as const

type RequiredEnvVar = (typeof requiredEnvVars)[number]

function getEnvVar(key: RequiredEnvVar): string {
  const value = import.meta.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export const env = {
  catalystoneAuthUrl: getEnvVar('VITE_CATALYSTONE_AUTH_URL'),
  catalystoneTokenUrl: getEnvVar('VITE_CATALYSTONE_TOKEN_URL'),
  catalystoneClientId: getEnvVar('VITE_CATALYSTONE_CLIENT_ID'),
  catalystoneRedirectUri: getEnvVar('VITE_CATALYSTONE_REDIRECT_URI'),
  catalystoneScope: getEnvVar('VITE_CATALYSTONE_SCOPE'),
} as const

export type AppEnv = typeof env
