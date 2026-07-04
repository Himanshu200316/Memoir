import { NextRequest, NextResponse } from "next/server";
import { sendAppointmentConfirmation, isEmailConfigured } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { to, recipientName, doctorName, specialty, date, time } = await request.json();

    if (!to || !doctorName) {
      return NextResponse.json(
        { error: "to and doctorName are required" },
        { status: 400 }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { sent: false, message: "Email is not configured (RESEND_API_KEY missing)" },
        { status: 200 }
      );
    }

    const result = await sendAppointmentConfirmation({ to, recipientName, doctorName, specialty, date, time });

    if (!result.sent) {
      return NextResponse.json({ sent: false, error: result.error }, { status: 502 });
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Notify appointment API error:", error);
    return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 });
  }
}
