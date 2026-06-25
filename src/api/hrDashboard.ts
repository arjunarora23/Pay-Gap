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

export interface ReferringPosition {
  pos: PositionItem
  emps: EmploymentItem[]
}

export async function fetchReferringPositions(
  monoBaseUrl: string,
  accessToken: string,
): Promise<ReferringPosition[]> {
  const url = `${monoBaseUrl}/employments/positions`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/hal+json',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch referring positions: ${response.status} ${response.statusText}`)
  }
  const data = (await response.json()) as {
    _embedded?: {
      positions?: Array<
        PositionItem & { _embedded?: { employments?: EmploymentItem[] } }
      >
    }
  }
  const positions = data._embedded?.positions ?? []
  return positions.map((pos) => ({
    pos: { id: pos.id, representation: pos.representation },
    emps: pos._embedded?.employments ?? [],
  }))
}
