export default function StatusBadge({ variant, className, children }) {
  const badgeClass = variant
    ? `badge badge-${variant}`
    : `badge ${className || 'badge-neutral'}`

  return <span className={badgeClass}>{children}</span>
}
