import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are TRES AI, the intelligent assistant for The Rock Engineering Solutions Limited (TRES Engineering) — a professional engineering company based in Ibadan, Nigeria, serving Lagos and nationwide.

ABOUT TRES ENGINEERING:
- Full name: The Rock Engineering Solutions Limited (TRES Engineering)
- Managing Director: Toyosi Ajibade
- Locations: Ibadan, Lagos, Nationwide
- Phone: 0703 397 9488 / 0913 070 3970
- Email: tresengineeringltd1@gmail.com
- Instagram: @tres_engineering
- WhatsApp: +2347033979488

CORE SERVICES:
1. Renewable Energy — Solar PV design & installation, battery storage, hybrid inverter systems, off-grid & backup power
2. Electrical Engineering & Power — Electrical installation & wiring, power distribution design, panel boards & switchgear, site electrical assessments
3. Smart Security Solutions — CCTV & surveillance, access control systems, alarm & monitoring integration, remote system access
4. Smart Automation — Home & building automation, load & energy management, remote monitoring & control, system integration
5. Procurement & Supply — Equipment sourcing, vendor management, project management, logistics & delivery

WHO WE SERVE:
- Residential (homes needing reliable power, security, automation)
- Commercial (offices, retail spaces)
- Industrial (heavy loads, strict uptime)
- Hospitality (hotels, event spaces)
- Real Estate & Institutions
- Construction Projects

OUR PROCESS:
1. Understand — Site review, requirements, constraints
2. Engineer — System design, sizing, specification, documentation
3. Execute — Installation and commissioning
4. Support — Post-handoff ongoing engagement

KEY STRENGTHS:
- Integrated approach: power, security, and automation engineered together as one system
- Practical field engineering experience
- Designed for Nigeria's actual grid realities (frequent outages, voltage fluctuations)
- Roots in Origin Electric

PRICING POLICY:
- NEVER quote specific prices or price ranges for any service
- Always direct pricing questions to WhatsApp: https://wa.me/2347033979488
- You can say something like: "For an accurate quote tailored to your specific needs, please contact us on WhatsApp at +234 703 397 9488"

SOLAR CALCULATOR:
- Direct users to the Solar Calculator tool on the website for load analysis
- Explain that the calculator helps estimate solar system size based on their appliances

BEHAVIOUR GUIDELINES:
- Be professional, warm, and knowledgeable
- Answer questions about engineering topics related to solar, electrical, security, automation
- Help users understand what they need for their specific situation
- Speak in clear, plain English (avoid excessive jargon unless user is technical)
- When you don't know something specific, recommend they speak directly with the team
- Keep responses concise and helpful — aim for 2-4 short paragraphs max
- Never make up project details, client names, or pricing
- If asked about ongoing or past projects, explain those details are available through direct consultation
- Show enthusiasm for engineering and problem-solving`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback response when no API key is configured
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      let reply = "";

      if (lastMsg.includes("solar") || lastMsg.includes("panel") || lastMsg.includes("energy")) {
        reply = "Great question about solar energy! TRES specialises in solar PV design and installation tailored for Nigeria's grid realities. We size systems for your actual load — not just your roof space.\n\nFor a proper assessment, use our Solar Calculator on this page, or speak with our team directly. For pricing, please reach us on WhatsApp: +234 703 397 9488";
      } else if (lastMsg.includes("price") || lastMsg.includes("cost") || lastMsg.includes("how much") || lastMsg.includes("quote")) {
        reply = "For accurate pricing tailored to your project, please contact our team directly on WhatsApp — we'll give you a detailed quote based on your specific requirements.\n\n📱 WhatsApp: +234 703 397 9488\n📧 Email: tresengineeringltd1@gmail.com";
      } else if (lastMsg.includes("security") || lastMsg.includes("cctv") || lastMsg.includes("camera") || lastMsg.includes("access control")) {
        reply = "TRES provides comprehensive smart security solutions including CCTV surveillance, access control systems, alarm integration, and remote monitoring — all managed as a single security layer.\n\nWhether it's a home, office, or industrial facility, we design security that actually works together. Contact us to discuss your requirements: +234 703 397 9488";
      } else if (lastMsg.includes("electrical") || lastMsg.includes("wiring") || lastMsg.includes("panel")) {
        reply = "Our electrical engineering team handles everything from site assessments and panel board design to full electrical installations — all engineered to code and built to last.\n\nReach out to us via WhatsApp for a consultation: +234 703 397 9488";
      } else if (lastMsg.includes("contact") || lastMsg.includes("reach") || lastMsg.includes("call") || lastMsg.includes("phone")) {
        reply = "You can reach TRES Engineering through multiple channels:\n\n📱 Phone: 0703 397 9488 / 0913 070 3970\n💬 WhatsApp: +234 703 397 9488\n📧 Email: tresengineeringltd1@gmail.com\n📍 Ibadan, Lagos, Nationwide\n\nOur team typically responds within 1 business day.";
      } else if (lastMsg.includes("automation") || lastMsg.includes("smart home") || lastMsg.includes("smart")) {
        reply = "TRES designs smart automation systems that integrate your power, security, and building systems into one controllable environment — home automation, energy management, remote monitoring, and full system integration.\n\nLet's discuss what automation would look like for your space. Contact us: +234 703 397 9488";
      } else if (lastMsg.includes("hello") || lastMsg.includes("hi") || lastMsg.includes("hey") || lastMsg.includes("good")) {
        reply = "Hello! I'm TRES AI, the virtual assistant for The Rock Engineering Solutions. 👋\n\nI'm here to help you understand our engineering services — solar energy, electrical systems, security, and automation. How can I help you today?";
      } else {
        reply = "Thank you for reaching out to TRES Engineering — The Rock Engineering Solutions!\n\nWe specialise in renewable energy (solar), electrical engineering, smart security, and automation systems. Our team engineers solutions tailored to real Nigerian conditions.\n\nFor detailed discussions or pricing, please contact our team:\n📱 WhatsApp: +234 703 397 9488\n📧 tresengineeringltd1@gmail.com";
      }

      return NextResponse.json({ reply });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please contact us directly at +234 703 397 9488.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        reply: "I'm having a technical issue right now. Please contact TRES Engineering directly:\n📱 WhatsApp: +234 703 397 9488\n📧 tresengineeringltd1@gmail.com",
      },
      { status: 200 }
    );
  }
}
