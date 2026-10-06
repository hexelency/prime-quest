import { randomUUID } from "node:crypto";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", { extension: "jpg", type: "image" as const }],
  ["image/png", { extension: "png", type: "image" as const }],
  ["image/webp", { extension: "webp", type: "image" as const }],
  ["image/gif", { extension: "gif", type: "image" as const }],
  ["video/mp4", { extension: "mp4", type: "video" as const }],
  ["video/webm", { extension: "webm", type: "video" as const }],
]);

function storageConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Listing media storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return { url, serviceRoleKey, bucket: process.env.SUPABASE_LISTING_MEDIA_BUCKET || "listing-media" };
}

async function storageRequest(path: string, init: RequestInit = {}) {
  const config = storageConfig();
  const response = await fetch(`${config.url}/storage/v1${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      ...init.headers,
    },
  });
  return response;
}

async function ensureBucket() {
  const { bucket } = storageConfig();
  const existing = await storageRequest(`/bucket/${encodeURIComponent(bucket)}`);
  if (existing.ok) {
    const details = await existing.json() as { public?: boolean };
    if (details.public) return;
    const updated = await storageRequest(`/bucket/${encodeURIComponent(bucket)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        public: true,
        file_size_limit: MAX_VIDEO_SIZE,
        allowed_mime_types: [...allowedTypes.keys()],
      }),
    });
    if (!updated.ok) throw new Error(`Could not enable public listing media (${updated.status}): ${await updated.text()}`);
    return;
  }
  const details = await existing.text();
  const missing = existing.status === 404
    || (existing.status === 400 && /bucket not found|bucket does not exist/i.test(details));
  if (!missing) {
    throw new Error(`Could not check listing media bucket (${existing.status}): ${details || existing.statusText}`);
  }

  const created = await storageRequest("/bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: MAX_VIDEO_SIZE,
      allowed_mime_types: [...allowedTypes.keys()],
    }),
  });
  if (created.ok) return;
  if (created.status === 409) {
    const racedBucket = await storageRequest(`/bucket/${encodeURIComponent(bucket)}`);
    if (racedBucket.ok) {
      const racedDetails = await racedBucket.json() as { public?: boolean };
      if (racedDetails.public) return;
      const updated = await storageRequest(`/bucket/${encodeURIComponent(bucket)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public: true,
          file_size_limit: MAX_VIDEO_SIZE,
          allowed_mime_types: [...allowedTypes.keys()],
        }),
      });
      if (updated.ok) return;
      throw new Error(`Could not enable public listing media (${updated.status}): ${await updated.text()}`);
    }
    throw new Error(`Listing media bucket was created concurrently but could not be checked (${racedBucket.status}): ${await racedBucket.text()}`);
  }
  throw new Error(`Could not create listing media bucket (${created.status}): ${await created.text()}`);
}

export function validateListingMedia(mimeType: unknown, size: unknown) {
  const mediaType = typeof mimeType === "string" ? allowedTypes.get(mimeType) : undefined;
  if (!mediaType) {
    return { error: "Use JPG, PNG, WebP, or GIF images, or MP4 and WebM videos." };
  }
  if (typeof size !== "number" || !Number.isSafeInteger(size) || size <= 0) return { error: "The selected file is empty or invalid." };
  const maxSize = mediaType.type === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (size > maxSize) return { error: mediaType.type === "image" ? "Images must be 8 MB or smaller." : "Videos must be 50 MB or smaller." };
  return { mediaType: mediaType.type, maxSize };
}

export async function createListingUploadUrl(listingId: string, fileName: string, mimeType: string) {
  const mediaType = allowedTypes.get(mimeType);
  if (!mediaType) throw new Error("Unsupported listing media type.");
  await ensureBucket();
  const { bucket } = storageConfig();
  const storagePath = `listings/${listingId}/${randomUUID()}.${mediaType.extension}`;
  const signPath = `/object/upload/sign/${encodeURIComponent(bucket)}/${storagePath.split("/").map(encodeURIComponent).join("/")}`;
  const response = await storageRequest(signPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ upsert: false }),
  });
  if (!response.ok) throw new Error(`Could not prepare listing upload (${response.status}): ${await response.text()}`);
  const result = await response.json() as {
    url?: unknown;
    signedURL?: unknown;
    signedUrl?: unknown;
    token?: unknown;
    path?: unknown;
    data?: { url?: unknown; signedURL?: unknown; signedUrl?: unknown; token?: unknown; path?: unknown };
  };
  const payload = result.data ?? result;
  let signedUrl = [payload.url, payload.signedUrl, payload.signedURL].find((value): value is string => typeof value === "string" && value.length > 0);
  if (!signedUrl && typeof payload.token === "string" && typeof payload.path === "string") {
    const objectPath = payload.path.startsWith(`${bucket}/`) ? payload.path : `${bucket}/${payload.path}`;
    const token = new URLSearchParams({ token: payload.token }).toString();
    signedUrl = `/object/upload/sign/${objectPath.split("/").map(encodeURIComponent).join("/")}?${token}`;
  }
  if (!signedUrl) {
    const fields = Object.keys(payload).filter((key) => !["token", "signedUrl", "signedURL"].includes(key));
    throw new Error(`Supabase returned a successful upload-signing response without a URL (response fields: ${fields.join(", ") || "none"}).`);
  }
  const config = storageConfig();
  const uploadUrl = /^https?:\/\//i.test(signedUrl)
    ? signedUrl
    : `${config.url}${signedUrl.startsWith("/storage/v1/") ? "" : "/storage/v1"}${signedUrl.startsWith("/") ? signedUrl : `/${signedUrl}`}`;
  return { storagePath: `supabase://${bucket}/${storagePath}`, uploadUrl, url: publicListingMediaUrl(`supabase://${bucket}/${storagePath}`), fileName };
}

export function publicListingMediaUrl(storagePath: string) {
  const match = /^supabase:\/\/([^/]+)\/(.+)$/.exec(storagePath);
  if (!match) throw new Error("Listing media has an invalid storage path.");
  const { url } = storageConfig();
  const encodedPath = match[2].split("/").map(encodeURIComponent).join("/");
  return `${url}/storage/v1/object/public/${encodeURIComponent(match[1])}/${encodedPath}`;
}

export async function removeListingMediaObjects(storagePaths: string[]) {
  if (!storagePaths.length) return;
  const { bucket } = storageConfig();
  const prefixes = storagePaths.map((storagePath) => {
    const prefix = `supabase://${bucket}/`;
    if (!storagePath.startsWith(prefix)) throw new Error("Refusing to remove listing media outside the configured bucket.");
    return storagePath.slice(prefix.length);
  });
  const response = await storageRequest(`/object/${encodeURIComponent(bucket)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes }),
  });
  if (!response.ok) throw new Error(`Could not remove listing media (${response.status}): ${await response.text()}`);
}

export function listingMediaBucket() {
  return storageConfig().bucket;
}
