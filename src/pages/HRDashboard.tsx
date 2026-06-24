import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { CheckCircle2, ChevronDown, Loader2 } from 'lucide-react'
import { useHRDashboard } from '../hooks/useHRDashboard'
import type { HRPositionData, EmployeeRecord } from '../hooks/useHRDashboard'

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function buildGenderDistribution(
  maleSalaries: number[],
  femaleSalaries: number[],
  bandMin: number,
  bandMax: number,
): { label: string; female: number; male: number }[] {
  const range = bandMax - bandMin
  if (range <= 0) return []
  const q = range / 4
  return (
    [
      { label: '25th', min: bandMin, max: bandMin + q },
      { label: '50th', min: bandMin + q, max: bandMin + 2 * q },
      { label: '75th', min: bandMin + 2 * q, max: bandMin + 3 * q },
      { label: '100th', min: bandMin + 3 * q, max: bandMax },
    ] as { label: string; min: number; max: number }[]
  ).map(({ label, min, max }, i) => {
    const count = (arr: number[]) =>
      arr.filter((s) => (i === 3 ? s >= min && s <= max : s >= min && s < max)).length
    return { label, female: count(femaleSalaries), male: count(maleSalaries) }
  })
}

type DistTooltipProps = {
  active?: boolean
  payload?: { name: string; value: number }[]
  label?: string
}

function makeDistTooltip(
  maleEmployees: EmployeeRecord[],
  femaleEmployees: EmployeeRecord[],
  bandMin: number,
  bandMax: number,
  onViewEmployee: (emp: EmployeeRecord) => void,
  currentEmploymentId?: string,
) {
  return function DistTooltip({ active, label }: DistTooltipProps) {
    if (!active || !label) return null
    const bands = ['25th', '50th', '75th', '100th']
    const idx = bands.indexOf(label)
    if (idx === -1) return null
    const range = bandMax - bandMin
    if (range <= 0) return null
    const q = range / 4
    const lo = bandMin + idx * q
    const hi = bandMin + (idx + 1) * q
    const isLast = idx === 3
    const inBand = (emps: EmployeeRecord[]) =>
      emps.filter((e) => (isLast ? e.salary >= lo && e.salary <= hi : e.salary >= lo && e.salary < hi))
    const femsInBand = inBand(femaleEmployees)
    const malesInBand = inBand(maleEmployees)
    if (femsInBand.length === 0 && malesInBand.length === 0) return null
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 min-w-[160px] max-w-[220px]">
        <p className="font-semibold text-slate-700 text-sm mb-2">{label} percentile</p>
        {femsInBand.length > 0 && (
          <div className="mb-2">
            <p className="text-[11px] text-[#f472b6] font-semibold mb-1">Female</p>
            {femsInBand.map((emp) =>
              emp.id === currentEmploymentId ? (
                <span key={emp.id} className="block text-slate-400 text-xs py-0.5">You</span>
              ) : (
                <button
                  key={emp.id}
                  onClick={() => onViewEmployee(emp)}
                  className="block w-full text-left text-slate-600 hover:text-indigo-600 text-xs py-0.5 hover:underline truncate"
                >
                  {emp.name}
                </button>
              )
            )}
          </div>
        )}
        {malesInBand.length > 0 && (
          <div>
            <p className="text-[11px] text-[#60a5fa] font-semibold mb-1">Male</p>
            {malesInBand.map((emp) =>
              emp.id === currentEmploymentId ? (
                <span key={emp.id} className="block text-slate-400 text-xs py-0.5">You</span>
              ) : (
                <button
                  key={emp.id}
                  onClick={() => onViewEmployee(emp)}
                  className="block w-full text-left text-slate-600 hover:text-indigo-600 text-xs py-0.5 hover:underline truncate"
                >
                  {emp.name}
                </button>
              )
            )}
          </div>
        )}
      </div>
    )
  }
}

function GapBadge({ maleMedian, femaleMedian }: { maleMedian: number; femaleMedian: number }) {
  const gap = maleMedian - femaleMedian
  const gapPct = maleMedian > 0 ? Math.abs(gap / maleMedian) * 100 : 0

  if (gap === 0) {
    return (
      <div className="flex items-center gap-1 text-emerald-600">
        <CheckCircle2 size={13} />
        <span className="font-medium text-sm">Equal pay</span>
      </div>
    )
  }
  return (
    <span
      className={`flex items-center gap-1 font-semibold tabular-nums ${gap > 0 ? 'text-blue-500' : 'text-purple-500'}`}
    >
      <span className="font-black text-base">
        {gap > 0 ? '♂' : '♀'}
      </span>
      +{gapPct.toFixed(1)}%
    </span>
  )
}

