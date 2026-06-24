export const env = {
  catalystoneAuthUrl: 'https://api.devtest.catalystone.dev/auth2/oauth2/authorize',
  catalystoneTokenUrl: 'https://api.devtest.catalystone.dev/auth2/oauth2/token',
  catalystoneClientId: '4db53012-a3f1-49c7-8ed3-1d4a8306f2e6',
  catalystoneRedirectUri: 'https://arjunarora23.github.io/Pay-Gap/callback',
  catalystoneScope: 'profile',
  catalystoneApiBaseUrl: 'https://api.devtest.catalystone.dev',
} as const

export type AppEnv = typeof env
