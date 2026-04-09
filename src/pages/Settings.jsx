import { useState, useEffect } from 'react'
import { Download, Upload, RotateCcw, AlertCircle } from 'lucide-react'
import Card from '../components/common/Card'
import PageLayout from '../components/common/PageLayout'
import { getMockTransactions } from '../services/mockData'

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    currency: 'BRL',
    monthlyBudget: 5000
  })
  const [showDangerZone, setShowDangerZone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('grana9_settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings({
        theme: parsed.theme || 'light',
        currency: parsed.currency || 'BRL',
        monthlyBudget: parsed.monthlyBudget || 5000
      })
    }
    setLoading(false)
  }

  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    localStorage.setItem('grana9_settings', JSON.stringify(updated))
    
    // Apply theme change immediately
    if (key === 'theme') {
      if (value === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const exportBackup = () => {
    try {
      const transactions = JSON.parse(localStorage.getItem('grana9_transactions') || '[]')
      const categories = JSON.parse(localStorage.getItem('grana9_categories') || '[]')
      const goals = JSON.parse(localStorage.getItem('grana9_goals') || '[]')
      const fixedAccounts = JSON.parse(localStorage.getItem('grana9_fixedAccounts') || '[]')
      const creditCards = JSON.parse(localStorage.getItem('grana9_creditCards') || '[]')
      const settingsData = JSON.parse(localStorage.getItem('grana9_settings') || '{}')

      const backup = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          transactions,
          categories,
          goals,
          fixedAccounts,
          creditCards,
          settings: settingsData
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

      alert('✅ Backup exportado com sucesso!')
    } catch (error) {
      console.error('Error exporting backup:', error)
      alert('❌ Erro ao exportar backup')
    }
  }

  const importBackup = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const backup = JSON.parse(event.target?.result)

        if (backup.version !== '1.0') {
          alert('❌ Versão do backup não suportada')
          return
        }

        // Import all data
        if (backup.data.transactions) {
          localStorage.setItem('grana9_transactions', JSON.stringify(backup.data.transactions))
        }
        if (backup.data.categories) {
          localStorage.setItem('grana9_categories', JSON.stringify(backup.data.categories))
        }
        if (backup.data.goals) {
          localStorage.setItem('grana9_goals', JSON.stringify(backup.data.goals))
        }
        if (backup.data.fixedAccounts) {
          localStorage.setItem('grana9_fixedAccounts', JSON.stringify(backup.data.fixedAccounts))
        }
        if (backup.data.creditCards) {
          localStorage.setItem('grana9_creditCards', JSON.stringify(backup.data.creditCards))
        }
        if (backup.data.settings) {
          localStorage.setItem('grana9_settings', JSON.stringify(backup.data.settings))
          loadSettings()
        }

        alert('✅ Backup importado com sucesso! Recarregando...')
        window.location.reload()
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('Error importing backup:', error)
      alert('❌ Erro ao importar backup. Verifique o arquivo.')
    }
  }

  const resetData = () => {
    if (!confirm('⚠️ ATENÇÃO: Isto apagará TODOS os seus dados! Tem certeza?')) {
      return
    }
    if (!confirm('🚨 Tem CERTEZA MESMO? Esta ação não pode ser desfeita!')) {
      return
    }

    try {
      localStorage.removeItem('grana9_transactions')
      localStorage.removeItem('grana9_categories')
      localStorage.removeItem('grana9_goals')
      localStorage.removeItem('grana9_fixedAccounts')
      localStorage.removeItem('grana9_creditCards')
      
      alert('✅ Dados resetados com sucesso!')
      window.location.reload()
    } catch (error) {
      console.error('Error resetting data:', error)
      alert('❌ Erro ao resetar dados')
    }
  }

  const loadMockData = () => {
    if (!confirm('📊 Isto carregará dados de exemplo. Continuar?')) {
      return
    }

    try {
      const mockTxns = getMockTransactions()
      const existingTransactions = JSON.parse(localStorage.getItem('grana9_transactions') || '[]')
      const allTransactions = [...existingTransactions, ...mockTxns]
      
      localStorage.setItem('grana9_transactions', JSON.stringify(allTransactions))
      alert('✅ Dados de exemplo carregados!')
      window.location.reload()
    } catch (error) {
      console.error('Error loading mock data:', error)
      alert('❌ Erro ao carregar dados')
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400">Personalize seu app Grana9</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Display Settings */}
        <Card>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Exibição</h2>
          <div className="space-y-4">
            {/* Tema */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tema
              </label>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>

            {/* Moeda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moeda
              </label>
              <select
                value={settings.currency}
                onChange={(e) => updateSetting('currency', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="BRL">Real Brasileiro (R$)</option>
                <option value="USD">Dólar Americano ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>

            {/* Orçamento Mensal - FUNCIONAL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Orçamento Mensal
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg font-bold text-gray-700 dark:text-gray-300 text-lg">
                  R$
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={settings.monthlyBudget}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    if (!isNaN(val)) {
                      updateSetting('monthlyBudget', val)
                    }
                  }}
                  placeholder="5000"
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 Seu orçamento: R$ {settings.monthlyBudget.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>

        {/* Backup & Restauração */}
        <Card>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Backup & Restauração</h2>
          <div className="space-y-3">
            <button
              onClick={exportBackup}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
            >
              <Download size={20} />
              📥 Exportar Backup (JSON)
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
                📤 Importar Backup
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

        {/* Zona de Perigo */}
        <Card className="border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
          <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle size={24} />
            Zona de Perigo
          </h2>

          {!showDangerZone ? (
            <button
              onClick={() => setShowDangerZone(true)}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              ⚠️ Mostrar Opções Perigosas
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-800 dark:text-red-300 mb-4 font-medium">
                🚨 Estas ações não podem ser desfeitas. Tenha cuidado!
              </p>
              <button
                onClick={resetData}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                <RotateCcw size={20} />
                🗑️ Resetar Todos os Dados
              </button>
              <button
                onClick={() => setShowDangerZone(false)}
                className="w-full px-4 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition"
              >
                ❌ Cancelar
              </button>
            </div>
          )}
        </Card>

        {/* Sobre o App */}
        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Sobre o App</h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            <p><strong>🤑 Grana9</strong> - Controle de Gastos Pessoal</p>
            <p>Versão: 1.0.0</p>
            <p>🔒 100% Offline - Todos os dados armazenados localmente</p>
            <p>💾 Salvo em: localStorage do navegador</p>
            <p className="pt-2 text-xs border-t border-gray-300 dark:border-gray-600">
              Desenvolvido com ❤️ usando React, Vite e localStorage
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}
