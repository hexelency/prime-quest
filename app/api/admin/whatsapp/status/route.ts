import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const configured = Boolean(accessToken && phoneNumberId && accessToken !== "your-system-user-token" && phoneNumberId !== "your-phone-number-id");

  if (!configured) return NextResponse.json({ configured: false, connected: false, message: "WhatsApp Cloud API credentials are not configured." });

  try {
    const version = process.env.WHATSAPP_API_VERSION || "v25.0";
    const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating,status`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
    const result = await response.json().catch(() => ({})) as { id?: string; display_phone_number?: string; verified_name?: string; quality_rating?: string; status?: string; error?: { message?: string } };
    if (!response.ok) return NextResponse.json({ configured: true, connected: false, error: result.error?.message ?? `Meta returned ${response.status}.` }, { status: 502 });
    return NextResponse.json({ configured: true, connected: result.status === "CONNECTED", phone: { id: result.id, displayPhoneNumber: result.display_phone_number, verifiedName: result.verified_name, qualityRating: result.quality_rating, status: result.status } });
  } catch (error) {
    return NextResponse.json({ configured: true, connected: false, error: error instanceof Error ? error.message : "Could not reach Meta." }, { status: 502 });
  }
}
