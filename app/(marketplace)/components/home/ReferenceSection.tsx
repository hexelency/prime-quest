import { motion, useReducedMotion, type Variants } from "framer-motion";

const referenceCards: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

const referenceReveal: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 110, damping: 18 } },
};

export default function ReferenceSection() {
  const reduceMotion = useReducedMotion();

  return <section className="reference-section section-space"><div className="shell"><div className="section-heading"><div><p className="eyebrow accent">People & track record</p><h2>Confidence comes<br /><em>with context.</em></h2></div><p>For users who want to understand who they are speaking with before they inquire, PrimeQuest keeps its reference process clear and permission-based.</p></div><motion.div className="reference-grid" variants={referenceCards} initial={reduceMotion ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.2 }}><motion.article variants={referenceReveal}><span>01</span><h3>Professional references</h3><p>Reference contacts and relationship details are shared with permission and where appropriate to the engagement.</p><strong>Available on request</strong></motion.article><motion.article variants={referenceReveal}><span>02</span><h3>Past contract experience</h3><p>Relevant past contract summaries can be presented with approved parties, subject to confidentiality and client permission.</p><strong>Presented with authorization</strong></motion.article><motion.article variants={referenceReveal}><span>03</span><h3>Documented process</h3><p>Mandates, supporting documents and listing decisions follow a review path before an opportunity is published.</p><strong>Review-led introductions</strong></motion.article></motion.div></div></section>;
}
