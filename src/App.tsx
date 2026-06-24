import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { Sun, Moon, ChevronDown } from 'lucide-react'
import { salaryData, employeeData } from './data'
import { formatCurrency, formatPercent, ordinalSuffix, generateGaussianCurve } from './utils'
import LoginButton from './components/LoginButton'
import { useAuth } from './auth/AuthContext'
import { useSalaryComparison } from './hooks/useSalaryComparison'

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl ${className ?? ''}`} />
  )
}

type TooltipProps = {
  active?: boolean
  payload?: { value: number }[]
  label?: number
}

function CohortTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none">
      <p className="font-semibold mb-0.5">Salary: {Math.round(label ?? 0)}th %ile</p>
      <p className="opacity-80">Peers: {payload[0].value.toFixed(1)}%</p>
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [isAccordionOpen, setIsAccordionOpen] = useState(false)
  const [isActionOpen, setIsActionOpen] = useState(false)

  const { isAuthenticated } = useAuth()
  const salaryResult = useSalaryComparison()

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => setIsLoading(false), 1200)
      return () => clearTimeout(timer)
    }
    if (salaryResult.status === 'loading' || salaryResult.status === 'idle') {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, salaryResult.status])

  const displayName =
    isAuthenticated && salaryResult.status === 'success'
      ? salaryResult.employeeName
      : employeeData.name

  const displayData =
    isAuthenticated && salaryResult.status === 'success' && salaryResult.data?.comparison != null
      ? salaryResult.data
      : salaryData

  const { currentSalary, salaryBand, comparison } = displayData
  const amount = currentSalary.components.basicSalary.amount
  const rawCurrency = currentSalary.components.basicSalary.currency
  const currency = typeof rawCurrency === 'string' ? rawCurrency : (rawCurrency.name || rawCurrency.id)
  const positionTitle = salaryBand.position.title
  const { min, max } = salaryBand
  const median = comparison.sameRoleMedian
  const bandRange = max - min
  const yourPct = Math.max(0, Math.min(100, ((amount - min) / bandRange) * 100))
  const medianPct = Math.max(0, Math.min(100, ((median - min) / bandRange) * 100))
  const percentileInt = Math.round(comparison.percentile * 100)
  const percentileLabel = ordinalSuffix(percentileInt)
  const curveData = generateGaussianCurve(
    comparison.P25Density,
    comparison.P50Density,
    comparison.P75Density,
    comparison.P100Density,
  )

  const accentColor = isDark ? '#818CF8' : '#4F46E5'
  const gridColor = isDark ? '#334155' : '#F1F5F9'
  const tickColor = isDark ? '#94A3B8' : '#64748b'

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 md:p-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <header className="mb-8 flex justify-between items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
                {displayName}'s Pay Profile
              </h1>
              {isLoading ? (
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded mt-2" />
              ) : (
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                  {positionTitle}
                </p>
              )}
            </motion.div>

            <div className="flex items-center gap-3">
              <LoginButton />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDark(!isDark)}
                className="relative p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors overflow-hidden w-10 h-10 flex items-center justify-center"
                aria-label="Toggle Dark Mode"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.div
                      key="moon"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -30, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute"
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -30, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute"
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </header>

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <SkeletonBlock className="h-32" />
                  <SkeletonBlock className="h-32" />
                </div>
                <SkeletonBlock className="h-48 md:h-56" />
                <SkeletonBlock className="h-48 md:h-56" />
              </div>
              <div className="space-y-6">
                <SkeletonBlock className="h-80" />
                <SkeletonBlock className="h-64" />
              </div>
            </div>
          ) : isAuthenticated && salaryResult.status === 'error' ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-rose-200 dark:border-rose-800 text-center max-w-md w-full">
                <p className="text-lg font-semibold text-rose-600 dark:text-rose-400 mb-2">
                  Failed to load salary data
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  {salaryResult.error.message}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">

                {/* Stat cards row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Current Salary */}
                  <motion.div
                    variants={cardVariants}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                      Current Salary
                    </div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <div className="text-4xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(amount, currency)}
                      </div>
                      <div className={`text-sm font-semibold px-2 py-0.5 rounded-md ${comparison.yourPositionVsMedian >= 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}>
                        {comparison.yourPositionVsMedian >= 0 ? '+' : ''}{formatPercent(comparison.yourPositionVsMedian)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      vs. same-role median
                    </p>
                  </motion.div>

                  {/* Same Role Median */}
                  <motion.div
                    variants={cardVariants}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                      Same Role Median
                    </div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(median, currency)}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {comparison.cohortSize} peers · {salaryBand.position.title}
                    </p>
                  </motion.div>
                </div>

                {/* Pay Band */}
                <motion.div
                  variants={cardVariants}
                  className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Pay Band for {salaryBand.position.title}
                  </h2>
                  <div className="relative pt-8 pb-10">
                    <div className="h-4 w-full bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 dark:from-slate-800 dark:via-indigo-900/30 dark:to-slate-800 rounded-full relative border border-slate-200 dark:border-slate-700">
                      {/* Min label */}
                      <div className="absolute top-full mt-3 left-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Min<br />
                        <span className="text-slate-900 dark:text-slate-200">
                          {formatCurrency(min, currency)}
                        </span>
                      </div>
                      {/* Max label */}
                      <div className="absolute top-full mt-3 right-0 text-sm font-medium text-slate-500 dark:text-slate-400 text-right">
                        Max<br />
                        <span className="text-slate-900 dark:text-slate-200">
                          {formatCurrency(max, currency)}
                        </span>
                      </div>
                      {/* Median line */}
                      <motion.div
                        initial={{ left: '0%' }}
                        animate={{ left: `${medianPct}%` }}
                        transition={{ duration: 1, delay: 0.5, type: 'spring' }}
                        className="absolute top-[-10px] bottom-[-10px] w-0.5 bg-slate-400 dark:bg-slate-500 -translate-x-1/2"
                      />
                      {/* Median label */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        className="absolute bottom-full mb-3 text-xs font-medium text-slate-500 dark:text-slate-400 -translate-x-1/2 text-center"
                        style={{ left: `${medianPct}%` }}
                      >
                        Median<br />
                        <span className="text-slate-900 dark:text-slate-200">
                          {formatCurrency(median, currency)}
                        </span>
                      </motion.div>
                      {/* You dot */}
                      <motion.div
                        initial={{ left: '0%' }}
                        animate={{ left: `${yourPct}%` }}
                        transition={{ duration: 1, delay: 0.7, type: 'spring' }}
                        className="absolute top-1/2 w-6 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full border-[3px] border-white dark:border-slate-900 -translate-y-1/2 -translate-x-1/2 shadow-md z-10"
                      />
                      {/* You label */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                        className="absolute top-full mt-3 text-xs font-bold text-indigo-700 dark:text-indigo-300 -translate-x-1/2 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-1 rounded whitespace-nowrap"
                        style={{ left: `${yourPct}%` }}
                      >
                        You: {formatCurrency(amount, currency)}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Percentile */}
                <motion.div
                  variants={cardVariants}
                  className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    {percentileLabel} Percentile
                  </h2>
                  <div className="relative pt-8 pb-6">
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full relative">
                      {/* Tick labels */}
                      {[0, 25, 50, 75, 100].map((v) => (
                        <div
                          key={v}
                          className="absolute top-full mt-2 text-xs text-slate-400 dark:text-slate-500 -translate-x-1/2"
                          style={{ left: `${v}%` }}
                        >
                          {v}
                        </div>
                      ))}
                      {/* Tick lines */}
                      {[25, 50, 75].map((v) => (
                        <div
                          key={`tick-${v}`}
                          className="absolute top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-600"
                          style={{ left: `${v}%` }}
                        />
                      ))}
                      {/* Median dot */}
                      <div
                        className="absolute top-1/2 w-4 h-4 bg-slate-400 dark:bg-slate-500 rounded-full border-2 border-white dark:border-slate-900 -translate-y-1/2 -translate-x-1/2 shadow-sm"
                        style={{ left: '50%' }}
                      />
                      <div
                        className="absolute bottom-full mb-2 text-xs font-medium text-slate-500 dark:text-slate-400 -translate-x-1/2"
                        style={{ left: '50%' }}
                      >
                        Median
                      </div>
                      {/* You dot */}
                      <motion.div
                        initial={{ left: '0%' }}
                        animate={{ left: `${comparison.percentile * 100}%` }}
                        transition={{ duration: 1, delay: 0.7, type: 'spring' }}
                        className="absolute top-1/2 w-5 h-5 bg-indigo-600 dark:bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900 -translate-y-1/2 -translate-x-1/2 shadow-md z-10"
                      />
                      {/* You bubble */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                        className="absolute bottom-full mb-2 bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-bold py-1 px-2 rounded -translate-x-1/2 whitespace-nowrap"
                        style={{ left: `${comparison.percentile * 100}%` }}
                      >
                        You ({percentileInt}th)
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-indigo-600 dark:border-t-indigo-500" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Cohort Distribution */}
                <motion.div
                  variants={cardVariants}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Cohort Distribution
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {comparison.cohortSize} peers in your cohort
                    </p>
                  </div>
                  <div className="h-56 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={curveData} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
                        <defs>
                          <linearGradient id="cohortGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={accentColor} stopOpacity={0.45} />
                            <stop offset="100%" stopColor={accentColor} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis
                          dataKey="x"
                          type="number"
                          domain={[0, 100]}
                          ticks={[0, 25, 50, 75, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: tickColor, fontSize: 11 }}
                          tickFormatter={(v: number) => `${v}%`}
                          dy={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: tickColor, fontSize: 11 }}
                          tickFormatter={(v: number) => `${Math.round(v)}%`}
                        />
                        <Tooltip
                          cursor={{ stroke: '#000', strokeWidth: 1, strokeDasharray: '4 3' }}
                          content={<CohortTooltip />}
                        />
                        <ReferenceLine
                          x={percentileInt}
                          stroke={accentColor}
                          strokeDasharray="5 3"
                          strokeWidth={2}
                          label={{ value: 'You', position: 'top', fill: accentColor, fontSize: 11, fontWeight: 600 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="y"
                          stroke={accentColor}
                          strokeWidth={2.5}
                          fill="url(#cohortGradient)"
                          dot={false}
                          activeDot={{ r: 4, fill: accentColor, strokeWidth: 0 }}
                          isAnimationActive
                          animationDuration={900}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Gender Pay Parity */}
                <motion.div
                  variants={cardVariants}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                    Gender Pay Parity
                  </h2>
                  <div className="space-y-6">
                    {/* Female */}
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Female Median
                        </span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {formatCurrency(comparison.femaleMedian, currency)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(comparison.femaleMedian / max) * 100}%` }}
                          transition={{ duration: 1, delay: 0.8 }}
                          className="bg-purple-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                    {/* Male */}
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Male Median
                        </span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {formatCurrency(comparison.maleMedian, currency)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(comparison.maleMedian / max) * 100}%` }}
                          transition={{ duration: 1, delay: 1 }}
                          className="bg-sky-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* How is this calculated? accordion */}
          {!isLoading && !(isAuthenticated && salaryResult.status === 'error') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <button
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="flex w-full items-center justify-between text-left text-lg font-semibold text-slate-900 dark:text-white focus:outline-none"
              >
                How is this calculated?
                <motion.div animate={{ rotate: isAccordionOpen ? 180 : 0 }}>
                  <ChevronDown className="w-5 h-5 text-slate-500" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isAccordionOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                      <p>
                        The same-role median and density curve are based on{' '}
                        <strong className="text-slate-900 dark:text-white">
                          {comparison.cohortSize} anonymised colleagues
                        </strong>{' '}
                        in the same position.
                      </p>
                      <p>
                        Percentile reflects where the salary sits inside the official salary band,
                        not a ranking against named people. Gender medians appear only when at least
                        five peers protect anonymity.
                      </p>

                      <div className="pt-6 pb-2 flex flex-wrap gap-4 items-center">
                        <a
                          href="https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/gender-equality/equal-pay/eu-pay-transparency-directive_en"
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium px-6 py-3 rounded-xl shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-block text-center flex-1 sm:flex-none"
                        >
                          Learn about EU Pay Transparency
                        </a>

                        <div className="relative flex-1 sm:flex-none">
                          <button
                            onClick={() => setIsActionOpen(!isActionOpen)}
                            className="bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl shadow-md transition-colors hover:bg-indigo-700 w-full sm:w-auto text-center flex items-center justify-center gap-2"
                          >
                            Take Action
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${isActionOpen ? 'rotate-180' : ''}`}
                            />
                          </button>

                          <AnimatePresence>
                            {isActionOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full mb-2 right-0 w-64 sm:min-w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-20"
                              >
                                <button className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-medium transition-colors border-b border-slate-100 dark:border-slate-700">
                                  Talk to {employeeData.managerName}
                                </button>
                                <button className="w-full text-left px-4 py-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-medium transition-colors flex justify-between items-center">
                                  Sue your manager
                                  <motion.span
                                    className="inline-block text-xl ml-2"
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                  >
                                    😈
                                  </motion.span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}
