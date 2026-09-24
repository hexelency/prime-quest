import Image from "next/image";

const facebookHref = "https://www.facebook.com/share/1CT3Bc6jrf/";
const linkedInHref = "https://www.linkedin.com/in/ugochukwu-lawrence-festus-94470a439";

export default function PublicCredentials() {
  return (
    <section className="public-credentials" aria-label="PrimeQuest leadership and company details">
      <div className="shell public-credentials-inner">
        <div className="public-credentials-portraits" aria-hidden="true">
          <Image src="/ceo-pics/WhatsApp%20Image%202026-09-23%20at%2001.28.26.jpeg" alt="" width={84} height={84} />
          <Image src="/ceo-pics/WhatsApp%20Image%202026-09-23%20at%2001.28.25.jpeg" alt="" width={84} height={84} />
        </div>
        <div className="public-credentials-copy">
          <p className="eyebrow accent">Leadership & accountability</p>
          <strong>Mr. Ugochukwu Lawrence Festus · CEO</strong>
          <span>PrimeQuest Oil and Properties Consultants · Asaba, Delta State, Nigeria</span>
        </div>
        <div className="public-credentials-links">
          <a href="mailto:info@primequest.com.ng">Email <span>↗</span></a>
          <a href="https://wa.me/2348038128933" target="_blank" rel="noreferrer"><span className="contact-icon whatsapp-icon" aria-hidden="true">WA</span> WhatsApp <span>↗</span></a>
          <a href={facebookHref} target="_blank" rel="noreferrer">Facebook <span>↗</span></a>
          <a href={linkedInHref} target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>
        </div>
      </div>
    </section>
  );
}