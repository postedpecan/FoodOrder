export function normalizeMenuPrice(amount) {
  const price = Number(amount)

  if (!Number.isFinite(price)) return 35
  if (price >= 25) return price
  if (price <= 2.5) return 25
  if (price <= 3.5) return 30
  if (price <= 5) return 35
  if (price <= 8.5) return 40
  if (price <= 9.5) return 45
  return 50
}
