import { startOfMonth, subMonths, format } from 'date-fns'
import { v4 as uuidv4 } from 'crypto'

export const getMockTransactions = () => {
  const today = new Date()
  const currentMonth = startOfMonth(today)
  const lastMonth = startOfMonth(subMonths(today, 1))

  return [
    // Mês atual
    {
      id: 1,
      uuid: uuidv4(),
      description: 'Mercado - Compras semanais',
      value: 287.50,
      type: 'expense',
      categoryId: 1,
      category: 'Mercado',
      date: new Date(today.getFullYear(), today.getMonth(), 3),
      paymentMethod: 'debit',
      isRecurring: false,
      isInstallment: false,
      installments: 1,
      creditCardId: null
    },
    {
      id: 2,
      uuid: uuidv4(),
      description: 'Salário mensal',
      value: 4500.00,
      type: 'income',
      categoryId: 11,
      category: 'Salário',
      date: new Date(today.getFullYear(), today.getMonth(), 1),
      paymentMethod: 'transfer',
      isRecurring: true,
      isInstallment: false,
      installments: 1,
      creditCardId: null
    },
    {
      id: 3,
      uuid: uuidv4(),
      description: 'Aluguel - Apartamento',
      value: 1200.00,
      type: 'expense',
      categoryId: 2,
      category: 'Aluguel',
      date: new Date(today.getFullYear(), today.getMonth(), 5),
      paymentMethod: 'transfer',
      isRecurring: true,
      isInstallment: false,
      installments: 1,
      creditCardId: null
    },
    {
      id: 4,
      uuid: uuidv4(),
      description: 'Internet - Fibra',
      value: 99.90,
      type: 'expense',
      categoryId: 5,
      category: 'Internet',
      date: new Date(today.getFullYear(), today.getMonth(), 8),
      paymentMethod: 'credit',
      isRecurring: true,
      isInstallment: false,
      installments: 1,
      creditCardId: 1
    },
    {
      id: 5,
      uuid: uuidv4(),
      description: 'Uber - Deslocamento trabalho',
      value: 45.80,
      type: 'expense',
      categoryId: 6,
      category: 'Transporte',
      date: new Date(today.getFullYear(), today.getMonth(), 10),
      paymentMethod: 'debit',
      isRecurring: false,
      isInstallment: false,
      installments: 1,
      creditCardId: null
    },
    {
      id: 6,
      uuid: uuidv4(),
      description: 'Cinema - Sessão 2D',
      value: 34.00,
      type: 'expense',
      categoryId: 7,
      category: 'Lazer',
      date: new Date(today.getFullYear(), today.getMonth(), 12),
      paymentMethod: 'credit',
      isRecurring: false,
      isInstallment: false,
      installments: 1,
      creditCardId: 1
    },
    {
      id: 7,
      uuid: uuidv4(),
      description: 'Farmácia - Medicamentos',
      value: 123.45,
      type: 'expense',
      categoryId: 8,
      category: 'Saúde',
      date: new Date(today.getFullYear(), today.getMonth(), 15),
      paymentMethod: 'debit',
      isRecurring: false,
      isInstallment: false,
      installments: 1,
      creditCardId: null
    },
    {
      id: 8,
      uuid: uuidv4(),
      description: 'Energia elétrica',
      value: 215.00,
      type: 'expense',
      categoryId: 4,
      category: 'Luz',
      date: new Date(today.getFullYear(), today.getMonth(), 18),
      paymentMethod: 'transfer',
      isRecurring: true,
      isInstallment: false,
      installments: 1,
      creditCardId: null
    },
    {
      id: 9,
      uuid: uuidv4(),
      description: 'Mercado - Compras extras',
      value: 156.70,
      type: 'expense',
      categoryId: 1,
      category: 'Mercado',
      date: new Date(today.getFullYear(), today.getMonth(), 20),
      paymentMethod: 'credit',
      isRecurring: false,
      isInstallment: false,
      installments: 1,
      creditCardId: 1
    },
    {
      id: 10,
      uuid: uuidv4(),
      description: 'Freelance - Projeto Web',
      value: 800.00,
      type: 'income',
      categoryId: 12,
      category: 'Freelance',
      date: new Date(today.getFullYear(), today.getMonth(), 22),
      paymentMethod: 'transfer',
      isRecurring: false,
      isInstallment: false,
      installments: 1,
      creditCardId: null
    },
    {
      id: 11,
      uuid: uuidv4(),
      description: 'Água - Fatura mensal',
      value: 87.50,
      type: 'expense',
      categoryId: 3,
      category: 'Água',
      date: new Date(today.getFullYear(), today.getMonth(), 25),
      paymentMethod: 'transfer',
      isRecurring: true,
      isInstallment: false,
      installments: 1,
      creditCardId: null
    },
    {
      id: 12,
      uuid: uuidv4(),
      description: 'Streaming - Netflix + Spotify',
      value: 45.00,
      type: 'expense',
      categoryId: 10,
      category: 'Outros',
      date: new Date(today.getFullYear(), today.getMonth(), 27),
      paymentMethod: 'credit',
      isRecurring: true,
      isInstallment: false,
      installments: 1,
      creditCardId: 1
    },

    // Mês anterior (para comparação)
    {
      id: 13,
      uuid: uuidv4(),
      description: 'Salário mensal',
      value: 4500.00,
      type: 'income',
      categoryId: 11,
      category: 'Salário',
      date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
      paymentMethod: 'transfer',
      isRecurring: true,
      isInstallment: false,
      installments: 1,
      creditCardId: null
    },
    {
      id: 14,
      uuid: uuidv4(),
      description: 'Aluguel - Apartamento',
      value: 1200.00,
      type: 'expense',
      categoryId: 2,
      category: 'Aluguel',
      date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 5),
      paymentMethod: 'transfer',
      isRecurring: true,
      isInstallment: false,
      installments: 1,
      creditCardId: null
    },
    {
      id: 15,
      uuid: uuidv4(),
      description: 'Mercado - Compras semanais',
      value: 312.00,
      type: 'expense',
      categoryId: 1,
      category: 'Mercado',
      date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 8),
      paymentMethod: 'debit',
      isRecurring: false,
      isInstallment: false,
      installments: 1,
      creditCardId: null
    },
    {
      id: 16,
      uuid: uuidv4(),
      description: 'Energia elétrica',
      value: 198.50,
      type: 'expense',
      categoryId: 4,
      category: 'Luz',
      date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 15),
      paymentMethod: 'transfer',
      isRecurring: true,
      isInstallment: false,
      installments: 1,
      creditCardId: null
    }
  ]
}

