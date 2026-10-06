"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./listing-manager.module.css";
import type { ListingMedia } from "@/lib/available-listings";

type Listing = {
  id: string; reference: string; title: string; category: string; asset_type: string;
  imo_number?: string | null; verification_details?: string | null;
  location?: string | null; summary?: string | null; source_url?: string | null;
  source_platform?: string | null; source_summary?: string | null; image_url?: string | null;
  media?: ListingMedia[];
  tags?: unknown; discovered_by?: string | null; confidence_score?: number | string | null;
  status: string; verification_status: string; risk_flags?: unknown; published_at?: string | null;
};
type FormState = Omit<Listing, "id" | "tags" | "risk_flags" | "confidence_score" | "published_at"> & { tags: string; risk_flags: string; confidence_score: string; published_at: string };
const emptyForm: FormState = { reference: "", title: "", category: "", asset_type: "", imo_number: "", verification_details: "", location: "", summary: "", source_url: "", source_platform: "", source_summary: "", image_url: "", discovered_by: "admin", confidence_score: "", status: "under_review", verification_status: "potential", tags: "", risk_flags: "", published_at: "" };
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
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]); const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); const [videoPreview, setVideoPreview] = useState("");
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [removedLegacyMediaUrls, setRemovedLegacyMediaUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");

  async function loadListings() {
    const response = await fetch("/api/admin/listings", { cache: "no-store" }); const data = await response.json() as { listings?: Listing[]; error?: string };
    if (!response.ok) throw new Error(data.error ?? "Could not load listings."); setListings(data.listings ?? []);
  }
  useEffect(() => { loadListings().catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => listings.filter((listing) => { const needle = query.trim().toLowerCase(); return (!needle || `${listing.reference} ${listing.title} ${listing.asset_type} ${listing.location ?? ""}`.toLowerCase().includes(needle)) && (status === "all" || listing.status === status); }), [listings, query, status]);
  function openCreate() { clearPreviews(); setError(""); setSelected(undefined); setForm(toForm()); setImageFiles([]); setVideoFile(null); setRemovedMediaIds([]); setRemovedLegacyMediaUrls([]); setModal("create"); }
  function openEdit(listing: Listing) { clearPreviews(); setError(""); setSelected(listing); setForm(toForm(listing)); setImageFiles([]); setVideoFile(null); setRemovedMediaIds([]); setRemovedLegacyMediaUrls([]); setModal("edit"); }
  function updateField(field: keyof FormState, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  function clearPreviews() {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setImagePreviews([]);
    setVideoPreview("");
  }
  function chooseImages(files: File[]) {
    const existingCount = (selected?.media ?? []).filter((media) => media.type === "image" && (media.id ? !removedMediaIds.includes(media.id) : !removedLegacyMediaUrls.includes(media.url))).length;
    if (existingCount + files.length > 2) { setError("A listing can have up to two images."); return; }
    setError("");
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  }
  function chooseVideo(file: File | undefined) {
    if (!file) return;
    const hasExistingVideo = (selected?.media ?? []).some((media) => media.type === "video" && (media.id ? !removedMediaIds.includes(media.id) : !removedLegacyMediaUrls.includes(media.url)));
    if (hasExistingVideo) { setError("A listing can have only one video. Remove the existing video first."); return; }
    setError("");
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  }
  function removeMedia(media: ListingMedia) {
    const mediaId = media.id;
    if (mediaId) setRemovedMediaIds((current) => current.includes(mediaId) ? current : [...current, mediaId]);
    else {
      setRemovedLegacyMediaUrls((current) => current.includes(media.url) ? current : [...current, media.url]);
      if (media.url === form.image_url) updateField("image_url", "");
    }
  }
  async function uploadMedia(listingId: string, files: File[]) {
    const uploaded: { storage_path: string; file_name: string; mime_type: string; file_size: number }[] = [];
    for (const file of files) {
      const signedResponse = await fetch("/api/admin/listings/media/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, file_name: file.name, mime_type: file.type, file_size: file.size }),
      });
      const signed = await signedResponse.json() as { uploadUrl?: string; storagePath?: string; error?: string };
      if (!signedResponse.ok || !signed.uploadUrl || !signed.storagePath) throw new Error(signed.error ?? `Could not prepare ${file.name} for upload.`);
      const uploadResponse = await fetch(signed.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type, "x-upsert": "false" }, body: file });
      if (!uploadResponse.ok) throw new Error(`Could not upload ${file.name} to media storage (${uploadResponse.status}).`);
      uploaded.push({ storage_path: signed.storagePath, file_name: file.name, mime_type: file.type, file_size: file.size });
    }
    return uploaded;
  }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const listingId = selected?.id ?? crypto.randomUUID();
      const payload = { ...form, ...(selected ? {} : { id: listingId }), confidence_score: form.confidence_score ? Number(form.confidence_score) : undefined, tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean), risk_flags: form.risk_flags.split(",").map((item) => item.trim()).filter(Boolean) };
      const response = await fetch(selected ? `/api/admin/listings/${selected.id}` : "/api/admin/listings", { method: selected ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { error?: string; listing?: Listing }; if (!response.ok) throw new Error(data.error ?? "Could not save listing.");
      const savedListing = data.listing ?? { ...form, id: listingId } as Listing;
      setSelected(savedListing);
      const filesToUpload = [...imageFiles, ...(videoFile ? [videoFile] : [])];
      if (filesToUpload.length || removedMediaIds.length || removedLegacyMediaUrls.length) {
        const items = await uploadMedia(listingId, filesToUpload);
        const removedSavedPhoto = (selected?.media ?? []).some((media) => media.type === "image" && (media.id ? removedMediaIds.includes(media.id) : removedLegacyMediaUrls.includes(media.url)));
        const fallbackImageUrl = removedSavedPhoto && !imageFiles.length ? "" : form.image_url;
        const mediaResponse = await fetch(`/api/admin/listings/${listingId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, remove_ids: removedMediaIds, fallback_image_url: fallbackImageUrl }),
        });
        const mediaResult = await mediaResponse.json() as { error?: string; media?: ListingMedia[]; image_url?: string | null };
        if (!mediaResponse.ok) throw new Error(mediaResult.error ?? "The listing was saved, but its media could not be saved.");
        setSelected({ ...savedListing, image_url: mediaResult.image_url, media: mediaResult.media });
      }
      await loadListings(); clearPreviews(); setModal(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save listing."); } finally { setBusy(false); }
  }
  async function remove(listing: Listing) {
    if (!window.confirm(`Delete ${listing.reference} - ${listing.title}?`)) return; setBusy(true); setError("");
    try { const response = await fetch(`/api/admin/listings/${listing.id}`, { method: "DELETE" }); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error ?? "Could not delete listing."); await loadListings(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete listing."); } finally { setBusy(false); }
  }

  const textFields = [
    ["reference", "Unique listing reference, e.g. PQ-2026-001"],
    ["title", "e.g. 65m Platform Supply Vessel"],
    ["asset_type", "e.g. Platform supply vessel (PSV)"],
    ["location", "e.g. Port Harcourt, Nigeria"],
    ["source_url", "https://example.com/verified-listing"],
    ["source_platform", "e.g. Seller website or broker platform"],
    ["discovered_by", "e.g. Admin, seller mandate, or research"],
  ] as const;
  const trackable = /vessel|container/i.test(`${form.category} ${form.asset_type}`);
  const property = /property|land|building/i.test(`${form.category} ${form.asset_type}`);
  return <section className={`${styles.manager} ${compact ? styles.compact : ""}`}>
    <div className={styles.heading}><div><p className={styles.eyebrow}>Database inventory</p><h2>{compact ? "Listings" : "Manage listings"}</h2></div><button className={styles.primary} type="button" onClick={openCreate}>+ Add listing</button></div>
    <div className={styles.toolbar}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search references, titles or locations" aria-label="Search listings" /><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter listings by status"><option value="all">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select><span>{visible.length} of {listings.length} records</span></div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Ref</th><th>Listing</th><th>Category</th><th>Location</th><th>Status</th><th>Verification</th><th /></tr></thead><tbody>{loading ? Array.from({ length: compact ? 8 : 15 }, (_, index) => <tr className={styles.skeletonRow} key={index}><td><span /></td><td><strong /><small /></td><td><span /></td><td><span /></td><td><span /></td><td><span /></td><td><span /></td></tr>) : visible.slice(0, compact ? 8 : undefined).map((listing) => <tr key={listing.id}><td className={styles.ref}>{listing.reference}</td><td><strong>{listing.title}</strong><small>{listing.asset_type}</small></td><td>{listing.category.replace("track_farm", "track farm")}</td><td>{listing.location || "-"}</td><td><span className={styles.badge}>{listing.status.replaceAll("_", " ")}</span></td><td><span className={styles.badge}>{listing.verification_status.replaceAll("_", " ")}</span></td><td className={styles.actions}><button type="button" onClick={() => openEdit(listing)}>Edit</button><button type="button" onClick={() => remove(listing)} disabled={busy}>Delete</button></td></tr>)}</tbody></table></div>
    {!loading && !visible.length && <p className={styles.empty}>No listings match the current filters.</p>}
    {modal && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { clearPreviews(); setModal(null); } }}><form className={styles.modal} onSubmit={save}><div className={styles.modalHeader}><div><p className={styles.eyebrow}>Inventory record</p><h2>{modal === "create" ? "Add listing" : "Edit listing"}</h2></div><button className={styles.close} type="button" onClick={() => { clearPreviews(); setModal(null); }} aria-label="Close">×</button></div>
      <div className={styles.formGrid}>
        <label className={`${styles.wide} ${styles.categoryPicker}`}>Category <span>Start here. The category controls which verification details are required.</span><select required value={form.category} onChange={(event) => updateField("category", event.target.value)}><option value="" disabled>Select the listing category</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        {textFields.map(([field, placeholder]) => <label key={field}>{field.replaceAll("_", " ")}<input required={field === "reference" || field === "title" || field === "asset_type"} type={field === "source_url" ? "url" : "text"} placeholder={placeholder} value={form[field] ?? ""} onChange={(event) => updateField(field, event.target.value)} /></label>)}
        {trackable && <label>IMO number <span>Enter the vessel’s 7-digit IMO number.</span><input required inputMode="numeric" pattern="[0-9]{7}" title="Enter a valid 7-digit IMO number." placeholder="e.g. 9074729" value={form.imo_number ?? ""} onChange={(event) => updateField("imo_number", event.target.value)} /></label>}
        {property && <label className={styles.wide}>Title / COFO verification details <span>Provide a title, Certificate of Occupancy, or another traceable document reference.</span><textarea required placeholder="e.g. Certificate of Occupancy number and issuing authority" value={form.verification_details ?? ""} onChange={(event) => updateField("verification_details", event.target.value)} /></label>}
        <div className={`${styles.imagePicker} ${styles.wide}`}>
          <strong>Listing photos and video</strong>
          <label>Photos<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => chooseImages(Array.from(event.target.files ?? []))} /><span>Up to two JPG, PNG, WebP, or GIF photos; 8 MB each.</span></label>
          <label>Video<input type="file" accept="video/mp4,video/webm" onChange={(event) => chooseVideo(event.target.files?.[0])} /><span>One MP4 or WebM video, up to 50 MB.</span></label>
          <div className={styles.mediaPreviews}>{(selected?.media ?? []).filter((media) => media.id ? !removedMediaIds.includes(media.id) : !removedLegacyMediaUrls.includes(media.url)).map((media) => <div className={styles.mediaPreview} key={media.id ?? media.url}>{media.type === "video" ? <video src={media.url} controls preload="metadata" /> : <img src={media.url} alt="Saved listing media" />}<button type="button" onClick={() => removeMedia(media)}>Remove</button></div>)}{imageFiles.map((file, index) => <div className={styles.mediaPreview} key={`${file.name}-${file.lastModified}`}><img src={imagePreviews[index]} alt={`Selected ${file.name}`} /><span>{file.name}</span></div>)}{videoFile && <div className={styles.mediaPreview}><video src={videoPreview} controls preload="metadata" /><span>{videoFile.name}</span></div>}</div>
        </div>
        <label>Status <span>Published listings are shown in the public marketplace.</span><select value={form.status} onChange={(event) => updateField("status", event.target.value)}>{statuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></label>
        <label>Verification <span>Only confirmed or verified listings appear publicly.</span><select value={form.verification_status} onChange={(event) => updateField("verification_status", event.target.value)}>{verificationStatuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></label>
        <label>Confidence score <span>Optional confidence rating from 0 to 100.</span><input type="number" min="0" max="100" placeholder="e.g. 85" value={form.confidence_score} onChange={(event) => updateField("confidence_score", event.target.value)} /></label>
        <label>Published date <span>Leave blank if the listing is not published yet.</span><input type="date" value={form.published_at} onChange={(event) => updateField("published_at", event.target.value)} /></label>
        <label className={styles.wide}>Summary <span>Short, factual overview for prospective buyers.</span><textarea placeholder="e.g. 2012-built PSV, 3,200 DWT, with current inspection records available." value={form.summary ?? ""} onChange={(event) => updateField("summary", event.target.value)} /></label>
        <label className={styles.wide}>Source summary <span>Note where the information came from and what has been checked.</span><textarea placeholder="e.g. Details provided by the registered owner; specifications checked against the latest vessel document pack." value={form.source_summary ?? ""} onChange={(event) => updateField("source_summary", event.target.value)} /></label>
        <label>Tags <span>Separate short, factual tags with commas.</span><input placeholder="e.g. Verified documents, ready to inspect" value={form.tags} onChange={(event) => updateField("tags", event.target.value)} /></label>
        <label>Risk flags <span>Separate unresolved risks with commas; leave blank if none.</span><input placeholder="e.g. Ownership confirmation pending" value={form.risk_flags} onChange={(event) => updateField("risk_flags", event.target.value)} /></label>
      </div>{error && <p className={styles.error}>{error}</p>}<div className={styles.modalActions}><button type="button" onClick={() => setModal(null)}>Cancel</button><button className={styles.primary} type="submit" disabled={busy}>{busy ? "Saving..." : modal === "create" ? "Create listing" : "Save changes"}</button></div></form></div>}
  </section>;
}
