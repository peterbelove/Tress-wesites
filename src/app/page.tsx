import HeroCanvas from "@/components/HeroCanvas";
import SolarCalculator from "@/components/SolarCalculator";
import AIChat from "@/components/AIChat";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ===== HEADER ===== */}
      <header>
        <nav>
          <div className="logo">
            TRES<span>THE ROCK ENGINEERING SOLUTIONS</span>
          </div>
          <input type="checkbox" id="menu-toggle" />
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#calculator">Solar Calc</a>
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href="#process">Process</a>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="nav-cta">
            <label className="burger" htmlFor="menu-toggle">☰</label>
            <Link href="/contact" className="btn btn-primary">Talk to us</Link>
          </div>
        </nav>
      </header>

      {/* ===== HERO ===== */}
      <section className="hero" id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        {/* Live background layers */}
        <div className="hero-aurora" />
        <div className="hero-grid" />
        <div className="hero-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="hero-scan" />
        <HeroCanvas />

        <div className="wrap" style={{ position: "relative", zIndex: 2, width: "100%" }}>
          <div className="eyebrow" style={{ marginBottom: 16, color: "var(--muted)" }}>
            ⚡ The Rock Engineering Solutions · Ibadan, Lagos, Nationwide
          </div>
          <h1 style={{ marginBottom: 0 }}>Engineering<br />better lives.</h1>
          <p className="lead" style={{ maxWidth: 600, fontSize: 18, marginTop: 20 }}>
            TRES designs, installs, and supports practical engineering systems — renewable energy,
            electrical infrastructure, security, and automation — built to work in the real
            conditions our clients operate in.
          </p>

          <div className="hero-badges" style={{ marginTop: 28 }}>
            <span className="hero-badge">⚡ Renewable Energy</span>
            <span className="hero-badge">🔌 Electrical Engineering</span>
            <span className="hero-badge">🔒 Smart Security</span>
            <span className="hero-badge">🏠 Automation</span>
          </div>

          <div className="hero-ctas">
            <Link href="/contact" className="btn btn-primary">Talk to us</Link>
            <a href="#projects" className="btn btn-outline">See our work</a>
            <a href="#calculator" className="btn btn-glass">☀️ Solar Calculator</a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>Scroll</span>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <div className="stats-bar">
        <div className="wrap">
          <div className="stat-item">
            <b>Renewable Energy</b>
            <span>Solar, storage &amp; hybrid systems</span>
          </div>
          <div className="stat-item">
            <b>Electrical Engineering</b>
            <span>Design, installation &amp; power</span>
          </div>
          <div className="stat-item">
            <b>Nationwide</b>
            <span>Ibadan, Lagos &amp; beyond</span>
          </div>
          <div className="stat-item">
            <b>Since Origin Electric</b>
            <span>Roots in practical field engineering</span>
          </div>
        </div>
      </div>

      {/* ===== SERVICES ===== */}
      <section id="services">
        <div className="wrap">
          <div className="eyebrow">Capabilities</div>
          <h2 className="h2">Engineering, installation, and support across five core disciplines</h2>

          {[
            {
              num: "01",
              title: "Renewable Energy",
              lead: "Solar PV, battery storage, and hybrid systems designed for Nigeria's grid realities — sized for the load, not just the roof.",
              items: ["Solar PV design & installation", "Battery storage integration", "Hybrid inverter systems", "Off-grid & backup power"],
              icon: "☀️",
            },
            {
              num: "02",
              title: "Electrical Engineering & Power",
              lead: "Core electrical infrastructure — wiring, distribution, and power systems engineered to code and built to last.",
              items: ["Electrical installation & wiring", "Power distribution design", "Panel boards & switchgear", "Site electrical assessments"],
              icon: "⚡",
            },
            {
              num: "03",
              title: "Smart Security Solutions",
              lead: "CCTV, access control, and monitoring systems integrated into a single, manageable security layer.",
              items: ["CCTV & surveillance", "Access control systems", "Alarm & monitoring integration", "Remote system access"],
              icon: "🔒",
            },
            {
              num: "04",
              title: "Smart Automation",
              lead: "Automation that ties power, security, and building systems together into one coherent, controllable environment.",
              items: ["Home & building automation", "Load & energy management", "Remote monitoring & control", "System integration"],
              icon: "🏠",
            },
            {
              num: "05",
              title: "Procurement & Supply",
              lead: "Sourcing genuine equipment at the right spec, with project management to keep delivery and installation on schedule.",
              items: ["Equipment sourcing", "Vendor management", "Project management", "Logistics & delivery"],
              icon: "📦",
            },
          ].map((svc) => (
            <div className="service-row" key={svc.num} data-reveal>
              <div className="service-num">{svc.num}</div>
              <div>
                <h3>{svc.title}</h3>
                <p className="lead">{svc.lead}</p>
                <ul>
                  {svc.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div
                className="service-img"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 72,
                }}
              >
                {svc.icon}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHO WE SERVE ===== */}
      <section>
        <div className="wrap">
          <div className="eyebrow">Who we serve</div>
          <h2 className="h2">Built for the environments that need it to actually work</h2>
          <div className="grid3">
            {[
              { title: "Residential", desc: "Homes that need reliable power, security, and automation they can depend on daily.", icon: "🏡" },
              { title: "Commercial", desc: "Offices and retail spaces where downtime and security gaps carry real cost.", icon: "🏢" },
              { title: "Industrial", desc: "Facilities with heavier loads and stricter uptime and safety requirements.", icon: "🏭" },
              { title: "Hospitality", desc: "Hotels and event spaces where power and systems must run without interruption.", icon: "🏨" },
              { title: "Real Estate & Institutions", desc: "Developments and organizations planning infrastructure from the ground up.", icon: "🏗️" },
              { title: "Construction Projects", desc: "New builds needing electrical, energy, and security systems engineered in from the start.", icon: "⚙️" },
            ].map((c) => (
              <div className="card glass-card" key={c.title} data-reveal>
                <div className="card-icon">{c.icon}</div>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INTEGRATED SYSTEMS ===== */}
      <section>
        <div className="wrap">
          <div className="eyebrow">Integrated Systems</div>
          <h2 className="h2">Energy, security, and automation, engineered as one system</h2>
          <p className="lead">
            Most infrastructure problems don't sit inside a single discipline. TRES designs power, security,
            and automation together so the pieces actually talk to each other — instead of stacking
            disconnected vendors on top of one another.
          </p>
          <div className="system-visual" data-reveal>
            <div className="sys-node">
              <div className="node-icon">☀️</div>
              Solar Energy
            </div>
            <div className="sys-connector" />
            <div className="sys-node">
              <div className="node-icon">⚡</div>
              Power Grid
            </div>
            <div className="sys-connector" />
            <div className="sys-node">
              <div className="node-icon">🏠</div>
              Automation
            </div>
            <div className="sys-connector" />
            <div className="sys-node">
              <div className="node-icon">🔒</div>
              Security
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOLAR CALCULATOR ===== */}
      <SolarCalculator />

      {/* ===== PROJECTS ===== */}
      <section id="projects">
        <div className="wrap">
          <div className="eyebrow">Featured Projects</div>
          <h2 className="h2">Engineering case studies from the field</h2>

          {[
            {
              tags: ["Residential", "Solar + Storage"],
              title: "Residential Solar Installation",
              desc: "Ibadan · Complete solar PV and battery storage system for a 4-bedroom residence. Off-grid capable, 24-hour power independence.",
              side: "image-first",
            },
            {
              tags: ["Commercial", "Security"],
              title: "Commercial Security Integration",
              desc: "Lagos · End-to-end CCTV, access control, and alarm system for a multi-floor office building with remote monitoring.",
              side: "text-first",
            },
            {
              tags: ["Industrial", "Electrical"],
              title: "Industrial Electrical Design",
              desc: "Nationwide · Full electrical design, panel board installation, and power distribution for an industrial facility.",
              side: "image-first",
            },
          ].map((p, i) => (
            <div
              className="project-row"
              key={i}
              data-reveal
              style={{ flexDirection: p.side === "text-first" ? "row-reverse" : undefined } as React.CSSProperties}
            >
              <div
                className="service-img"
                style={{
                  aspectRatio: "16/10",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 64,
                  background: `linear-gradient(135deg, var(--navy2), var(--green))`,
                }}
              >
                {i === 0 ? "☀️" : i === 1 ? "🔒" : "⚡"}
              </div>
              <div>
                <span className="placeholder-badge">Case Study</span>
                <div className="tags">
                  {p.tags.map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <Link href="/contact" className="btn btn-outline">
                  Get Similar →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about">
        <div className="wrap">
          <div className="eyebrow">About TRES</div>
          <h2 className="h2">Practical engineering, delivered end to end</h2>
          <p className="lead">
            TRES Engineering Limited — The Rock Engineering Solutions — was founded to solve real
            infrastructure problems: power that fails, security that&apos;s incomplete, systems that
            don&apos;t talk to each other. We design, install, and support solutions across renewable
            energy, electrical engineering, security, and automation, backed by procurement and
            project management that keeps delivery on track.
          </p>

          <div className="team-grid" data-reveal>
            <div
              className="team-img glass-card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 72,
                background: "linear-gradient(135deg, var(--navy2), var(--green))",
              }}
            >
              👷
            </div>
            <div>
              <h3>Toyosi Ajibade</h3>
              <p className="lead" style={{ marginTop: 6, color: "var(--green2)" }}>Managing Director</p>
              <p style={{ color: "var(--muted)", marginTop: 12, fontSize: 15, maxWidth: 480 }}>
                Leading TRES Engineering with a focus on practical, end-to-end engineering solutions
                built for Nigeria&apos;s real operating conditions. Rooted in hands-on field engineering
                experience from Origin Electric.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section id="process">
        <div className="wrap">
          <div className="eyebrow">Our Process</div>
          <h2 className="h2">From requirement to long-term support</h2>
          <div className="process-grid">
            {[
              { num: "01", title: "Understand", desc: "We review the site, the requirement, and the constraints before proposing anything." },
              { num: "02", title: "Engineer", desc: "We design the system — sized, specified, and documented for the actual conditions." },
              { num: "03", title: "Execute", desc: "We install and commission the system with the right equipment and process." },
              { num: "04", title: "Support", desc: "We stay engaged after handoff, so the system keeps performing." },
            ].map((step) => (
              <div className="process-step" key={step.num} data-reveal>
                <div className="process-num">{step.num}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section>
        <div className="wrap">
          <div className="eyebrow">Testimonials</div>
          <div className="testi glass" data-reveal>
            <span className="placeholder-badge">Client Testimonial</span>
            <p>&ldquo;TRES delivered our complete solar installation on time and to spec. The system has been running flawlessly — genuine engineering quality.&rdquo;</p>
            <div className="who">Client · Residential Solar Project · Ibadan</div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="wrap">
          <div className="eyebrow" style={{ color: "var(--muted)" }}>Have a project in mind?</div>
          <h2>Tell us what you&apos;re trying to solve.</h2>
          <p>Whether it&apos;s energy, electrical infrastructure, security, or smart technology — let&apos;s engineer the right solution.</p>
          <div className="hero-ctas" style={{ justifyContent: "center" }}>
            <Link href="/contact" className="btn btn-primary">Talk to us</Link>
            <a href="#projects" className="btn btn-outline">View our work</a>
            <a href="#calculator" className="btn btn-glass">☀️ Solar Calculator</a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="logo">TRES</div>
              <p className="lead" style={{ marginTop: 8, fontSize: 13 }}>THE ROCK ENGINEERING SOLUTIONS</p>
              <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8, maxWidth: 220 }}>
                Engineering better lives through practical, integrated engineering systems.
              </p>
            </div>
            <div>
              <h5>Sitemap</h5>
              <a href="#services">Services</a>
              <a href="#calculator">Solar Calculator</a>
              <a href="#projects">Projects</a>
              <a href="#about">About</a>
              <a href="#process">Process</a>
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
              <a href="https://instagram.com/tres_engineering" target="_blank" rel="noopener">@tres_engineering</a>
            </div>
          </div>
          <div className="foot-bottom">
            <div>© 2026 TRES Engineering Limited. All rights reserved.</div>
            <div>The Rock Engineering Solutions</div>
          </div>
        </div>
      </footer>

      {/* ===== FLOATING BUTTONS ===== */}
      <div className="floating" style={{ zIndex: 200 }}>
        <Link href="/contact" className="float-talk">💬 Talk to an Engineer</Link>
        <a
          href="https://wa.me/2347033979488"
          className="float-wa"
          target="_blank"
          rel="noopener noreferrer"
        >
          🟢 WhatsApp
        </a>
      </div>

      {/* ===== AI CHAT ===== */}
      <AIChat />

      {/* Reveal animation script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try{
              const run=()=>{
                const els=document.querySelectorAll('[data-reveal],[data-reveal-left]');
                const io=new IntersectionObserver((entries)=>{
                  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
                },{threshold:.12});
                els.forEach(el=>io.observe(el));
              };
              if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
            }catch(e){}
          `,
        }}
      />
    </>
  );
}
