"use client";

import { FormEvent, useRef, useState } from "react";
import type { AvailableListing } from "@/lib/available-listings";

type ListingInterestModalProps = {
  listing: AvailableListing;
  onClose: () => void;
};

const WHATSAPP_NUMBER = "2348108117215";

export default function ListingInterestModal({ listing, onClose }: ListingInterestModalProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const brief = String(form.get("brief") ?? "").trim();
    const accepted = form.get("terms") === "on";

    if (!name || !email || !phone || !accepted) {
      setError("Please complete your contact details and accept the Terms of listing.");
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
        location: listing.location,
        terms: `Request for listing ${listing.ref}`,
        description: `Buyer enquiry for ${listing.title} (${listing.ref}). ${brief || "No additional requirements provided."}`,
        consent: true,
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
          <label className="listing-modal-consent"><input name="terms" type="checkbox" required /> <span>I accept the <a href="/terms" target="_blank" rel="noreferrer">Terms of listing</a> and consent to PrimeQuest contacting me about this request.</span></label>
          {error && <p className="listing-modal-error" role="alert">{error}</p>}
          <button className="button button-dark" type="submit" disabled={loading}>{loading ? "Saving request..." : "Continue to WhatsApp"} <span>↗</span></button>
        </form>
      </section>
    </div>
  );
}