export const getMockGoals = () => [
  {
    id: 1,
    categoryId: 1,
    category: 'Mercado',
    limit: 800,
    spent: 444.20,
    period: 'monthly'
  },
  {
    id: 2,
    categoryId: 6,
    category: 'Transporte',
    limit: 300,
    spent: 45.80,
    period: 'monthly'
  },
  {
    id: 3,
    categoryId: 7,
    category: 'Lazer',
    limit: 400,
    spent: 34.00,
    period: 'monthly'
  }
]

export const getMockFixedAccounts = () => [
  {
    id: 1,
    uuid: uuidv4(),
    name: 'Aluguel',
    value: 1200.00,
    dueDay: 5,
    categoryId: 2,
    isActive: true,
    description: 'Aluguel do apartamento',
    paymentMethod: 'transfer'
  },
  {
    id: 2,
    uuid: uuidv4(),
    name: 'Internet',
    value: 99.90,
    dueDay: 8,
    categoryId: 5,
    isActive: true,
    description: 'Internet Fibra',
    paymentMethod: 'credit'
  },
  {
    id: 3,
    uuid: uuidv4(),
    name: 'Energia',
    value: 215.00,
    dueDay: 18,
    categoryId: 4,
    isActive: true,
    description: 'Conta de energia elétrica',
    paymentMethod: 'transfer'
  },
  {
    id: 4,
    uuid: uuidv4(),
    name: 'Água',
    value: 87.50,
    dueDay: 25,
    categoryId: 3,
    isActive: true,
    description: 'Conta de água',
    paymentMethod: 'transfer'
  }
]

export const getMockCreditCards = () => [
  {
    id: 1,
    uuid: uuidv4(),
    name: 'Nubank',
    lastDigits: '1234',
    closingDay: 10,
    dueDay: 20,
    limit: 5000,
    spent: 252.35,
    isActive: true,
    color: '#8B0000'
  }
]
