interface SectionWrapperProps {
  children: React.ReactNode
  id?: string
  variant?: 'dark' | 'light'
  className?: string
}

/** Wrapper de sección con variantes de fondo y padding consistente */
export default function SectionWrapper({
  children,
  id,
  variant = 'dark',
  className = '',
}: SectionWrapperProps) {
  const bgClass = variant === 'dark' ? 'bg-heaven-bg-dark' : 'bg-heaven-bg-light'

  return (
    <section
      id={id}
      className={`${bgClass} py-24 ${className}`}
    >
      <div className="mx-auto max-w-6xl px-6">
        {children}
      </div>
    </section>
  )
}
