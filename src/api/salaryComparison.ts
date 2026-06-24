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
  employmentGuid: string
}

export async function fetchEmploymentMapping(
  apiBaseUrl: string,
  accessToken: string,
): Promise<EmploymentMappingResponse> {
  const url = `${apiBaseUrl}/employments/mapping`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: '*/*',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch employment mapping: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<EmploymentMappingResponse>
}

export interface EmploymentDetailsResponse {
  employee: {
    firstName: string
    lastName: string
  }
}

export async function fetchEmploymentDetails(
  apiBaseUrl: string,
  employmentGuid: string,
  accessToken: string,
): Promise<EmploymentDetailsResponse> {
  const url = `${apiBaseUrl}/employments/${employmentGuid}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: '*/*',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch employment details: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<EmploymentDetailsResponse>
}

export async function fetchSalaryComparison(
  apiBaseUrl: string,
  employmentGuid: string,
  accessToken: string,
): Promise<SalaryComparisonResponse> {
  const url = `${apiBaseUrl}/employments/${employmentGuid}/salary-comparison`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/hal+json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch salary comparison: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<SalaryComparisonResponse>
}
