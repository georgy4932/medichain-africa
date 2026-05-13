import { format, differenceInDays, parseISO, isValid } from 'date-fns'

function safeParseISO(dateStr) {
  if (!dateStr) return null
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? d : null
  } catch { return null }
}

export function fmtDate(dateStr) {
  const d = safeParseISO(dateStr)
  if (!d) return '—'
  return format(d, 'dd MMM yyyy')
}

export function fmtDateShort(dateStr) {
  const d = safeParseISO(dateStr)
  if (!d) return '—'
  return format(d, 'dd MMM')
}

export function fmtDateTime(dateStr) {
  const d = safeParseISO(dateStr)
  if (!d) return '—'
  return format(d, 'dd MMM yyyy · HH:mm')
}

export function fmtRelative(dateStr) {
  const d = safeParseISO(dateStr)
  if (!d) return '—'
  const days = differenceInDays(new Date(), d)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.round(days / 7)}w ago`
  return fmtDate(dateStr)
}

export function daysUntilExpiry(dateStr) {
  const d = safeParseISO(dateStr)
  if (!d) return null
  return differenceInDays(d, new Date())
}

export function fmtCurrency(amount, currency = 'NGN') {
  if (amount == null || amount === '') return '—'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function fmtNumber(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat().format(n)
}

export function expiryBadgeClass(dateStr) {
  const days = daysUntilExpiry(dateStr)
  if (days == null) return 'badge-neutral'
  if (days < 0)    return 'badge-danger'
  if (days <= 30)  return 'badge-danger'
  if (days <= 90)  return 'badge-warning'
  return 'badge-success'
}

export function expiryTextClass(dateStr) {
  const days = daysUntilExpiry(dateStr)
  if (days == null) return ''
  if (days < 0)    return 'text-danger'
  if (days <= 30)  return 'text-danger'
  if (days <= 90)  return 'text-warning'
  return 'text-success'
}

export function fmtExpiryLabel(dateStr) {
  const days = daysUntilExpiry(dateStr)
  if (days == null)  return '—'
  if (days < 0)      return `Expired ${Math.abs(days)}d ago`
  if (days === 0)    return 'Expires today'
  if (days === 1)    return 'Expires tomorrow'
  if (days <= 90)    return `${days}d left`
  return fmtDate(dateStr)
}

export function transferStatusClass(status) {
  const map = {
    pending:    'badge-warning',
    approved:   'badge-primary',
    rejected:   'badge-danger',
    in_transit: 'badge-info',
    fulfilled:  'badge-success',
    cancelled:  'badge-neutral',
  }
  return map[status] ?? 'badge-neutral'
}

export function transferStatusLabel(status) {
  const map = {
    pending:    'Pending',
    approved:   'Approved',
    rejected:   'Rejected',
    in_transit: 'In Transit',
    fulfilled:  'Fulfilled',
    cancelled:  'Cancelled',
  }
  return map[status] ?? status
}

export function alertTypeLabel(type) {
  const map = {
    low_stock:    'Low Stock',
    out_of_stock: 'Out of Stock',
    near_expiry:  'Near Expiry',
    overstock:    'Overstock',
  }
  return map[type] ?? type
}

export function alertTypeClass(type) {
  const map = {
    low_stock:    'badge-warning',
    out_of_stock: 'badge-danger',
    near_expiry:  'badge-warning',
    overstock:    'badge-info',
  }
  return map[type] ?? 'badge-neutral'
}

export function alertDotClass(type) {
  const map = {
    low_stock:    'warning',
    out_of_stock: 'danger',
    near_expiry:  'warning',
    overstock:    'muted',
  }
  return map[type] ?? 'muted'
}

export function urgencyClass(urgency) {
  if (urgency === 'critical') return 'badge-danger'
  if (urgency === 'urgent')   return 'badge-warning'
  return 'badge-neutral'
}

export function stockStatusClass(available, reorderLevel) {
  if (available <= 0)           return 'badge-danger'
  if (available < reorderLevel) return 'badge-warning'
  return 'badge-success'
}

export function stockStatusLabel(available, reorderLevel) {
  if (available <= 0)           return 'Out of stock'
  if (available < reorderLevel) return 'Low stock'
  return 'In stock'
}

export function initials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function facilityTypeLabel(type) {
  const map = {
    pharmacy:              'Pharmacy',
    hospital_pharmacy:     'Hospital Pharmacy',
    clinic:                'Clinic',
    primary_health_center: 'PHC',
    wholesaler:            'Wholesaler',
    distributor:           'Distributor',
    government_store:      'Gov. Medical Store',
  }
  return map[type] ?? type
}
