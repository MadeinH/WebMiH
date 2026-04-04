import type { ManagedItem } from '@/lib/content/types'

export function getStartingPrice(item: ManagedItem): number | null {
  const matrixPrices = Object.values(item.priceMatrix).filter((value): value is number => typeof value === 'number')
  const variantPrices = Array.isArray(item.variants)
    ? item.variants
        .map((variant) => variant.price)
        .filter((value): value is number => typeof value === 'number')
    : []

  const prices = [...matrixPrices, ...variantPrices]
  if (prices.length === 0) {
    return null
  }

  return Math.min(...prices)
}
