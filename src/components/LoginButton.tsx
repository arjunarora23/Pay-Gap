import { motion } from 'framer-motion'
import { useAuth } from '../auth/AuthContext'

export default function LoginButton() {
  const { isAuthenticated, isLoading, login, logout } = useAuth()

  if (isLoading) {
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
          logout()
          return
        }

        void login()
      }}
      className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
    >
      {isAuthenticated ? 'Sign out' : 'Authorise with CatalystOne'}
    </motion.button>
  )
}
