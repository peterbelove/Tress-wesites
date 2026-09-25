"use client";

import { useState, useMemo } from "react";

interface Appliance {
  id: string;
  name: string;
  icon: string;
  watts: number;
  defaultHours: number;
  qty: number;
  hours: number;
}

const DEFAULT_APPLIANCES: Appliance[] = [
  { id: "fan", name: "Ceiling Fan", icon: "🌀", watts: 60, defaultHours: 8, qty: 0, hours: 8 },
  { id: "lights", name: "LED Lights (per bulb)", icon: "💡", watts: 10, defaultHours: 10, qty: 0, hours: 10 },
  { id: "tv", name: "Television (32–43\")", icon: "📺", watts: 100, defaultHours: 6, qty: 0, hours: 6 },
  { id: "fridge", name: "Refrigerator", icon: "🧊", watts: 150, defaultHours: 24, qty: 0, hours: 24 },
  { id: "ac", name: "Air Conditioner (1HP)", icon: "❄️", watts: 746, defaultHours: 8, qty: 0, hours: 8 },
  { id: "laptop", name: "Laptop", icon: "💻", watts: 65, defaultHours: 6, qty: 0, hours: 6 },
  { id: "phone", name: "Phone Charger", icon: "📱", watts: 10, defaultHours: 3, qty: 0, hours: 3 },
  { id: "microwave", name: "Microwave", icon: "♨️", watts: 1000, defaultHours: 1, qty: 0, hours: 1 },
  { id: "washing", name: "Washing Machine", icon: "🫧", watts: 500, defaultHours: 1, qty: 0, hours: 1 },
  { id: "pump", name: "Water Pump", icon: "💧", watts: 750, defaultHours: 2, qty: 0, hours: 2 },
  { id: "decoder", name: "TV Decoder / Satellite", icon: "📡", watts: 30, defaultHours: 6, qty: 0, hours: 6 },
  { id: "router", name: "WiFi Router", icon: "📶", watts: 15, defaultHours: 24, qty: 0, hours: 24 },
];

interface CalcResult {
  dailyKwh: number;
  peakLoad: number;
  panelKwp: number;
  batteryKwh: number;
  inverterKva: number;
  systemType: string;
  recommendations: string[];
}

function buildWhatsAppMsg(result: CalcResult, buildingType: string, backupHours: string): string {
  return encodeURIComponent(
    `Hello TRES Engineering! I used your Solar Calculator and got the following results:\n\n` +
    `📍 Building Type: ${buildingType}\n` +
    `⚡ Daily Energy: ${result.dailyKwh.toFixed(2)} kWh\n` +
    `🔋 Peak Load: ${result.peakLoad.toFixed(0)} W\n` +
    `☀️ Recommended Solar: ${result.panelKwp.toFixed(2)} kWp\n` +
    `🔋 Battery Storage: ${result.batteryKwh.toFixed(1)} kWh\n` +
    `⚙️ Inverter Size: ${result.inverterKva.toFixed(1)} kVA\n` +
    `🏠 System Type: ${result.systemType}\n` +
    `⏱️ Backup Duration: ${backupHours} hours\n\n` +
    `Please provide me with a quote for this solar installation. Thank you!`
  );
}

