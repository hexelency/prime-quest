"use client";

import { useEffect, useState } from "react";

const locations = [
  { label: "Asaba", timeZone: "Africa/Lagos" },
  { label: "London", timeZone: "Europe/London" },
  { label: "New York", timeZone: "America/New_York" },
  { label: "Dubai", timeZone: "Asia/Dubai" },
];

const calendarHref = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=PrimeQuest%20consultation&details=Discuss%20a%20PrimeQuest%20buyer%20brief%2C%20seller%20mandate%20or%20commercial%20opportunity.&location=Summit%20By%20Express%2C%20Asaba%2C%20Delta%20State%2C%20Nigeria";
const mapsHref = "https://www.google.com/maps/search/?api=1&query=Summit+By+Express%2C+Asaba%2C+Delta+State%2C+Nigeria";

function formatTime(timeZone: string, now: Date) {
  return new Intl.DateTimeFormat("en", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
}

export default function BusinessInfo() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return <section className="business-info" aria-labelledby="business-info-heading">
    <div className="shell business-info-grid">
      <div className="business-info-copy">
        <p className="eyebrow accent">Plan a conversation</p>
        <h2 id="business-info-heading">PrimeQuest<br /><em>around the world.</em></h2>
        <p>Our team works from Asaba and coordinates with buyers, owners and representatives across international time zones.</p>
        <div className="business-info-actions"><a className="button button-dark" href={calendarHref} target="_blank" rel="noreferrer">Add a calendar hold <span>↗</span></a><a className="text-link" href={mapsHref} target="_blank" rel="noreferrer">Open in Google Maps <span>↗</span></a></div>
      </div>
      <div className="business-info-details">
        <div className="world-clocks" aria-label="Current world times">{locations.map((location) => <div className="world-clock" key={location.timeZone}><span>{location.label}</span><strong>{formatTime(location.timeZone, now)}</strong><small>{location.timeZone}</small></div>)}</div>
        <div className="hours-card"><div><span className="state-label">Working hours</span><strong>Monday - Saturday</strong><p>09:00 - 18:00 WAT</p></div><div><span className="state-label">Closed</span><strong>Sunday</strong><p>Messages are reviewed on the next working day.</p></div></div>
        <div className="map-frame"><iframe title="PrimeQuest office location in Asaba" src="https://www.google.com/maps?q=Summit+By+Express%2C+Asaba%2C+Delta+State%2C+Nigeria&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
      </div>
    </div>
  </section>;
}