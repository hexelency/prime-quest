import type { Offering } from "@/lib/offerings";

type ConversionSectionsProps = { offerings: readonly Offering[]; buyerLink: (message: string) => string; buyerMessage: (offering: Offering) => string };

export function MandateSection() {
  return <section className="mandate section-space" id="mandate"><div className="shell mandate-grid"><div><p className="eyebrow light-accent">For owners & sellers</p><h2>Have a mandate<br /><em>worth placing?</em></h2></div><div><p>Put your vessel, property, energy or agricultural offering in front of a serious network. Share the essentials privately and our team will guide the next step.</p><a className="button button-light" href="/mandate">Submit a mandate <span>↗</span></a></div></div></section>;
}

export function SellerGuideSection() {
  return <section className="seller-section section-space" id="seller-guide"><div className="shell contact-grid"><div><p className="eyebrow accent">For owners & sellers</p><h2>Place an offering<br /><em>with context.</em></h2><p className="contact-note">No seller dashboard is required. Start with a short guided submission and PrimeQuest will review your offering before publishing or introducing it.</p><div className="document-note"><strong>What you can prepare</strong><span>Offering details, location, asking terms, photos and supporting documents where relevant. Requirements change by category.</span></div></div><div className="mandate-guide"><p className="state-label">One clear submission</p><h3>Tell us what you have.</h3><p>Use the dedicated mandate page to select your category, provide the right details and attach the appropriate media or documents.</p><a className="button button-dark" href="/mandate">Open seller mandate <span>↗</span></a></div></div></section>;
}

export function BuyerSection({ offerings, buyerLink, buyerMessage }: ConversionSectionsProps) {
  return <section className="contact section-space" id="inquiry"><div className="shell contact-grid"><div><p className="eyebrow accent">Prospective buyers</p><h2>Tell us what<br /><em>you are seeking.</em></h2><p className="contact-note">Use the shared intake to submit a consented buyer brief, or message PrimeQuest directly for a quick conversation.</p><a className="button button-dark" href="/request">Open buyer or seller form <span>↗</span></a></div><div className="buyer-actions">{offerings.map((item) => <a className="buyer-link" key={item.id} href={buyerLink(buyerMessage(item))} target="_blank" rel="noreferrer"><span>Looking for {item.shortTitle.toLowerCase()}</span><span>WhatsApp ↗</span></a>)}</div></div></section>;
}

export function HomeFooter({ buyerLink }: { buyerLink: (message: string) => string }) {
  return <footer className="footer" id="contact"><div className="shell footer-grid"><a className="brand" href="#top"><span className="brand-mark">PQ</span><span><strong>PRIMEQUEST</strong><small>OIL · VESSELS · PROPERTIES</small></span></a><p>Connecting genuine sellers<br />with genuine buyers.</p><div><a href="/about">About PrimeQuest ↗</a><a href="/privacy">Privacy policy</a><a href="/terms">Terms of listing</a><a href={buyerLink("Hello PrimeQuest, I have a general inquiry.")} target="_blank" rel="noreferrer">WhatsApp PrimeQuest ↗</a><a href="mailto:primequestoilandpropertyconsul@gmail.com">primequestoilandpropertyconsul@gmail.com</a><a href="tel:+2348036598189">+234 803 659 8189</a></div></div><div className="shell footer-bottom"><span>© 2026 PrimeQuest Oil and Properties Consultants</span><span>Asaba · Delta State · Nigeria</span></div></footer>;
}
