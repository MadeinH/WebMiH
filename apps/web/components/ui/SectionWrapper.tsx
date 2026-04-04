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
  const sectionClass =
    variant === 'dark'
      ? 'bg-heaven-bg-dark text-heaven-text'
      : 'bg-heaven-bg-light text-heaven-bg-dark'

  return (
    <section
      id={id}
      className={`relative isolate overflow-hidden py-20 md:py-28 ${sectionClass} ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-heaven-bg-dark/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-heaven-lilac/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-heaven-mint/10 blur-3xl"
      />
      <div className="mx-auto max-w-6xl px-6">
        {children}
      </div>
    </section>
  )
}
