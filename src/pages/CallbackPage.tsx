import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ACCESS_TOKEN_KEY, exchangeCodeForToken } from '../auth/oauth'

export default function CallbackPage() {
  const navigate = useNavigate()
  const { login, setAccessToken } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isExchanging, setIsExchanging] = useState(true)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      setErrorMessage('We could not complete sign-in. Please try again.')
      setIsExchanging(false)
      return
    }

    let cancelled = false

    const exchangeToken = async () => {
      try {
        const tokenResponse = await exchangeCodeForToken(code, state)

        if (cancelled) {
          return
        }

        sessionStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.access_token)
        setAccessToken(tokenResponse.access_token)
        navigate('/', { replace: true })
      } catch {
        if (!cancelled) {
          setErrorMessage('Authorization failed. Please try again.')
          setIsExchanging(false)
        }
      }
    }

    void exchangeToken()

    return () => {
      cancelled = true
    }
  }, [navigate, setAccessToken])

  if (isExchanging) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-slate-700 dark:text-slate-200">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm font-medium">Finishing CatalystOne authorisation…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-6">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Sign-in unsuccessful</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {errorMessage ?? 'We could not complete your request.'}
        </p>
        <button
          type="button"
          onClick={() => void login()}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
