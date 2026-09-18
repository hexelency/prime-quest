"use client";

import { FormEvent, useRef, useState } from "react";

const categories = [
  { id: "vessels", label: "Vessel brokerage", guidance: "Vessel photos, specification sheet, registration or ownership documents where available.", accept: "image/jpeg,image/png,image/webp,application/pdf", documents: "Vessel specifications / ownership documents" },
  { id: "energy", label: "Oil & gas advisory", guidance: "Asset photos, technical summary, permits, title or operating documents where available.", accept: "image/jpeg,image/png,image/webp,application/pdf", documents: "Technical, title or permit documents" },
  { id: "property", label: "Property & land", guidance: "Property photos, survey plan, title documents and location details where available.", accept: "image/jpeg,image/png,image/webp,application/pdf", documents: "Survey, title or ownership documents" },
  { id: "agriculture", label: "Agriculture & track farms", guidance: "Land photos, access information, survey plan, title documents and farm details where available.", accept: "image/jpeg,image/png,image/webp,application/pdf", documents: "Survey, title or farm documents" },
];

const WHATSAPP_NUMBER = "2348108117215";

export default function MandatePage() {
  const [categoryId, setCategoryId] = useState("vessels");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const formElement = event.currentTarget;
    form.set("kind", "seller"); form.set("category", categoryId); form.set("asset_type", String(form.get("title") ?? "")); form.set("description", String(form.get("title") ?? ""));
    const details = { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), phone: String(form.get("phone") ?? ""), location: String(form.get("location") ?? ""), title: String(form.get("title") ?? ""), terms: String(form.get("terms") ?? "") };
    try {
      const response = await fetch("/api/intake", { method: "POST", body: form });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) { setError(result.error ?? "Could not submit the mandate."); return; }
      setMessage("Mandate saved. Redirecting you to WhatsApp...");
      formElement.reset();
      const whatsappMessage = `Hello PrimeQuest, I have submitted a ${category.label.toLowerCase()} mandate.\n\n- Name / company: ${details.name}\n- Email: ${details.email}\n- Phone: ${details.phone}\n- Location: ${details.location}\n- Offering: ${details.title}\n- Terms: ${details.terms}\n\nMy mandate has been submitted to the PrimeQuest backend for review.`;
      window.setTimeout(() => window.location.assign(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`), 700);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not reach the intake service. Please try again.");
    } finally {
      setLoading(false);
      submitting.current = false;
    }
  };

  return (
    <main className="mandate-page">
      <div className="shell mandate-page-grid"><div><p className="eyebrow accent">Private seller intake</p><h1>Place an offering<br /><em>with context.</em></h1><p className="mandate-lead">Have a vessel, energy asset, property, land or agricultural opportunity to place? Share the essentials and PrimeQuest will review the mandate before publishing or making an introduction.</p><div className="document-note"><strong>What to prepare</strong><span>{category.guidance}</span></div><p className="upload-note">Private ownership and legal documents are reviewed as part of the process and are not made public by default.</p></div><form className="inquiry-form" onSubmit={submit}><label>Offering category<select name="category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Name or company<input name="name" placeholder="Your name or company" required /></label><label>Email<input name="email" type="email" placeholder="you@company.com" required /></label><label>Phone / WhatsApp<input name="phone" placeholder="+234 ..." required /></label><label>Location<input name="location" placeholder="City, state, country" required /></label><label>Offering title<input name="title" placeholder="What are you offering?" required /></label><label>Asking price or terms<input name="terms" placeholder="Price, lease terms or ask" required /></label><label>Photos and media<input name="media" type="file" accept={category.accept} multiple /></label><label>{category.documents}<input name="documents" type="file" accept="application/pdf,image/jpeg,image/png" multiple /></label><p className="upload-note">Files are stored privately for admin review. Maximum 10 files, 10 MB each.</p><label className="consent-check"><input name="consent" type="checkbox" required /> <span>I agree to PrimeQuest reviewing this mandate and contacting me under the <a href="/terms" target="_blank" rel="noreferrer">Terms of listing</a> and <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span></label>{error && <p className="upload-note" role="alert">{error}</p>}{message && <p className="upload-note" role="status">{message}</p>}<button className="button button-dark" type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit mandate"} <span>↗</span></button></form></div>
      <footer className="footer"><div className="shell footer-bottom"><span><a href="/">← Back to PrimeQuest</a></span><span>Asaba · Delta State · Nigeria</span></div></footer>
    </main>
  );
}
