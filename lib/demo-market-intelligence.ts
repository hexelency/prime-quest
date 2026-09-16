export type MarketAsset = {
  id: string;
  reference: string;
  title: string;
  category: string;
  asset_type: string;
  location: string;
  summary: string;
  source_url: string;
  source_platform: string;
  source_summary: string;
  discovered_by: string;
  confidence_score: number;
  status: string;
  verification_status: string;
  created_at: string;
};

export type MarketBuyer = {
  id: string;
  company_name: string;
  kind: "buyer";
  country: string;
  website: string;
  source_url: string;
  source_summary: string;
  confidence_score: number;
  status: string;
  verification_status: string;
  created_at: string;
};

export const demoMarketAssets: MarketAsset[] = [
  { id: "demo-asset-1", reference: "AI-VSL-001", title: "Offshore Support Vessel", category: "vessel", asset_type: "Platform supply vessel", location: "West Africa", summary: "Public sale signal found for a marine support vessel.", source_url: "https://www.nautisnp.com/", source_platform: "Public vessel marketplace", source_summary: "Listing language indicates the vessel is available for sale; specifications require seller confirmation.", discovered_by: "ai_agent", confidence_score: 82, status: "under_review", verification_status: "potential", created_at: "2026-09-15T09:00:00.000Z" },
  { id: "demo-asset-2", reference: "AI-PRP-002", title: "Commercial Property Opportunity", category: "property", asset_type: "Commercial building", location: "Lagos, Nigeria", summary: "Commercial property sale signal surfaced from a public listing.", source_url: "https://www.propertypro.ng/", source_platform: "Public property marketplace", source_summary: "Public details suggest an active sale opportunity; title and seller authority are unverified.", discovered_by: "ai_agent", confidence_score: 76, status: "discovered", verification_status: "potential", created_at: "2026-09-14T14:30:00.000Z" },
];

export const demoMarketBuyers: MarketBuyer[] = [
  { id: "demo-buyer-1", company_name: "Regional Offshore Services Group", kind: "buyer", country: "Nigeria", website: "https://example.com", source_url: "https://www.linkedin.com/", source_summary: "Public company profile and fleet expansion language suggest interest in acquiring support vessels.", confidence_score: 71, status: "researched", verification_status: "under_review", created_at: "2026-09-15T11:20:00.000Z" },
  { id: "demo-buyer-2", company_name: "West Africa Property Investors", kind: "buyer", country: "Ghana", website: "https://example.com", source_url: "https://www.linkedin.com/", source_summary: "Investor profile indicates active commercial property acquisition across West African markets.", confidence_score: 68, status: "discovered", verification_status: "potential", created_at: "2026-09-13T16:10:00.000Z" },
];