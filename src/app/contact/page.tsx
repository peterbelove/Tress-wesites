"use client";

import { useState } from "react";
import Link from "next/link";
import AIChat from "@/components/AIChat";

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", company: "", service: "", message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setWhatsappUrl(data.whatsappUrl);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      {/* HEADER */}
      <header>
        <nav>
          <div className="logo">
            TRES<span>THE ROCK ENGINEERING SOLUTIONS</span>
          </div>
          <input type="checkbox" id="menu-toggle" />
          <div className="nav-links">
            <a href="/#home">Home</a>
            <a href="/#services">Services</a>
            <a href="/#calculator">Solar Calc</a>
            <a href="/#projects">Projects</a>
            <a href="/#about">About</a>
            <a href="/#process">Process</a>
            <Link href="/contact" className="active">Contact</Link>
          </div>
          <div className="nav-cta">
            <label className="burger" htmlFor="menu-toggle">☰</label>
            <Link href="/" className="btn btn-outline">← Back to Home</Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section
        className="hero hero-sm"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <div className="hero-aurora" />
        <div className="hero-grid" />
        <div className="hero-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="hero-scan" />
        <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
          <div className="eyebrow">Contact</div>
          <h1>Let&apos;s engineer what&apos;s next.</h1>
          <p className="lead" style={{ color: "#c9d2e0" }}>
            Solar, security, automation — and the engineering that ties them together. Tell us
            about your project and our team will get back to you promptly.
          </p>
          <div className="hero-badges" style={{ marginTop: 24 }}>
            <span className="hero-badge">⚡ Renewable Energy</span>
            <span className="hero-badge">🔌 Electrical Systems</span>
            <span className="hero-badge">🔒 Security &amp; Automation</span>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section style={{ borderBottom: "none" }}>
        <div className="wrap">
          <div className="contact-wrap glass">
            {/* Left: Info */}
            <div className="contact-info">
              <div className="eyebrow">Direct lines</div>
              <h3>Get in Touch</h3>
              <p>Prefer to reach out directly? We&apos;re one call or WhatsApp away.</p>

              {[
                { label: "Phone", val: "0703 397 9488", href: "tel:+2347033979488" },
                { label: "Phone", val: "0913 070 3970", href: "tel:+2349130703970" },
                { label: "Email", val: "tresengineeringltd1@gmail.com", href: "mailto:tresengineeringltd1@gmail.com" },
                { label: "WhatsApp", val: "+234 703 397 9488", href: "https://wa.me/2347033979488" },
                { label: "Location", val: "Ibadan, Lagos, Nationwide", href: undefined },
              ].map((item, i) => (
                <div className="cline" key={i}>
                  <div className="clabel">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} className="cval" style={{ color: "#fff", textDecoration: "none" }}>
                      {item.val}
                    </a>
                  ) : (
                    <div className="cval">{item.val}</div>
                  )}
                </div>
              ))}

              <div className="socials">
                <a
                  href="https://instagram.com/tres_engineering"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram: @tres_engineering"
                >
                  IG
                </a>
                <a
                  href="https://wa.me/2347033979488"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  WA
                </a>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", marginTop: 28, paddingTop: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Working hours</div>
                <p style={{ color: "#c9d2e0", fontSize: 13, lineHeight: 1.7 }}>
                  Mon – Fri: 8:00am – 6:00pm<br />
                  Sat: 9:00am – 4:00pm<br />
                  Typically replies within 1 business day
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="contact-form">
              <div className="eyebrow">Send us a message</div>

              {status === "success" ? (
                <div
                  style={{
                    padding: 32, textAlign: "center", border: "1px solid rgba(14,107,74,.4)",
                    borderRadius: 12, background: "rgba(14,107,74,.08)", marginTop: 16,
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <h3 style={{ color: "#fff", marginBottom: 10 }}>Message received!</h3>
                  <p style={{ color: "var(--muted)", marginBottom: 24 }}>
                    Your message has been captured. Click below to send it directly to our team
                    on WhatsApp for the fastest response.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      background: "linear-gradient(135deg,#25D366,#128C7E)",
                      color: "#fff",
                      marginBottom: 16,
                    }}
                  >
                    💬 Open WhatsApp Conversation
                  </a>
                  <br />
                  <button
                    className="btn btn-outline"
                    style={{ marginTop: 8 }}
                    onClick={() => {
                      setStatus("idle");
                      setForm({ name: "", email: "", phone: "", company: "", service: "", message: "" });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
                  <div className="form-row">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      required
                      value={form.name}
                      onChange={handleChange}
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      required
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="company"
                      placeholder="Company / Organisation"
                      value={form.company}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-row" style={{ gridTemplateColumns: "1fr" }}>
                    <select
                      name="service"
                      className="calc-select"
                      value={form.service}
                      onChange={handleChange}
                      style={{ marginBottom: 0 }}
                    >
                      <option value="">Service of Interest (optional)</option>
                      <option value="solar">☀️ Renewable Energy / Solar</option>
                      <option value="electrical">⚡ Electrical Engineering & Power</option>
                      <option value="security">🔒 Smart Security Solutions</option>
                      <option value="automation">🏠 Smart Automation</option>
                      <option value="procurement">📦 Procurement & Supply</option>
                      <option value="multiple">Multiple Services</option>
                    </select>
                  </div>
                  <br />
                  <textarea
                    name="message"
                    placeholder="Tell us about your project — location, size, specific requirements… *"
                    required
                    value={form.message}
                    onChange={handleChange}
                  />

                  {status === "error" && (
                    <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>
                      Something went wrong. Please try again or contact us directly on WhatsApp.
                    </p>
                  )}

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? "Sending…" : "Send Message"}
                    </button>
                    <a
                      href="https://wa.me/2347033979488"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff" }}
                    >
                      💬 WhatsApp Instead
                    </a>
                  </div>
                  <p style={{ marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
                    Typically replies within 1 business day · All details are kept private
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section style={{ padding: "64px 0" }}>
        <div className="wrap">
          <div className="eyebrow">Quick access</div>
          <h2 className="h2">Other ways to engage</h2>
          <div className="grid3" style={{ marginTop: 32 }}>
            <div className="card glass-card">
              <div className="card-icon">☀️</div>
              <h4>Solar Calculator</h4>
              <p>Estimate your solar system size and requirements instantly, then get a quote via WhatsApp.</p>
              <a href="/#calculator" className="btn btn-outline" style={{ marginTop: 16, fontSize: 12 }}>
                Try Calculator →
              </a>
            </div>
            <div className="card glass-card">
              <div className="card-icon">🤖</div>
              <h4>Chat with TRES AI</h4>
              <p>Ask our AI assistant about solar, electrical, security, and automation — 24/7 availability.</p>
              <button
                className="btn btn-outline"
                style={{ marginTop: 16, fontSize: 12 }}
                onClick={() => {
                  const btn = document.querySelector('[aria-label="Open TRES AI chat"]') as HTMLButtonElement;
                  btn?.click();
                }}
              >
                Open Chat →
              </button>
            </div>
            <div className="card glass-card">
              <div className="card-icon">💬</div>
              <h4>WhatsApp Direct</h4>
              <p>Fastest response. Message our team directly on WhatsApp for quotes and urgent enquiries.</p>
              <a
                href="https://wa.me/2347033979488"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", marginTop: 16, fontSize: 12 }}
              >
                Message Now →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="logo">TRES</div>
              <p className="lead" style={{ marginTop: 8, fontSize: 13 }}>THE ROCK ENGINEERING SOLUTIONS</p>
            </div>
            <div>
              <h5>Sitemap</h5>
              <a href="/#services">Services</a>
              <a href="/#calculator">Solar Calculator</a>
              <a href="/#projects">Projects</a>
              <a href="/#about">About</a>
              <Link href="/contact">Contact</Link>
            </div>
            <div>
              <h5>Locations</h5>
              <div>Ibadan</div>
              <div>Lagos</div>
              <div>Nationwide</div>
            </div>
            <div>
              <h5>Contact</h5>
              <div>0703 397 9488</div>
              <div>0913 070 3970</div>
              <a href="mailto:tresengineeringltd1@gmail.com">tresengineeringltd1@gmail.com</a>
              <div>@tres_engineering</div>
            </div>
          </div>
          <div className="foot-bottom">
            <div>© 2026 TRES Engineering Limited. All rights reserved.</div>
            <div>The Rock Engineering Solutions</div>
          </div>
        </div>
      </footer>

      {/* FLOATING */}
      <div className="floating" style={{ zIndex: 200 }}>
        <a
          href="https://wa.me/2347033979488"
          className="float-wa"
          target="_blank"
          rel="noopener noreferrer"
        >
          🟢 WhatsApp
        </a>
      </div>

      {/* AI CHAT */}
      <AIChat />
    </>
  );
}
