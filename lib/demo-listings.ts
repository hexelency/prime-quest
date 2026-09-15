export type ListingTab = "vessels" | "land" | "track-farms" | "property";

export const vesselDemoListings = [
  { ref: "Q1", name: "Offshore Support Vessel", type: "Platform supply vessel", location: "West Africa", length: "Information not provided", year: "Information not provided", status: "Demo review", image: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=900&q=75" },
  { ref: "Q2", name: "Crew Transfer Vessel", type: "Crew / utility vessel", location: "Information not provided", length: "Information not provided", year: "Information not provided", status: "Demo review", image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=900&q=75" },
  { ref: "Q3", name: "Multipurpose Workboat", type: "Workboat", location: "Information not provided", length: "Information not provided", year: "Information not provided", status: "Demo review", image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=900&q=75" },
  { ref: "Q4", name: "Tug Vessel", type: "Harbour / ocean tug", location: "Information not provided", length: "Information not provided", year: "Information not provided", status: "Demo review", image: "https://images.unsplash.com/photo-1498623116890-37e912163d5d?auto=format&fit=crop&w=900&q=75" },
  { ref: "Q5", name: "Landing Craft", type: "Cargo landing craft", location: "Information not provided", length: "Information not provided", year: "Information not provided", status: "Demo review", image: "https://images.unsplash.com/photo-1535024966841-1a4f0f5b6f0c?auto=format&fit=crop&w=900&q=75" },
  { ref: "Q6", name: "Fast Supply Vessel", type: "Fast supply vessel", location: "Information not provided", length: "Information not provided", year: "Information not provided", status: "Demo review", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=75" },
  { ref: "Q7", name: "Dredging Support Vessel", type: "Marine support vessel", location: "Information not provided", length: "Information not provided", year: "Information not provided", status: "Demo review", image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=75" },
  { ref: "Q8", name: "Passenger / Utility Vessel", type: "Passenger utility vessel", location: "Information not provided", length: "Information not provided", year: "Information not provided", status: "Demo review", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=75" },
] as const;

export const demoCategoryListings = {
  land: [
    { ref: "LAND-01", name: "Land opportunity", detail: "Location, size and title details supplied after review.", status: "Demo review" },
    { ref: "LAND-02", name: "Development land", detail: "Location, access and permitted use supplied after review.", status: "Demo review" },
  ],
  "track-farms": [
    { ref: "FARM-01", name: "Track farm opportunity", detail: "Farm size, access and supporting documents supplied after review.", status: "Demo review" },
    { ref: "FARM-02", name: "Agricultural land opportunity", detail: "Use, location and land documentation supplied after review.", status: "Demo review" },
  ],
  property: [
    { ref: "PROP-01", name: "Property opportunity", detail: "Property type, location and asking terms supplied after review.", status: "Demo review" },
    { ref: "PROP-02", name: "Commercial property opportunity", detail: "Use, location and title information supplied after review.", status: "Demo review" },
  ],
} as const;
