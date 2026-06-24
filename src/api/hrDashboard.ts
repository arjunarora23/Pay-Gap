export interface PositionItem {
  id: string
  representation?: {
    title?: {
      text?: string
    }
  }
}

export interface EmploymentItem {
  id: string
}

export async function fetchHRPositions(
  positionApiBaseUrl: string,
  accessToken: string,
): Promise<PositionItem[]> {
  const url = `${positionApiBaseUrl}/job-architecture/positions`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch positions: ${response.status} ${response.statusText}`)
  }
  const data = (await response.json()) as { items?: PositionItem[] }
  return data.items ?? []
}

export async function fetchPositionEmployments(
  monoBaseUrl: string,
  positionId: string,
  accessToken: string,
): Promise<EmploymentItem[]> {
  const url = `${monoBaseUrl}/positions/${positionId}/employments`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/hal+json',
    },
  })
  if (!response.ok) {
    throw new Error(
      `Failed to fetch employments for position ${positionId}: ${response.status} ${response.statusText}`,
    )
  }
  const data = (await response.json()) as {
    _embedded?: { employments?: EmploymentItem[] }
  }
  return data._embedded?.employments ?? []
}
