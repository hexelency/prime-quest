"use client";

import { useEffect, useState } from "react";

const WHATSAPP_NUMBER = "2348038128933";

const offerings = [
  { id: "vessels", number: "01", title: "Vessel brokerage", shortTitle: "Vessels", text: "Commercial, private and support vessels introduced with context and care.", heroTitle: "The right vessel.\nThe right route.", heroCopy: "Source a vessel, sell a vessel or place a private mandate with a consultancy that keeps the conversation clear.", background: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=2200&q=80", sellerFields: "Vessel photos, specification sheet, registration or ownership documents where available.", mediaAccept: "image/jpeg,image/png,image/webp,application/pdf", documentLabel: "Vessel specifications / ownership documents" },
  { id: "energy", number: "02", title: "Oil & gas advisory", shortTitle: "Oil & gas", text: "Introductions and advisory support for serious energy opportunities.", heroTitle: "Energy opportunities.\nHandled with intent.", heroCopy: "Bring an energy mandate or tell us what you are looking for. We qualify the brief before making an introduction.", background: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=2200&q=80", sellerFields: "Asset photos, technical summary, permits, title or operating documents where available.", mediaAccept: "image/jpeg,image/png,image/webp,application/pdf", documentLabel: "Technical, title or permit documents" },
  { id: "property", number: "03", title: "Property & land", shortTitle: "Property & land", text: "Property, land and development opportunities for genuine buyers and owners.", heroTitle: "A place to build.\nA better way forward.", heroCopy: "Share a property or land mandate, or tell us the location and opportunity you want to find.", background: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=80", sellerFields: "Property photos, survey plan, title documents and location details where available.", mediaAccept: "image/jpeg,image/png,image/webp,application/pdf", documentLabel: "Survey, title or ownership documents" },
  { id: "agriculture", number: "04", title: "Agriculture & track farms", shortTitle: "Agriculture", text: "Land, track farms and agricultural opportunities prepared for the next conversation.", heroTitle: "Ground with potential.\nPlans with purpose.", heroCopy: "Place an agricultural asset or share a brief for land, track farms and productive opportunities.", background: "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=2200&q=80", sellerFields: "Land photos, access information, survey plan, title documents and farm details where available.", mediaAccept: "image/jpeg,image/png,image/webp,application/pdf", documentLabel: "Survey, title or farm documents" },
] as const;

type OfferingId = (typeof offerings)[number]["id"];

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buyerMessage(offering: (typeof offerings)[number]) {
  return `Hello PrimeQuest, I am a prospective buyer/client looking for ${offering.shortTitle.toLowerCase()} opportunities.\n\nMy brief:\n- Offering: ${offering.title}\n- Location / preferred market: \n- Budget or range: \n- Timeline: \n- Additional requirements: \n\nPlease share suitable verified opportunities when available.`;
}

export default function Home() {
  const [activeOffering, setActiveOffering] = useState<OfferingId>("vessels");
  const offering = offerings.find((item) => item.id === activeOffering) ?? offerings[0];

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setActiveOffering((currentId) => {
        const currentIndex = offerings.findIndex((item) => item.id === currentId);
        return offerings[(currentIndex + 1) % offerings.length].id;
      });
    }, 5000);

    return () => window.clearInterval(rotation);
  }, []);

  const chooseOffering = (id: OfferingId) => {
    setActiveOffering(id);
  };

  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-backdrop" key={offering.id} aria-hidden="true" style={{ backgroundImage: `linear-gradient(90deg, rgba(13, 29, 26, .94) 0%, rgba(13, 29, 26, .68) 48%, rgba(13, 29, 26, .25) 100%), url(${offering.background})` }} />
        <div className="hero-content shell"><p className="eyebrow">Independent consultancy · Asaba, Nigeria</p><h1>{offering.heroTitle.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}<em>{index === 1 ? line : ""}</em>{index === 0 ? line : ""}</span>)}</h1><p className="hero-copy">{offering.heroCopy}</p><div className="hero-actions"><a className="button button-primary" href={whatsappLink(buyerMessage(offering))} target="_blank" rel="noreferrer">I am looking to buy <span>↗</span></a><a className="text-link" href="/mandate">I have an offering <span>Tell us about it →</span></a></div></div>
        <div className="hero-meta shell"><span>{offering.number} / 04</span><span className="hero-line" /><span>{offering.shortTitle} · private mandate & brokerage</span></div>
      </section>

      <section className="intro shell section-space"><div><p className="eyebrow accent">The PrimeQuest standard</p><h2>Built for decisions<br /><em>that matter.</em></h2></div><div className="intro-copy"><p>We work between opportunity and action. Our role is to make the next step clearer, the conversation more direct and the process more considered.</p><a className="text-link dark-link" href="#process">Our approach <span>→</span></a></div></section>

      <section className="portfolio section-space" id="portfolio"><div className="shell"><div className="section-heading"><div><p className="eyebrow accent">What we represent</p><h2>Our portfolio</h2></div><p>Select an offering to change the hero, request language and buyer route. Newly approved opportunities can be connected to these same flows.</p></div><div className="service-grid">{offerings.map((item) => <button className={`service-card ${activeOffering === item.id ? "active" : ""}`} key={item.id} onClick={() => chooseOffering(item.id)}><span className="service-number">{item.number}</span><h3>{item.title}</h3><p>{item.text}</p><span className="service-link">View offering <span>↗</span></span></button>)}</div></div></section>

      <section className="vessels shell section-space" id="vessels"><div className="section-heading vessel-heading"><div><p className="eyebrow accent">Available opportunities</p><h2>{offering.shortTitle}, when<br /><em>the fit is right.</em></h2></div><p>Approved opportunities will appear here as they are listed. Refresh this page to see newly published inventory and current offers.</p></div><div className="listing-state"><div className="state-icon">⌁</div><div><p className="state-label">Newly listed opportunities</p><h3>Inventory is being curated.</h3><p>We do not publish unverified offerings. Contact PrimeQuest with what you are looking for and we will share suitable opportunities as they become available.</p><a className="button button-dark" href={whatsappLink(buyerMessage(offering))} target="_blank" rel="noreferrer">Request {offering.shortTitle.toLowerCase()} opportunities <span>↗</span></a></div></div></section>

      <section className="mandate section-space" id="mandate"><div className="shell mandate-grid"><div><p className="eyebrow light-accent">For owners & sellers</p><h2>Have a mandate<br /><em>worth placing?</em></h2></div><div><p>Put your vessel, property, energy or agricultural offering in front of a serious network. Share the essentials privately and our team will guide the next step.</p><a className="button button-light" href="/mandate">Submit a mandate <span>↗</span></a></div></div></section>

      <section className="seller-section section-space" id="seller-guide"><div className="shell contact-grid"><div><p className="eyebrow accent">For owners & sellers</p><h2>Place an offering<br /><em>with context.</em></h2><p className="contact-note">No seller dashboard is required. Start with a short guided submission and PrimeQuest will review your offering before publishing or introducing it.</p><div className="document-note"><strong>What you can prepare</strong><span>Offering details, location, asking terms, photos and supporting documents where relevant. Requirements change by category.</span></div></div><div className="mandate-guide"><p className="state-label">One clear submission</p><h3>Tell us what you have.</h3><p>Use the dedicated mandate page to select your category, provide the right details and attach the appropriate media or documents.</p><a className="button button-dark" href="/mandate">Open seller mandate <span>↗</span></a></div></div></section>

      <section className="process shell section-space" id="process"><div className="section-heading"><div><p className="eyebrow accent">A more useful process</p><h2>From first brief<br /><em>to clear next step.</em></h2></div><p>Every conversation begins with context. We qualify the requirement, confirm the opportunity and keep communication moving through one trusted channel.</p></div><div className="process-list"><div><span>01</span><h3>Tell us what you need</h3><p>Buyer inquiry, seller mandate or a broader brief.</p></div><div><span>02</span><h3>We qualify the fit</h3><p>Our team reviews the details and available routes.</p></div><div><span>03</span><h3>Move with confidence</h3><p>Receive a clear response and a practical next step.</p></div></div></section>

      <section className="contact section-space" id="inquiry"><div className="shell contact-grid"><div><p className="eyebrow accent">Prospective buyers</p><h2>Tell us what<br /><em>you are seeking.</em></h2><p className="contact-note">Use the category selector above or message PrimeQuest directly for a buyer brief tailored to vessels, energy, land or agriculture.</p></div><div className="buyer-actions">{offerings.map((item) => <a className="buyer-link" key={item.id} href={whatsappLink(buyerMessage(item))} target="_blank" rel="noreferrer"><span>Looking for {item.shortTitle.toLowerCase()}</span><span>WhatsApp ↗</span></a>)}</div></div></section>

      <footer className="footer" id="contact"><div className="shell footer-grid"><a className="brand" href="#top"><span className="brand-mark">PQ</span><span><strong>PRIMEQUEST</strong><small>OIL · VESSELS · PROPERTIES</small></span></a><p>Connecting genuine sellers<br />with genuine buyers.</p><div><a href={whatsappLink("Hello PrimeQuest, I have a general inquiry.")} target="_blank" rel="noreferrer">WhatsApp PrimeQuest ↗</a><a href="mailto:primequestoilandpropertyconsul@gmail.com">primequestoilandpropertyconsul@gmail.com</a><a href="tel:+2348036598189">+234 803 659 8189</a></div></div><div className="shell footer-bottom"><span>© 2026 PrimeQuest Oil and Properties Consultants</span><span>Asaba · Delta State · Nigeria</span></div></footer>
    </main>
  );
}
