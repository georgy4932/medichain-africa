 const VARIANTS = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
}

export default function StatusBadge({
  variant = 'neutral',
  children,
  className = '',
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.neutral

  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  )
}
