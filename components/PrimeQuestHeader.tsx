"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PrimeQuestHeaderProps = {
  whatsappHref: string;
};

export default function PrimeQuestHeader({ whatsappHref }: PrimeQuestHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const closeNavigation = () => setMobileNavOpen(false);

  return (
    <>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="PrimeQuest home">
          <span className="brand-mark">PQ</span>
          <span><strong>PRIMEQUEST</strong><small>OIL · VESSELS · PROPERTIES</small></span>
        </a>
        <div className="nav-links">
          <a href="/#portfolio">Portfolio</a>
          <a href="/mandate">List with us</a>
          <a href="/#process">How it works</a>
          <a href="/#contact">Contact</a>
        </div>
        <a className="button button-small button-outline desktop-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp us <span>↗</span></a>
        <button className="menu-toggle" type="button" aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}><span /><span /><span /></button>
      </nav>

      {portalReady && createPortal(
        <>
          <div className={`mobile-nav-backdrop ${mobileNavOpen ? "open" : ""}`} onClick={closeNavigation} aria-hidden="true" />
          <aside className={`mobile-drawer ${mobileNavOpen ? "open" : ""}`} aria-label="Mobile navigation">
            <div className="mobile-drawer-head"><span>Menu</span><button type="button" onClick={closeNavigation} aria-label="Close navigation">×</button></div>
            <div className="mobile-drawer-links">
              <a href="/#portfolio" onClick={closeNavigation}>Portfolio <span>↗</span></a>
              <a href="/mandate" onClick={closeNavigation}>List with us <span>↗</span></a>
              <a href="/#process" onClick={closeNavigation}>How it works <span>↗</span></a>
              <a href="/#contact" onClick={closeNavigation}>Contact <span>↗</span></a>
              <a className="mobile-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer" onClick={closeNavigation}>WhatsApp us <span>↗</span></a>
            </div>
          </aside>
        </>,
        document.body,
      )}
    </>
  );
}
