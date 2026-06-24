import { motion } from 'framer-motion'
import { useAuth } from '../auth/useAuth'

export default function LoginButton() {
  const { isAuthenticated, loading, login, logout } = useAuth()

  if (loading) {
    return (
      <div className="h-10 w-44 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" aria-hidden="true" />
    )
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (isAuthenticated) {
          void logout()
          return
        }

        login()
      }}
      className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
    >
      {isAuthenticated ? 'Sign out' : 'Authorise with CatalystOne'}
    </motion.button>
  )
}
