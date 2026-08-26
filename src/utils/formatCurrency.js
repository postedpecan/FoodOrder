const THAI_BAHT_FORMATTER = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCurrency(amount) {
  return THAI_BAHT_FORMATTER.format(Number(amount))
}
