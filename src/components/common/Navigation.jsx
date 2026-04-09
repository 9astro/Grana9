import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Wallet, FolderOpen, Target, Home, CreditCard, TrendingUp, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/transactions', label: 'Lançamentos', icon: Wallet },
  { path: '/categories', label: 'Categorias', icon: FolderOpen },
  { path: '/goals', label: 'Metas', icon: Target },
  { path: '/fixed-accounts', label: 'Contas Fixas', icon: BarChart3 },
  { path: '/credit-cards', label: 'Cartões', icon: CreditCard },
  { path: '/reports', label: 'Relatórios', icon: TrendingUp },
  { path: '/settings', label: 'Config', icon: Settings }
]

export default function Navigation({ menuOpen, onMenuClose }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 fixed left-0 top-16 h-[calc(100vh-64px)] overflow-y-auto">
        <nav className="flex-1 px-4 py-8 space-y-2">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                isActive(path)
                  ? 'bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={onMenuClose}
          />
          <aside className="fixed left-0 top-16 z-40 w-64 bg-white dark:bg-slate-900 h-[calc(100vh-64px)] md:hidden overflow-y-auto">
            <nav className="px-4 py-8 space-y-2">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={onMenuClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                    isActive(path)
                      ? 'bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  )
}
