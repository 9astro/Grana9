import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { format } from 'date-fns'
import Card from '../components/common/Card'
import PageLayout from '../components/common/PageLayout'
import FloatingButton from '../components/common/FloatingButton'
import db from '../services/db'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    type: 'expense',
    categoryId: 1,
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'debit',
    isRecurring: false
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const txns = await db.transactions.toArray()
    const cats = await db.categories.toArray()
    setTransactions(txns.sort((a, b) => new Date(b.date) - new Date(a.date)))
    setCategories(cats)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.description || !formData.value) return

    try {
      const cat = categories.find(c => c.id === parseInt(formData.categoryId))
      const txn = {
        ...formData,
        value: parseFloat(formData.value),
        categoryId: parseInt(formData.categoryId),
        category: cat?.name || 'Outros',
        date: new Date(formData.date),
        uuid: editingId ? undefined : Date.now().toString()
      }

      if (editingId) {
        await db.transactions.update(editingId, txn)
      } else {
        await db.transactions.add(txn)
      }

      setFormData({
        description: '',
        value: '',
        type: 'expense',
        categoryId: 1,
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'debit',
        isRecurring: false
      })
      setShowForm(false)
      setEditingId(null)
      loadData()
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza?')) {
      await db.transactions.delete(id)
      loadData()
    }
  }

  const filtered = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || t.type === filterType
    return matchSearch && matchType
  })

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Lançamentos</h1>
        {!showForm && (
          <div className="flex gap-2 flex-col sm:flex-row">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            >
              <option value="all">Todos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>
        )}
      </div>

      {showForm ? (
        <Card className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">{editingId ? 'Editar' : 'Novo'} Lançamento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="col-span-2 px-4 py-2 rounded-lg border dark:bg-slate-800"
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
              <input
                type="text"
                placeholder="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="col-span-2 px-4 py-2 rounded-lg border dark:bg-slate-800"
                required
              />
              <input
                type="number"
                placeholder="Valor"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                className="px-4 py-2 rounded-lg border dark:bg-slate-800"
                required
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="px-4 py-2 rounded-lg border dark:bg-slate-800"
              />
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className="col-span-2 px-4 py-2 rounded-lg border dark:bg-slate-800"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                  className="rounded"
                />
                <span>Recorrente</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-6 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="space-y-4 mb-20">
          {filtered.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-500">Nenhum lançamento encontrado</p>
            </Card>
          ) : (
            filtered.map(t => (
              <Card key={t.id} className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{t.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.category} • {format(new Date(t.date), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.value)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingId(t.id); setFormData({...t, date: format(new Date(t.date), 'yyyy-MM-dd')}); setShowForm(true); }}
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg"
                    >
                      <Edit2 size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <FloatingButton onClick={() => setShowForm(!showForm)} label="Adicionar Lançamento" />
    </PageLayout>
  )
}
