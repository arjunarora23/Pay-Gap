# CatalystOne OAuth setup

## Register Pay-Gap as an OAuth client

1. Create/register an OAuth 2.0 client in CatalystOne for the Pay-Gap SPA.
2. Set the redirect URI to `http://localhost:5173/callback` for local development.
3. Request scopes based on your API needs (for example: `openid profile paygap:read`).
4. Copy the generated client id into your local environment.

## Local development configuration

Create a `.env` file in the project root based on `.env.example`:

- `VITE_CATALYSTONE_AUTH_URL`: CatalystOne authorize endpoint.
- `VITE_CATALYSTONE_TOKEN_URL`: CatalystOne token endpoint.
- `VITE_CATALYSTONE_CLIENT_ID`: OAuth client id from CatalystOne.
- `VITE_CATALYSTONE_REDIRECT_URI`: Callback URI (must match registered URI).
- `VITE_CATALYSTONE_SCOPE`: Space-delimited scope string.

## PKCE authorization code flow (SPA)

```text
Browser (Pay-Gap)         CatalystOne OAuth Server
      |                              |
      |-- authorize + code_challenge->
      |<----------- login/consent ----|
      |<----- redirect /callback?code,state
      |-- token request + code_verifier->
      |<----------- access token ------|
      |-- store token in sessionStorage
```
