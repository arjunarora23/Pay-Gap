export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('no-NO', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(n: number): string {
  return `${n}%`
}

export function ordinalSuffix(n: number): string {
  const t = n % 10
  const r = n % 100
  if (t === 1 && r !== 11) return `${n}st`
  if (t === 2 && r !== 12) return `${n}nd`
  if (t === 3 && r !== 13) return `${n}rd`
  return `${n}th`
}

export function generateGaussianCurve(
  p25: number,
  p50: number,
  p75: number,
  p100: number,
): { x: number; y: number }[] {
  const peaks = [
    { center: 12.5, weight: p25, sigma: 14 },
    { center: 37.5, weight: p50, sigma: 14 },
    { center: 62.5, weight: p75, sigma: 14 },
    { center: 87.5, weight: p100, sigma: 14 },
  ]
  const result: { x: number; y: number }[] = []
  for (let x = 0; x <= 100; x += 2) {
    const y = peaks.reduce(
      (sum, { center, weight, sigma }) =>
        sum + weight * Math.exp(-0.5 * Math.pow((x - center) / sigma, 2)),
      0,
    )
    result.push({ x, y: Math.round(y * 10) / 10 })
  }
  return result
}
