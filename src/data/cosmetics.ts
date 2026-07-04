export type CosmeticSlot = 'hat' | 'scarf' | 'theme';

export type Cosmetic = {
  id: string;
  slot: CosmeticSlot;
  name: string;
  cost: number;
  /** Ionicons name used on the collection screen. */
  icon: string;
  color: string;
};

export const COSMETICS: Cosmetic[] = [
  { id: 'scarf_coral', slot: 'scarf', name: 'Coral Scarf', cost: 0, icon: 'ribbon', color: '#FF7A59' },
  { id: 'scarf_mint', slot: 'scarf', name: 'Mint Scarf', cost: 40, icon: 'ribbon', color: '#35D0BA' },
  { id: 'scarf_sunny', slot: 'scarf', name: 'Sunny Scarf', cost: 60, icon: 'ribbon', color: '#FFD166' },
  { id: 'hat_explorer', slot: 'hat', name: 'Explorer Hat', cost: 80, icon: 'trail-sign', color: '#C58A4B' },
  { id: 'hat_captain', slot: 'hat', name: 'Captain Cap', cost: 120, icon: 'boat', color: '#2F80ED' },
  { id: 'hat_flower', slot: 'hat', name: 'Garden Bloom', cost: 100, icon: 'flower', color: '#8E7CFF' },
  { id: 'theme_sunrise', slot: 'theme', name: 'Sunrise Island', cost: 150, icon: 'sunny', color: '#FFB84D' },
  { id: 'theme_lagoon', slot: 'theme', name: 'Calm Lagoon', cost: 150, icon: 'water', color: '#35D0BA' },
];

export const DEFAULT_SELECTED: Record<string, string> = { scarf: 'scarf_coral' };

export function getCosmetic(id: string): Cosmetic | undefined {
  return COSMETICS.find((c) => c.id === id);
}
