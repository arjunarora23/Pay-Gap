/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CATALYSTONE_AUTH_URL: string
  readonly VITE_CATALYSTONE_TOKEN_URL: string
  readonly VITE_CATALYSTONE_CLIENT_ID: string
  readonly VITE_CATALYSTONE_REDIRECT_URI: string
  readonly VITE_CATALYSTONE_SCOPE: string
  readonly VITE_CATALYSTONE_API_BASE_URL: string
  readonly VITE_CATALYSTONE_EMPLOYMENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
