import type { ProductCategory, SkinType } from '../backend';

export function formatCategory(category: ProductCategory): string {
  const kind = category.__kind__;
  if (kind === 'eyeTreatment') return 'Eye Treatment';
  if (kind === 'other' && 'other' in category) return category.other;
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export function formatSkinType(skinType: SkinType): string {
  return skinType.charAt(0).toUpperCase() + skinType.slice(1);
}

export function formatCurrency(currency: any): string {
  const kind = currency.__kind__;
  if (kind === 'usd') return '$';
  if (kind === 'eur') return '€';
  if (kind === 'gbp') return '£';
  if (kind === 'jpy') return '¥';
  if (kind === 'other' && 'other' in currency) return currency.other;
  return '';
}

export function parseConcerns(concernsString: string): string[] {
  return concernsString
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

export function parseIngredients(ingredientsString: string): string[] {
  return ingredientsString
    .split(',')
    .map((i) => i.trim())
    .filter(Boolean);
}
