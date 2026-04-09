import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import Card from '../components/common/Card'
import PageLayout from '../components/common/PageLayout'
import db from '../services/db'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    categoryId: 1,
    limit: '',
    period: 'monthly'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const cats = await db.categories.toArray()
    const allGoals = await db.goals.toArray()
    setCategories(cats)
    setGoals(allGoals)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.limit) return

    try {
      const cat = categories.find(c => c.id === parseInt(formData.categoryId))
      const goalData = {
        categoryId: parseInt(formData.categoryId),
        category: cat?.name || 'Outros',
        limit: parseFloat(formData.limit),
        spent: 0,
        period: formData.period
      }

      if (editingId) {
        await db.goals.update(editingId, goalData)
      } else {
        await db.goals.add(goalData)
      }

      setFormData({ categoryId: 1, limit: '', period: 'monthly' })
      setShowForm(false)
      setEditingId(null)
      loadData()
    } catch (error) {
      console.error('Error saving goal:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza?')) {
      await db.goals.delete(id)
      loadData()
    }
  }

  const handleEdit = (goal) => {
    setEditingId(goal.id)
    setFormData({
      categoryId: goal.categoryId,
      limit: goal.limit.toString(),
      period: goal.period
    })
    setShowForm(true)
  }

  const getSpentAmount = async (categoryId) => {
    const now = new Date()
    const txns = await db.transactions
      .where('categoryId')
      .equals(categoryId)
      .filter(t => {
        const tDate = new Date(t.date)
        return t.type === 'expense' &&
          tDate >= startOfMonth(now) &&
          tDate <= endOfMonth(now)
      })
      .toArray()
    return txns.reduce((sum, t) => sum + t.value, 0)
  }

  const getProgressPercent = (spent, limit) => Math.min((spent / limit) * 100, 100)

  const getProgressColor = (percent) => {
    if (percent < 50) return 'bg-green-500'
    if (percent < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Metas e Limites</h1>
        <p className="text-gray-600 dark:text-gray-400">Controle seus gastos por categoria</p>
      </div>

      {showForm && (
        <Card className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">{editingId ? 'Editar' : 'Nova'} Meta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
            >
              {categories.filter(c => c.type === 'expense').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Limite (R$)"
              step="0.01"
              value={formData.limit}
              onChange={(e) => setFormData({...formData, limit: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
              required
            />
            <select
              value={formData.period}
              onChange={(e) => setFormData({...formData, period: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
            >
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg">Salvar</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-6 bg-gray-300 dark:bg-slate-700 py-2 rounded-lg">Cancelar</button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {goals.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">Nenhuma meta definida</p>
          </Card>
        ) : (
          goals.map(goal => {
            const [spent, setSpent] = useState(0)
            
            useEffect(() => {
              getSpentAmount(goal.categoryId).then(setSpent)
            }, [goal.categoryId])

            const percent = getProgressPercent(spent, goal.limit)
            return (
              <Card key={goal.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{goal.category}</h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{percent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition ${getProgressColor(percent)}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    R$ {spent.toFixed(2)} de R$ {goal.limit.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                  >
                    <Edit2 size={18} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-40 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl"
        >
          <Plus size={28} />
        </button>
      )}
    </PageLayout>
  )
}
