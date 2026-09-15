import type { Offering, OfferingId } from "@/lib/offerings";

type ServicesSectionProps = {
  offerings: readonly Offering[];
  activeOffering: OfferingId;
  onOfferingSelect: (id: OfferingId) => void;
};

export default function ServicesSection({ offerings, activeOffering, onOfferingSelect }: ServicesSectionProps) {
  return (
    <section className="portfolio section-space" id="portfolio"><div className="shell"><div className="section-heading"><div><p className="eyebrow accent">What we do</p><h2>Our services</h2></div><p>Choose a service to view its dedicated listing space, request an opportunity or place a mandate with PrimeQuest.</p></div><div className="service-grid">{offerings.map((item) => <a className={`service-card ${activeOffering === item.id ? "active" : ""}`} href={`/offerings/${item.id}#available`} key={item.id} onClick={() => onOfferingSelect(item.id)}><span className="service-number">{item.number}</span><h3>{item.title}</h3><p>{item.text}</p><span className="service-link">View available service <span>↗</span></span></a>)}</div></div></section>
  );
}
