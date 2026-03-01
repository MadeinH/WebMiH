type BadgeVariant = 'lilac' | 'mint' | 'rose'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  lilac: 'bg-heaven-lilac/20 text-heaven-lilac border-heaven-lilac/40',
  mint:  'bg-heaven-mint/20 text-heaven-mint border-heaven-mint/40',
  rose:  'bg-heaven-rose/20 text-heaven-rose border-heaven-rose/40',
}

/** Badge / etiqueta decorativa con variantes de color */
export default function Badge({ children, variant = 'lilac', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-sm font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
