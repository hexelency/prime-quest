import type { Offering } from "@/lib/offerings";

type HomeHeroProps = {
  offering: Offering;
  buyerHref: string;
};

export default function HomeHero({ offering, buyerHref }: HomeHeroProps) {
  return (
    <section className="hero" id="top">
      <div className="hero-backdrop" key={offering.id} aria-hidden="true" style={{ backgroundImage: `linear-gradient(90deg, rgba(13, 29, 26, .94) 0%, rgba(13, 29, 26, .68) 48%, rgba(13, 29, 26, .25) 100%), url(${offering.background})` }} />
      <div className="hero-content shell"><div className="hero-carousel-frame"><p className="eyebrow">Independent consultancy · Asaba, Nigeria</p><h1>{offering.heroTitle.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}<em>{index === 1 ? line : ""}</em>{index === 0 ? line : ""}</span>)}</h1><p className="hero-copy">{offering.heroCopy}</p><div className="hero-actions"><a className="button button-primary" href={buyerHref} target="_blank" rel="noreferrer">I am looking to buy <span>↗</span></a><a className="text-link" href="/mandate">I have an offering <span>Tell us about it →</span></a></div></div></div>
      <div className="hero-meta shell"><span>{offering.number} / 04</span><span className="hero-line" /><span>{offering.shortTitle} · private mandate & brokerage</span></div>
    </section>
  );
}
