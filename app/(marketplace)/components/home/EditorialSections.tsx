export function IntroSection() {
  return <section className="intro shell section-space"><div><p className="eyebrow accent">The PrimeQuest standard</p><h2>Built for decisions<br /><em>that matter.</em></h2></div><div className="intro-copy"><p>We work between opportunity and action. Our role is to make the next step clearer, the conversation more direct and the process more considered.</p><a className="text-link dark-link" href="#process">Our approach <span>→</span></a></div></section>;
}

export function ProcessSection() {
  return <section className="process shell section-space" id="process"><div className="section-heading"><div><p className="eyebrow accent">A more useful process</p><h2>From first brief<br /><em>to clear next step.</em></h2></div><p>Every conversation begins with context. We qualify the requirement, confirm the opportunity and keep communication moving through one trusted channel.</p></div><div className="process-list"><div><span>01</span><h3>Tell us what you need</h3><p>Buyer inquiry, seller mandate or a broader brief.</p></div><div><span>02</span><h3>We qualify the fit</h3><p>Our team reviews the details and available routes.</p></div><div><span>03</span><h3>Move with confidence</h3><p>Receive a clear response and a practical next step.</p></div></div></section>;
}

export function FaqSection() {
  return (
    <section className="faq-section section-space" id="faq">
      <div className="shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow accent">Questions, answered</p>
            <h2>Before the<br /><em>conversation.</em></h2>
          </div>
          <p>Clear expectations make better introductions. PrimeQuest works across vessel, oil and gas, property, land and commercial opportunity transactions, and these answers explain how we review, match and protect commercial information.</p>
        </div>

        <div className="faq-list">
          <details>
            <summary>What is PrimeQuest and what does it do? <span>+</span></summary>
            <p>PrimeQuest Oil and Properties Consultants is a multi-sector commercial consultancy and opportunity-matching platform that connects legitimate owners, sellers, buyers, investors, charterers and professionals across oil and gas, vessels, maritime assets, property, land and related commercial service opportunities.</p>
          </details>

          <details>
            <summary>Does PrimeQuest guarantee that a vessel or property is genuine? <span>+</span></summary>
            <p>No. PrimeQuest does not guarantee ownership, title, legal status, vessel condition, property safety or transaction completion. We review submissions, request supporting material and classify matters as submitted, under review, verified or qualified only where the evidence supports that status.</p>
          </details>

          <details>
            <summary>How does the review process work? <span>+</span></summary>
            <p>When an opportunity or requirement is submitted, PrimeQuest reviews the information, asks for missing documents where necessary, and assesses whether there is a viable commercial fit. We may hold, request more information, decline or restrict publication if the brief is incomplete, unclear or not supported by sufficient information.</p>
          </details>

          <details>
            <summary>Can I submit a property, land or vessel mandate? <span>+</span></summary>
            <p>Yes. Owners and authorized representatives can submit opportunities through the appropriate inquiry or mandate channel. We may request ownership documents, title records, surveys, vessel information, photographs, class and technical information, or commercial terms where relevant to the category.</p>
          </details>

          <details>
            <summary>What information should a seller provide? <span>+</span></summary>
            <p>At minimum, sellers should provide the asset category, location, ownership details, commercial terms, photographs, a short description and relevant documents such as title, proof of authority, technical data, permits, vessel particulars or operational records. The more specific and verifiable the brief, the better the review and matching process.</p>
          </details>

          <details>
            <summary>How do buyer inquiries work? <span>+</span></summary>
            <p>Buyers can share their requirements, preferred market, budget, timeline, size or capacity, and any technical or legal conditions. PrimeQuest uses that information to identify suitable opportunities and to qualify the fit before introducing relevant parties or advising on next steps.</p>
          </details>

          <details>
            <summary>Does submission guarantee publication or a sale? <span>+</span></summary>
            <p>No. Submission is not a guarantee of publication, buyer introduction, sale, purchase, lease or completion. Commercial opportunity review remains subject to accuracy, documentation, verification and the applicable business process.</p>
          </details>

          <details>
            <summary>What is the role of PrimeQuest AI? <span>+</span></summary>
            <p>PrimeQuest AI helps organize opportunity information, search relevant listings, identify potential matches, request missing data and support introduction workflows. It is designed to assist the platform but it does not replace the need for human review and professional due diligence.</p>
          </details>

          <details>
            <summary>How are confidential documents handled? <span>+</span></summary>
            <p>PrimeQuest treats submitted documents as commercially sensitive and restricts access to authorized personnel and appropriate parties. Information is used to support review and communication, not to be broadly circulated or published without reason.</p>
          </details>

          <details>
            <summary>What should I do before entering into a transaction? <span>+</span></summary>
            <p>Before committing to any transaction, confirm ownership or authority, conduct independent legal, technical and financial review, verify any supporting documents, review payment and commission terms, and seek specialist advice where the opportunity involves substantial value or cross-border matters.</p>
          </details>
        </div>
      </div>
    </section>
  );
}
