"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./listing-manager.module.css";

type Listing = {
  id: string; reference: string; title: string; category: string; asset_type: string;
  imo_number?: string | null; verification_details?: string | null;
  location?: string | null; summary?: string | null; source_url?: string | null;
  source_platform?: string | null; source_summary?: string | null; image_url?: string | null;
  tags?: unknown; discovered_by?: string | null; confidence_score?: number | string | null;
  status: string; verification_status: string; risk_flags?: unknown; published_at?: string | null;
};
type FormState = Omit<Listing, "id" | "tags" | "risk_flags" | "confidence_score" | "published_at"> & { tags: string; risk_flags: string; confidence_score: string; published_at: string };
const emptyForm: FormState = { reference: "", title: "", category: "vessel", asset_type: "", imo_number: "", verification_details: "", location: "", summary: "", source_url: "", source_platform: "", source_summary: "", image_url: "", discovered_by: "admin", confidence_score: "", status: "under_review", verification_status: "potential", tags: "", risk_flags: "", published_at: "" };
const categories = [["vessel", "Vessel"], ["property", "Property"], ["land", "Land"], ["track_farm", "Track farm"], ["energy", "Oil & gas"]];
const statuses = ["discovered", "under_review", "approved", "published", "withdrawn"];
const verificationStatuses = ["potential", "confirmed", "under_review", "verified", "rejected"];

function asText(value: unknown) { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join(", ") : ""; }
function toForm(listing?: Listing): FormState {
  if (!listing) return emptyForm;
  return { ...emptyForm, ...listing, tags: asText(listing.tags), risk_flags: asText(listing.risk_flags), confidence_score: listing.confidence_score == null ? "" : String(listing.confidence_score), published_at: listing.published_at ? listing.published_at.slice(0, 10) : "" };
}