export default function SolarCalculator() {
  const [appliances, setAppliances] = useState<Appliance[]>(DEFAULT_APPLIANCES);
  const [buildingType, setBuildingType] = useState("residential");
  const [backupHours, setBackupHours] = useState("8");
  const [sunHours, setSunHours] = useState("5");
  const [showResult, setShowResult] = useState(false);

  const updateAppliance = (id: string, field: "qty" | "hours", value: number) => {
    setAppliances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: Math.max(0, value) } : a))
    );
  };

  const result = useMemo<CalcResult>(() => {
    const activeAppliances = appliances.filter((a) => a.qty > 0);
    
    // Daily energy consumption
    const dailyWh = activeAppliances.reduce(
      (sum, a) => sum + a.watts * a.qty * a.hours,
      0
    );
    const dailyKwh = dailyWh / 1000;

    // Peak load (concurrent draw estimate — not all at once, use 70% factor)
    const totalWatts = activeAppliances.reduce((sum, a) => sum + a.watts * a.qty, 0);
    const peakLoad = totalWatts;

    // Solar panel sizing with 25% system losses
    const solarPeakHours = parseFloat(sunHours) || 5;
    const systemEfficiency = 0.75; // 25% losses
    const panelKwp = dailyKwh / (solarPeakHours * systemEfficiency);

    // Battery sizing: backup hours × daily usage / depth of discharge (80%)
    const backup = parseFloat(backupHours) || 8;
    const depthOfDischarge = 0.8;
    const batteryKwh = (dailyKwh * (backup / 24)) / depthOfDischarge;

    // Inverter sizing: peak load × 1.25 safety factor, rounded to nearest .5 kVA
    const inverterRaw = (peakLoad * 1.25) / 1000;
    const inverterKva = Math.ceil(inverterRaw * 2) / 2;

    // Determine system type
    let systemType = "Grid-Tied Solar";
    if (backup >= 12) systemType = "Off-Grid Solar System";
    else if (backup >= 6) systemType = "Hybrid Solar System (Grid + Battery)";
    else systemType = "Grid-Tied with Battery Backup";

    // Build recommendations
    const recommendations: string[] = [];

    if (panelKwp < 1) {
      recommendations.push(`Install approximately ${Math.ceil(panelKwp * 4)} × 250Wp solar panels (~${panelKwp.toFixed(2)} kWp total)`);
    } else {
      const panelCount = Math.ceil((panelKwp * 1000) / 400); // 400W panels
      recommendations.push(`Install approximately ${panelCount} × 400Wp solar panels (~${panelKwp.toFixed(2)} kWp total)`);
    }

    recommendations.push(
      `${inverterKva.toFixed(1)} kVA hybrid inverter with MPPT charge controller`
    );

    const batteryVoltage = 48; // 48V system
    const batteryAh = Math.ceil((batteryKwh * 1000) / batteryVoltage);
    recommendations.push(
      `Lithium battery bank: ~${batteryKwh.toFixed(1)} kWh (${batteryAh}Ah @ 48V) — provides ${backup} hours autonomy`
    );

    if (totalWatts > 5000) {
      recommendations.push("Three-phase distribution panel recommended given your total load");
    } else {
      recommendations.push("Single-phase distribution panel with surge protection and circuit breakers");
    }

    if (activeAppliances.some((a) => a.id === "ac" && a.qty > 0)) {
      recommendations.push("Consider inverter-type air conditioners — they use 40–60% less energy and reduce your solar system size significantly");
    }

    if (buildingType === "industrial" || buildingType === "commercial") {
      recommendations.push("Energy management system (EMS) recommended to monitor and optimise load distribution");
    }

    recommendations.push(
      "Professional site assessment by TRES Engineering to verify roof suitability, cable runs, and exact equipment sizing"
    );

    return { dailyKwh, peakLoad, panelKwp, batteryKwh, inverterKva, systemType, recommendations };
  }, [appliances, backupHours, sunHours, buildingType]);

  const hasAppliances = appliances.some((a) => a.qty > 0);

  return (
    <section className="calc-section" id="calculator">
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <div className="eyebrow">Solar System Sizing</div>
        <h2 className="h2">Solar Load Calculator</h2>
        <p className="lead">
          Enter your appliances and usage hours to get an instant system recommendation. TRES engineers
          will then design and size your exact system.
        </p>

        <div className="calc-wrap">
          {/* Header */}
          <div className="calc-header">
            <span style={{ fontSize: 28 }}>☀️</span>
            <div>
              <h3>Solar System Calculator</h3>
              <p style={{ color: "rgba(255,255,255,.7)", fontSize: 13, margin: 0 }}>
                Estimate your solar needs · Designed for Nigerian conditions
              </p>
            </div>
          </div>

          <div className="calc-body">
            {/* Building Type */}
            <div className="calc-step">
              <label>Building Type</label>
              <select
                className="calc-select"
                value={buildingType}
                onChange={(e) => setBuildingType(e.target.value)}
              >
                <option value="residential">Residential — Home / Apartment</option>
                <option value="commercial">Commercial — Office / Shop / Business</option>
                <option value="industrial">Industrial — Factory / Heavy Facility</option>
                <option value="hospitality">Hospitality — Hotel / Restaurant / Event Venue</option>
              </select>
            </div>

            {/* Appliances */}
            <div className="calc-step">
              <label>Select Your Appliances & Enter Quantities</label>
              <div className="appliance-grid">
                {appliances.map((app) => (
                  <div key={app.id} className="appliance-item">
                    <span className="app-icon">{app.icon}</span>
                    <div style={{ flex: 1 }}>
                      <label htmlFor={`qty-${app.id}`} style={{ display: "block", fontSize: 12, color: "var(--fg)", marginBottom: 4 }}>
                        {app.name}
                        <span style={{ color: "var(--muted)", fontSize: 10, display: "block" }}>
                          {app.watts}W each
                        </span>
                      </label>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "var(--muted)" }}>Qty:</span>
                        <input
                          id={`qty-${app.id}`}
                          type="number"
                          min={0}
                          max={20}
                          value={app.qty || ""}
                          placeholder="0"
                          onChange={(e) => updateAppliance(app.id, "qty", parseInt(e.target.value) || 0)}
                          style={{ width: 48 }}
                        />
                        <span style={{ fontSize: 10, color: "var(--muted)" }}>hrs:</span>
                        <input
                          type="number"
                          min={0}
                          max={24}
                          value={app.hours || ""}
                          placeholder={String(app.defaultHours)}
                          onChange={(e) => updateAppliance(app.id, "hours", parseFloat(e.target.value) || 0)}
                          style={{ width: 42 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced settings */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="calc-step" style={{ marginBottom: 0 }}>
                <label>Desired Backup Duration (hours without grid)</label>
                <select
                  className="calc-select"
                  value={backupHours}
                  onChange={(e) => setBackupHours(e.target.value)}
                >
                  <option value="4">4 hours (partial backup)</option>
                  <option value="8">8 hours (standard)</option>
                  <option value="12">12 hours (extended)</option>
                  <option value="18">18 hours (heavy backup)</option>
                  <option value="24">24 hours (full off-grid)</option>
                </select>
              </div>

              <div className="calc-step" style={{ marginBottom: 0 }}>
                <label>Average Daily Sun Hours (Nigeria)</label>
                <select
                  className="calc-select"
                  value={sunHours}
                  onChange={(e) => setSunHours(e.target.value)}
                >
                  <option value="4">4 hours (cloudy / rainy season)</option>
                  <option value="5">5 hours (average — recommended)</option>
                  <option value="6">6 hours (sunny / dry season)</option>
                  <option value="6.5">6.5 hours (northern states)</option>
                </select>
              </div>
            </div>

            {/* Calculate Button */}
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowResult(true)}
                disabled={!hasAppliances}
                style={{ opacity: hasAppliances ? 1 : .5, cursor: hasAppliances ? "pointer" : "not-allowed" }}
              >
                ☀️ Calculate My Solar System
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setAppliances(DEFAULT_APPLIANCES);
                  setShowResult(false);
                }}
              >
                Reset
              </button>
            </div>

            {!hasAppliances && (
              <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 12 }}>
                ↑ Enter quantities above to enable the calculator
              </p>
            )}

            {/* Results */}
            {showResult && hasAppliances && (
              <div className="calc-result" style={{ animation: "fadeIn .4s ease" }}>
                <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}`}</style>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 32 }}>☀️</span>
                  <div>
                    <h4 style={{ color: "#fff", fontSize: 18 }}>Your Solar System Recommendation</h4>
                    <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                      System Type: <strong style={{ color: "var(--green2)" }}>{result.systemType}</strong>
                    </p>
                  </div>
                </div>

                <div className="result-grid">
                  <div className="result-card">
                    <div className="val">{result.dailyKwh.toFixed(1)}</div>
                    <div className="label">kWh / Day</div>
                  </div>
                  <div className="result-card">
                    <div className="val">{result.panelKwp.toFixed(2)}</div>
                    <div className="label">kWp Solar</div>
                  </div>
                  <div className="result-card">
                    <div className="val">{result.batteryKwh.toFixed(1)}</div>
                    <div className="label">kWh Battery</div>
                  </div>
                  <div className="result-card">
                    <div className="val">{result.peakLoad >= 1000 ? (result.peakLoad / 1000).toFixed(1) + "k" : result.peakLoad.toFixed(0)}</div>
                    <div className="label">Peak Watts</div>
                  </div>
                  <div className="result-card">
                    <div className="val">{result.inverterKva.toFixed(1)}</div>
                    <div className="label">kVA Inverter</div>
                  </div>
                  <div className="result-card">
                    <div className="val">{backupHours}h</div>
                    <div className="label">Backup Time</div>
                  </div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <h5 style={{ color: "#fff", marginBottom: 12, fontSize: 14, letterSpacing: ".06em", textTransform: "uppercase" }}>
                    ✅ System Recommendations
                  </h5>
                  <ul className="recommendation-list">
                    {result.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>

                {/* Disclaimer */}
                <div
                  style={{
                    marginTop: 20, padding: "14px 16px", borderRadius: 8,
                    background: "rgba(255,255,255,.04)", border: "1px solid var(--border)",
                    fontSize: 13, color: "var(--muted)"
                  }}
                >
                  <strong style={{ color: "#fff" }}>⚠️ Important note:</strong> This is an estimate for planning purposes only.
                  Actual system sizing requires a professional site assessment by our engineers — including roof survey,
                  shading analysis, cable sizing, and load verification. Results may vary ±20%.
                </div>

                {/* WhatsApp CTA */}
                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>
                    Ready to get a professional quote? Send your results directly to our engineers:
                  </p>
                  <a
                    href={`https://wa.me/2347033979488?text=${buildWhatsAppMsg(result, buildingType, backupHours)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      background: "linear-gradient(135deg, #25D366, #128C7E)",
                      color: "#fff",
                      boxShadow: "0 4px 20px rgba(37,211,102,.3)",
                      fontSize: 15,
                      padding: "16px 32px",
                    }}
                  >
                    💬 Get a Quote on WhatsApp
                  </a>
                  <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 10 }}>
                    Your calculator results will be sent automatically — no pricing is shown here.
                    Our team will provide a detailed quote for your specific installation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
