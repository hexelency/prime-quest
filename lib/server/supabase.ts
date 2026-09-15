type SupabaseRow = Record<string, unknown>;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;
  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

export function isDatabaseConfigured() {
  return Boolean(getSupabaseConfig());
}

export async function selectFromSupabase(table: string, query: Record<string, string>) {
  const config = getSupabaseConfig();
  if (!config) return [] as SupabaseRow[];

  const params = new URLSearchParams({ select: "*", ...query });
  const response = await fetch(`${config.url}/rest/v1/${table}?${params.toString()}`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed for ${table}: ${response.status}`);
  }

  return (await response.json()) as SupabaseRow[];
}

export async function insertIntoSupabase(table: string, row: SupabaseRow) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Database is not configured.");

  const response = await fetch(`${config.url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    throw new Error(`Supabase insert failed for ${table}: ${response.status}`);
  }

  return (await response.json()) as SupabaseRow[];
}

export async function updateSupabase(table: string, filter: string, row: SupabaseRow) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Database is not configured.");

  const response = await fetch(`${config.url}/rest/v1/${table}?${filter}`, {
    method: "PATCH",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) throw new Error(`Supabase update failed for ${table}: ${response.status}`);
  return (await response.json()) as SupabaseRow[];
}
