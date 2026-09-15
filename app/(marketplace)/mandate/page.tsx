"use client";

import { FormEvent, useState } from "react";

const WHATSAPP_NUMBER = "2348038128933";
const categories = [
  { id: "vessels", label: "Vessel brokerage", guidance: "Vessel photos, specification sheet, registration or ownership documents where available.", accept: "image/jpeg,image/png,image/webp,application/pdf", documents: "Vessel specifications / ownership documents" },
  { id: "energy", label: "Oil & gas advisory", guidance: "Asset photos, technical summary, permits, title or operating documents where available.", accept: "image/jpeg,image/png,image/webp,application/pdf", documents: "Technical, title or permit documents" },
  { id: "property", label: "Property & land", guidance: "Property photos, survey plan, title documents and location details where available.", accept: "image/jpeg,image/png,image/webp,application/pdf", documents: "Survey, title or ownership documents" },
  { id: "agriculture", label: "Agriculture & track farms", guidance: "Land photos, access information, survey plan, title documents and farm details where available.", accept: "image/jpeg,image/png,image/webp,application/pdf", documents: "Survey, title or farm documents" },
];

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function MandatePage() {
  const [categoryId, setCategoryId] = useState("vessels");
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fields = ["name", "email", "phone", "location", "title", "terms"];
    const details = Object.fromEntries(fields.map((field) => [field, String(form.get(field) ?? "")]));
    const message = `Hello PrimeQuest, I would like to place a ${category.label.toLowerCase()} mandate.\n\nOffering details:\n- Category: ${category.label}\n- Name / company: ${details.name}\n- Email: ${details.email}\n- Phone: ${details.phone}\n- Location: ${details.location}\n- Title / short description: ${details.title}\n- Asking price or terms: ${details.terms}\n\nI understand that PrimeQuest will review the information before publishing or introducing the opportunity.`;
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <main className="mandate-page">
      <div className="shell mandate-page-grid"><div><p className="eyebrow accent">Private seller intake</p><h1>Place an offering<br /><em>with context.</em></h1><p className="mandate-lead">Have a vessel, energy asset, property, land or agricultural opportunity to place? Share the essentials and PrimeQuest will review the mandate before publishing or making an introduction.</p><div className="document-note"><strong>What to prepare</strong><span>{category.guidance}</span></div><p className="upload-note">Private ownership and legal documents are reviewed as part of the process and are not made public by default.</p></div><form className="inquiry-form" onSubmit={submit}><label>Offering category<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Name or company<input name="name" placeholder="Your name or company" required /></label><label>Email<input name="email" type="email" placeholder="you@company.com" required /></label><label>Phone / WhatsApp<input name="phone" placeholder="+234 ..." required /></label><label>Location<input name="location" placeholder="City, state, country" required /></label><label>Offering title<input name="title" placeholder="What are you offering?" required /></label><label>Asking price or terms<input name="terms" placeholder="Price, lease terms or ask" required /></label><label>Photos and media<input name="media" type="file" accept={category.accept} multiple /></label><label>{category.documents}<input name="documents" type="file" accept="application/pdf,image/jpeg,image/png" multiple /></label><p className="upload-note">Files are selected for secure intake. Our production upload endpoint will store documents privately before review.</p><button className="button button-dark" type="submit">Continue on WhatsApp <span>↗</span></button></form></div>
      <footer className="footer"><div className="shell footer-bottom"><span><a href="/">← Back to PrimeQuest</a></span><span>Asaba · Delta State · Nigeria</span></div></footer>
    </main>
  );
}
