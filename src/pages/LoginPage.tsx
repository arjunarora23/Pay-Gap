import { motion } from 'framer-motion'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const { login, isLoading } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Pay Transparency
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Sign in with your CatalystOne account to view your pay profile and salary
          comparison.
        </p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          onClick={() => void login()}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Authorise with CatalystOne
        </motion.button>
      </motion.div>
    </div>
  )
}
