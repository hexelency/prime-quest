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

  useEffect(() => {
    if (!mobileNavOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileNavOpen]);

  const closeNavigation = () => setMobileNavOpen(false);

  return (
    <>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="PrimeQuest home">
          <span className="brand-mark">PQ</span>
          <span><strong>PRIMEQUEST</strong><small>OIL · VESSELS · PROPERTIES</small></span>
        </a>
        <div className="nav-links">
          <details className="nav-dropdown">
            <summary>Services <span>⌄</span></summary>
            <div className="nav-dropdown-menu"><a href="/#portfolio">Services overview <span>↗</span></a><a href="/#available-listings">Available now <span>↗</span></a><a href="/offerings/vessels#available">Vessels <span>↗</span></a><a href="/offerings/property#available">Properties <span>↗</span></a><a href="/offerings/energy#available">Oil & gas <span>↗</span></a><a href="/offerings/agriculture#available">Land & agriculture <span>↗</span></a></div>
          </details>
          <a href="/#available-listings">Available</a>
          <details className="nav-dropdown">
            <summary>How it works <span>⌄</span></summary>
            <div className="nav-dropdown-menu"><a href="/#inquiry">For buyers <span>↗</span></a><a href="/mandate">For sellers <span>↗</span></a></div>
          </details>
          <a href="/about">About us</a>
          <a href="/#contact">Contact</a>
        </div>
        <a className="button button-small button-outline desktop-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp us <span>↗</span></a>
        <button className="menu-toggle" type="button" aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"} aria-controls="mobile-navigation-drawer" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}><span /><span /><span /></button>
      </nav>

      {portalReady && createPortal(
        <>
          <div className={`mobile-nav-backdrop ${mobileNavOpen ? "open" : ""}`} onClick={closeNavigation} aria-hidden="true" />
          <aside id="mobile-navigation-drawer" className={`mobile-drawer ${mobileNavOpen ? "open" : ""}`} aria-label="Mobile navigation" aria-hidden={!mobileNavOpen}>
            <div className="mobile-drawer-head"><span>Menu</span><button type="button" onClick={closeNavigation} aria-label="Close navigation">×</button></div>
            <div className="mobile-drawer-links">
              <details className="mobile-nav-dropdown"><summary>Services <span>⌄</span></summary><div><a href="/#portfolio" onClick={closeNavigation}>Services overview <span>↗</span></a><a href="/#available-listings" onClick={closeNavigation}>Available now <span>↗</span></a><a href="/offerings/vessels#available" onClick={closeNavigation}>Vessels <span>↗</span></a><a href="/offerings/property#available" onClick={closeNavigation}>Properties <span>↗</span></a><a href="/offerings/energy#available" onClick={closeNavigation}>Oil & gas <span>↗</span></a><a href="/offerings/agriculture#available" onClick={closeNavigation}>Land & agriculture <span>↗</span></a></div></details>
              <a href="/#available-listings" onClick={closeNavigation}>Available <span>↗</span></a>
              <details className="mobile-nav-dropdown"><summary>How it works <span>⌄</span></summary><div><a href="/#inquiry" onClick={closeNavigation}>For buyers <span>↗</span></a><a href="/mandate" onClick={closeNavigation}>For sellers <span>↗</span></a></div></details>
              <a href="/about" onClick={closeNavigation}>About us <span>↗</span></a>
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
