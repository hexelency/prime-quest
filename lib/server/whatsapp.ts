const DEFAULT_API_VERSION = "v25.0";

function cleanPhone(value: string) {
  return value.replace(/[^0-9+]/g, "").replace(/^\+/, "");
}

function greetingForTimezone(timeZone = process.env.WHATSAPP_DEFAULT_TIMEZONE || "Africa/Lagos") {
  const hour = Number(new Intl.DateTimeFormat("en-NG", { hour: "numeric", hour12: false, timeZone }).format(new Date()));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function buildIntakeAcknowledgement(kind: "buyer" | "seller") {
  const label = kind === "buyer" ? "buy" : "sell";
  return `${greetingForTimezone()}, we have received your ${label} request details. We will get back to you as soon as possible. Please check your email regularly for follow-up questions, responses and attachments from PrimeQuest. - PrimeQuest Oil and Properties Consultants`;
}

export async function sendWhatsAppText(to: string, body: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!accessToken || !phoneNumberId || accessToken === "your-system-user-token" || phoneNumberId === "your-phone-number-id") {
    return { configured: false, sent: false };
  }

  const version = process.env.WHATSAPP_API_VERSION || DEFAULT_API_VERSION;
  const templateName = process.env.WHATSAPP_ACK_TEMPLATE_NAME?.trim();
  const payload = templateName
    ? { messaging_product: "whatsapp", recipient_type: "individual", to: cleanPhone(to), type: "template", template: { name: templateName, language: { code: process.env.WHATSAPP_ACK_TEMPLATE_LANGUAGE || "en_US" }, components: [{ type: "body", parameters: [{ type: "text", text: body }] }] } }
    : { messaging_product: "whatsapp", recipient_type: "individual", to: cleanPhone(to), type: "text", text: { preview_url: false, body } };
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({})) as { messages?: Array<{ id?: string }>; error?: { message?: string } };
  if (!response.ok) {
    if (result.error?.message?.includes("Recipient phone number not in allowed list")) {
      throw new Error("This recipient is not in Meta's WhatsApp test recipient allowlist. Add the number under WhatsApp > API Setup > To, then try again.");
    }
    throw new Error(result.error?.message || `WhatsApp request failed with status ${response.status}.`);
  }
  return { configured: true, sent: true, messageId: result.messages?.[0]?.id };
}
