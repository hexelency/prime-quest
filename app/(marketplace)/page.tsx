"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { offerings, type OfferingId } from "@/lib/offerings";
import { categoryListings, type ListingTab, vesselListings as vesselListings } from "@/lib/demo-listings";
import HomeHero from "@/app/(marketplace)/components/home/HomeHero";
import ServicesSection from "@/app/(marketplace)/components/home/ServicesSection";
import { IntroSection, ProcessSection } from "@/app/(marketplace)/components/home/EditorialSections";
import { FaqSection, TrustSections } from "@/app/(marketplace)/components/home/TrustSections";
import { BuyerSection, HomeFooter, MandateSection, SellerGuideSection } from "@/app/(marketplace)/components/home/ConversionSections";
import ReferenceSection from "@/app/(marketplace)/components/home/ReferenceSection";
import AvailableSection from "@/app/(marketplace)/components/home/AvailableSection";
import BusinessInfo from "@/app/(marketplace)/components/BusinessInfo";
import VesselTracking from "@/app/(marketplace)/components/VesselTracking";
import PrimeQuestChat from "@/app/(marketplace)/components/PrimeQuestChat";

const WHATSAPP_NUMBER = "2348036598189";

function whatsappLink(message: string) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buyerMessage(offering: (typeof offerings)[number]) {
    return `Hello PrimeQuest, I am a prospective buyer/client looking for ${offering.shortTitle.toLowerCase()} opportunities.\n\nMy brief:\n- Offering: ${offering.title}\n- Location / preferred market: \n- Budget or range: \n- Timeline: \n- Additional requirements: \n\nPlease share suitable verified opportunities when available.`;
}

function SectionConnector() {
    return <div className="section-connector" aria-hidden="true"><span /></div>;
}

type SectionEntranceProps = {
    children: React.ReactNode;
    delay?: number;
    direction?: "up" | "left" | "right";
};

function SectionEntrance({ children, delay = 0, direction = "up" }: SectionEntranceProps) {
    const reduceMotion = useReducedMotion();
    const offset = direction === "left" ? { x: -28 } : direction === "right" ? { x: 28 } : { y: 24 };
    return <motion.div initial={reduceMotion ? false : { opacity: 0, ...offset }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.65, delay: reduceMotion ? 0 : delay, ease: "easeOut" }}>{children}</motion.div>;
}

const loaderSlogans = ["Powering energy.", "Building values.", "Securing futures."];

