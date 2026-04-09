import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ArrowDownRight, ArrowUpLeft, Target, TrendingUp } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { pt } from 'date-fns/locale'
import Card from '../components/common/Card'
import PageLayout from '../components/common/PageLayout'
import db from '../services/db'

const COLORS = ['#0f766e', '#06b6d4', '#8b5cf6', '#ef4444', '#f97316', '#eab308', '#ec4899', '#6366f1', '#10b981', '#64748b']

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    remaining: 0
  })
  const [chartData, setChartData] = useState([])
  const [categoryData, setCategoryData] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const now = new Date()
      const startOfCurrentMonth = startOfMonth(now)
      const endOfCurrentMonth = endOfMonth(now)

      const txns = await db.transactions
        .where('date')
        .between(startOfCurrentMonth, endOfCurrentMonth, true, true)
        .toArray()

      const cats = await db.categories.toArray()

      setTransactions(txns)
      setCategories(cats)

      // Calculate stats
      const income = txns
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.value, 0)

      const expenses = txns
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.value, 0)

      setStats({
        totalIncome: income,
        totalExpense: expenses,
        balance: income - expenses,
        remaining: 5000 - expenses // Assuming monthly budget of 5000
      })

      // Prepare chart data
      const dailyData = {}
      txns.forEach(t => {
        const day = format(new Date(t.date), 'dd', { locale: pt })
        if (!dailyData[day]) {
          dailyData[day] = { day, income: 0, expense: 0 }
        }
        if (t.type === 'income') {
          dailyData[day].income += t.value
        } else {
          dailyData[day].expense += t.value
        }
      })
      setChartData(Object.values(dailyData).sort((a, b) => parseInt(a.day) - parseInt(b.day)))

      // Prepare category data
      const catTotals = {}
      txns.filter(t => t.type === 'expense').forEach(t => {
        if (!catTotals[t.category]) {
          catTotals[t.category] = 0
        }
        catTotals[t.category] += t.value
      })
      setCategoryData(
        Object.entries(catTotals).map(([name, value]) => ({ name, value }))
      )
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {format(new Date(), 'MMMM de yyyy', { locale: pt })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Income */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Recebido
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ArrowUpLeft className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </Card>

        {/* Total Expense */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Gasto
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ArrowDownRight className="text-red-600 dark:text-red-400" size={24} />
            </div>
          </div>
        </Card>

        {/* Balance */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Saldo
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                stats.balance >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(stats.balance)}
              </p>
            </div>
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <TrendingUp className="text-teal-600 dark:text-teal-400" size={24} />
            </div>
          </div>
        </Card>

        {/* Remaining Budget */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Restante
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                stats.remaining >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(stats.remaining)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Target className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Fluxo Diário
          </h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#16a34a"
                  name="Receitas"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#dc2626"
                  name="Despesas"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Nenhuma transação este mês
            </div>
          )}
        </Card>

        {/* Category Breakdown */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Por Categoria
          </h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Nenhuma despesa este mês
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  )
}
