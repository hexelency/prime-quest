"use client";

import { useState } from "react";
import type { AvailableListing } from "@/lib/available-listings";

export default function ShareListing({ listing }: { listing: AvailableListing }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window === "undefined" ? "/?listing=" + encodeURIComponent(listing.ref) + "#available-listings" : `${window.location.origin}/?listing=${encodeURIComponent(listing.ref)}#available-listings`;
  const shareText = `${listing.title} | PrimeQuest ${listing.location}`;

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: shareText, text: listing.summary, url: shareUrl }).catch(() => undefined);
      return;
    }
    setOpen((current) => !current);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const encodedText = encodeURIComponent(`${shareText}\n${listing.summary}`);
  const encodedUrl = encodeURIComponent(shareUrl);

  return <div className="listing-share"><button className="table-link listing-share-button" type="button" onClick={share} aria-expanded={open} aria-haspopup="menu">Share listing <span>↗</span></button>{open && <div className="listing-share-menu" role="menu"><a href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noreferrer">WhatsApp</a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer">Facebook</a><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noreferrer">LinkedIn</a><a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noreferrer">X</a><a href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`} target="_blank" rel="noreferrer">Telegram</a><a href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodedText}%0A${encodedUrl}`}>Email</a><button type="button" onClick={copyLink}>{copied ? "Copied" : "Copy link"}</button></div>}</div>;
}