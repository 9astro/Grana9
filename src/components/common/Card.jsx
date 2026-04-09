import { clsx } from 'clsx'

export default function Card({ children, className, hover = true, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 transition',
        hover && 'hover:shadow-lg hover:border-gray-300 dark:hover:border-slate-600',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
