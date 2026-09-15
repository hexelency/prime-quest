import AvailableListings from "@/app/(marketplace)/components/AvailableListings";

export default function AvailableSection() {
  return <section className="available-section section-space" id="available-listings"><div className="shell"><div className="section-heading"><div><p className="eyebrow accent">Published availability</p><h2>Find what is<br /><em>available now.</em></h2></div><p>Search and filter the current admin-published availability feed across vessels, properties, land, track farms and oil & gas.</p></div><div className="demo-warning">DEMO DATA — NOT A REAL LISTING. These records model the future admin-published inventory feed.</div><AvailableListings /></div></section>;
}
