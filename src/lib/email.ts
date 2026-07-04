// Email helper — sends transactional emails via Resend's REST API.
// Free tier: 100 emails/day, 3,000/month. Without a verified custom domain,
// Resend only allows sending from their sandbox address to the email that
// owns the Resend account — verify a domain in the Resend dashboard to send
// to your actual users.

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Memoir <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendAppointmentConfirmation(opts: {
  to: string;
  recipientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY is not set" };
  }

  const { to, recipientName, doctorName, specialty, date, time } = opts;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "an upcoming date";

  const html = `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 480px; margin: 0 auto; color: #2C2420;">
      <h2 style="color: #C47A5A;">Appointment confirmed</h2>
      <p>Hi ${recipientName || "there"},</p>
      <p>Your appointment has been added to Memoir:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 6px 0; color: #6B5E54;">Doctor</td><td style="padding: 6px 0; font-weight: 600;">${doctorName}</td></tr>
        <tr><td style="padding: 6px 0; color: #6B5E54;">Specialty</td><td style="padding: 6px 0; font-weight: 600;">${specialty || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #6B5E54;">Date</td><td style="padding: 6px 0; font-weight: 600;">${formattedDate}</td></tr>
        <tr><td style="padding: 6px 0; color: #6B5E54;">Time</td><td style="padding: 6px 0; font-weight: 600;">${time || "—"}</td></tr>
      </table>
      <p style="color: #9E8E82; font-size: 13px;">You're receiving this because you added this appointment in Memoir.</p>
    </div>
  `;

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [to],
        subject: `Appointment confirmed with ${doctorName}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Resend] send failed (${res.status}):`, err);
      return { sent: false, error: err };
    }

    return { sent: true };
  } catch (err) {
    console.error("[Resend] network error:", err);
    return { sent: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
