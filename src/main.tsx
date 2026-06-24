import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider.tsx'
import RequireAuth from './auth/RequireAuth.tsx'
import CallbackPage from './pages/CallbackPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import SalaryComparison from './pages/SalaryComparison.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/salary-comparison"
            element={
              <RequireAuth>
                <SalaryComparison />
              </RequireAuth>
            }
          />
          <Route path="/oauth/callback" element={<CallbackPage />} />
          <Route path="/" element={<Navigate to="/salary-comparison" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
