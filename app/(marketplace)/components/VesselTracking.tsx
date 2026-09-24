"use client";

import { FormEvent, useState } from "react";

function isValidImo(value: string) {
  if (!/^\d{7}$/.test(value) || value.startsWith("0")) return false;
  const digits = value.split("").map(Number);
  const weightedTotal = digits.slice(0, 6).reduce((total, digit, index) => total + digit * (7 - index), 0);
  return weightedTotal % 10 === digits[6];
}

export default function VesselTracking() {
  const [imo, setImo] = useState("");
  const [error, setError] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = imo.replace(/\D/g, "").slice(0, 7);
    setImo(normalized);
    if (!isValidImo(normalized)) {
      setTrackingUrl("");
      setError("Enter a valid 7-digit IMO number.");
      return;
    }
    setError("");
    setTrackingUrl(`https://www.vesselfinder.com/vessels?name=IMO${normalized}`);
  }

  return <section className="vessel-tracking section-space" aria-labelledby="vessel-tracking-heading">
    <div className="shell vessel-tracking-grid">
      <div>
        <p className="eyebrow accent">Vessel intelligence</p>
        <h2 id="vessel-tracking-heading">Track a vessel<br /><em>by IMO number.</em></h2>
        <p>Enter the vessel&apos;s unique seven-digit IMO number to open its live position, identity and voyage information on VesselFinder.</p>
      </div>
      <form className="vessel-tracking-form" onSubmit={submit}>
        <label htmlFor="imo-tracking-number">IMO number</label>
        <div className="vessel-tracking-input"><input id="imo-tracking-number" value={imo} onChange={(event) => { setImo(event.target.value.replace(/\D/g, "").slice(0, 7)); setError(""); }} inputMode="numeric" pattern="[0-9]{7}" maxLength={7} placeholder="e.g. 9074729" aria-describedby={error ? "imo-tracking-error" : undefined} /><button className="button button-dark" type="submit">Track vessel <span>↗</span></button></div>
        {error && <p className="form-error" id="imo-tracking-error" role="alert">{error}</p>}
        {trackingUrl && <div className="vessel-tracking-result" role="status"><strong>IMO {imo} is ready to track.</strong><a href={trackingUrl} target="_blank" rel="noreferrer">Open live vessel tracking <span>↗</span></a><a href={`https://www.marinetraffic.com/en/ais/index/search/all/imo:${imo}`} target="_blank" rel="noreferrer">Check MarineTraffic too <span>↗</span></a></div>}
        <small>IMO numbers are checked locally. Tracking data is provided by external maritime services.</small>
      </form>
    </div>
  </section>;
}