function LoaderSlogans({ reduceMotion, onCycleComplete }: { reduceMotion: boolean; onCycleComplete: (complete: boolean) => void }) {
    const [activeSlogan, setActiveSlogan] = useState(0);

    useEffect(() => {
        if (reduceMotion) return;
        const timeout = window.setTimeout(() => {
            const next = (activeSlogan + 1) % loaderSlogans.length;
            setActiveSlogan(next);
            if (next === 0) onCycleComplete(true);
        }, 1650);
        return () => window.clearTimeout(timeout);
    }, [activeSlogan, onCycleComplete, reduceMotion]);

    const slogan = loaderSlogans[activeSlogan];

    return (
        <div className="homepage-loader-copy" aria-hidden="true">
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    className="homepage-loader-slogan"
                    key={activeSlogan}
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                                transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeInOut" }}
                >
                    {reduceMotion
                        ? slogan
                        : slogan.split("").map((character, index) => (
                            <motion.span
                                className="homepage-loader-character"
                                key={`${activeSlogan}-${index}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.025, duration: 0.05 }}
                            >
                                {character === " " ? "\u00a0" : character}
                            </motion.span>
                        ))}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}

export default function Home() {
    const [activeOffering, setActiveOffering] = useState<OfferingId>("vessels");
    const [activeListingTab, setActiveListingTab] = useState<ListingTab>("vessels");
    const [availabilityLoaded, setAvailabilityLoaded] = useState(false);
    const [sloganCycleComplete, setSloganCycleComplete] = useState(false);
    const [loaderVisible, setLoaderVisible] = useState(true);
    const reduceMotion = useReducedMotion();
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

    useEffect(() => {
        if (!availabilityLoaded || (!reduceMotion && !sloganCycleComplete)) return;
        const timeout = window.setTimeout(() => setLoaderVisible(false), reduceMotion ? 0 : 550);
        return () => window.clearTimeout(timeout);
    }, [availabilityLoaded, reduceMotion, sloganCycleComplete]);

    return (
        <main>
                        <HomeHero offering={offering} buyerHref={whatsappLink(buyerMessage(offering))} ready={availabilityLoaded} />

            <SectionEntrance direction="left"><IntroSection /></SectionEntrance>

            <SectionConnector />

            <SectionEntrance delay={0.04}><AvailableSection onDataLoaded={setAvailabilityLoaded} /></SectionEntrance>

            <SectionEntrance direction="right"><VesselTracking /></SectionEntrance>

            <SectionConnector />

            <SectionEntrance direction="left"><ReferenceSection /></SectionEntrance>

            <SectionConnector />

            <SectionEntrance direction="right">
            <section className="vessels shell section-space" id="vessels"><div className="section-heading vessel-heading"><div><p className="eyebrow accent">Available opportunities</p><h2>Listings, when<br /><em>the fit is right.</em></h2></div><p>Browse current PrimeQuest opportunities by category. Contact us for the latest availability, documentation and qualification status.</p></div><div className="listing-tabs" role="tablist" aria-label="Listing categories"><button className={activeListingTab === "vessels" ? "selected" : ""} onClick={() => setActiveListingTab("vessels")} role="tab" type="button">Vessels</button>
            <button className={activeListingTab === "land" ? "selected" : ""} onClick={() => setActiveListingTab("land")} role="tab" type="button">Land</button>
            <button className={activeListingTab === "track-farms" ? "selected" : ""} onClick={() => setActiveListingTab("track-farms")} role="tab" type="button">Track farms</button>
            <button className={activeListingTab === "property" ? "selected" : ""} onClick={() => setActiveListingTab("property")} role="tab" type="button">Property</button></div>
            {activeListingTab === "vessels" ? <>
            <div className="vessel-table-wrap"><table className="vessel-table"><caption className="sr-only">Demo vessel listings Q1 through Q8</caption><thead><tr><th>Ref</th><th>Vessel</th><th>Type</th><th>Location</th><th>Length</th><th>Year</th><th>Status</th><th /></tr></thead><tbody>{vesselListings.map((listing) => <tr key={listing.ref}><td data-label="Ref">{listing.ref}</td><td data-label="Vessel"><strong>{listing.name}</strong></td><td data-label="Type">{listing.type}</td><td data-label="Location">{listing.location}</td><td data-label="Length">{listing.length}</td><td data-label="Year">{listing.year}</td><td data-label="Status"><span className="table-status">{listing.status}</span></td><td><a className="table-link" href={whatsappLink(`Hello PrimeQuest, I would like more information about demo vessel ${listing.ref}.`)} target="_blank" rel="noreferrer">Inquire ↗</a></td></tr>)}</tbody></table></div><div className="vessel-mobile-cards">{vesselListings.map((listing) => <article className="vessel-mobile-card" key={listing.ref}><img src={listing.image} alt={`Dummy image representing ${listing.type}`} loading="lazy" /><div className="vessel-card-body"><div className="vessel-card-top"><span className="service-number">{listing.ref}</span><span className="table-status">{listing.status}</span></div><h3>{listing.name}</h3><p>{listing.type}</p><span>{listing.location}</span><a className="table-link" href={whatsappLink(`Hello PrimeQuest, I would like more information about demo vessel ${listing.ref}.`)} target="_blank" rel="noreferrer">Inquire ↗</a></div></article>)}</div></> : <div className="category-listings">{categoryListings[activeListingTab].map((listing) => <article key={listing.ref}><span className="service-number">{listing.ref}</span><h3>{listing.name}</h3><p>{listing.detail}</p><span className="table-status">{listing.status}</span><a className="table-link" href={whatsappLink(`Hello PrimeQuest, I would like more information about demo listing ${listing.ref}.`)} target="_blank" rel="noreferrer">Inquire ↗</a></article>)}</div>}</section>

            </SectionEntrance>

            <SectionEntrance direction="left"><MandateSection /></SectionEntrance>

            <SectionConnector />

            <SectionEntrance direction="right"><SellerGuideSection /></SectionEntrance>

            <SectionConnector />

            <SectionEntrance direction="left"><ProcessSection /></SectionEntrance>

            <SectionEntrance delay={0.04}><FaqSection /></SectionEntrance>

            <SectionEntrance direction="left"><TrustSections /></SectionEntrance>

            <SectionEntrance direction="right"><ServicesSection offerings={offerings} activeOffering={activeOffering} onOfferingSelect={chooseOffering} /></SectionEntrance>

            <SectionEntrance direction="left"><BuyerSection offerings={offerings} buyerLink={whatsappLink} buyerMessage={buyerMessage} /></SectionEntrance>

            <SectionEntrance direction="right"><BusinessInfo /></SectionEntrance>

            <SectionEntrance><HomeFooter buyerLink={whatsappLink} /></SectionEntrance>
            <PrimeQuestChat />
            <AnimatePresence>
                {loaderVisible && (
                    <motion.div
                        className="homepage-loader"
                        role="status"
                        aria-label="Powering energy. Building values, securing futures."
                        aria-busy={!availabilityLoaded}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
                    >
                        <div className="homepage-loader-content">
                            <div className="homepage-loader-mark">
                                <motion.span className="homepage-loader-orbit" aria-hidden="true" animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }} transition={reduceMotion ? { duration: 0 } : { duration: 7, ease: "linear", repeat: Infinity }} />
                                <motion.span className="homepage-loader-orbit homepage-loader-orbit-inner" aria-hidden="true" animate={reduceMotion ? { rotate: 0 } : { rotate: -360 }} transition={reduceMotion ? { duration: 0 } : { duration: 10, ease: "linear", repeat: Infinity }} />
                                <motion.div
                                    className="homepage-loader-logo"
                                    initial={reduceMotion ? false : { opacity: 0, scale: 0.78 }}
                                    animate={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: [1, 1.045, 1] }}
                                    transition={reduceMotion ? { duration: 0 } : { opacity: { duration: 0.45 }, scale: { duration: 1.8, ease: "easeInOut", repeat: Infinity } }}
                                >
                                    <Image src="/logo/official-logo.png" alt="" width={150} height={150} priority />
                                </motion.div>
                            </div>
                            <p className="homepage-loader-title">PrimeQuest</p>
                            <LoaderSlogans reduceMotion={Boolean(reduceMotion)} onCycleComplete={setSloganCycleComplete} />
                            <div className="homepage-loader-track" aria-hidden="true">
                                <motion.span
                                    animate={reduceMotion ? { x: 0 } : { x: ["-100%", "320%"] }}
                                    transition={reduceMotion ? { duration: 0 } : { duration: 1.3, ease: "easeInOut", repeat: Infinity }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
