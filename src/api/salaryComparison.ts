// Types mirroring the /employment/{id}/salary-comparison HAL JSON response

export interface SalaryComparisonOption {
  id: string
  name: string
}

export interface BasicSalaryData {
  amount: number
  currency: SalaryComparisonOption
  typeOfPay?: SalaryComparisonOption
}

export interface SalaryBandData {
  position: {
    title: string
  }
  min: number
  max: number
}

export interface ComparisonData {
  cohortSize: number
  sameRoleMedian: number
  percentile: number
  P25Density: number
  P50Density: number
  P75Density: number
  P100Density: number
  yourPositionVsMedian: number
  maleMedian: number
  femaleMedian: number
}

export interface SalaryComparisonResponse {
  currentSalary: {
    components: {
      basicSalary: BasicSalaryData
    }
  }
  salaryBand: SalaryBandData
  comparison: ComparisonData
}

export interface EmploymentMappingResponse {
  employmentId: string
}

export async function fetchEmploymentMapping(): Promise<EmploymentMappingResponse> {
  const response = await fetch('/api/employments/mapping', {
    credentials: 'include',
    headers: {
      Accept: 'application/hal+json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch employment mapping: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<EmploymentMappingResponse>
}

export async function fetchSalaryComparison(
  employmentId: string,
): Promise<SalaryComparisonResponse> {
  const response = await fetch(`/api/employments/${employmentId}/salary-comparison`, {
    credentials: 'include',
    headers: {
      Accept: 'application/hal+json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch salary comparison: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<SalaryComparisonResponse>
}
