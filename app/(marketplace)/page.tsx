"use client";

import { useEffect, useState } from "react";
import { offerings, type OfferingId } from "@/lib/offerings";
import { demoCategoryListings, type ListingTab, vesselDemoListings } from "@/lib/demo-listings";
import HomeHero from "@/app/(marketplace)/components/home/HomeHero";
import ServicesSection from "@/app/(marketplace)/components/home/ServicesSection";
import { IntroSection, ProcessSection } from "@/app/(marketplace)/components/home/EditorialSections";
import { FaqSection, TrustSections } from "@/app/(marketplace)/components/home/TrustSections";
import { BuyerSection, HomeFooter, MandateSection, SellerGuideSection } from "@/app/(marketplace)/components/home/ConversionSections";
import ReferenceSection from "@/app/(marketplace)/components/home/ReferenceSection";
import AvailableSection from "@/app/(marketplace)/components/home/AvailableSection";
import PrimeQuestChat from "@/app/(marketplace)/components/PrimeQuestChat";

const WHATSAPP_NUMBER = "2348038128933";

function whatsappLink(message: string) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buyerMessage(offering: (typeof offerings)[number]) {
    return `Hello PrimeQuest, I am a prospective buyer/client looking for ${offering.shortTitle.toLowerCase()} opportunities.\n\nMy brief:\n- Offering: ${offering.title}\n- Location / preferred market: \n- Budget or range: \n- Timeline: \n- Additional requirements: \n\nPlease share suitable verified opportunities when available.`;
}

export default function Home() {
    const [activeOffering, setActiveOffering] = useState<OfferingId>("vessels");
    const [activeListingTab, setActiveListingTab] = useState<ListingTab>("vessels");
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
            <HomeHero offering={offering} buyerHref={whatsappLink(buyerMessage(offering))} />

            <IntroSection />

            <AvailableSection />

            <ReferenceSection />

            <section className="vessels shell section-space" id="vessels"><div className="section-heading vessel-heading"><div><p className="eyebrow accent">Available opportunities</p><h2>Listings, when<br /><em>the fit is right.</em></h2></div><p>Browse the intended marketplace structure by category. The inventory below is clearly marked demo data until approved PrimeQuest listings are connected.</p></div><div className="listing-tabs" role="tablist" aria-label="Listing categories"><button className={activeListingTab === "vessels" ? "selected" : ""} onClick={() => setActiveListingTab("vessels")} role="tab" type="button">Vessels</button>
            <button className={activeListingTab === "land" ? "selected" : ""} onClick={() => setActiveListingTab("land")} role="tab" type="button">Land</button>
            <button className={activeListingTab === "track-farms" ? "selected" : ""} onClick={() => setActiveListingTab("track-farms")} role="tab" type="button">Track farms</button>
            <button className={activeListingTab === "property" ? "selected" : ""} onClick={() => setActiveListingTab("property")} role="tab" type="button">Property</button></div>
            <div className="demo-warning">DEMO DATA — NOT A REAL LISTING. Replace these rows with approved inventory before publishing.</div>{activeListingTab === "vessels" ? <>
            <div className="vessel-table-wrap"><table className="vessel-table"><caption className="sr-only">Demo vessel listings Q1 through Q8</caption><thead><tr><th>Ref</th><th>Vessel</th><th>Type</th><th>Location</th><th>Length</th><th>Year</th><th>Status</th><th /></tr></thead><tbody>{vesselDemoListings.map((listing) => <tr key={listing.ref}><td data-label="Ref">{listing.ref}</td><td data-label="Vessel"><strong>{listing.name}</strong></td><td data-label="Type">{listing.type}</td><td data-label="Location">{listing.location}</td><td data-label="Length">{listing.length}</td><td data-label="Year">{listing.year}</td><td data-label="Status"><span className="table-status">{listing.status}</span></td><td><a className="table-link" href={whatsappLink(`Hello PrimeQuest, I would like more information about demo vessel ${listing.ref}.`)} target="_blank" rel="noreferrer">Inquire ↗</a></td></tr>)}</tbody></table></div><div className="vessel-mobile-cards">{vesselDemoListings.map((listing) => <article className="vessel-mobile-card" key={listing.ref}><img src={listing.image} alt={`Dummy image representing ${listing.type}`} loading="lazy" /><div className="vessel-card-body"><div className="vessel-card-top"><span className="service-number">{listing.ref}</span><span className="table-status">{listing.status}</span></div><h3>{listing.name}</h3><p>{listing.type}</p><span>{listing.location}</span><a className="table-link" href={whatsappLink(`Hello PrimeQuest, I would like more information about demo vessel ${listing.ref}.`)} target="_blank" rel="noreferrer">Inquire ↗</a></div></article>)}</div></> : <div className="category-listings">{demoCategoryListings[activeListingTab].map((listing) => <article key={listing.ref}><span className="service-number">{listing.ref}</span><h3>{listing.name}</h3><p>{listing.detail}</p><span className="table-status">{listing.status}</span><a className="table-link" href={whatsappLink(`Hello PrimeQuest, I would like more information about demo listing ${listing.ref}.`)} target="_blank" rel="noreferrer">Inquire ↗</a></article>)}</div>}</section>

            <MandateSection />

            <SellerGuideSection />

            <ProcessSection />

            <FaqSection />

            <TrustSections />

            <ServicesSection offerings={offerings} activeOffering={activeOffering} onOfferingSelect={chooseOffering} />

            <BuyerSection offerings={offerings} buyerLink={whatsappLink} buyerMessage={buyerMessage} />

            <HomeFooter buyerLink={whatsappLink} />
            <PrimeQuestChat />
        </main>
    );
}
