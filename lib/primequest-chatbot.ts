export type KnowledgeEntry = {
  id: string;
  intent: string;
  tags: string[];
  answer: string;
  priority?: number;
};

export const PRIMEQUEST_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "corporate-faq-position",
    intent: "corporate-position",
    tags: ["corporate faq", "business model", "does primequest own", "owner of listed asset", "guarantee sale", "guaranteed deal"],
    answer:
      "PrimeQuest is a consultancy and transaction-support business connecting legitimate sellers, owners, buyers, investors, clients and service providers. PrimeQuest does not automatically own every vessel, property or other asset presented. A listing is an opportunity or mandate, not a guarantee of sale, purchase, charter, lease or completion. PrimeQuest's role should be confirmed for each transaction.",
    priority: 105,
  },
  {
    id: "corporate-services",
    intent: "corporate-services",
    tags: ["industries", "business areas", "marine services", "commercial investment", "building products", "heavy equipment"],
    answer:
      "PrimeQuest's intended service areas include oil and gas, vessels and marine assets, vessel sales and acquisition, marine services, residential and commercial real estate, land, development opportunities, heavy-duty equipment, building products, industrial assets and related commercial investment opportunities. PrimeQuest can organize requirements, receive mandates, support communication, coordinate appropriate review and facilitate introductions.",
    priority: 103,
  },
  {
    id: "vessel-services-faq",
    intent: "vessel-services",
    tags: ["types of vessels", "what vessels", "ahts", "osv", "psv", "tugboat", "tanker", "barge", "dredger", "landing craft"],
    answer:
      "Depending on verified availability and mandate, PrimeQuest may facilitate tugboats, AHTS and anchor-handling vessels, OSVs, PSVs, crew and utility boats, fast supply vessels, workboats, barges, tank barges, oil and accommodation barges, dredgers, landing craft, cargo and bulk carriers, container vessels, tankers, product and chemical tankers, offshore construction vessels, multipurpose vessels, research vessels, fishing vessels, ferries and other commercial marine assets. Availability depends on the owner's mandate, vessel condition, location and documentation.",
    priority: 102,
  },
  {
    id: "vessel-seller-information",
    intent: "vessel-seller-information",
    tags: ["vessel seller information", "what details for vessel", "imo number", "vessel documents", "vessel specifications"],
    answer:
      "A vessel seller should generally provide the vessel name, IMO number where applicable, type, year built, flag, classification society, DWT/GRT/NT, dimensions, engine and machinery details, accommodation capacity, trading area, current location and operational status, photographs, general arrangement, class and survey information, ownership or authority information, price guidance, sale terms and relevant certificates. These details remain subject to verification.",
    priority: 101,
  },
  {
    id: "property-services-faq",
    intent: "property-services",
    tags: ["types of property", "property services", "land types", "real estate services", "property documents"],
    answer:
      "PrimeQuest may facilitate residential, commercial, industrial, agricultural and development land; estates; homes; offices; warehouses; hotels; industrial facilities; shops; commercial complexes; development projects; investment properties and leased properties. Sellers should provide ownership or authority information and relevant documents such as title, deed, survey, approvals, permits and lease documents where applicable. Property title must be independently investigated.",
    priority: 101,
  },
  {
    id: "oil-gas-faq",
    intent: "oil-gas-services",
    tags: ["oil gas products", "crude oil", "ago", "diesel", "pms", "aviation fuel", "lpg", "lng", "petrochemical"],
    answer:
      "Depending on verified availability and mandate, PrimeQuest may facilitate crude oil, refined petroleum products such as AGO/diesel and PMS, aviation fuel, base oils, LPG, LNG-related opportunities, petrochemicals, marine fuels, oilfield equipment and services, storage, logistics and marine support. PrimeQuest should not be represented as a producer, refiner or commodity owner unless that role is specifically verified. Availability and documentation must be confirmed for each transaction.",
    priority: 101,
  },
  {
    id: "buyer-requirements-faq",
    intent: "buyer-requirements",
    tags: ["how buyer works", "buyer requirement", "buyer documents", "submit buyer requirement", "buyer mandate"],
    answer:
      "A buyer should provide the required product or asset, quantity, location, budget or commercial parameters, delivery requirements, timeline, technical specifications, required documentation and preferred transaction structure. PrimeQuest may request enough information to establish a legitimate commercial requirement. AI-generated matches remain potential matches and require human review.",
    priority: 101,
  },
  {
    id: "seller-mandate-faq",
    intent: "seller-mandate-faq",
    tags: ["why seller mandate", "mandate contents", "authorized representative", "can agent submit asset", "seller mandate terms"],
    answer:
      "A seller mandate helps establish the seller or owner's identity, representative authority, asset details, authority to market, mandate period, commission arrangements, introduction terms, non-circumvention provisions, seller obligations, verification requirements, payment terms and signatures. An agent should not present another person's asset without appropriate authority.",
    priority: 101,
  },
  {
    id: "due-diligence-security-faq",
    intent: "due-diligence-security",
    tags: ["should i send money", "suspect fraud", "fake listing", "fake buyer", "fake seller", "security", "kyc", "sanctions"],
    answer:
      "Do not send money simply because an asset is listed. Confirm the counterparty, ownership or authority, documentation, banking instructions, contractual obligations and relevant legal, technical, financial, corporate/KYC and sanctions checks. If fraud is suspected, notify PrimeQuest and independently verify the information with the relevant owner, authority, bank, registry, adviser or institution. A listing does not mean every detail is fully verified.",
    priority: 104,
  },
  {
    id: "privacy-confidentiality-faq",
    intent: "privacy-confidentiality",
    tags: ["privacy", "confidential information", "share client information", "confidentiality policy", "data protection"],
    answer:
      "PrimeQuest should handle confidential commercial information according to its applicable privacy and confidentiality policies and the agreements governing the transaction. Information should be shared only as permitted by client authorization, applicable agreements, legitimate business requirements and applicable law.",
    priority: 100,
  },
  {
    id: "complaints-faq",
    intent: "complaints",
    tags: ["complaint", "make a complaint", "report fraud", "dispute", "customer support"],
    answer:
      "For a complaint, suspected fraud or dispute, document the relevant opportunity, people, messages and documents, then contact PrimeQuest directly for review. Do not make further payments or rely on unverified instructions while the matter is being investigated. PrimeQuest's contact email is primequestoilandpropertyconsul@gmail.com and its WhatsApp number is +234 803 812 8933.",
    priority: 100,
  },
  {
    id: "transaction-process-faq",
    intent: "transaction-process",
    tags: ["transaction process", "what happens after submission", "how transaction works", "process", "workflow"],
    answer:
      "The typical process is: requirement or mandate submission, information review, document request, preliminary verification, identification of a potential counterparty, introduction, commercial discussion, due diligence, contract preparation by the appropriate parties or professionals, satisfaction of conditions, payment and closing according to contract, and commission payment according to the applicable agreement. No stage guarantees completion.",
    priority: 102,
  },
  {
    id: "ai-agent-rules-faq",
    intent: "ai-agent-rules",
    tags: ["what can ai do", "ai rules", "ai guarantee match", "can ai verify", "can ai negotiate", "ai agent"],
    answer:
      "PrimeQuest AI can organize information, analyze requirements, identify potential matches, draft communications and support administrative workflows. It cannot guarantee a buyer or seller match, independently verify ownership, replace legal or technical professionals, make binding commercial decisions or guarantee a transaction. Live records must come from approved PrimeQuest data sources, and unverified information must be clearly identified.",
    priority: 104,
  },
  {
    id: "contact-faq",
    intent: "contact-faq",
    tags: ["summit by express", "primequest address", "customer support", "contact details", "email address"],
    answer:
      "PrimeQuest Oil and Properties Consultants is located at Summit By Express, Asaba, Delta State, Nigeria. CEO: Ugochukwu Lawrence Festus. Email: primequestoilandpropertyconsul@gmail.com. WhatsApp: +234 803 812 8933. Telephone: +234 803 659 8189.",
    priority: 103,
  },
  {
    id: "company-overview",
    intent: "company-description",
    tags: ["what is primequest", "who is primequest", "company", "about", "business", "description"],
    answer:
      "PrimeQuest Oil and Properties Consultants is a Nigerian-based business consultancy and transaction facilitation platform in Asaba, Delta State. PrimeQuest connects genuine sellers, asset owners, buyers, investors and clients across oil and gas, vessels, properties, land, industrial assets, heavy equipment and related commercial opportunities. Its model is built around verified mandates, professional introductions, due diligence, negotiation support and transaction facilitation.",
    priority: 100,
  },
  {
    id: "company-mission",
    intent: "mission",
    tags: ["mission", "purpose", "why", "goal", "what do you do"],
    answer:
      "PrimeQuest exists to reduce unnecessary intermediary layers and provide a professional bridge between genuine asset owners and genuine buyers through proper mandates, verification, introductions and transaction facilitation.",
    priority: 90,
  },
  {
    id: "location",
    intent: "location",
    tags: ["where are you located", "location", "asaba", "delta state", "city"],
    answer: "PrimeQuest Oil and Properties Consultants is based in Asaba, Delta State, Nigeria.",
    priority: 95,
  },
  {
    id: "ceo",
    intent: "ceo",
    tags: ["ceo", "who is the ceo", "leader"],
    answer: "The CEO of PrimeQuest Oil and Properties Consultants is Ugochukwu Lawrence Festus.",
    priority: 96,
  },
  {
    id: "founder",
    intent: "founder",
    tags: ["founder", "who founded primequest", "who started primequest", "owner of primequest"],
    answer:
      "PrimeQuest's current knowledge base identifies Ugochukwu Lawrence Festus as the CEO. It does not contain a separately verified founder profile, so I will not claim a different founder without an official company source.",
    priority: 99,
  },
  {
    id: "services",
    intent: "services",
    tags: ["services", "what services", "what do you offer", "what does primequest offer", "areas of service"],
    answer:
      "PrimeQuest offers consultancy and transaction facilitation across oil and gas, vessels and marine assets, properties and land, building products, heavy-duty equipment, industrial assets and related commercial opportunities. Services include receiving buyer requirements and seller mandates, reviewing submitted information, coordinating verification and due diligence, introducing suitable parties and supporting negotiation and transaction follow-up. Current availability is confirmed separately from these service categories.",
    priority: 99,
  },
  {
    id: "anti-circumvention",
    intent: "anti-circumvention",
    tags: ["circumvention", "anti circumvention", "bypass primequest", "bypass", "terms and conditions", "terms condition"],
    answer:
      "PrimeQuest's anti-circumvention principle is that parties introduced through a PrimeQuest mandate or transaction process should not bypass PrimeQuest to complete the same opportunity directly. The exact scope, duration, commission and remedies must come from the applicable signed mandate, introduction or transaction agreement. Please request and review that agreement before relying on any specific legal term.",
    priority: 100,
  },
  {
    id: "trust",
    intent: "trust",
    tags: ["why trust primequest", "can i trust primequest", "why should i trust", "is primequest legitimate", "proof", "trust"],
    answer:
      "You should evaluate PrimeQuest through evidence and process, not a promise from an AI assistant. PrimeQuest's stated safeguards are documented mandates, ownership or authority checks, supporting-document review, direct follow-up with relevant parties, clear written agreements and independent due diligence. Treat discovered companies and opportunities as potential until the PrimeQuest team confirms them and you independently verify the legal, commercial and technical facts.",
    priority: 100,
  },
  {
    id: "contact",
    intent: "contact",
    tags: ["contact", "how do i contact primequest", "phone", "whatsapp", "email"],
    answer:
      "You can contact PrimeQuest Oil and Properties Consultants through:\n\nWhatsApp: +234 803 812 8933\nTelephone: +234 803 659 8189\nEmail: primequestoilandpropertyconsul@gmail.com\nLocation: Asaba, Delta State, Nigeria.",
    priority: 100,
  },
  {
    id: "commission",
    intent: "commission",
    tags: ["commission", "fee", "what is your commission", "cost", "4 percent", "4%"],
    answer:
      "For applicable PrimeQuest vessel and property transactions, the established commission is 4%, payable by the seller alone. Buyers are not charged the PrimeQuest 4% seller commission under this policy. The exact obligation is governed by the applicable signed seller/mandate agreement.",
    priority: 100,
  },
  {
    id: "verification",
    intent: "verification",
    tags: ["verification", "how does verification work", "review", "verified", "mandate"],
    answer:
      "PrimeQuest reviews submitted information and, where appropriate, verifies the mandate, ownership or authority, documentation and transaction facts before an opportunity is treated as a verified opportunity. The process can include document review, internal assessment and direct follow-up with the relevant party where required.",
    priority: 90,
  },
  {
    id: "sell-vessel",
    intent: "sell-vessel",
    tags: ["i want to sell my vessel", "sell my vessel", "vessel sale", "sell vessel"],
    answer:
      "PrimeQuest facilitates legitimate vessel sale mandates. Please provide the vessel name, vessel type, IMO number if available, location, year built, asking price, technical specifications, ownership/authority information and available documentation. PrimeQuest will review the information and determine the appropriate verification and mandate process.",
    priority: 98,
  },
  {
    id: "buy-vessel",
    intent: "buy-vessel",
    tags: ["i want to buy a vessel", "buy a vessel", "need a vessel", "vessel requirement"],
    answer:
      "PrimeQuest can help connect buyers with legitimate vessel sale opportunities. Please provide the vessel type, required specifications, budget, preferred location, intended use and purchase timeline. I can help organize your requirement for PrimeQuest's review.",
    priority: 98,
  },
  {
    id: "vessel-for-sale",
    intent: "available-vessel",
    tags: ["do you have a vessel for sale", "vessel for sale", "have vessel"],
    answer:
      "PrimeQuest facilitates vessel sale opportunities, including tugboats, AHTS, PSV, barges, tankers, workboats and other marine assets. I would need access to PrimeQuest's current verified listings to confirm which vessels are presently available. You can also contact PrimeQuest directly on WhatsApp +234 803 812 8933 or telephone +234 803 659 8189.",
    priority: 96,
  },
  {
    id: "sell-property",
    intent: "sell-property",
    tags: ["i want to sell my property", "sell property", "property sale", "land sale"],
    answer:
      "PrimeQuest facilitates property and land sale opportunities. Please provide the property location, type, size, asking price, ownership/title information, photographs and any available documentation. The opportunity may be subject to verification before publication.",
    priority: 98,
  },
  {
    id: "buy-property",
    intent: "buy-property",
    tags: ["i want to buy property", "buy property", "property requirement", "land requirement"],
    answer:
      "PrimeQuest facilitates property and land opportunities. Please provide your preferred location, property type, budget, required size, intended use and purchase timeline so your requirement can be properly recorded and matched with available verified opportunities.",
    priority: 98,
  },
  {
    id: "availability",
    intent: "availability",
    tags: ["available", "currently available", "is it available", "current listing"],
    answer:
      "I can explain the type of opportunity PrimeQuest handles, but I don't have a verified live listing for that asset at the moment. Please contact PrimeQuest for current availability.",
    priority: 92,
  },
  {
    id: "affiliate",
    intent: "affiliate",
    tags: ["affiliate", "affiliates", "partners", "who are your affiliates"],
    answer:
      "PrimeQuest works with relevant professionals, owners, buyers, service providers and transaction specialists depending on the specific opportunity. For a particular affiliate or partner, please contact PrimeQuest directly or refer to the company's officially published partner information.",
    priority: 96,
  },
  {
    id: "sell-mandate",
    intent: "seller-mandate",
    tags: ["sell", "seller", "mandate", "have a listing", "offer"],
    answer:
      "PrimeQuest can help structure a legitimate seller mandate. Please share the asset type, location, size or specification, asking price, ownership or authority information, and available documentation so PrimeQuest can determine the right review and verification path.",
    priority: 88,
  },
  {
    id: "buy-requirement",
    intent: "buyer-requirement",
    tags: ["buy", "requirement", "need", "buyer", "i need"],
    answer:
      "PrimeQuest can help organize a buyer requirement. Please share the asset type, preferred location, budget, technical specifications, intended use, and timeline so the brief can be reviewed against relevant verified opportunities.",
    priority: 88,
  },
  {
    id: "default",
    intent: "general",
    tags: ["general", "hello", "hi", "thanks"],
    answer:
      "PrimeQuest Oil and Properties Consultants connects genuine sellers, asset owners, buyers, investors and clients across oil and gas, vessels, properties, land, industrial assets and related commercial opportunities. For current listings or a specific mandate, please contact PrimeQuest directly on WhatsApp +234 803 812 8933 or telephone +234 803 659 8189.",
    priority: 10,
  },
];

