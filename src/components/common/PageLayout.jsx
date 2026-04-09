export default function PageLayout({ children, className = '' }) {
  return (
    <main className={`md:ml-64 pt-4 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${className}`}>
      {children}
    </main>
  )
}
