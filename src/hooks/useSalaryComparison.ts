import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { env } from '../env'
import {
  fetchEmploymentMapping,
  fetchEmploymentDetails,
  fetchSalaryComparison,
  SalaryComparisonResponse,
} from '../api/salaryComparison'

type UseSalaryComparisonResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: SalaryComparisonResponse; employeeName: string }
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

    fetchEmploymentMapping(env.catalystoneMappingApiBaseUrl, accessToken)
      .then(({ employmentGuid }) =>
        Promise.all([
          fetchSalaryComparison(env.catalystoneMappingApiBaseUrl, employmentGuid, accessToken),
          fetchEmploymentDetails(env.catalystoneMappingApiBaseUrl, employmentGuid, accessToken),
        ]),
      )
      .then(([data, details]) => {
        if (!cancelled) {
          const { firstName, lastName } = details.employee
          setResult({ status: 'success', data, employeeName: `${firstName} ${lastName}` })
        }
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
