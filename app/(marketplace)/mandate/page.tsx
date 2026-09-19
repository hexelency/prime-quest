"use client";

import { FormEvent, useRef, useState } from "react";

const categories = [
  { id: "vessels", label: "Vessel brokerage", guidance: "Vessel photos, specification sheet, registration or ownership documents where available.", accept: "image/jpeg,image/png,image/webp,application/pdf", documents: "Vessel specifications / ownership documents" },
  { id: "energy", label: "Oil & gas advisory", guidance: "Asset photos, technical summary, permits, title or operating documents where available.", accept: "image/jpeg,image/png,image/webp,application/pdf", documents: "Technical, title or permit documents" },
  { id: "property", label: "Property & land", guidance: "Property photos, survey plan, title documents and location details where available.", accept: "image/jpeg,image/png,image/webp,application/pdf", documents: "Survey, title or ownership documents" },
  { id: "agriculture", label: "Agriculture & track farms", guidance: "Land photos, access information, survey plan, title documents and farm details where available.", accept: "image/jpeg,image/png,image/webp,application/pdf", documents: "Survey, title or farm documents" },
];
const callWindows = ["Weekday mornings (09:00-12:00)", "Weekday afternoons (12:00-17:00)", "Weekday evenings (17:00-20:00)"];
const WHATSAPP_NUMBER = "2348108117215";

export default function MandatePage() {
  const [categoryId, setCategoryId] = useState("vessels");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ tone: "success" | "warning" | "error"; title: string; body: string } | null>(null);
  const submitting = useRef(false);
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (!form.getAll("call_windows").length) { const body = "Select at least one preferred meeting or call window."; setError(body); setToast({ tone: "error", title: "Missing availability", body }); return; }
    submitting.current = true; setLoading(true); setError(""); setMessage("");
    form.set("kind", "seller"); form.set("category", categoryId); form.set("asset_type", String(form.get("title") ?? "")); form.set("description", String(form.get("title") ?? ""));
    const details = { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), phone: String(form.get("phone") ?? ""), location: String(form.get("location") ?? ""), title: String(form.get("title") ?? ""), terms: String(form.get("terms") ?? "") };
    try {
      const response = await fetch("/api/intake", { method: "POST", body: form });
      const result = await response.json() as { error?: string; whatsapp?: { sent?: boolean; error?: string } };
      if (!response.ok) throw new Error(result.error ?? "Could not submit the mandate.");
      const whatsappIssue = result.whatsapp?.sent ? "WhatsApp acknowledgement sent." : result.whatsapp?.error ?? "WhatsApp acknowledgement was not sent for this recipient.";
      setMessage(`Mandate saved. ${whatsappIssue} Redirecting you to WhatsApp...`);
      setToast({ tone: result.whatsapp?.sent ? "success" : "warning", title: result.whatsapp?.sent ? "Mandate received" : "Mandate saved, WhatsApp pending", body: result.whatsapp?.sent ? "Your acknowledgement was sent. Watch your email for follow-up and attachments." : whatsappIssue });
      formElement.reset();
      const whatsappMessage = `Hello PrimeQuest, I have submitted a ${category.label.toLowerCase()} mandate.\n\n- Name / company: ${details.name}\n- Email: ${details.email}\n- Phone: ${details.phone}\n- Location: ${details.location}\n- Offering: ${details.title}\n- Terms: ${details.terms}`;
      window.setTimeout(() => window.location.assign(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`), 700);
    } catch (requestError) {
      const body = requestError instanceof Error ? requestError.message : "Could not submit the mandate.";
      setError(body); setToast({ tone: "error", title: "Submission failed", body });
    } finally {
      setLoading(false); submitting.current = false;
    }
  }

  return <main className="mandate-page"><div className="shell mandate-page-grid"><div><p className="eyebrow accent">Private seller intake</p><h1>Place an offering<br /><em>with context.</em></h1><p className="mandate-lead">Share the essentials and PrimeQuest will review the mandate before publishing or making an introduction.</p><div className="document-note"><strong>Admin-mediated contact</strong><span>By consenting below, you authorize PrimeQuest to contact you when a legitimate potential buyer is identified.</span></div><p className="upload-note">{category.guidance}</p></div><form className="inquiry-form seller-form" onSubmit={submit}><section className="form-section"><div className="form-section-heading"><span>01</span><div><h2>Offering details</h2><p>Give the operations team enough context to review the opportunity.</p></div></div><div className="seller-field-grid"><label>Offering category<select name="category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Offering title<input name="title" required placeholder="What are you offering?" /></label><label>Location<input name="location" required placeholder="City, state, country" /></label><label>Asking price or terms<input name="terms" required placeholder="Price, lease terms or ask" /></label></div></section><section className="form-section"><div className="form-section-heading"><span>02</span><div><h2>Contact and documents</h2><p>These details stay private for review and approved follow-up.</p></div></div><div className="seller-field-grid"><label>Name or company<input name="name" required placeholder="Your name or company" /></label><label>Email<input name="email" type="email" required placeholder="you@company.com" /></label><label>Phone / WhatsApp<input name="phone" required placeholder="+234 ..." /></label><label>Preferred timezone<select name="timezone" defaultValue="Africa/Lagos"><option value="Africa/Lagos">West Africa Time (Lagos)</option><option value="Europe/London">United Kingdom</option><option value="America/New_York">Eastern Time (US)</option><option value="Asia/Dubai">Gulf Standard Time</option></select></label><label className="seller-field-wide">{category.documents}<input name="documents" type="file" accept="application/pdf,image/jpeg,image/png" multiple /></label></div></section><section className="form-section"><div className="form-section-heading"><span>03</span><div><h2>Meeting availability</h2><p>PrimeQuest will mediate any meeting or call with a legitimate potential buyer.</p></div></div><fieldset><legend>Preferred meeting or call windows</legend><div className="window-grid">{callWindows.map((window) => <label className="consent-check window-option" key={window}><input name="call_windows" type="checkbox" value={window} /> <span>{window}</span></label>)}</div></fieldset></section><section className="form-section consent-section"><label className="consent-check"><input name="consent" type="checkbox" required /> <span>I accept the PrimeQuest terms and authorize review of this mandate.</span></label><label className="consent-check"><input name="contact_consent" type="checkbox" required /> <span>I consent to PrimeQuest contacting me by email, phone or WhatsApp about this mandate.</span></label><label className="consent-check"><input name="meeting_consent" type="checkbox" required /> <span>I consent to an admin-mediated web or WhatsApp meeting if a legitimate buyer is found.</span></label></section>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}<button className="button button-primary seller-submit" type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit mandate"} <span>↗</span></button></form></div>{toast && <div className={`intake-toast intake-toast-${toast.tone}`} role="status"><button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">×</button><strong>{toast.title}</strong><p>{toast.body}</p></div>}</main>;
}
