import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import { positions } from '../data/mockData'
import type { Employee } from '../data/mockData'

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function getGenderMedians(employees: Employee[]) {
  const male = employees.filter(e => e.gender === 'M').map(e => e.salary)
  const female = employees.filter(e => e.gender === 'F').map(e => e.salary)
  return { maleMedian: median(male), femaleMedian: median(female) }
}

function buildPercentileGenderData(employees: Employee[]) {
  if (employees.length === 0) return []
  const sorted = [...employees].sort((a, b) => a.salary - b.salary)
  const n = sorted.length
  const bucketLabels = ['25th', '50th', '75th', '100th']
  return bucketLabels.map((label, i) => {
    const start = Math.floor(n * i * 0.25)
    const end = Math.floor(n * (i + 1) * 0.25)
    const slice = sorted.slice(start, end)
    return {
      label,
      Female: slice.filter(e => e.gender === 'F').length,
      Male: slice.filter(e => e.gender === 'M').length,
    }
  })
}

function GapBadge({ employees }: { employees: Employee[] }) {
  const { maleMedian, femaleMedian } = getGenderMedians(employees)
  const gap = maleMedian - femaleMedian
  const gapPct = maleMedian > 0 ? Math.abs(gap / maleMedian * 100) : 0

  if (gap === 0) {
    return (
      <div className="flex items-center gap-1 text-emerald-600">
        <CheckCircle2 size={13} />
        <span className="font-medium text-sm">Equal pay</span>
      </div>
    )
  }
  return (
    <span className={`flex items-center gap-1 font-semibold tabular-nums ${gapPct > 5 ? 'text-red-500' : 'text-emerald-600'}`}>
      <span className={`font-black text-base ${gap > 0 ? 'text-blue-500' : 'text-pink-500'}`}>
        {gap > 0 ? '♂' : '♀'}
      </span>
      +{gapPct.toFixed(1)}%
    </span>
  )
}

export default function HRDashboard() {
  const [openId, setOpenId] = useState<string | null>(null)

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

  const allEmployees = positions.flatMap(p => p.employees)
  const totalEmployees = positions.reduce((acc, p) => acc + p.employeeCount, 0)
  const { maleMedian, femaleMedian } = getGenderMedians(allEmployees)
  const overallGap = maleMedian - femaleMedian
  const overallGapPct = maleMedian > 0 ? Math.abs(overallGap / maleMedian * 100) : 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pay Gap Analysis</h1>
        <p className="text-slate-500 mt-1">Analyse salary distribution and gender pay gaps across roles.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Positions</p>
          <div className="text-3xl font-bold text-slate-900 mt-2">{positions.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Employees</p>
          <div className="text-3xl font-bold text-slate-900 mt-2">{totalEmployees}</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Gender Pay Gap</p>
          <div className="mt-2">
            {overallGap === 0 ? (
              <div className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 size={14} />
                <span className="font-medium">Equal pay</span>
              </div>
            ) : (
              <span className={`flex items-center gap-1 font-semibold tabular-nums text-2xl ${overallGapPct > 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                <span className={`font-black text-base ${overallGap > 0 ? 'text-blue-500' : 'text-pink-500'}`}>
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
        {positions.map((position) => {
          const isOpen = openId === position.id
          const salaries = position.employees.map(e => e.salary).sort((a, b) => a - b)
          const low = salaries[0]
          const high = salaries[salaries.length - 1]
          const med = median(salaries)
          const medPct = ((med - low) / (high - low)) * 100
          const chartData = buildPercentileGenderData(position.employees)

          return (
            <div key={position.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <button
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                onClick={() => setOpenId(isOpen ? null : position.id)}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-semibold text-lg text-slate-900">{position.title}</span>
                  <span className="text-sm text-slate-500">{position.employeeCount} Employees</span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-slate-500 text-sm">Gender Pay Gap</span>
                    <GapBadge employees={position.employees} />
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
                      {/* Salary range bar */}
                      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-right shrink-0">
                            <div className="text-[10px] text-slate-400">Min</div>
                            <div className="text-xs font-semibold text-slate-700">{fmt(low)}</div>
                          </div>

                          <div className="relative flex-1" style={{ paddingTop: 28 }}>
                            <div
                              className="absolute flex flex-col items-center"
                              style={{ left: `${medPct}%`, transform: 'translateX(-50%)', top: 0 }}
                            >
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">Median</span>
                              <span className="text-xs font-semibold text-slate-700">{fmt(med)}</span>
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
                            <div className="text-xs font-semibold text-slate-700">{fmt(high)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Gender distribution chart */}
                      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                        <h3 className="text-base font-semibold text-slate-900 mb-0.5">
                          Salary Distribution by Gender
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Number of employees per salary percentile band
                        </p>

                        <div className="flex items-center gap-5 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-pink-400" />
                            Female
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
                            Male
                          </span>
                        </div>

                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                              <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                allowDecimals={false}
                              />
                              <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{
                                  borderRadius: 8,
                                  border: '1px solid #e2e8f0',
                                  boxShadow: 'none',
                                  fontSize: 12,
                                }}
                              />
                              <Bar dataKey="Female" fill="#f472b6" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="Male" fill="#60a5fa" radius={[2, 2, 0, 0]} />
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
        })}
      </div>
    </div>
  )
}
