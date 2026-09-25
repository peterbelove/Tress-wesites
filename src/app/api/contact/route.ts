import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Log the submission (in production, you'd send an email or save to DB)
    console.log("Contact form submission:", { name, email, phone, company, message, timestamp: new Date().toISOString() });

    // Build WhatsApp message
    const waMessage = encodeURIComponent(
      `🔔 *New Contact Form Submission — TRES Website*\n\n` +
      `👤 *Name:* ${name}\n` +
      `📧 *Email:* ${email}\n` +
      `📱 *Phone:* ${phone || "Not provided"}\n` +
      `🏢 *Company:* ${company || "Not provided"}\n\n` +
      `💬 *Message:*\n${message}`
    );

    const whatsappUrl = `https://wa.me/2347033979488?text=${waMessage}`;

    return NextResponse.json({
      success: true,
      message: "Message received! Redirecting to WhatsApp…",
      whatsappUrl,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
