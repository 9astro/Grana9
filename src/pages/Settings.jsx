import { useState, useEffect } from 'react'
import { Download, Upload, RotateCcw, AlertCircle } from 'lucide-react'
import Card from '../components/common/Card'
import PageLayout from '../components/common/PageLayout'
import db, { DEFAULT_CATEGORIES } from '../services/db'
import { getMockTransactions } from '../services/mockData'

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    currency: 'BRL',
    monthlyBudget: 5000
  })
  const [showDangerZone, setShowDangerZone] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const themeDB = await db.settings.get('theme')
    const currencyDB = await db.settings.get('currency')
    const budgetDB = await db.settings.get('monthlyBudget')

    setSettings({
      theme: themeDB?.value || 'light',
      currency: currencyDB?.value || 'BRL',
      monthlyBudget: budgetDB?.value || 5000
    })
  }

  const updateSetting = async (key, value) => {
    await db.settings.put({
      key,
      value,
      timestamp: new Date()
    })
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const exportBackup = async () => {
    try {
      const transactions = await db.transactions.toArray()
      const categories = await db.categories.toArray()
      const goals = await db.goals.toArray()
      const fixedAccounts = await db.fixedAccounts.toArray()
      const creditCards = await db.creditCards.toArray()

      const backup = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          transactions,
          categories,
          goals,
          fixedAccounts,
          creditCards
        }
      }

      const dataStr = JSON.stringify(backup, null, 2)
      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(dataStr))
      element.setAttribute('download', `grana9-backup-${new Date().toISOString().split('T')[0]}.json`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      alert('Backup exportado com sucesso!')
    } catch (error) {
      console.error('Error exporting backup:', error)
      alert('Erro ao exportar backup')
    }
  }

  const importBackup = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const backup = JSON.parse(text)

      if (backup.version !== '1.0') {
        alert('Versão do backup não suportada')
        return
      }

      // Clear existing data
      await db.transactions.clear()
      await db.categories.clear()
      await db.goals.clear()
      await db.fixedAccounts.clear()
      await db.creditCards.clear()

      // Import new data
      if (backup.data.transactions?.length) {
        await db.transactions.bulkAdd(backup.data.transactions)
      }
      if (backup.data.categories?.length) {
        await db.categories.bulkAdd(backup.data.categories)
      }
      if (backup.data.goals?.length) {
        await db.goals.bulkAdd(backup.data.goals)
      }
      if (backup.data.fixedAccounts?.length) {
        await db.fixedAccounts.bulkAdd(backup.data.fixedAccounts)
      }
      if (backup.data.creditCards?.length) {
        await db.creditCards.bulkAdd(backup.data.creditCards)
      }

      alert('Backup importado com sucesso! Recarregue a página.')
      window.location.reload()
    } catch (error) {
      console.error('Error importing backup:', error)
      alert('Erro ao importar backup. Verifique o arquivo.')
    }
  }

  const resetData = async () => {
    if (!confirm('ATENÇÃO: Isto apagará TODOS os seus dados! Tem certeza?')) {
      return
    }
    if (!confirm('Tem CERTEZA MESMO? Esta ação não pode ser desfeita!')) {
      return
    }

    try {
      await db.transactions.clear()
      await db.categories.clear()
      await db.goals.clear()
      await db.fixedAccounts.clear()
      await db.creditCards.clear()
      
      // Reinitialize with defaults
      await db.categories.bulkAdd(DEFAULT_CATEGORIES)
      
      alert('Dados resetados com sucesso!')
      window.location.reload()
    } catch (error) {
      console.error('Error resetting data:', error)
      alert('Erro ao resetar dados')
    }
  }

  const loadMockData = async () => {
    if (!confirm('Isto carregará dados de exemplo. Continuar?')) {
      return
    }

    try {
      const mockTxns = getMockTransactions()
      await db.transactions.bulkAdd(mockTxns)
      alert('Dados de exemplo carregados!')
      window.location.reload()
    } catch (error) {
      console.error('Error loading mock data:', error)
      alert('Erro ao carregar dados')
    }
  }

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400">Personalize seu app Grana9</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Display Settings */}
        <Card>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Exibição</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tema
              </label>
              <select
                value={settings.theme}
                onChange={(e) => {
                  updateSetting('theme', e.target.value)
                  if (e.target.value === 'dark') {
                    document.documentElement.classList.add('dark')
                  } else {
                    document.documentElement.classList.remove('dark')
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moeda
              </label>
              <select
                value={settings.currency}
                onChange={(e) => updateSetting('currency', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              >
                <option value="BRL">Real Brasileiro (R$)</option>
                <option value="USD">Dólar Americano ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Orçamento Mensal
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                  R$
                </span>
                <input
                  type="number"
                  value={settings.monthlyBudget}
                  onChange={(e) => updateSetting('monthlyBudget', parseFloat(e.target.value))}
                  className="flex-1 px-4 py-2 rounded-lg border dark:bg-slate-800"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Backup & Restore */}
        <Card>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Backup & Restauração</h2>
          <div className="space-y-3">
            <button
              onClick={exportBackup}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
            >
              <Download size={20} />
              Exportar Backup (JSON)
            </button>

            <label className="w-full">
              <input
                type="file"
                accept=".json"
                onChange={importBackup}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition cursor-pointer">
                <Upload size={20} />
                Importar Backup
              </div>
            </label>

            <button
              onClick={loadMockData}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
            >
              📊 Carregar Dados de Exemplo
            </button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
          <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle size={24} />
            Zona de Perigo
          </h2>

          {!showDangerZone ? (
            <button
              onClick={() => setShowDangerZone(true)}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
            >
              Mostrar Opções Perigosas
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-800 dark:text-red-300 mb-4">
                ⚠️ Estas ações não podem ser desfeitas. Tenha cuidado!
              </p>
              <button
                onClick={resetData}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                <RotateCcw size={20} />
                Resetar Todos os Dados
              </button>
              <button
                onClick={() => setShowDangerZone(false)}
                className="w-full px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium"
              >
                Cancelar
              </button>
            </div>
          )}
        </Card>

        {/* App Info */}
        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Sobre o App</h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            <p><strong>Grana9</strong> - Controle de Gastos Pessoal</p>
            <p>Versão: 1.0.0</p>
            <p>100% Offline - Todos os dados armazenados localmente no seu dispositivo</p>
            <p className="pt-2 text-xs">
              Desenvolvido com ❤️ usando React, Vite e IndexedDB
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}
