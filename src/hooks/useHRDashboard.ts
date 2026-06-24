import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { env } from '../env'
import { fetchHRPositions, fetchPositionEmployments } from '../api/hrDashboard'
import { fetchSalaryComparison, fetchEmploymentDetails } from '../api/salaryComparison'
import type { SalaryComparisonResponse } from '../api/salaryComparison'

export interface EmployeeRecord {
  id: string
  name: string
  salary: number
  salaryData: SalaryComparisonResponse
}

export interface HRPositionData {
  id: string
  title: string
  hasEnoughData: boolean
  bandMin: number
  bandMax: number
  bandMedian: number
  maleMedian: number
  femaleMedian: number
  cohortSize: number
  employeeCount: number
  salaries: number[]
  maleSalaries: number[]
  femaleSalaries: number[]
  maleEmployees: EmployeeRecord[]
  femaleEmployees: EmployeeRecord[]
  currency: string
}

type UseHRDashboardResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; positions: HRPositionData[] }
  | { status: 'error'; error: Error }

interface CacheEntry {
  positions: HRPositionData[]
  fetchedAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
// Keyed by access token so different users never share cache
const cache = new Map<string, CacheEntry>()

function getCached(token: string): HRPositionData[] | null {
  const entry = cache.get(token)
  if (!entry) return null
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
    cache.delete(token)
    return null
  }
  return entry.positions
}

export function useHRDashboard(): UseHRDashboardResult {
  const { accessToken, isAuthenticated } = useAuth()
  const [result, setResult] = useState<UseHRDashboardResult>(() => {
    // Hydrate from cache synchronously so the UI never shows a spinner on re-mount
    if (accessToken) {
      const cached = getCached(accessToken)
      if (cached) return { status: 'success', positions: cached }
    }
    return { status: 'idle' }
  })

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setResult({ status: 'idle' })
      return
    }

    // Already served from cache in useState initializer — skip the fetch
    const cached = getCached(accessToken)
    if (cached) {
      setResult({ status: 'success', positions: cached })
      return
    }

    let cancelled = false
    setResult({ status: 'loading' })

    void (async () => {
      try {
        const positionItems = await fetchHRPositions(env.catalystonePositionApiBaseUrl, accessToken)
        if (cancelled) return

        const employmentsByPosition = await Promise.all(
          positionItems.map(async (pos) => {
            try {
              const emps = await fetchPositionEmployments(
                env.catalystoneMappingApiBaseUrl,
                pos.id,
                accessToken,
              )
              return { pos, emps }
            } catch {
              return { pos, emps: [] }
            }
          }),
        )
        if (cancelled) return

        const processedPositions: HRPositionData[] = []

        await Promise.all(
          employmentsByPosition.map(async ({ pos, emps }) => {
            const posTitle = pos.representation?.title?.text ?? pos.id

            if (emps.length === 0) {
              processedPositions.push({
                id: pos.id, title: posTitle, hasEnoughData: false,
                bandMin: 0, bandMax: 0, bandMedian: 0,
                maleMedian: 0, femaleMedian: 0, cohortSize: 0,
                employeeCount: 0, salaries: [], maleSalaries: [], femaleSalaries: [],
                maleEmployees: [], femaleEmployees: [], currency: '',
              })
              return
            }

            const compResults = await Promise.all(
              emps.map(async (emp) => {
                try {
                  const [comp, details] = await Promise.all([
                    fetchSalaryComparison(env.catalystoneMappingApiBaseUrl, emp.id, accessToken),
                    fetchEmploymentDetails(env.catalystoneMappingApiBaseUrl, emp.id, accessToken).catch(() => null),
                  ])
                  return { empId: emp.id, comp, details }
                } catch {
                  return null
                }
              }),
            )

            const valid = compResults.filter(
              (r): r is { empId: string; comp: SalaryComparisonResponse; details: { employee: { firstName: string; lastName: string } } | null } =>
                r !== null && r.comp?.currentSalary?.components?.basicSalary != null,
            )

            if (valid.length === 0) {
              processedPositions.push({
                id: pos.id, title: posTitle, hasEnoughData: false,
                bandMin: 0, bandMax: 0, bandMedian: 0,
                maleMedian: 0, femaleMedian: 0, cohortSize: 0,
                employeeCount: emps.length, salaries: [], maleSalaries: [], femaleSalaries: [],
                maleEmployees: [], femaleEmployees: [], currency: '',
              })
              return
            }

            const first = valid[0].comp
            // Find the first result that actually has a salaryBand with a title
            const withBand = valid.find((r) => r.comp.salaryBand?.position?.title)
            const rawCurrency = first.currentSalary.components.basicSalary.currency
            const currency =
              typeof rawCurrency === 'string'
                ? rawCurrency
                : (rawCurrency?.name || rawCurrency?.id || '')

            const comparison = first.comparison
            const cohortSize = comparison?.cohortSize ?? valid.length
            const hasEnoughData = comparison !== null && cohortSize > 1

            const employeeRecords: EmployeeRecord[] = valid.map((r) => {
              const name = r.details
                ? `${r.details.employee.firstName} ${r.details.employee.lastName}`.trim()
                : r.empId
              return { id: r.empId, name, salary: r.comp.currentSalary.components.basicSalary.amount, salaryData: r.comp }
            })
            const allSalaries = employeeRecords.map((e) => e.salary)
            const maleMedianVal = comparison?.maleMedian ?? 0
            const femaleMedianVal = comparison?.femaleMedian ?? 0

            let maleSalaries: number[] = []
            let femaleSalaries: number[] = []
            let maleEmployees: EmployeeRecord[] = []
            let femaleEmployees: EmployeeRecord[] = []
            if (maleMedianVal > 0 && femaleMedianVal > 0 && maleMedianVal !== femaleMedianVal) {
              const midpoint = (maleMedianVal + femaleMedianVal) / 2
              const maleHigher = maleMedianVal > femaleMedianVal
              employeeRecords.forEach((e) => {
                if (maleHigher ? e.salary >= midpoint : e.salary < midpoint) {
                  maleSalaries.push(e.salary)
                  maleEmployees.push(e)
                } else {
                  femaleSalaries.push(e.salary)
                  femaleEmployees.push(e)
                }
              })
            }

            processedPositions.push({
              id: pos.id,
              title:
                pos.representation?.title?.text ??
                withBand?.comp.salaryBand?.position?.title ??
                pos.id,
              hasEnoughData,
              bandMin: withBand?.comp.salaryBand?.min ?? first.salaryBand?.min ?? 0,
              bandMax: withBand?.comp.salaryBand?.max ?? first.salaryBand?.max ?? 0,
              bandMedian: comparison?.sameRoleMedian ?? 0,
              maleMedian: comparison?.maleMedian ?? 0,
              femaleMedian: comparison?.femaleMedian ?? 0,
              cohortSize,
              employeeCount: emps.length,
              salaries: allSalaries,
              maleSalaries,
              femaleSalaries,
              maleEmployees,
              femaleEmployees,
              currency,
            })
          }),
        )

        if (!cancelled) {
          cache.set(accessToken, { positions: processedPositions, fetchedAt: Date.now() })
          setResult({ status: 'success', positions: processedPositions })
        }
      } catch (error) {
        if (!cancelled) {
          setResult({
            status: 'error',
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [accessToken, isAuthenticated])

  return result
}

