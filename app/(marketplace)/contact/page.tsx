export default function ContactPage() {
  return (
    <main className="simple-page">
      <section className="shell simple-page-content legal-content">
        <p className="eyebrow accent">Contact PrimeQuest</p>
        <h1>Speak with our team<br /><em>about your inquiry.</em></h1>
        <p className="simple-lead">
          Whether you are a buyer, seller, investor, charterer, property owner or representative, PrimeQuest is available to discuss your opportunity, requirement or commercial brief. We encourage clear documentation and specific details so we can route your inquiry appropriately.
        </p>

        <div className="simple-grid">
          <div>
            <span>01</span>
            <h2>Corporate leadership</h2>
            <p>CEO: Mr. Ugochukwu Lawrence Festus</p>
          </div>
          <div>
            <span>02</span>
            <h2>Email</h2>
            <p><a href="mailto:info@primequest.com.ng">info@primequest.com.ng</a></p>
          </div>
          <div>
            <span>03</span>
            <h2>WhatsApp</h2>
            <p><a href="https://wa.me/2348038128933" target="_blank" rel="noreferrer"><span className="contact-icon whatsapp-icon" aria-hidden="true">WA</span> +234 803 812 8933</a></p>
          </div>
          <div>
            <span>04</span>
            <h2>Telephone</h2>
            <p><a href="tel:+2348036598189"><span className="contact-icon phone-icon" aria-hidden="true">☎</span> +234 803 659 8189</a></p>
          </div>
          <div>
            <span>05</span>
            <h2>LinkedIn</h2>
            <p><a href="https://www.linkedin.com/in/ugochukwu-lawrence-festus-94470a439" target="_blank" rel="noreferrer">Ugochukwu Lawrence Festus ↗</a></p>
          </div>
        </div>

        <h2>Office address</h2>
        <p>Summit By Express, Capital of Delta State, Asaba, Delta State, Nigeria.</p>

        <h2>How to send an inquiry</h2>
        <p>For the most useful response, include your category, location, timeline, commercial terms, and any supporting documents or photos relevant to the opportunity. If you are a buyer, explain your target asset or requirement. If you are a seller or owner, describe the opportunity and any ownership or verification status that already exists.</p>

        <h2>General response process</h2>
        <p>PrimeQuest will review the inquiry, request any missing information needed for assessment, and then advise on the next appropriate step. This may include a review call, document request, introduction process or a specific commercial workflow depending on the circumstances.</p>
      </section>
    </main>
  );
}
