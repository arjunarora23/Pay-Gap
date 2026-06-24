import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { fetchEmploymentMapping, fetchSalaryComparison, SalaryComparisonResponse } from '../api/salaryComparison'

type UseSalaryComparisonResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: SalaryComparisonResponse }
  | { status: 'error'; error: Error }

export function useSalaryComparison(): UseSalaryComparisonResult {
  const { isAuthenticated } = useAuth()
  const [result, setResult] = useState<UseSalaryComparisonResult>({ status: 'idle' })

  useEffect(() => {
    if (!isAuthenticated) {
      setResult({ status: 'idle' })
      return
    }

    let cancelled = false
    setResult({ status: 'loading' })

    fetchEmploymentMapping()
      .then(({ employmentId }) => fetchSalaryComparison(employmentId))
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
  }, [isAuthenticated])

  return result
}
