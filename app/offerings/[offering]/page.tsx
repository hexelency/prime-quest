import { notFound } from "next/navigation";
import { offerings } from "@/lib/offerings";

type OfferingPageProps = {
  params: Promise<{ offering: string }>;
};

export function generateStaticParams() {
  return offerings.map((offering) => ({ offering: offering.id }));
}

export default async function OfferingPage({ params }: OfferingPageProps) {
  const { offering: offeringId } = await params;
  const offering = offerings.find((item) => item.id === offeringId);

  if (!offering) notFound();

  return (
    <main className="offering-page">
      <section className="offering-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(13, 29, 26, .94), rgba(13, 29, 26, .42)), url(${offering.background})` }}>
        <div className="shell offering-hero-content"><p className="eyebrow">PrimeQuest portfolio · {offering.number} / 04</p><h1>{offering.title}</h1><p>{offering.heroCopy}</p><div className="hero-actions"><a className="button button-primary" href={`https://wa.me/2348038128933?text=${encodeURIComponent(`Hello PrimeQuest, I am a prospective buyer looking for ${offering.shortTitle.toLowerCase()} opportunities.`)}`} target="_blank" rel="noreferrer">Request opportunities <span>↗</span></a><a className="button button-light" href="/mandate">List an offering <span>↗</span></a></div></div>
      </section>

      <section className="shell listing-page-section section-space" id="available"><div className="section-heading"><div><p className="eyebrow accent">{offering.shortTitle} listings</p><h2>Available<br /><em>opportunities.</em></h2></div><p>Listings are reviewed before publication. Use the category below to see approved opportunities as PrimeQuest adds them.</p></div><div className="listing-category-grid"><div><span>01</span><h3>Newly listed</h3><p>Recently approved {offering.shortTitle.toLowerCase()} opportunities will appear here.</p></div><div><span>02</span><h3>Available</h3><p>Current opportunities open for qualified buyer and client inquiries.</p></div><div><span>03</span><h3>Offers & mandates</h3><p>Private offers can be discussed directly with the PrimeQuest team.</p></div></div><div className="empty-listings"><p className="state-label">No published listings yet</p><h3>New {offering.shortTitle.toLowerCase()} opportunities will appear here.</h3><p>PrimeQuest does not invent or publish unverified inventory. Contact us with your brief and we will share suitable opportunities when available.</p><a className="button button-dark" href={`https://wa.me/2348038128933?text=${encodeURIComponent(`Hello PrimeQuest, please notify me about new ${offering.shortTitle.toLowerCase()} opportunities.`)}`} target="_blank" rel="noreferrer">Ask to be notified <span>↗</span></a></div></section>

      <section className="offering-note section-space"><div className="shell"><p className="eyebrow light-accent">A considered route</p><h2>Genuine opportunity<br /><em>needs context.</em></h2><a className="button button-light" href="/about">About PrimeQuest <span>↗</span></a></div></section>
    </main>
  );
}
