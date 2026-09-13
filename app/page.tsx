"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const WHATSAPP_NUMBER = "2348038128933";

const offerings = [
  { id: "vessels", number: "01", title: "Vessel brokerage", shortTitle: "Vessels", text: "Commercial, private and support vessels introduced with context and care.", heroTitle: "The right vessel.\nThe right route.", heroCopy: "Source a vessel, sell a vessel or place a private mandate with a consultancy that keeps the conversation clear.", background: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=2200&q=80", sellerFields: "Vessel photos, specification sheet, registration or ownership documents where available.", mediaAccept: "image/jpeg,image/png,image/webp,application/pdf", documentLabel: "Vessel specifications / ownership documents" },
  { id: "energy", number: "02", title: "Oil & gas advisory", shortTitle: "Oil & gas", text: "Introductions and advisory support for serious energy opportunities.", heroTitle: "Energy opportunities.\nHandled with intent.", heroCopy: "Bring an energy mandate or tell us what you are looking for. We qualify the brief before making an introduction.", background: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=2200&q=80", sellerFields: "Asset photos, technical summary, permits, title or operating documents where available.", mediaAccept: "image/jpeg,image/png,image/webp,application/pdf", documentLabel: "Technical, title or permit documents" },
  { id: "property", number: "03", title: "Property & land", shortTitle: "Property & land", text: "Property, land and development opportunities for genuine buyers and owners.", heroTitle: "A place to build.\nA better way forward.", heroCopy: "Share a property or land mandate, or tell us the location and opportunity you want to find.", background: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=80", sellerFields: "Property photos, survey plan, title documents and location details where available.", mediaAccept: "image/jpeg,image/png,image/webp,application/pdf", documentLabel: "Survey, title or ownership documents" },
  { id: "agriculture", number: "04", title: "Agriculture & track farms", shortTitle: "Agriculture", text: "Land, track farms and agricultural opportunities prepared for the next conversation.", heroTitle: "Ground with potential.\nPlans with purpose.", heroCopy: "Place an agricultural asset or share a brief for land, track farms and productive opportunities.", background: "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=2200&q=80", sellerFields: "Land photos, access information, survey plan, title documents and farm details where available.", mediaAccept: "image/jpeg,image/png,image/webp,application/pdf", documentLabel: "Survey, title or farm documents" },
] as const;

type OfferingId = (typeof offerings)[number]["id"];
type EnquiryMode = "buyer" | "seller";

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buyerMessage(offering: (typeof offerings)[number]) {
  return `Hello PrimeQuest, I am a prospective buyer/client looking for ${offering.shortTitle.toLowerCase()} opportunities.\n\nMy brief:\n- Offering: ${offering.title}\n- Location / preferred market: \n- Budget or range: \n- Timeline: \n- Additional requirements: \n\nPlease share suitable verified opportunities when available.`;
}

function sellerMessage(offering: (typeof offerings)[number], details: Record<string, string>) {
  return `Hello PrimeQuest, I would like to place a ${offering.shortTitle.toLowerCase()} mandate.\n\nOffering details:\n- Category: ${offering.title}\n- Name / company: ${details.name}\n- Email: ${details.email}\n- Phone: ${details.phone}\n- Location: ${details.location}\n- Title / short description: ${details.title}\n- Asking price or terms: ${details.terms}\n\nI understand that PrimeQuest will review the information before publishing or introducing the opportunity. The supporting files will be shared through the secure submission process.`;
}

export default function Home() {
  const [activeOffering, setActiveOffering] = useState<OfferingId>("vessels");
  const [enquiryMode, setEnquiryMode] = useState<EnquiryMode>("buyer");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const offering = offerings.find((item) => item.id === activeOffering) ?? offerings[0];

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setActiveOffering((currentId) => {
        const currentIndex = offerings.findIndex((item) => item.id === currentId);
        return offerings[(currentIndex + 1) % offerings.length].id;
      });
    }, 5000);

    return () => window.clearInterval(rotation);
  }, []);

  const chooseOffering = (id: OfferingId, mode: EnquiryMode = enquiryMode) => {
    setActiveOffering(id);
    setEnquiryMode(mode);
  };

  const submitSellerForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const details = Object.fromEntries(["name", "email", "phone", "location", "title", "terms"].map((field) => [field, String(form.get(field) ?? "")]));
    window.open(whatsappLink(sellerMessage(offering, details)), "_blank", "noopener,noreferrer");
  };

  return (
    <main>
      <section className={`hero ${mobileNavOpen ? "nav-open" : ""}`} id="top">
        <div className="hero-backdrop" key={offering.id} aria-hidden="true" style={{ backgroundImage: `linear-gradient(90deg, rgba(13, 29, 26, .94) 0%, rgba(13, 29, 26, .68) 48%, rgba(13, 29, 26, .25) 100%), url(${offering.background})` }} />
        <nav className="nav shell" aria-label="Main navigation"><a className="brand" href="#top" aria-label="PrimeQuest home"><span className="brand-mark">PQ</span><span><strong>PRIMEQUEST</strong><small>OIL · VESSELS · PROPERTIES</small></span></a><div className="nav-links"><a href="#portfolio">Portfolio</a><a href="#mandate">List with us</a><a href="#process">How it works</a><a href="#contact">Contact</a></div><a className="button button-small button-outline desktop-whatsapp" href={whatsappLink(buyerMessage(offering))} target="_blank" rel="noreferrer">WhatsApp us <span>↗</span></a><button className="menu-toggle" type="button" aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}><span /><span /><span /></button></nav>
        <div className="hero-content shell"><p className="eyebrow">Independent consultancy · Asaba, Nigeria</p><h1>{offering.heroTitle.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}<em>{index === 1 ? line : ""}</em>{index === 0 ? line : ""}</span>)}</h1><p className="hero-copy">{offering.heroCopy}</p><div className="hero-actions"><a className="button button-primary" href={whatsappLink(buyerMessage(offering))} target="_blank" rel="noreferrer">I am looking to buy <span>↗</span></a><a className="text-link" href="#mandate" onClick={() => setEnquiryMode("seller")}>I have an offering <span>Tell us about it →</span></a></div></div>
        <div className="hero-meta shell"><span>{offering.number} / 04</span><span className="hero-line" /><span>{offering.shortTitle} · private mandate & brokerage</span></div>
      </section>

      {portalReady && createPortal(<><div className={`mobile-nav-backdrop ${mobileNavOpen ? "open" : ""}`} onClick={() => setMobileNavOpen(false)} aria-hidden="true" /><aside className={`mobile-drawer ${mobileNavOpen ? "open" : ""}`} aria-label="Mobile navigation"><div className="mobile-drawer-head"><span>Menu</span><button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation">×</button></div><div className="mobile-drawer-links"><a href="#portfolio" onClick={() => setMobileNavOpen(false)}>Portfolio <span>↗</span></a><a href="#mandate" onClick={() => { setEnquiryMode("seller"); setMobileNavOpen(false); }}>List with us <span>↗</span></a><a href="#process" onClick={() => setMobileNavOpen(false)}>How it works <span>↗</span></a><a href="#contact" onClick={() => setMobileNavOpen(false)}>Contact <span>↗</span></a><a className="mobile-whatsapp" href={whatsappLink(buyerMessage(offering))} target="_blank" rel="noreferrer" onClick={() => setMobileNavOpen(false)}>WhatsApp us <span>↗</span></a></div></aside></>, document.body)}

      <section className="intro shell section-space"><div><p className="eyebrow accent">The PrimeQuest standard</p><h2>Built for decisions<br /><em>that matter.</em></h2></div><div className="intro-copy"><p>We work between opportunity and action. Our role is to make the next step clearer, the conversation more direct and the process more considered.</p><a className="text-link dark-link" href="#process">Our approach <span>→</span></a></div></section>

      <section className="portfolio section-space" id="portfolio"><div className="shell"><div className="section-heading"><div><p className="eyebrow accent">What we represent</p><h2>Our portfolio</h2></div><p>Select an offering to change the hero, request language and buyer route. Newly approved opportunities can be connected to these same flows.</p></div><div className="service-grid">{offerings.map((item) => <button className={`service-card ${activeOffering === item.id ? "active" : ""}`} key={item.id} onClick={() => chooseOffering(item.id)}><span className="service-number">{item.number}</span><h3>{item.title}</h3><p>{item.text}</p><span className="service-link">View offering <span>↗</span></span></button>)}</div></div></section>

      <section className="vessels shell section-space" id="vessels"><div className="section-heading vessel-heading"><div><p className="eyebrow accent">Available opportunities</p><h2>{offering.shortTitle}, when<br /><em>the fit is right.</em></h2></div><p>Approved opportunities will appear here as they are listed. Refresh this page to see newly published inventory and current offers.</p></div><div className="listing-state"><div className="state-icon">⌁</div><div><p className="state-label">Newly listed opportunities</p><h3>Inventory is being curated.</h3><p>We do not publish unverified offerings. Contact PrimeQuest with what you are looking for and we will share suitable opportunities as they become available.</p><a className="button button-dark" href={whatsappLink(buyerMessage(offering))} target="_blank" rel="noreferrer">Request {offering.shortTitle.toLowerCase()} opportunities <span>↗</span></a></div></div></section>

      <section className="mandate section-space" id="mandate"><div className="shell mandate-grid"><div><p className="eyebrow light-accent">For owners & sellers</p><h2>Have a mandate<br /><em>worth placing?</em></h2></div><div><p>Put your {offering.shortTitle.toLowerCase()} offering in front of a serious network. Complete the short intake below and share your photos or supporting documents where necessary.</p><a className="button button-light" href="#seller-form" onClick={() => setEnquiryMode("seller")}>Submit a mandate <span>↓</span></a></div></div></section>

      <section className="seller-section section-space" id="seller-form"><div className="shell contact-grid"><div><p className="eyebrow accent">Seller intake · {offering.shortTitle}</p><h2>Place an offering<br /><em>with context.</em></h2><p className="contact-note">No seller dashboard is required. We review each submission before sharing or publishing it. Required documents depend on the offering category.</p><div className="document-note"><strong>For {offering.shortTitle}:</strong><span>{offering.sellerFields}</span></div><div className="mode-switch" role="tablist" aria-label="Inquiry type"><button className={enquiryMode === "seller" ? "selected" : ""} onClick={() => setEnquiryMode("seller")} type="button">Seller / owner</button><button className={enquiryMode === "buyer" ? "selected" : ""} onClick={() => setEnquiryMode("buyer")} type="button">Prospective buyer</button></div></div><form className="inquiry-form" onSubmit={submitSellerForm}><label>Offering category<select value={activeOffering} onChange={(event) => setActiveOffering(event.target.value as OfferingId)}>{offerings.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>Name or company<input name="name" placeholder="Your name or company" required /></label><label>Email<input name="email" type="email" placeholder="you@company.com" required /></label><label>Phone / WhatsApp<input name="phone" placeholder="+234 ..." required /></label><label>Location<input name="location" placeholder="City, state, country" required /></label><label>Offering title<input name="title" placeholder="What are you offering?" required /></label><label>Asking price or terms<input name="terms" placeholder="Price, lease terms or ask" required /></label><label>Photos and media<input name="media" type="file" accept={offering.mediaAccept} multiple /></label><label>{offering.documentLabel}<input name="documents" type="file" accept="application/pdf,image/jpeg,image/png" multiple /></label><p className="upload-note">Files are selected for secure intake. A production upload endpoint will store documents privately before review.</p><button className="button button-dark" type="submit">Continue on WhatsApp <span>↗</span></button></form></div></section>

      <section className="process shell section-space" id="process"><div className="section-heading"><div><p className="eyebrow accent">A more useful process</p><h2>From first brief<br /><em>to clear next step.</em></h2></div><p>Every conversation begins with context. We qualify the requirement, confirm the opportunity and keep communication moving through one trusted channel.</p></div><div className="process-list"><div><span>01</span><h3>Tell us what you need</h3><p>Buyer inquiry, seller mandate or a broader brief.</p></div><div><span>02</span><h3>We qualify the fit</h3><p>Our team reviews the details and available routes.</p></div><div><span>03</span><h3>Move with confidence</h3><p>Receive a clear response and a practical next step.</p></div></div></section>

      <section className="contact section-space" id="inquiry"><div className="shell contact-grid"><div><p className="eyebrow accent">Prospective buyers</p><h2>Tell us what<br /><em>you are seeking.</em></h2><p className="contact-note">Use the category selector above or message PrimeQuest directly for a buyer brief tailored to vessels, energy, land or agriculture.</p></div><div className="buyer-actions">{offerings.map((item) => <a className="buyer-link" key={item.id} href={whatsappLink(buyerMessage(item))} target="_blank" rel="noreferrer"><span>Looking for {item.shortTitle.toLowerCase()}</span><span>WhatsApp ↗</span></a>)}</div></div></section>

      <footer className="footer" id="contact"><div className="shell footer-grid"><a className="brand" href="#top"><span className="brand-mark">PQ</span><span><strong>PRIMEQUEST</strong><small>OIL · VESSELS · PROPERTIES</small></span></a><p>Connecting genuine sellers<br />with genuine buyers.</p><div><a href={whatsappLink("Hello PrimeQuest, I have a general inquiry.")} target="_blank" rel="noreferrer">WhatsApp PrimeQuest ↗</a><a href="mailto:primequestoilandpropertyconsul@gmail.com">primequestoilandpropertyconsul@gmail.com</a><a href="tel:+2348036598189">+234 803 659 8189</a></div></div><div className="shell footer-bottom"><span>© 2026 PrimeQuest Oil and Properties Consultants</span><span>Asaba · Delta State · Nigeria</span></div></footer>
    </main>
  );
}