function normalizePrompt(prompt: string) {
  return prompt.toLowerCase().replace(/\s+/g, " ").trim();
}

export function getRelevantKnowledge(prompt: string): KnowledgeEntry[] {
  const normalized = normalizePrompt(prompt);

  if (!normalized) {
    return [];
  }

  return [...PRIMEQUEST_KNOWLEDGE_BASE]
    .map((entry) => {
      let score = 0;
      const terms = normalized.split(" ");

      entry.tags.forEach((tag) => {
        const tagValue = tag.toLowerCase();
        if (normalized.includes(tagValue)) {
          score += 40;
        }

        const tagWords = tagValue.split(" ");
        if (tagWords.every((word) => terms.includes(word))) {
          score += 25;
        }
      });

      const extraBoost = entry.priority ?? 0;
      return { ...entry, score: score + extraBoost };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function buildPrimeQuestReply(prompt: string): string {
  const trimmed = prompt.trim();

  if (!trimmed) {
    return "Please tell me what you need help with, and I can guide you to the right PrimeQuest process.";
  }

  const matches = getRelevantKnowledge(trimmed);
  if (!matches.length) {
    return "PrimeQuest Oil and Properties Consultants connects genuine sellers, asset owners, buyers, investors and clients across oil and gas, vessels, properties, land, industrial assets and related commercial opportunities. For current listings or a specific mandate, please contact PrimeQuest directly on WhatsApp +234 803 812 8933 or telephone +234 803 659 8189.";
  }

  return matches[0].answer;
}
