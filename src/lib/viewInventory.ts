export type ViewInventoryItemId =
  | "thumbnail-polish"
  | "hashtag-amplifier"
  | "ring-light-array"
  | "algorithm-charm"
  | "viral-edit-kit";

export interface ViewInventoryItemConfig {
  id: ViewInventoryItemId;
  name: string;
  description: string;
  icon: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  viewMultiplierBonus: number;
}

export type ViewInventory = Record<ViewInventoryItemId, number>;

export interface ViewInventoryReward {
  itemId: ViewInventoryItemId;
  quantity: number;
}

export const VIEW_INVENTORY_ORDER: ViewInventoryItemId[] = [
  "thumbnail-polish",
  "hashtag-amplifier",
  "ring-light-array",
  "algorithm-charm",
  "viral-edit-kit",
];

export const VIEW_INVENTORY_ITEMS: Record<ViewInventoryItemId, ViewInventoryItemConfig> = {
  "thumbnail-polish": {
    id: "thumbnail-polish",
    name: "Neon Thumbnail Polish",
    description: "Adds +5% views per copy by making mukbang uploads more clickable.",
    icon: "🖼️",
    rarity: "Common",
    viewMultiplierBonus: 0.05,
  },
  "hashtag-amplifier": {
    id: "hashtag-amplifier",
    name: "Hashtag Amplifier",
    description: "Adds +8% views per copy by pushing the stream into better feeds.",
    icon: "#️⃣",
    rarity: "Uncommon",
    viewMultiplierBonus: 0.08,
  },
  "ring-light-array": {
    id: "ring-light-array",
    name: "Ring Light Array",
    description: "Adds +12% views per copy by making food shots glow harder.",
    icon: "💡",
    rarity: "Rare",
    viewMultiplierBonus: 0.12,
  },
  "algorithm-charm": {
    id: "algorithm-charm",
    name: "Algorithm Charm",
    description: "Adds +20% views per copy when the recommendation engine smiles.",
    icon: "📈",
    rarity: "Epic",
    viewMultiplierBonus: 0.2,
  },
  "viral-edit-kit": {
    id: "viral-edit-kit",
    name: "Viral Edit Kit",
    description: "Adds +35% views per copy with jump cuts, captions, and chaos zooms.",
    icon: "🎬",
    rarity: "Legendary",
    viewMultiplierBonus: 0.35,
  },
};

export const EMPTY_VIEW_INVENTORY: ViewInventory = {
  "thumbnail-polish": 0,
  "hashtag-amplifier": 0,
  "ring-light-array": 0,
  "algorithm-charm": 0,
  "viral-edit-kit": 0,
};

export const MAX_VIEW_INVENTORY_MULTIPLIER = 3;

function clampInventoryQuantity(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

export function normalizeViewInventory(
  value: Partial<Record<ViewInventoryItemId, number>> | null | undefined
): ViewInventory {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_VIEW_INVENTORY };
  }

  return VIEW_INVENTORY_ORDER.reduce<ViewInventory>((inventory, itemId) => {
    inventory[itemId] = clampInventoryQuantity(value[itemId]);
    return inventory;
  }, { ...EMPTY_VIEW_INVENTORY });
}

export function addViewInventoryItem(
  inventory: ViewInventory,
  itemId: ViewInventoryItemId,
  quantity: number = 1
): ViewInventory {
  const normalizedInventory = normalizeViewInventory(inventory);
  const safeQuantity = clampInventoryQuantity(quantity) || 1;

  return {
    ...normalizedInventory,
    [itemId]: normalizedInventory[itemId] + safeQuantity,
  };
}

export function getViewInventoryMultiplier(inventory: ViewInventory): number {
  const normalizedInventory = normalizeViewInventory(inventory);
  const rawMultiplier = VIEW_INVENTORY_ORDER.reduce((multiplier, itemId) => {
    return multiplier + normalizedInventory[itemId] * VIEW_INVENTORY_ITEMS[itemId].viewMultiplierBonus;
  }, 1);

  return Math.min(MAX_VIEW_INVENTORY_MULTIPLIER, Math.round(rawMultiplier * 100) / 100);
}
