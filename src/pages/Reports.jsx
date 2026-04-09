import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { pt } from 'date-fns/locale'
import Card from '../components/common/Card'
import PageLayout from '../components/common/PageLayout'
import db from '../services/db'

const COLORS = ['#0f766e', '#06b6d4', '#8b5cf6', '#ef4444', '#f97316', '#eab308', '#ec4899', '#6366f1', '#10b981', '#64748b']

export default function Reports() {
  const [period, setPeriod] = useState('month')
  const [monthlyData, setMonthlyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  })

  useEffect(() => {
    loadReportData()
  }, [period])

  const loadReportData = async () => {
    const now = new Date()
    let startDate, endDate

    if (period === 'month') {
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
    } else if (period === '3months') {
      startDate = startOfMonth(subMonths(now, 2))
      endDate = endOfMonth(now)
    } else if (period === '6months') {
      startDate = startOfMonth(subMonths(now, 5))
      endDate = endOfMonth(now)
    } else {
      startDate = startOfMonth(subMonths(now, 11))
      endDate = endOfMonth(now)
    }

    const txns = await db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray()

    // Calculate monthly breakdown
    const monthlyBreakdown = {}
    txns.forEach(t => {
      const monthKey = format(new Date(t.date), 'MMM/yy', { locale: pt })
      if (!monthlyBreakdown[monthKey]) {
        monthlyBreakdown[monthKey] = { month: monthKey, income: 0, expense: 0 }
      }
      if (t.type === 'income') {
        monthlyBreakdown[monthKey].income += t.value
      } else {
        monthlyBreakdown[monthKey].expense += t.value
      }
    })
    setMonthlyData(Object.values(monthlyBreakdown))

    // Category breakdown
    const categoryBreakdown = {}
    txns.filter(t => t.type === 'expense').forEach(t => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = 0
      }
      categoryBreakdown[t.category] += t.value
    })
    setCategoryData(
      Object.entries(categoryBreakdown)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    )

    // Stats
    const income = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0)
    const expense = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0)
    setStats({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    })
  }

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Relatórios</h1>
        
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'month', label: 'Mês Atual' },
            { value: '3months', label: 'Últimos 3 Meses' },
            { value: '6months', label: 'Últimos 6 Meses' },
            { value: 'year', label: 'Último Ano' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === opt.value
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Recebido</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {formatCurrency(stats.totalIncome)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Gasto</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {formatCurrency(stats.totalExpense)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Saldo</p>
          <p className={`text-3xl font-bold mt-2 ${
            stats.balance >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(stats.balance)}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Evolução Mensal</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="income" fill="#16a34a" name="Receitas" />
                <Bar dataKey="expense" fill="#dc2626" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">Sem dados</div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Gastos por Categoria</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">Sem dados</div>
          )}
        </Card>
      </div>

      {/* Category Details */}
      {categoryData.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Detalhes por Categoria</h2>
          <div className="space-y-3">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(cat.value)}</p>
                  <p className="text-xs text-gray-500">
                    {((cat.value / stats.totalExpense) * 100).toFixed(1)}% do total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageLayout>
  )
}
