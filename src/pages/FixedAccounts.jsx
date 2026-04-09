import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { pt } from 'date-fns/locale'
import Card from '../components/common/Card'
import PageLayout from '../components/common/PageLayout'
import db from '../services/db'

export default function FixedAccounts() {
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    dueDay: '1',
    categoryId: 2,
    isActive: true,
    description: '',
    paymentMethod: 'transfer'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const accts = await db.fixedAccounts.toArray()
    const cats = await db.categories.toArray()
    setAccounts(accts)
    setCategories(cats)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.value) return

    try {
      const acctData = {
        name: formData.name,
        value: parseFloat(formData.value),
        dueDay: parseInt(formData.dueDay),
        categoryId: parseInt(formData.categoryId),
        isActive: formData.isActive,
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        uuid: editingId ? undefined : Date.now().toString()
      }

      if (editingId) {
        await db.fixedAccounts.update(editingId, acctData)
      } else {
        await db.fixedAccounts.add(acctData)
      }

      setFormData({
        name: '',
        value: '',
        dueDay: '1',
        categoryId: 2,
        isActive: true,
        description: '',
        paymentMethod: 'transfer'
      })
      setShowForm(false)
      setEditingId(null)
      loadData()
    } catch (error) {
      console.error('Error saving account:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza?')) {
      await db.fixedAccounts.delete(id)
      loadData()
    }
  }

  const handleEdit = (acct) => {
    setEditingId(acct.id)
    setFormData(acct)
    setShowForm(true)
  }

  const getNextDueDate = (dueDay) => {
    const today = new Date()
    const currentDay = today.getDate()
    let nextDate = new Date(today.getFullYear(), today.getMonth(), dueDay)
    if (currentDay >= dueDay) {
      nextDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay)
    }
    return nextDate
  }

  const getDaysUntilDue = (dueDay) => {
    const today = new Date()
    const next = getNextDueDate(dueDay)
    return Math.ceil((next - today) / (1000 * 60 * 60 * 24))
  }

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const upcomingAccounts = accounts.filter(a => a.isActive).sort((a, b) => a.dueDay - b.dueDay)

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Contas Fixas</h1>
        <p className="text-gray-600 dark:text-gray-400">Controle contas recorrentes e alertas de vencimento</p>
      </div>

      {showForm && (
        <Card className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">{editingId ? 'Editar' : 'Nova'} Conta Fixa</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nome da conta"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
              required
            />
            <input
              type="text"
              placeholder="Descrição (opcional)"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
            />
            <div className="grid grid-cols-2 gap-4">
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
                type="number"
                placeholder="Dia do vencimento"
                min="1"
                max="31"
                value={formData.dueDay}
                onChange={(e) => setFormData({...formData, dueDay: e.target.value})}
                className="px-4 py-2 rounded-lg border dark:bg-slate-800"
              />
            </div>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
            >
              {categories.filter(c => c.type === 'expense').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
            >
              <option value="transfer">Transferência</option>
              <option value="credit">Cartão Crédito</option>
              <option value="debit">Débito</option>
              <option value="cash">Dinheiro</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded"
              />
              <span>Ativa</span>
            </label>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg">Salvar</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-6 bg-gray-300 dark:bg-slate-700 py-2 rounded-lg">Cancelar</button>
            </div>
          </form>
        </Card>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Próximos Vencimentos</h2>
        <div className="space-y-3">
          {upcomingAccounts.length === 0 ? (
            <Card className="text-center py-8 text-gray-500">Nenhuma conta ativa</Card>
          ) : (
            upcomingAccounts.map(acct => {
              const daysLeft = getDaysUntilDue(acct.dueDay)
              const isUrgent = daysLeft <= 3
              return (
                <Card key={acct.id} className={`flex items-center justify-between ${isUrgent ? 'border-2 border-orange-500' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">{acct.name}</h3>
                      {isUrgent && <AlertCircle size={18} className="text-orange-500" />}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{acct.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Vence em {daysLeft} dia{daysLeft !== 1 ? 's' : ''} • Dia {acct.dueDay}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(acct.value)}</p>
                      <p className={`text-xs ${isUrgent ? 'text-orange-600' : 'text-gray-500'}`}>
                        {daysLeft} dias
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(acct)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded">
                        <Edit2 size={18} className="text-blue-600" />
                      </button>
                      <button onClick={() => handleDelete(acct.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
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
