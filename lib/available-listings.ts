export type AvailableCategory = "vessels" | "property" | "land" | "track-farms" | "energy";

export type AvailableListing = {
  ref: string;
  title: string;
  category: AvailableCategory;
  type: string;
  location: string;
  summary: string;
  tags: readonly string[];
  publishedAt: string;
  image: string;
};

const vesselImage = "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=900&q=75";
const marineImage = "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=900&q=75";
const landImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=75";
const propertyImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=75";
const energyImage = "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=900&q=75";

export const availableListings: readonly AvailableListing[] = [
  { ref: "Q1", title: "Offshore Support Vessel", category: "vessels", type: "Platform supply vessel", location: "West Africa", summary: "Marine support opportunity with specifications supplied on request.", tags: ["New", "Q1 Ready"], publishedAt: "2026-09-12", image: vesselImage },
  { ref: "Q2", title: "Crew Transfer Vessel", category: "vessels", type: "Crew / utility vessel", location: "West Africa", summary: "Crew transfer opportunity awaiting approved listing details.", tags: ["New", "Crew Ready"], publishedAt: "2026-09-11", image: marineImage },
  { ref: "Q3", title: "Multipurpose Workboat", category: "vessels", type: "Workboat", location: "Gulf of Guinea", summary: "Multipurpose marine workboat opportunity for qualified inquiries.", tags: ["Q3 Ready", "Available"], publishedAt: "2026-09-10", image: marineImage },
  { ref: "Q4", title: "Harbour Tug Vessel", category: "vessels", type: "Harbour / ocean tug", location: "Nigeria", summary: "Tug vessel mandate with supporting information under review.", tags: ["Q4 Ready", "Verified Docs"], publishedAt: "2026-09-09", image: vesselImage },
  { ref: "Q5", title: "Cargo Landing Craft", category: "vessels", type: "Landing craft", location: "West Africa", summary: "Landing craft opportunity for cargo and project support discussions.", tags: ["Q5 Ready", "New"], publishedAt: "2026-09-08", image: marineImage },
  { ref: "Q6", title: "Fast Supply Vessel", category: "vessels", type: "Fast supply vessel", location: "Nigeria", summary: "Fast supply opportunity with details available after inquiry.", tags: ["Q6 Ready", "Available"], publishedAt: "2026-09-07", image: vesselImage },
  { ref: "Q7", title: "Dredging Support Vessel", category: "vessels", type: "Marine support vessel", location: "West Africa", summary: "Dredging support opportunity for qualified marine operators.", tags: ["Q7 Ready", "New"], publishedAt: "2026-09-06", image: marineImage },
  { ref: "Q8", title: "Passenger Utility Vessel", category: "vessels", type: "Passenger / utility vessel", location: "Nigeria", summary: "Passenger utility opportunity with Q8 documentation route.", tags: ["Q8 Ready", "Available"], publishedAt: "2026-09-05", image: vesselImage },
  { ref: "PROP-01", title: "Residential Property Opportunity", category: "property", type: "Residential property", location: "Asaba, Delta State", summary: "Residential opportunity with title and location details supplied after review.", tags: ["New", "C of O Ready"], publishedAt: "2026-09-12", image: propertyImage },
  { ref: "PROP-02", title: "Commercial Property Opportunity", category: "property", type: "Commercial building", location: "Warri, Delta State", summary: "Commercial property mandate for qualified buyer inquiries.", tags: ["C of O Ready", "Available"], publishedAt: "2026-09-09", image: propertyImage },
  { ref: "PROP-03", title: "Development Property", category: "property", type: "Development site", location: "Asaba, Delta State", summary: "Development opportunity with planning details available on request.", tags: ["New", "Development Ready"], publishedAt: "2026-09-07", image: propertyImage },
  { ref: "PROP-04", title: "Affordable Property Offer", category: "property", type: "Residential property", location: "Benin City, Edo State", summary: "Entry-level opportunity with asking terms supplied after review.", tags: ["Cheapest Offer", "Available"], publishedAt: "2026-09-04", image: propertyImage },
  { ref: "LAND-01", title: "Residential Land Opportunity", category: "land", type: "Residential land", location: "Asaba, Delta State", summary: "Residential land opportunity with survey and title route under review.", tags: ["New", "C of O Ready"], publishedAt: "2026-09-11", image: landImage },
  { ref: "LAND-02", title: "Commercial Land Opportunity", category: "land", type: "Commercial land", location: "Warri, Delta State", summary: "Commercial land opportunity for development conversations.", tags: ["C of O Ready", "Available"], publishedAt: "2026-09-08", image: landImage },
  { ref: "LAND-03", title: "Expansion Land", category: "land", type: "Industrial land", location: "Port Harcourt, Rivers State", summary: "Expansion land opportunity with access information supplied after inquiry.", tags: ["New", "Industrial Ready"], publishedAt: "2026-09-05", image: landImage },
  { ref: "LAND-04", title: "Budget Land Offer", category: "land", type: "Residential land", location: "Abraka, Delta State", summary: "Budget land opportunity for qualified buyers.", tags: ["Cheapest Offer", "Available"], publishedAt: "2026-09-02", image: landImage },
  { ref: "FARM-01", title: "Track Farm Opportunity", category: "track-farms", type: "Track farm", location: "Delta State", summary: "Track farm opportunity with access and supporting documents under review.", tags: ["New", "Farm Docs Ready"], publishedAt: "2026-09-10", image: landImage },
  { ref: "FARM-02", title: "Agricultural Land Opportunity", category: "track-farms", type: "Agricultural land", location: "Edo State", summary: "Agricultural land opportunity for production and investment briefs.", tags: ["Available", "Survey Ready"], publishedAt: "2026-09-06", image: landImage },
  { ref: "FARM-03", title: "Managed Track Farm", category: "track-farms", type: "Managed farm", location: "Delta State", summary: "Managed farm opportunity with operational details supplied on request.", tags: ["New", "Operations Ready"], publishedAt: "2026-09-03", image: landImage },
  { ref: "FARM-04", title: "Entry Agricultural Offer", category: "track-farms", type: "Agricultural land", location: "Ondo State", summary: "Accessible agricultural opportunity for qualified inquiries.", tags: ["Cheapest Offer", "Available"], publishedAt: "2026-09-01", image: landImage },
  { ref: "ENERGY-01", title: "Energy Asset Mandate", category: "energy", type: "Oil & gas opportunity", location: "Niger Delta", summary: "Energy opportunity with technical information available under controlled review.", tags: ["New", "Docs Under Review"], publishedAt: "2026-09-10", image: energyImage },
  { ref: "ENERGY-02", title: "Field Services Opportunity", category: "energy", type: "Energy services", location: "Nigeria", summary: "Field services opportunity for qualified commercial discussions.", tags: ["Available", "Technical Ready"], publishedAt: "2026-09-07", image: energyImage },
  { ref: "ENERGY-03", title: "Support Services Mandate", category: "energy", type: "Oilfield support", location: "West Africa", summary: "Support services mandate with details supplied after qualification.", tags: ["New", "Mandate Ready"], publishedAt: "2026-09-04", image: energyImage },
  { ref: "ENERGY-04", title: "Energy Partnership Opportunity", category: "energy", type: "Energy partnership", location: "Nigeria", summary: "Partnership opportunity for serious counterparties.", tags: ["Available", "Partner Review"], publishedAt: "2026-09-02", image: energyImage },
] as const;
