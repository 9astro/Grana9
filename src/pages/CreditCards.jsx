import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CreditCard as CreditCardIcon } from 'lucide-react'
import Card from '../components/common/Card'
import PageLayout from '../components/common/PageLayout'
import db from '../services/db'

export default function CreditCards() {
  const [cards, setCards] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    lastDigits: '',
    closingDay: '10',
    dueDay: '20',
    limit: '',
    isActive: true,
    color: '#ef4444'
  })

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    const crds = await db.creditCards.toArray()
    setCards(crds)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.limit) return

    try {
      const cardData = {
        name: formData.name,
        lastDigits: formData.lastDigits,
        closingDay: parseInt(formData.closingDay),
        dueDay: parseInt(formData.dueDay),
        limit: parseFloat(formData.limit),
        spent: 0,
        isActive: formData.isActive,
        color: formData.color,
        uuid: editingId ? undefined : Date.now().toString()
      }

      if (editingId) {
        await db.creditCards.update(editingId, cardData)
      } else {
        await db.creditCards.add(cardData)
      }

      setFormData({
        name: '',
        lastDigits: '',
        closingDay: '10',
        dueDay: '20',
        limit: '',
        isActive: true,
        color: '#ef4444'
      })
      setShowForm(false)
      setEditingId(null)
      loadCards()
    } catch (error) {
      console.error('Error saving card:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza?')) {
      await db.creditCards.delete(id)
      loadCards()
    }
  }

  const handleEdit = (card) => {
    setEditingId(card.id)
    setFormData(card)
    setShowForm(true)
  }

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const getUtilizationPercent = (spent, limit) => Math.min((spent / limit) * 100, 100)

  const getUtilizationColor = (percent) => {
    if (percent < 50) return 'bg-green-500'
    if (percent < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Cartões de Crédito</h1>
        <p className="text-gray-600 dark:text-gray-400">Controle suas faturas e limites</p>
      </div>

      {showForm && (
        <Card className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">{editingId ? 'Editar' : 'Novo'} Cartão</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nome do cartão"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
              required
            />
            <input
              type="text"
              placeholder="Últimos 4 dígitos"
              value={formData.lastDigits}
              onChange={(e) => setFormData({...formData, lastDigits: e.target.value})}
              maxLength="4"
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Dia fechamento"
                min="1"
                max="31"
                value={formData.closingDay}
                onChange={(e) => setFormData({...formData, closingDay: e.target.value})}
                className="px-4 py-2 rounded-lg border dark:bg-slate-800"
              />
              <input
                type="number"
                placeholder="Dia vencimento"
                min="1"
                max="31"
                value={formData.dueDay}
                onChange={(e) => setFormData({...formData, dueDay: e.target.value})}
                className="px-4 py-2 rounded-lg border dark:bg-slate-800"
              />
            </div>
            <input
              type="number"
              placeholder="Limite"
              step="0.01"
              value={formData.limit}
              onChange={(e) => setFormData({...formData, limit: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
              required
            />
            <div className="flex items-center gap-4">
              <label>Cor:</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="w-16 h-10 rounded-lg border"
              />
            </div>
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

      <div className="space-y-6 mb-20">
        {cards.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">Nenhum cartão cadastrado</p>
          </Card>
        ) : (
          cards.map(card => {
            const utilization = getUtilizationPercent(card.spent || 0, card.limit)
            return (
              <div key={card.id} className="space-y-4">
                <div
                  className="rounded-xl p-6 text-white shadow-lg"
                  style={{ backgroundColor: card.color }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-sm opacity-80">Cartão de Crédito</p>
                      <p className="text-2xl font-bold">{card.name}</p>
                    </div>
                    <CreditCardIcon size={32} className="opacity-50" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-80">Últimos dígitos</p>
                      <p className="text-lg font-bold">•••• {card.lastDigits}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-80">Fechamento</p>
                      <p className="text-lg font-bold">Dia {card.closingDay}</p>
                    </div>
                  </div>
                </div>

                <Card>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Limite</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(card.limit)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Gasto</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(card.spent || 0)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Utilização</span>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{utilization.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition ${getUtilizationColor(utilization)}`}
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-slate-700 flex gap-2">
                      <button
                        onClick={() => handleEdit(card)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-blue-600"
                      >
                        <Edit2 size={18} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600"
                      >
                        <Trash2 size={18} />
                        Deletar
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
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
