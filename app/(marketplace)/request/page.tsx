"use client";

import { FormEvent, useRef, useState } from "react";

const categories = [
  { value: "vessel", label: "Vessels" },
  { value: "energy", label: "Oil & gas" },
  { value: "property", label: "Property" },
  { value: "land", label: "Land" },
  { value: "track_farm", label: "Agriculture" },
];

export default function RequestPage() {
  const [kind, setKind] = useState<"buyer" | "seller">("buyer");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true); setError(""); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      kind, name: form.get("name"), email: form.get("email"), phone: form.get("phone"), category: form.get("category"), asset_type: form.get("asset_type"), location: form.get("location"), terms: form.get("terms"), description: form.get("description"), consent: form.get("consent") === "on", source: "public_form",
    }) });
    const result = await response.json() as { message?: string; error?: string; admin_whatsapp_url?: string };
    setLoading(false);
    submitting.current = false;
    if (!response.ok) { setError(result.error ?? "Could not submit your request."); return; }
    setMessage(result.message ?? "Your request has been received.");
    formElement.reset();
  }

  return <main className="mandate-page"><div className="shell mandate-page-grid"><div><p className="eyebrow accent">Private PrimeQuest intake</p><h1>Start with a clear<br /><em>brief.</em></h1><p className="mandate-lead">Tell us what you need or what you have. PrimeQuest will review the request, search approved internal and public sources where appropriate, and coordinate the next qualified conversation.</p><div className="document-note"><strong>One controlled route</strong><span>Your details are sent to the PrimeQuest backend for human review. We do not publish your identity or commercial terms by default.</span></div></div><form className="inquiry-form" onSubmit={submit}><label>Request type<select value={kind} onChange={(event) => setKind(event.target.value as "buyer" | "seller")}><option value="buyer">I am looking to buy</option><option value="seller">I have an offering</option></select></label><label>Category<select name="category" required>{categories.map((category) => <option value={category.value} key={category.value}>{category.label}</option>)}</select></label><label>Name or company<input name="name" required placeholder="Your name or company" /></label><label>Email<input name="email" type="email" required placeholder="you@company.com" /></label><label>Phone / WhatsApp<input name="phone" required placeholder="+234 ..." /></label><label>Asset or requirement<input name="asset_type" placeholder="Oil rig, vessel, land, etc." /></label><label>Location or preferred market<input name="location" placeholder="City, state, country or region" /></label><label>Budget or commercial terms<input name="terms" placeholder="Optional range or terms" /></label><label>{kind === "buyer" ? "What are you looking for?" : "What are you offering?"}<textarea name="description" required rows={5} placeholder="Include quantity, timing, specifications and anything important for qualification." /></label><label className="consent-check"><input name="consent" type="checkbox" required /> <span>I agree to PrimeQuest reviewing this request, contacting me about relevant opportunities, and using my information under the <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms of listing</a>.</span></label>{error && <p role="alert" className="upload-note">{error}</p>}{message && <p role="status" className="upload-note">{message}</p>}<button className="button button-dark" type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit request"} <span>↗</span></button></form></div><footer className="footer"><div className="shell footer-bottom"><span><a href="/">← Back to PrimeQuest</a></span><span>Asaba · Delta State · Nigeria</span></div></footer></main>;
}