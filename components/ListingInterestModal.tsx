"use client";

import { FormEvent, useRef, useState } from "react";
import type { AvailableListing } from "@/lib/available-listings";

type ListingInterestModalProps = {
  listing: AvailableListing;
  onClose: () => void;
};

const WHATSAPP_NUMBER = "2348108117215";
const callWindows = ["Weekday mornings (09:00-12:00)", "Weekday afternoons (12:00-17:00)", "Weekday evenings (17:00-20:00)"];

export default function ListingInterestModal({ listing, onClose }: ListingInterestModalProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const trackable = /vessel|container/i.test(`${listing.category} ${listing.type}`);
  const property = /property|land|building/i.test(`${listing.category} ${listing.type}`);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const brief = String(form.get("brief") ?? "").trim();
    const imoNumber = String(form.get("imo_number") ?? "").trim();
    const verificationDetails = String(form.get("verification_details") ?? "").trim();
    const accepted = form.get("terms") === "on";
    const contactConsent = form.get("contact_consent") === "on";
    const meetingConsent = form.get("meeting_consent") === "on";
    const selectedWindows = form.getAll("call_windows");

    if (!name || !email || !phone || !accepted || !contactConsent || !meetingConsent || !selectedWindows.length || (trackable && !imoNumber) || (property && !verificationDetails)) {
      setError("Please complete your details, accept the terms, consent to contact and meeting, and choose at least one call window.");
      return;
    }

    setLoading(true);
    submitting.current = true;
    const category = listing.category === "vessels" ? "vessel" : listing.category === "track-farms" ? "track_farm" : listing.category;
    const response = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "buyer",
        name,
        email,
        phone,
        category,
        asset_type: listing.type,
        imo_number: imoNumber,
        verification_details: verificationDetails,
        location: listing.location,
        terms: `Request for listing ${listing.ref}`,
        description: `Buyer enquiry for ${listing.title} (${listing.ref}). ${brief || "No additional requirements provided."}`,
        consent: true,
        contact_consent: contactConsent,
        meeting_consent: meetingConsent,
        call_windows: selectedWindows,
        timezone: form.get("timezone"),
        source: "listing_details_modal",
      }),
    });
    const result = await response.json() as { error?: string };
    setLoading(false);
    submitting.current = false;
    if (!response.ok) {
      setError(result.error ?? "Could not save your request. Please try again.");
      return;
    }

    const message = `Hello PrimeQuest, I would like more information about listing ${listing.ref}.\n\nBuyer details:\n- Name / company: ${name}\n- Email: ${email}\n- Phone / WhatsApp: ${phone}\n- Additional requirements: ${brief || "Not provided"}\n\nI accept the PrimeQuest Terms of listing and consent to being contacted about this opportunity.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <div className="listing-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="listing-modal" role="dialog" aria-modal="true" aria-labelledby="listing-interest-title">
        <div className="listing-modal-header"><div><p className="eyebrow accent">Buyer enquiry · {listing.ref}</p><h2 id="listing-interest-title">Request listing details</h2><p>{listing.title}</p></div><button className="listing-modal-close" type="button" onClick={onClose} aria-label="Close request form">×</button></div>
        <form className="listing-modal-form" onSubmit={submit}>
          <label>Name or company<input name="name" required placeholder="Your name or company" /></label>
          <label>Email<input name="email" type="email" required placeholder="you@company.com" /></label>
          <label>Phone / WhatsApp<input name="phone" required placeholder="+234 ..." /></label>
          <label>Additional requirements<textarea name="brief" rows={3} placeholder="Quantity, timing, location or specifications" /></label>
          {trackable && <label>IMO number<input name="imo_number" required placeholder="IMO number for tracking" /></label>}
          {property && <label>Title / COFO verification details<textarea name="verification_details" required rows={3} placeholder="COFO, title, survey or verification reference" /></label>}
          <label>Preferred timezone<select name="timezone" defaultValue="Africa/Lagos"><option value="Africa/Lagos">West Africa Time (Lagos)</option><option value="Europe/London">United Kingdom</option><option value="America/New_York">Eastern Time (US)</option><option value="Asia/Dubai">Gulf Standard Time</option></select></label>
          <fieldset className="listing-modal-windows"><legend>Preferred meeting or call windows</legend>{callWindows.map((window) => <label className="listing-modal-consent" key={window}><input name="call_windows" type="checkbox" value={window} /> <span>{window}</span></label>)}</fieldset>
          <label className="listing-modal-consent"><input name="terms" type="checkbox" required /> <span>I accept the <a href="/terms" target="_blank" rel="noreferrer">Terms of listing</a>.</span></label>
          <label className="listing-modal-consent"><input name="contact_consent" type="checkbox" required /> <span>I consent to PrimeQuest contacting me by email, phone or WhatsApp about this request.</span></label>
          <label className="listing-modal-consent"><input name="meeting_consent" type="checkbox" required /> <span>I consent to an admin-mediated web or WhatsApp meeting if a legitimate opportunity is found.</span></label>
          {error && <p className="listing-modal-error" role="alert">{error}</p>}
          <button className="button button-dark" type="submit" disabled={loading}>{loading ? "Saving request..." : "Continue to WhatsApp"} <span>↗</span></button>
        </form>
      </section>
    </div>
  );
}
