import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Offering } from "@/lib/offerings";

type ConversionSectionsProps = { offerings: readonly Offering[]; buyerLink: (message: string) => string; buyerMessage: (offering: Offering) => string };

const mandateRise: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, type: "spring", stiffness: 90, damping: 20 } },
};

const sellerGuideFocus: Variants = {
  hidden: { opacity: 0, scale: 0.96, filter: "blur(7px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: "easeOut" } },
};

const buyerContentReveal: Variants = {
  hidden: { opacity: 0, x: -26 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

const buyerActionsStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const buyerActionReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function MandateSection() {
  const reduceMotion = useReducedMotion();

  return <motion.section className="mandate section-space" id="mandate" initial={reduceMotion ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.28 }}><div className="shell mandate-grid"><motion.div variants={mandateRise}><p className="eyebrow light-accent">For owners & sellers</p><h2>Have a mandate<br /><em>worth placing?</em></h2></motion.div><motion.div variants={mandateRise} transition={{ delay: reduceMotion ? 0 : 0.12 }}><p>Put your vessel, property, energy or agricultural offering in front of a serious network. Share the essentials privately and our team will guide the next step.</p><a className="button button-light" href="/mandate">Submit a mandate <span>↗</span></a></motion.div></div></motion.section>;
}

export function SellerGuideSection() {
  const reduceMotion = useReducedMotion();

  return <motion.section className="seller-section section-space" id="seller-guide" initial={reduceMotion ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.22 }}><div className="shell contact-grid"><motion.div variants={sellerGuideFocus}><p className="eyebrow accent">For owners & sellers</p><h2>Place an offering<br /><em>with context.</em></h2><p className="contact-note">No seller dashboard is required. Start with a short guided submission and PrimeQuest will review your offering before publishing or introducing it.</p><div className="document-note"><strong>What you can prepare</strong><span>Offering details, location, asking terms, photos and supporting documents where relevant. Requirements change by category.</span></div></motion.div><motion.div className="mandate-guide" variants={sellerGuideFocus} transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.14, ease: "easeOut" }}><p className="state-label">One clear submission</p><h3>Tell us what you have.</h3><p>Use the dedicated mandate page to select your category, provide the right details and attach the appropriate media or documents.</p><a className="button button-dark" href="/mandate">Open seller mandate <span>↗</span></a></motion.div></div></motion.section>;
}

export function BuyerSection({ offerings, buyerLink, buyerMessage }: ConversionSectionsProps) {
  const reduceMotion = useReducedMotion();

  return <motion.section className="contact section-space" id="inquiry" initial={reduceMotion ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.2 }}><div className="shell contact-grid"><motion.div variants={buyerContentReveal}><p className="eyebrow accent">Prospective buyers</p><h2>Tell us what<br /><em>you are seeking.</em></h2><p className="contact-note">Use the category selector above or message PrimeQuest directly for a buyer brief tailored to vessels, energy, land or agriculture.</p></motion.div><motion.div className="buyer-actions" variants={buyerActionsStagger}>{offerings.map((item) => <motion.a className="buyer-link" key={item.id} href={buyerLink(buyerMessage(item))} target="_blank" rel="noreferrer" variants={buyerActionReveal}><span>Looking for {item.shortTitle.toLowerCase()}</span><span>WhatsApp ↗</span></motion.a>)}</motion.div></div></motion.section>;
}

export function HomeFooter({ buyerLink }: { buyerLink: (message: string) => string }) {
  return (
    <footer className="footer" id="contact">
      <div className="shell footer-grid">
        <a className="brand" href="#top">
          <Image className="brand-logo" src="/logo/official-logo.png" alt="" width={150} height={150} />
          <span><strong>PRIMEQUEST</strong><small>OIL · VESSELS · PROPERTIES</small></span>
        </a>
        <p>Connecting genuine sellers<br />with genuine buyers.</p>
        <div>
          <a href="/about">About PrimeQuest ↗</a>
          <a href="/mission">Our mission</a>
          <a href="/faq">FAQs</a>
          <a href="/privacy">Privacy policy</a>
          <a href="/terms">Terms of listing</a>
          <a href="/contact">Contact us</a>
          <div className="footer-social-links" role="group" aria-label="PrimeQuest social channels">
            <a className="footer-social-link" href="https://www.facebook.com/share/1CT3Bc6jrf/" target="_blank" rel="noreferrer" aria-label="PrimeQuest on Facebook" title="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H8.2v3h2.6v8h2.7Z" /></svg>
              <span>Facebook</span>
            </a>
            <a className="footer-social-link" href="https://www.linkedin.com/in/ugochukwu-lawrence-festus-94470a439" target="_blank" rel="noreferrer" aria-label="PrimeQuest on LinkedIn" title="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.2 8.1A1.7 1.7 0 1 0 6.2 4.7a1.7 1.7 0 0 0 0 3.4ZM4.8 9.5h2.8V19H4.8V9.5Zm4.6 0h2.7v1.3h.1c.4-.8 1.4-1.7 2.9-1.7 3.1 0 3.7 2 3.7 4.6V19H16v-4.7c0-1.1 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5V19H9.4V9.5Z" /></svg>
              <span>LinkedIn</span>
            </a>
            <a className="footer-social-link" href="https://www.instagram.com/primequest2026/" target="_blank" rel="noreferrer" aria-label="PrimeQuest on Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.7" r="1" fill="currentColor" /></svg>
              <span>Instagram</span>
            </a>
            <a className="footer-social-link" href={buyerLink("Hello PrimeQuest, I have a general inquiry.")} target="_blank" rel="noreferrer" aria-label="Message PrimeQuest on WhatsApp" title="WhatsApp">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.5 11.4a8.3 8.3 0 0 1-12.3 7.3L4 20l1.4-4.1A8.3 8.3 0 1 1 20.5 11.4Z" stroke="currentColor" strokeWidth="1.7" /><path d="M8.2 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.5c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3-.1.5-.4.7-.4.3-1 .4-1.5.2-2.8-.8-5-3-5.8-5.8-.2-.5-.1-1.1.2-1.7Z" fill="currentColor" /></svg>
              <span>WhatsApp</span>
            </a>
          </div>
          <a href="mailto:info@primequest.com.ng">info@primequest.com.ng</a>
          <a href="tel:+2348036598189">+234 803 659 8189</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 PrimeQuest Oil and Properties Consultants</span>
        <span>Asaba · Delta State · Nigeria</span>
      </div>
    </footer>
  );
}
