import { format, differenceInDays, parseISO } from 'date-fns'

export function fmtDate(dateString) {
  if (!dateString) return '—'

  return format(parseISO(dateString), 'dd MMM yyyy')
}

export function fmtDateTime(dateString) {
  if (!dateString) return '—'

  return format(parseISO(dateString), 'dd MMM yyyy, HH:mm')
}

export function daysUntilExpiry(dateString) {
  if (!dateString) return null

  return differenceInDays(parseISO(dateString), new Date())
}

export function fmtCurrency(amount, currency = 'NGN') {
  if (amount == null) return '—'

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function fmtNumber(value) {
  if (value == null) return '—'

  return new Intl.NumberFormat('en-NG').format(value)
}

/*
|--------------------------------------------------------------------------
| STATUS HELPERS
|--------------------------------------------------------------------------
*/

export function getExpiryStatus(dateString) {
  const days = daysUntilExpiry(dateString)

  if (days == null) return 'neutral'
  if (days < 0) return 'danger'
  if (days <= 30) return 'danger'
  if (days <= 90) return 'warning'

  return 'success'
}

export function getTransferStatus(status) {
  const statusMap = {
    pending: 'warning',
    approved: 'info',
    rejected: 'danger',
    in_transit: 'info',
    fulfilled: 'success',
    cancelled: 'neutral',
  }

  return statusMap[status] ?? 'neutral'
}

export function getAlertLabel(type) {
  const labelMap = {
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
    near_expiry: 'Near Expiry',
    overstock: 'Overstock',
  }

  return labelMap[type] ?? type
}

export function getAlertStatus(type) {
  const statusMap = {
    low_stock: 'warning',
    out_of_stock: 'danger',
    near_expiry: 'warning',
    overstock: 'info',
  }

  return statusMap[type] ?? 'neutral'
}
