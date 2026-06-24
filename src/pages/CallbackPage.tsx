import { useEffect } from 'react'

export default function CallbackPage() {
  useEffect(() => {
    const query = globalThis.location.search || ''
    globalThis.location.replace(`/api/auth-callback${query}`)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4 text-slate-700 dark:text-slate-200">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="text-sm font-medium">Finishing CatalystOne authorisation…</p>
      </div>
    </div>
  )
}
