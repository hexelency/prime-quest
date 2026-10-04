import type { AvailableCategory } from "@/lib/available-listings";

const categoryAliases: Record<string, AvailableCategory> = {
  vessel: "vessels",
  vessels: "vessels",
  property: "property",
  properties: "property",
  energy: "energy",
  "oil-and-gas": "energy",
  "oil-gas": "energy",
  land: "land",
  agriculture: "track-farms",
  agricultural: "track-farms",
  "track-farm": "track-farms",
  "track-farms": "track-farms",
};

export function resolveAvailableCategory(value: string | string[] | undefined): AvailableCategory | undefined {
  const normalized = (Array.isArray(value) ? value[0] : value)?.trim().toLowerCase().replace(/[\s_&]+/g, "-");
  return normalized && Object.prototype.hasOwnProperty.call(categoryAliases, normalized) ? categoryAliases[normalized] : undefined;
}
