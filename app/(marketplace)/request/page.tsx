"use client";

import { FormEvent, useRef, useState } from "react";

const categories = [
  { value: "vessel", label: "Vessels" },
  { value: "energy", label: "Oil & gas" },
  { value: "property", label: "Property" },
  { value: "land", label: "Land" },
  { value: "track_farm", label: "Agriculture" },
];
const callWindows = ["Weekday mornings (09:00-12:00)", "Weekday afternoons (12:00-17:00)", "Weekday evenings (17:00-20:00)"];

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
    if (!form.getAll("call_windows").length) { setError("Select at least one preferred meeting or call window."); submitting.current = false; setLoading(false); return; }
    try {
      const response = await fetch("/api/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        kind, name: form.get("name"), email: form.get("email"), phone: form.get("phone"), category: form.get("category"), asset_type: form.get("asset_type"), location: form.get("location"), terms: form.get("terms"), description: form.get("description"), consent: form.get("consent") === "on", contact_consent: form.get("contact_consent") === "on", meeting_consent: form.get("meeting_consent") === "on", call_windows: form.getAll("call_windows"), timezone: form.get("timezone"), source: "public_form",
      }) });
      const result = await response.json() as { message?: string; error?: string; whatsapp?: { sent?: boolean; error?: string } };
      if (!response.ok) throw new Error(result.error ?? "Could not submit your request.");
      setMessage(result.whatsapp?.sent ? "Your request has been received and the WhatsApp acknowledgement was sent." : `${result.message ?? "Your request has been received."} WhatsApp acknowledgement: ${result.whatsapp?.error ?? "not sent for this recipient."}`);
      formElement.reset();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not submit your request.");
    } finally {
      setLoading(false); submitting.current = false;
    }
  }

  return <main className="mandate-page"><div className="shell mandate-page-grid"><div><p className="eyebrow accent">Private PrimeQuest intake</p><h1>Start with a clear<br /><em>brief.</em></h1><p className="mandate-lead">Tell us what you need or what you have. PrimeQuest will review the request and coordinate the next qualified conversation.</p><div className="document-note"><strong>Admin-mediated contact</strong><span>PrimeQuest will only arrange a meeting or call after review and a potential match. Follow-ups may be sent by email.</span></div></div><form className="inquiry-form" onSubmit={submit}><label>Request type<select value={kind} onChange={(event) => setKind(event.target.value as "buyer" | "seller")}><option value="buyer">I am looking to buy</option><option value="seller">I have an offering</option></select></label><label>Category<select name="category" required>{categories.map((category) => <option value={category.value} key={category.value}>{category.label}</option>)}</select></label><label>Name or company<input name="name" required placeholder="Your name or company" /></label><label>Email<input name="email" type="email" required placeholder="you@company.com" /></label><label>Phone / WhatsApp<input name="phone" required placeholder="+234 ..." /></label><label>Asset or requirement<input name="asset_type" placeholder="Oil rig, vessel, land, etc." /></label><label>Location or preferred market<input name="location" placeholder="City, state, country or region" /></label><label>Budget or commercial terms<input name="terms" placeholder="Optional range or terms" /></label><label>{kind === "buyer" ? "What are you looking for?" : "What are you offering?"}<textarea name="description" required rows={5} placeholder="Include quantity, timing, specifications and anything important for qualification." /></label><label>Preferred timezone<select name="timezone" defaultValue="Africa/Lagos"><option value="Africa/Lagos">West Africa Time (Lagos)</option><option value="Europe/London">United Kingdom</option><option value="America/New_York">Eastern Time (US)</option><option value="America/Los_Angeles">Pacific Time (US)</option><option value="Asia/Dubai">Gulf Standard Time</option></select></label><fieldset><legend>Preferred meeting or call windows</legend><p className="upload-note">The AI may use these windows to propose a meeting. PrimeQuest will mediate and confirm the final time.</p>{callWindows.map((window) => <label className="consent-check" key={window}><input name="call_windows" type="checkbox" value={window} required={false} /> <span>{window}</span></label>)}</fieldset><label className="consent-check"><input name="consent" type="checkbox" required /> <span>I accept the PrimeQuest terms and understand this request is subject to review.</span></label><label className="consent-check"><input name="contact_consent" type="checkbox" required /> <span>I consent to PrimeQuest contacting me by email, phone or WhatsApp about this request.</span></label><label className="consent-check"><input name="meeting_consent" type="checkbox" required /> <span>I consent to an admin-mediated web or WhatsApp meeting if a legitimate potential match is found.</span></label>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}<button className="button button-primary" type="submit" disabled={loading}>{loading ? "Sending..." : "Submit request"} <span>↗</span></button></form></div></main>;
}
