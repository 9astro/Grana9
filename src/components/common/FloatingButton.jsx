import { Plus } from 'lucide-react'

export default function FloatingButton({ onClick, label = 'Adicionar' }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-40 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all hover:scale-110 active:scale-95"
      title={label}
      aria-label={label}
    >
      <Plus size={28} />
    </button>
  )
}
