import Image from "next/image";
import Link from "next/link";
import AvailableListings from "@/app/(marketplace)/components/AvailableListings";
import type { AvailableCategory, AvailableListing } from "@/lib/available-listings";

type CategoryContent = {
  category: AvailableCategory;
  number: string;
  title: string;
  shortTitle: string;
  heroCopy: string;
  background: string;
};

const categoryContent: Record<AvailableCategory, CategoryContent> = {
  vessels: {
    category: "vessels",
    number: "01",
    title: "Vessel brokerage",
    shortTitle: "Vessels",
    heroCopy: "Source a vessel, sell a vessel or place a private mandate. PrimeQuest keeps the route clear.",
    background: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=2200&q=80",
  },
  property: {
    category: "property",
    number: "02",
    title: "Properties",
    shortTitle: "Properties",
    heroCopy: "Explore published property opportunities, or share a property brief with PrimeQuest.",
    background: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=80",
  },
  energy: {
    category: "energy",
    number: "03",
    title: "Oil & gas",
    shortTitle: "Oil & gas",
    heroCopy: "Browse published energy opportunities and qualified oil and gas mandates.",
    background: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=2200&q=80",
  },
  land: {
    category: "land",
    number: "04",
    title: "Land",
    shortTitle: "Land",
    heroCopy: "Review published land opportunities for residential, commercial and industrial use.",
    background: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=80",
  },
  "track-farms": {
    category: "track-farms",
    number: "05",
    title: "Agriculture & track farms",
    shortTitle: "Agriculture",
    heroCopy: "Explore published agricultural land and track farm opportunities.",
    background: "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=2200&q=80",
  },
};

export default function OfferingCategoryPage({
  category,
  listings,
}: {
  category: AvailableCategory;
  listings: readonly AvailableListing[];
}) {
  const offering = categoryContent[category];

  return (
    <main className="offering-page">
      <section className="offering-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(13, 29, 26, .94), rgba(13, 29, 26, .42)), url(${offering.background})` }}>
        <div className="shell offering-hero-content">
          <p className="eyebrow">PrimeQuest portfolio · {offering.number} / 05</p>
          <h1>{offering.title}</h1>
          <p>{offering.heroCopy}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={`https://wa.me/2348108117215?text=${encodeURIComponent(`Hello PrimeQuest, I am a prospective buyer looking for ${offering.shortTitle.toLowerCase()} opportunities.`)}`} target="_blank" rel="noreferrer">Request opportunities <span>↗</span></a>
            <Link className="button button-light" href="/mandate">List an offering <span>↗</span></Link>
          </div>
        </div>
      </section>

      <section className="shell listing-page-section section-space" id="available">
        <div className="section-heading">
          <div><p className="eyebrow accent">{offering.shortTitle} listings</p><h2>Available<br /><em>opportunities.</em></h2></div>
          <p>Published {offering.shortTitle.toLowerCase()} opportunities, reviewed by PrimeQuest and loaded directly from the current inventory database.</p>
        </div>
        {listings.length ? <AvailableListings listings={listings} /> : (
          <div className="empty-listings category-empty-listings">
            <div className="category-empty-mark"><Image src="/logo/official-logo.png" alt="PrimeQuest" width={220} height={220} /></div>
            <div><p className="state-label">No published {offering.shortTitle.toLowerCase()} listings yet</p><h3>New opportunities will appear here.</h3><p>PrimeQuest only displays verified, published inventory. Submit a mandate or contact our team to discuss what you are looking for.</p><Link className="button button-dark" href="/mandate">Submit a mandate <span>↗</span></Link></div>
          </div>
        )}
      </section>

      <section className="offering-note section-space"><div className="shell"><p className="eyebrow light-accent">A considered route</p><h2>Genuine opportunity<br /><em>needs context.</em></h2><Link className="button button-light" href="/about">About PrimeQuest <span>↗</span></Link></div></section>
    </main>
  );
}
