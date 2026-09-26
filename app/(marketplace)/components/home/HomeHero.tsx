import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Offering } from "@/lib/offerings";

const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.12, staggerChildren: 0.12 } },
};

const heroReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

type HomeHeroProps = {
  offering: Offering;
  buyerHref: string;
  ready: boolean;
};

export default function HomeHero({ offering, buyerHref, ready }: HomeHeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="hero" id="top">
      <motion.div className="hero-backdrop" key={offering.id} aria-hidden="true" initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }} animate={ready || reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }} transition={{ duration: reduceMotion ? 0 : 1.05, ease: "easeOut" }} style={{ backgroundImage: `linear-gradient(90deg, rgba(13, 29, 26, .94) 0%, rgba(13, 29, 26, .68) 48%, rgba(13, 29, 26, .25) 100%), url(${offering.background})` }} />
      <div className="hero-content shell"><motion.div className="hero-carousel-frame" variants={heroStagger} initial={reduceMotion ? "visible" : "hidden"} animate={ready || reduceMotion ? "visible" : "hidden"}><motion.p className="eyebrow" variants={heroReveal}>Independent consultancy · Asaba, Nigeria</motion.p><motion.h1 variants={heroReveal}>{offering.heroTitle.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}<em>{index === 1 ? line : ""}</em>{index === 0 ? line : ""}</span>)}</motion.h1><motion.p className="hero-copy" variants={heroReveal}>{offering.heroCopy}</motion.p><motion.div className="hero-actions" variants={heroReveal}><a className="button button-primary" href={buyerHref} target="_blank" rel="noreferrer">I am looking to buy <span>↗</span></a><a className="text-link" href="/mandate">I have an offering <span>Tell us about it →</span></a></motion.div></motion.div></div>
      <motion.div className="hero-meta shell" variants={heroReveal} initial={reduceMotion ? "visible" : "hidden"} animate={ready || reduceMotion ? "visible" : "hidden"} transition={{ delay: reduceMotion ? 0 : 0.55 }}><span>{offering.number} / 04</span><span className="hero-line" /><span>{offering.shortTitle} · private mandate & brokerage</span></motion.div>
    </section>
  );
}
