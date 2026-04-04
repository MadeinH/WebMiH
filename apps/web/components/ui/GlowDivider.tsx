/** Divider decorativo con glow gradiente */
export default function GlowDivider() {
  return (
    <div aria-hidden="true" className="flex items-center py-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-heaven-divider/70 to-transparent" />
      <div className="mx-3 h-2 w-2 rounded-full bg-heaven-lilac shadow-heaven-cta" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-heaven-divider/70 to-transparent" />
    </div>
  )
}
