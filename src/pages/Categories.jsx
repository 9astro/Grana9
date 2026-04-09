import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import Card from '../components/common/Card'
import PageLayout from '../components/common/PageLayout'
import db from '../services/db'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#0f766e',
    icon: 'Tag'
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const cats = await db.categories.toArray()
    setCategories(cats)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) return

    try {
      if (editingId) {
        await db.categories.update(editingId, formData)
      } else {
        await db.categories.add(formData)
      }
      setFormData({ name: '', type: 'expense', color: '#0f766e', icon: 'Tag' })
      setShowForm(false)
      setEditingId(null)
      loadCategories()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza? Isso pode afetar lançamentos existentes.')) {
      await db.categories.delete(id)
      loadCategories()
    }
  }

  const handleEdit = (cat) => {
    setEditingId(cat.id)
    setFormData(cat)
    setShowForm(true)
  }

  const expenseCategories = categories.filter(c => c.type === 'expense')
  const incomeCategories = categories.filter(c => c.type === 'income')

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Categorias</h1>
      </div>

      {showForm && (
        <Card className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">{editingId ? 'Editar' : 'Nova'} Categoria</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nome da categoria"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
              required
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg">Salvar</button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-6 bg-gray-300 dark:bg-slate-700 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-8">
        {/* Despesas */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Despesas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map(cat => (
              <Card key={cat.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: cat.color }}
                  >
                    📁
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                  >
                    <Edit2 size={18} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Receitas */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Receitas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeCategories.map(cat => (
              <Card key={cat.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: cat.color }}
                  >
                    📁
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                  >
                    <Edit2 size={18} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
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
