import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { env } from '../env'
import { fetchSalaryComparison, SalaryComparisonResponse } from '../api/salaryComparison'

type UseSalaryComparisonResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: SalaryComparisonResponse }
  | { status: 'error'; error: Error }

export function useSalaryComparison(): UseSalaryComparisonResult {
  const { accessToken, isAuthenticated } = useAuth()
  const [result, setResult] = useState<UseSalaryComparisonResult>({ status: 'idle' })

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setResult({ status: 'idle' })
      return
    }

    let cancelled = false
    setResult({ status: 'loading' })

    fetchSalaryComparison(env.catalystoneApiBaseUrl, env.catalystoneEmploymentId, accessToken)
      .then((data) => {
        if (!cancelled) setResult({ status: 'success', data })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setResult({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) })
        }
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, isAuthenticated])

  return result
}
