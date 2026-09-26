import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Offering, OfferingId } from "@/lib/offerings";

const serviceStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const serviceReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

type ServicesSectionProps = {
  offerings: readonly Offering[];
  activeOffering: OfferingId;
  onOfferingSelect: (id: OfferingId) => void;
};

export default function ServicesSection({ offerings, activeOffering, onOfferingSelect }: ServicesSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="portfolio section-space" id="portfolio"><div className="shell"><div className="section-heading"><div><p className="eyebrow accent">What we do</p><h2>Our services</h2></div><p>Choose a service to view its dedicated listing space, request an opportunity or place a mandate with PrimeQuest.</p></div><motion.div className="service-grid" variants={serviceStagger} initial={reduceMotion ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.18 }}>{offerings.map((item) => <motion.a className={activeOffering === item.id ? "service-card active" : "service-card"} href={`/offerings/${item.id}#available`} key={item.id} onClick={() => onOfferingSelect(item.id)} variants={serviceReveal} whileHover={reduceMotion ? undefined : { y: -5 }} transition={{ duration: 0.2, ease: "easeOut" }}><span className="service-number">{item.number}</span><h3>{item.title}</h3><p>{item.text}</p><span className="service-link">View available service <span>↗</span></span></motion.a>)}</motion.div></div></section>
  );
}