export default function ListingManager({ compact = false }: { compact?: boolean }) {
  const [listings, setListings] = useState<Listing[]>([]); const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("all");
  const [modal, setModal] = useState<"create" | "edit" | null>(null); const [selected, setSelected] = useState<Listing>();
  const [form, setForm] = useState<FormState>(emptyForm); const [imageFile, setImageFile] = useState<File | null>(null); const [imagePreview, setImagePreview] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");

  async function loadListings() {
    const response = await fetch("/api/admin/listings", { cache: "no-store" }); const data = await response.json() as { listings?: Listing[]; error?: string };
    if (!response.ok) throw new Error(data.error ?? "Could not load listings."); setListings(data.listings ?? []);
  }
  useEffect(() => { loadListings().catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => listings.filter((listing) => { const needle = query.trim().toLowerCase(); return (!needle || `${listing.reference} ${listing.title} ${listing.asset_type} ${listing.location ?? ""}`.toLowerCase().includes(needle)) && (status === "all" || listing.status === status); }), [listings, query, status]);
  function openCreate() { setError(""); setSelected(undefined); setForm(toForm()); setImageFile(null); setImagePreview(""); setModal("create"); }
  function openEdit(listing: Listing) { setError(""); setSelected(listing); setForm(toForm(listing)); setImageFile(null); setImagePreview(listing.image_url ?? ""); setModal("edit"); }
  function updateField(field: keyof FormState, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  function chooseImage(file: File | undefined) { if (!file) return; setImageFile(file); setImagePreview(URL.createObjectURL(file)); }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); let imageUrl = form.image_url;
    try {
      if (imageFile) { const upload = new FormData(); upload.append("image", imageFile); const response = await fetch("/api/admin/listings/image", { method: "POST", body: upload }); const data = await response.json() as { url?: string; error?: string }; if (!response.ok || !data.url) throw new Error(data.error ?? "Could not upload image."); imageUrl = data.url; }
      const payload = { ...form, image_url: imageUrl, confidence_score: form.confidence_score ? Number(form.confidence_score) : undefined, tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean), risk_flags: form.risk_flags.split(",").map((item) => item.trim()).filter(Boolean) };
      const response = await fetch(selected ? `/api/admin/listings/${selected.id}` : "/api/admin/listings", { method: selected ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error ?? "Could not save listing."); await loadListings(); setModal(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save listing."); } finally { setBusy(false); }
  }
  async function remove(listing: Listing) {
    if (!window.confirm(`Delete ${listing.reference} - ${listing.title}?`)) return; setBusy(true); setError("");
    try { const response = await fetch(`/api/admin/listings/${listing.id}`, { method: "DELETE" }); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error ?? "Could not delete listing."); await loadListings(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete listing."); } finally { setBusy(false); }
  }

  const textFields = ["reference", "title", "asset_type", "location", "source_url", "source_platform", "discovered_by"] as const;
  const trackable = /vessel|container/i.test(`${form.category} ${form.asset_type}`);
  const property = /property|land|building/i.test(`${form.category} ${form.asset_type}`);
  return <section className={`${styles.manager} ${compact ? styles.compact : ""}`}>
    <div className={styles.heading}><div><p className={styles.eyebrow}>Database inventory</p><h2>{compact ? "Listings" : "Manage listings"}</h2></div><button className={styles.primary} type="button" onClick={openCreate}>+ Add listing</button></div>
    <div className={styles.toolbar}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search references, titles or locations" aria-label="Search listings" /><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter listings by status"><option value="all">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select><span>{visible.length} of {listings.length} records</span></div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Ref</th><th>Listing</th><th>Category</th><th>Location</th><th>Status</th><th>Verification</th><th /></tr></thead><tbody>{loading ? Array.from({ length: compact ? 8 : 15 }, (_, index) => <tr className={styles.skeletonRow} key={index}><td><span /></td><td><strong /><small /></td><td><span /></td><td><span /></td><td><span /></td><td><span /></td><td><span /></td></tr>) : visible.slice(0, compact ? 8 : undefined).map((listing) => <tr key={listing.id}><td className={styles.ref}>{listing.reference}</td><td><strong>{listing.title}</strong><small>{listing.asset_type}</small></td><td>{listing.category.replace("track_farm", "track farm")}</td><td>{listing.location || "-"}</td><td><span className={styles.badge}>{listing.status.replaceAll("_", " ")}</span></td><td><span className={styles.badge}>{listing.verification_status.replaceAll("_", " ")}</span></td><td className={styles.actions}><button type="button" onClick={() => openEdit(listing)}>Edit</button><button type="button" onClick={() => remove(listing)} disabled={busy}>Delete</button></td></tr>)}</tbody></table></div>
    {!loading && !visible.length && <p className={styles.empty}>No listings match the current filters.</p>}
    {modal && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}><form className={styles.modal} onSubmit={save}><div className={styles.modalHeader}><div><p className={styles.eyebrow}>Inventory record</p><h2>{modal === "create" ? "Add listing" : "Edit listing"}</h2></div><button className={styles.close} type="button" onClick={() => setModal(null)} aria-label="Close">×</button></div>
      <div className={styles.formGrid}>{textFields.map((field) => <label key={field}>{field.replaceAll("_", " ")}<input required={field === "reference" || field === "title" || field === "asset_type"} value={form[field] ?? ""} onChange={(event) => updateField(field, event.target.value)} /></label>)}{trackable && <label>IMO number<input required value={form.imo_number ?? ""} onChange={(event) => updateField("imo_number", event.target.value)} /></label>}{property && <label className={styles.wide}>Title / COFO verification details<textarea required value={form.verification_details ?? ""} onChange={(event) => updateField("verification_details", event.target.value)} /></label>}
        <label className={styles.imagePicker}>Listing image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => chooseImage(event.target.files?.[0])} /><span>Choose a JPG, PNG, WebP, or GIF up to 8 MB.</span>{imagePreview && <img src={imagePreview} alt="Selected listing preview" />}</label>
        <label>Category<select value={form.category} onChange={(event) => updateField("category", event.target.value)}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Status<select value={form.status} onChange={(event) => updateField("status", event.target.value)}>{statuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></label><label>Verification<select value={form.verification_status} onChange={(event) => updateField("verification_status", event.target.value)}>{verificationStatuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></label><label>Confidence score<input type="number" min="0" max="100" value={form.confidence_score} onChange={(event) => updateField("confidence_score", event.target.value)} /></label><label>Published date<input type="date" value={form.published_at} onChange={(event) => updateField("published_at", event.target.value)} /></label><label className={styles.wide}>Summary<textarea value={form.summary ?? ""} onChange={(event) => updateField("summary", event.target.value)} /></label><label className={styles.wide}>Source summary<textarea value={form.source_summary ?? ""} onChange={(event) => updateField("source_summary", event.target.value)} /></label><label>Tags <span>(comma separated)</span><input value={form.tags} onChange={(event) => updateField("tags", event.target.value)} /></label><label>Risk flags <span>(comma separated)</span><input value={form.risk_flags} onChange={(event) => updateField("risk_flags", event.target.value)} /></label>
      </div>{error && <p className={styles.error}>{error}</p>}<div className={styles.modalActions}><button type="button" onClick={() => setModal(null)}>Cancel</button><button className={styles.primary} type="submit" disabled={busy}>{busy ? "Saving..." : modal === "create" ? "Create listing" : "Save changes"}</button></div></form></div>}
  </section>;
}
