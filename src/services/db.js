import Dexie from 'dexie'

const db = new Dexie('Grana9DB')

db.version(1).stores({
  transactions: '++id, date, categoryId, type, &uuid',
  categories: '++id, &name, type',
  goals: '++id, categoryId',
  fixedAccounts: '++id, dueDay, &uuid',
  creditCards: '++id, &uuid',
  installments: '++id, transactionId, creditCardId',
  settings: '++id, &key'
})

// Default categories
export const DEFAULT_CATEGORIES = [
  { name: 'Mercado', type: 'expense', color: '#8b5cf6', icon: 'ShoppingCart' },
  { name: 'Aluguel', type: 'expense', color: '#ef4444', icon: 'Home' },
  { name: 'Água', type: 'expense', color: '#3b82f6', icon: 'Droplets' },
  { name: 'Luz', type: 'expense', color: '#eab308', icon: 'Lightbulb' },
  { name: 'Internet', type: 'expense', color: '#06b6d4', icon: 'Wifi' },
  { name: 'Transporte', type: 'expense', color: '#f97316', icon: 'Bus' },
  { name: 'Lazer', type: 'expense', color: '#ec4899', icon: 'Music' },
  { name: 'Saúde', type: 'expense', color: '#10b981', icon: 'Heart' },
  { name: 'Cartão', type: 'expense', color: '#6366f1', icon: 'CreditCard' },
  { name: 'Outros', type: 'expense', color: '#64748b', icon: 'MoreHorizontal' },
  { name: 'Salário', type: 'income', color: '#16a34a', icon: 'DollarSign' },
  { name: 'Freelance', type: 'income', color: '#059669', icon: 'Briefcase' },
  { name: 'Bonificação', type: 'income', color: '#0891b2', icon: 'TrendingUp' }
]

// Initialize DB with defaults
export const initializeDB = async () => {
  const count = await db.categories.count()
  if (count === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES)
  }

  // Initialize settings
  const hasSettings = await db.settings.get('initialized')
  if (!hasSettings) {
    await db.settings.put({
      key: 'initialized',
      value: true,
      timestamp: new Date()
    })
    await db.settings.put({
      key: 'theme',
      value: 'light',
      timestamp: new Date()
    })
    await db.settings.put({
      key: 'currency',
      value: 'BRL',
      timestamp: new Date()
    })
    await db.settings.put({
      key: 'monthlyBudget',
      value: 5000,
      timestamp: new Date()
    })
  }
}

export default db
