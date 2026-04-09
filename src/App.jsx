import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/common/Header'
import Navigation from './components/common/Navigation'
import { ToastProvider } from './components/common/Toast'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import Goals from './pages/Goals'
import FixedAccounts from './pages/FixedAccounts'
import CreditCards from './pages/CreditCards'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import db, { initializeDB } from './services/db'
import { getMockTransactions } from './services/mockData'

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    initializeDB()
    loadInitialData()
    applyTheme()
  }, [])

  const loadInitialData = async () => {
    const hasData = await db.transactions.count()
    if (hasData === 0) {
      const mockTxns = getMockTransactions()
      await db.transactions.bulkAdd(mockTxns)
    }
  }

  const applyTheme = () => {
    const theme = localStorage.getItem('theme') || 'light'
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      <Header 
        title="Grana9" 
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        menuOpen={menuOpen}
      />
      <Navigation 
        menuOpen={menuOpen}
        onMenuClose={() => setMenuOpen(false)}
      />
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/fixed-accounts" element={<FixedAccounts />} />
        <Route path="/credit-cards" element={<CreditCards />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ToastProvider>
  )
}
