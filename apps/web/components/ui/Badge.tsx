type BadgeVariant = 'lilac' | 'mint' | 'rose'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  lilac: 'border-heaven-lilac/35 bg-heaven-lilac/12 text-heaven-lilac',
  mint:  'border-heaven-mint/35 bg-heaven-mint/12 text-heaven-mint',
  rose:  'border-heaven-rose/35 bg-heaven-rose/12 text-heaven-rose',
}

/** Badge / etiqueta decorativa con variantes de color */
export default function Badge({ children, variant = 'lilac', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex cursor-default items-center rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
