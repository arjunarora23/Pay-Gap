export const env = {
  catalystoneAuthUrl: 'https://api.devtest.catalystone.dev/auth2/oauth2/authorize',
  catalystoneTokenUrl: 'https://api.devtest.catalystone.dev/auth2/oauth2/token',
  catalystoneClientId: '5b672f40-410c-425e-9eee-a56d0f16af6d',
  catalystoneRedirectUri: 'https://arjunarora23.github.io/Pay-Gap/callback',
  catalystoneScope: 'profile',
  catalystoneDeveloperPortal: 'https://api.devtest.catalystone.io',
  catalystoneMappingApiBaseUrl: 'https://hrisrefactoringroutinedev1.devtest.catalystone.dev/mono',
  catalystonePositionApiBaseUrl: 'https://api.devtest.catalystone.dev/position-management',
  hrDashboardEmploymentId: '11860456-80e2-4808-a288-f7e8f16195e9',
} as const
export type AppEnv = typeof env