function InsufficientCard({ position }: { position: HRPositionData }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-lg text-slate-900">{position.title}</span>
        {position.employeeCount > 0 && (
          <span className="text-sm text-slate-400">
            {position.employeeCount} employee{position.employeeCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <span className="text-sm text-slate-400 italic">Not enough users to evaluate</span>
    </div>
  )
}

function PositionCard({ position, onViewEmployee, currentEmploymentId }: { position: HRPositionData; onViewEmployee: (emp: EmployeeRecord) => void; currentEmploymentId?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const currencyCode = (() => {
    const raw = position.currency.trim().toUpperCase()
    const overrides: Record<string, string> = { EURO: 'EUR', DOLLARS: 'USD', DOLLAR: 'USD', POUNDS: 'GBP', POUND: 'GBP' }
    return overrides[raw] ?? raw
  })()

  const fmt = (v: number) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 0,
      }).format(v)
    } catch {
      return `${v.toLocaleString('en-US')} ${currencyCode}`
    }
  }

  const actualSalaries = position.salaries
  const actualMedian = median(actualSalaries)
  const medPct =
    position.bandMax > position.bandMin
      ? ((actualMedian - position.bandMin) / (position.bandMax - position.bandMin)) * 100
      : 50

  const medLabelTransform =
    medPct > 75 ? 'translateX(-105%)' : medPct < 10 ? 'translateX(5%)' : 'translateX(-50%)'

  const distTooltip = useMemo(
    () => makeDistTooltip(position.maleEmployees, position.femaleEmployees, position.bandMin, position.bandMax, onViewEmployee, currentEmploymentId),
    [position.maleEmployees, position.femaleEmployees, position.bandMin, position.bandMax, onViewEmployee, currentEmploymentId],
  )

  const genderDistData = buildGenderDistribution(
    position.maleSalaries,
    position.femaleSalaries,
    position.bandMin,
    position.bandMax,
  )

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <button
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col items-start gap-1">
          <span className="font-semibold text-lg text-slate-900">{position.title}</span>
          <span className="text-sm text-slate-500">
            {position.employeeCount} employee{position.employeeCount !== 1 ? 's' : ''}
            {' · '}cohort of {position.cohortSize}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-slate-500 text-sm">Gender Pay Gap</span>
            <GapBadge maleMedian={position.maleMedian} femaleMedian={position.femaleMedian} />
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 space-y-4">
              {/* Salary band bar */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Salary Band
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400">Min</div>
                    <div className="text-xs font-semibold text-slate-700">
                      {fmt(position.bandMin)}
                    </div>
                  </div>
                  <div className="relative flex-1" style={{ paddingTop: 28 }}>
                    <div
                      className="absolute flex flex-col items-center"
                      style={{ left: `${medPct}%`, transform: medLabelTransform, top: 0 }}
                    >
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">Median</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {fmt(position.bandMedian)}
                      </span>
                    </div>
                    <div className="relative h-2.5">
                      <div className="absolute inset-0 rounded-full bg-slate-200" />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-px h-4 bg-slate-400"
                        style={{ left: `${medPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div className="text-[10px] text-slate-400">Max</div>
                    <div className="text-xs font-semibold text-slate-700">
                      {fmt(position.bandMax)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
                  Salary Distribution by Gender
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Number of employees per salary percentile band
                </p>
                {/* Legend */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f472b6]" />
                    <span className="text-xs text-slate-600">Female</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]" />
                    <span className="text-xs text-slate-600">Male</span>
                  </div>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={genderDistData} barCategoryGap="25%" barGap={3}>
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={distTooltip}
                        wrapperStyle={{ pointerEvents: 'all' }}
                      />
                      <Bar dataKey="female" name="Female" fill="#f472b6" radius={[2, 2, 0, 0]}>
                        <LabelList dataKey="female" position="top" style={{ fontSize: 10, fill: '#94a3b8' }} />
                      </Bar>
                      <Bar dataKey="male" name="Male" fill="#60a5fa" radius={[2, 2, 0, 0]}>
                        <LabelList dataKey="male" position="top" style={{ fontSize: 10, fill: '#94a3b8' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HRDashboard({ onViewEmployee, currentEmploymentId }: { onViewEmployee: (emp: EmployeeRecord) => void; currentEmploymentId?: string }) {
  const result = useHRDashboard()

  if (result.status === 'idle' || result.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-500 text-sm">
          Loading HR data — fetching positions and salary details…
        </p>
      </div>
    )
  }

  if (result.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-200 text-center max-w-md w-full">
          <p className="text-lg font-semibold text-rose-600 mb-2">Something went wrong</p>
          <p className="text-sm text-slate-500 mb-6">{result.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const { positions } = result

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-slate-500">No position data found.</p>
      </div>
    )
  }

  const totalEmployees = positions.reduce((acc, p) => acc + p.employeeCount, 0)
  const richPositions = positions.filter((p) => p.hasEnoughData)

  // Weighted overall gender pay gap — only positions with enough data
  const totalCohort = richPositions.reduce((acc, p) => acc + p.cohortSize, 0)
  const weightedMale =
    totalCohort > 0
      ? richPositions.reduce((acc, p) => acc + p.maleMedian * (p.cohortSize / totalCohort), 0)
      : 0
  const weightedFemale =
    totalCohort > 0
      ? richPositions.reduce((acc, p) => acc + p.femaleMedian * (p.cohortSize / totalCohort), 0)
      : 0
  const overallGap = weightedMale - weightedFemale
  const overallGapPct = weightedMale > 0 ? Math.abs(overallGap / weightedMale) * 100 : 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pay Gap Analysis</h1>
        <p className="text-slate-500 mt-1">
          Salary distribution and gender pay gaps across roles.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            Total Positions
          </p>
          <div className="text-3xl font-bold text-slate-900 mt-2">{positions.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            Total Employees
          </p>
          <div className="text-3xl font-bold text-slate-900 mt-2">{totalEmployees}</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            Gender Pay Gap
          </p>
          <div className="mt-2">
            {overallGap === 0 ? (
              <div className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 size={14} />
                <span className="font-medium">Equal pay</span>
              </div>
            ) : (
              <span
                className={`flex items-center gap-1 font-semibold tabular-nums text-2xl ${overallGap > 0 ? 'text-blue-500' : 'text-purple-500'}`}
              >
                <span
                  className="font-black text-base"
                >
                  {overallGap > 0 ? '♂' : '♀'}
                </span>
                +{overallGapPct.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Position accordion */}
      <div className="space-y-4">
        {positions.map((position) =>
          position.hasEnoughData ? (
            <PositionCard key={position.id} position={position} onViewEmployee={onViewEmployee} currentEmploymentId={currentEmploymentId} />
          ) : (
            <InsufficientCard key={position.id} position={position} />
          ),
        )}
      </div>
    </div>
  )
}
