/**
 * TRES solar sizing engine.
 * Pure functions shared by the client calculator and server endpoints.
 * Every assumption is supplied by `CalculatorConfig`, which is managed in Admin.
 */

export interface GridCondition {
  key: string;
  label: string;
  description: string;
  solarFraction: number; // share of daily energy the solar array should cover
}

export interface CalculatorLocation {
  name: string;
  sunHours: number;
}

export interface CalculatorLabels {
  title: string;
  subtitle: string;
  resultTitle: string;
  readyTitle: string;
  quoteCta: string;
  whatsappCta: string;
}

export interface CalculatorConfig {
  peakSunHoursDefault: number;
  systemEfficiency: number;
  usableBatteryFraction: number;
  designMargin: number;
  diversityFactor: number;
  backupLoadFactor: number;
  peakToAverageRatio: number;
  inverterPowerFactor: number;
  inverterSurgeMargin: number;
  inverterToSolarRatio: number;
  panelWatt: number;
  minPanels: number;
  tariffNairaPerKwh: number;
  batteryOptionsKwh: number[];
  inverterOptionsKva: number[];
  backupOptionsHours: number[];
  gridConditions: GridCondition[];
  propertyTypes: string[];
  locations: CalculatorLocation[];
  disclaimer: string;
  whatsappNumber: string;
  labels: CalculatorLabels;
}

export interface ApplianceDef {
  id: number;
  name: string;
  wattage: number;
  defaultQuantity: number;
  defaultHours: number;
}

export interface ApplianceSelection {
  id: number;
  name: string;
  wattage: number;
  quantity: number;
  hours: number;
}

export interface CalculatorInputs {
  location: string;
  propertyType: string;
  monthlyBill: number | null;
  dailyKwh: number | null;
  appliances: ApplianceSelection[];
  backupHours: number;
  gridCondition: string;
  hasGenerator: boolean | null;
}

export interface CalculatorResult {
  dailyEnergyKwh: number;
  peakLoadKw: number;
  solarKw: number;
  panelCount: number;
  batteryKwh: number;
  inverterKva: number;
  dailyGenerationKwh: number;
  solarContributionPercent: number;
  estimatedBackupHours: number;
  sunHours: number;
  energySource: "appliances" | "daily" | "bill";
  notes: string[];
}

export const NIGERIAN_STATES: CalculatorLocation[] = [
  { name: "Abia", sunHours: 4.3 },
  { name: "Adamawa", sunHours: 5.6 },
  { name: "Akwa Ibom", sunHours: 4.1 },
  { name: "Anambra", sunHours: 4.4 },
  { name: "Bauchi", sunHours: 5.7 },
  { name: "Bayelsa", sunHours: 4.0 },
  { name: "Benue", sunHours: 5.0 },
  { name: "Borno", sunHours: 5.9 },
  { name: "Cross River", sunHours: 4.1 },
  { name: "Delta", sunHours: 4.2 },
  { name: "Ebonyi", sunHours: 4.5 },
  { name: "Edo", sunHours: 4.4 },
  { name: "Ekiti", sunHours: 4.6 },
  { name: "Enugu", sunHours: 4.6 },
  { name: "FCT Abuja", sunHours: 5.3 },
  { name: "Gombe", sunHours: 5.7 },
  { name: "Imo", sunHours: 4.3 },
  { name: "Jigawa", sunHours: 5.9 },
  { name: "Kaduna", sunHours: 5.5 },
  { name: "Kano", sunHours: 5.8 },
  { name: "Katsina", sunHours: 5.9 },
  { name: "Kebbi", sunHours: 5.7 },
  { name: "Kogi", sunHours: 5.0 },
  { name: "Kwara", sunHours: 5.0 },
  { name: "Lagos", sunHours: 4.4 },
  { name: "Nasarawa", sunHours: 5.1 },
  { name: "Niger", sunHours: 5.4 },
  { name: "Ogun", sunHours: 4.5 },
  { name: "Ondo", sunHours: 4.5 },
  { name: "Osun", sunHours: 4.6 },
  { name: "Oyo", sunHours: 4.7 },
  { name: "Plateau", sunHours: 5.5 },
  { name: "Rivers", sunHours: 4.0 },
  { name: "Sokoto", sunHours: 6.0 },
  { name: "Taraba", sunHours: 5.3 },
  { name: "Yobe", sunHours: 5.9 },
  { name: "Zamfara", sunHours: 5.8 },
];

export const DEFAULT_CALCULATOR_CONFIG: CalculatorConfig = {
  peakSunHoursDefault: 4.8,
  systemEfficiency: 0.75,
  usableBatteryFraction: 0.8,
  designMargin: 1.15,
  diversityFactor: 0.7,
  backupLoadFactor: 0.6,
  peakToAverageRatio: 3,
  inverterPowerFactor: 0.8,
  inverterSurgeMargin: 1.25,
  inverterToSolarRatio: 0.8,
  panelWatt: 550,
  minPanels: 2,
  tariffNairaPerKwh: 209.5,
  batteryOptionsKwh: [5, 10, 15, 20, 30, 40, 60, 80, 100, 150, 200],
  inverterOptionsKva: [3, 5, 6, 8, 10, 12, 15, 20, 30, 50, 100],
  backupOptionsHours: [4, 6, 8, 10, 12],
  gridConditions: [
    {
      key: "reliable",
      label: "Reliable",
      description: "Grid power most of the day; solar mainly reduces cost.",
      solarFraction: 0.6,
    },
    {
      key: "occasional",
      label: "Occasional outages",
      description: "Grid is usually available with some interruptions.",
      solarFraction: 0.8,
    },
    {
      key: "poor",
      label: "Poor",
      description: "Grid supply is irregular for long stretches.",
      solarFraction: 1.0,
    },
    {
      key: "unreliable",
      label: "Unreliable / none",
      description: "Little or no dependable grid supply.",
      solarFraction: 1.15,
    },
  ],
  propertyTypes: ["Residential", "Commercial", "Office", "Shop", "Facility", "Other"],
  locations: NIGERIAN_STATES,
  disclaimer:
    "This calculator provides an indicative estimate for planning purposes only. Final system sizing should be confirmed through a professional site assessment, load analysis and engineering design by TRES.",
  whatsappNumber: "",
  labels: {
    title: "HOW MUCH SOLAR POWER DO YOU NEED?",
    subtitle: "Get an indicative estimate based on your energy needs and backup requirements.",
    resultTitle: "YOUR ESTIMATED SYSTEM",
    readyTitle: "YOUR SYSTEM IS READY FOR ENGINEERING REVIEW.",
    quoteCta: "Get Your TRES Quotation",
    whatsappCta: "WhatsApp TRES",
  },
};

export const DEFAULT_APPLIANCES: Omit<ApplianceDef, "id">[] = [
  { name: "Refrigerator", wattage: 150, defaultQuantity: 1, defaultHours: 8 },
  { name: "Freezer", wattage: 200, defaultQuantity: 1, defaultHours: 8 },
  { name: "Television", wattage: 100, defaultQuantity: 1, defaultHours: 6 },
  { name: "Lighting (LED point)", wattage: 10, defaultQuantity: 10, defaultHours: 6 },
  { name: "Fan", wattage: 60, defaultQuantity: 3, defaultHours: 8 },
  { name: "Air conditioner (1HP)", wattage: 900, defaultQuantity: 1, defaultHours: 6 },
  { name: "Water pump (1HP)", wattage: 750, defaultQuantity: 1, defaultHours: 1 },
  { name: "Washing machine", wattage: 500, defaultQuantity: 1, defaultHours: 1 },
  { name: "Computer / laptop", wattage: 80, defaultQuantity: 1, defaultHours: 6 },
  { name: "Router", wattage: 15, defaultQuantity: 1, defaultHours: 24 },
  { name: "Microwave", wattage: 1000, defaultQuantity: 1, defaultHours: 0.5 },
  { name: "Iron", wattage: 1200, defaultQuantity: 1, defaultHours: 0.5 },
  { name: "Other", wattage: 100, defaultQuantity: 1, defaultHours: 2 },
];

function num(v: unknown, fallback: number) {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}

function numArray(v: unknown, fallback: number[]) {
  if (!Array.isArray(v)) return fallback;
  const arr = v.map((x) => num(x, NaN)).filter((x) => Number.isFinite(x) && x > 0);
  return arr.length ? [...arr].sort((a, b) => a - b) : fallback;
}

/** Merge persisted JSON with defaults so the engine never sees missing values. */
export function normalizeConfig(raw: Record<string, unknown> | null | undefined): CalculatorConfig {
  const d = DEFAULT_CALCULATOR_CONFIG;
  const r = raw || {};
  const labels = (r.labels as Partial<CalculatorLabels>) || {};
  const gc = Array.isArray(r.gridConditions)
    ? (r.gridConditions as GridCondition[]).filter((g) => g && g.key && g.label)
    : d.gridConditions;
  const locs = Array.isArray(r.locations)
    ? (r.locations as CalculatorLocation[])
        .filter((l) => l && l.name)
        .map((l) => ({ name: String(l.name), sunHours: num(l.sunHours, d.peakSunHoursDefault) }))
    : d.locations;
  return {
    peakSunHoursDefault: num(r.peakSunHoursDefault, d.peakSunHoursDefault),
    systemEfficiency: num(r.systemEfficiency, d.systemEfficiency),
    usableBatteryFraction: num(r.usableBatteryFraction, d.usableBatteryFraction),
    designMargin: num(r.designMargin, d.designMargin),
    diversityFactor: num(r.diversityFactor, d.diversityFactor),
    backupLoadFactor: num(r.backupLoadFactor, d.backupLoadFactor),
    peakToAverageRatio: num(r.peakToAverageRatio, d.peakToAverageRatio),
    inverterPowerFactor: num(r.inverterPowerFactor, d.inverterPowerFactor),
    inverterSurgeMargin: num(r.inverterSurgeMargin, d.inverterSurgeMargin),
    inverterToSolarRatio: num(r.inverterToSolarRatio, d.inverterToSolarRatio),
    panelWatt: num(r.panelWatt, d.panelWatt),
    minPanels: num(r.minPanels, d.minPanels),
    tariffNairaPerKwh: num(r.tariffNairaPerKwh, d.tariffNairaPerKwh),
    batteryOptionsKwh: numArray(r.batteryOptionsKwh, d.batteryOptionsKwh),
    inverterOptionsKva: numArray(r.inverterOptionsKva, d.inverterOptionsKva),
    backupOptionsHours: numArray(r.backupOptionsHours, d.backupOptionsHours),
    gridConditions: gc.length ? gc : d.gridConditions,
    propertyTypes:
      Array.isArray(r.propertyTypes) && r.propertyTypes.length
        ? (r.propertyTypes as string[]).map(String)
        : d.propertyTypes,
    locations: locs.length ? locs : d.locations,
    disclaimer: typeof r.disclaimer === "string" && r.disclaimer ? r.disclaimer : d.disclaimer,
    whatsappNumber: typeof r.whatsappNumber === "string" ? r.whatsappNumber : "",
    labels: { ...d.labels, ...labels },
  };
}

function pickOption(options: number[], required: number) {
  const found = options.find((o) => o >= required);
  if (found !== undefined) return found;
  const max = options[options.length - 1] ?? required;
  // Beyond the configured range: round up to a sensible multiple.
  const step = max >= 50 ? 10 : 5;
  return Math.max(max, Math.ceil(required / step) * step);
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function computeEstimate(
  inputs: CalculatorInputs,
  config: CalculatorConfig,
): CalculatorResult | null {
  const notes: string[] = [];
  const location = config.locations.find(
    (l) => l.name.toLowerCase() === (inputs.location || "").toLowerCase(),
  );
  const sunHours = location?.sunHours ?? config.peakSunHoursDefault;

  const selected = (inputs.appliances || []).filter((a) => a.quantity > 0 && a.wattage > 0);
  const applianceDailyWh = selected.reduce((s, a) => s + a.wattage * a.quantity * a.hours, 0);
  const applianceLoadW = selected.reduce((s, a) => s + a.wattage * a.quantity, 0);

  let dailyWh = 0;
  let energySource: CalculatorResult["energySource"] = "appliances";
  if (applianceDailyWh > 0) {
    dailyWh = applianceDailyWh;
  } else if (inputs.dailyKwh && inputs.dailyKwh > 0) {
    dailyWh = inputs.dailyKwh * 1000;
    energySource = "daily";
    notes.push("Daily energy taken from the figure you supplied.");
  } else if (inputs.monthlyBill && inputs.monthlyBill > 0 && config.tariffNairaPerKwh > 0) {
    dailyWh = (inputs.monthlyBill / config.tariffNairaPerKwh / 30) * 1000;
    energySource = "bill";
    notes.push(
      `Daily energy inferred from your monthly bill at an indicative tariff of ₦${config.tariffNairaPerKwh}/kWh.`,
    );
  }
  if (dailyWh <= 0) return null;

  const peakLoadW =
    applianceLoadW > 0
      ? applianceLoadW * config.diversityFactor
      : (dailyWh / 24) * config.peakToAverageRatio;

  const grid = config.gridConditions.find((g) => g.key === inputs.gridCondition);
  const solarFraction = grid?.solarFraction ?? 1;

  const solarKwRaw =
    ((dailyWh / 1000) * solarFraction * config.designMargin) /
    (sunHours * config.systemEfficiency);
  const panelCount = Math.max(config.minPanels, Math.ceil((solarKwRaw * 1000) / config.panelWatt));
  const solarKw = (panelCount * config.panelWatt) / 1000;

  const backupHours = inputs.backupHours > 0 ? inputs.backupHours : 6;
  const backupLoadKw = (peakLoadW / 1000) * config.backupLoadFactor;
  const batteryRaw = (backupLoadKw * backupHours) / config.usableBatteryFraction;
  const batteryKwh = pickOption(config.batteryOptionsKwh, batteryRaw);

  const inverterRaw = Math.max(
    ((peakLoadW / 1000) * config.inverterSurgeMargin) / config.inverterPowerFactor,
    solarKw * config.inverterToSolarRatio,
  );
  const inverterKva = pickOption(config.inverterOptionsKva, inverterRaw);

  const dailyGenerationKwh = solarKw * sunHours * config.systemEfficiency;
  const dailyEnergyKwh = dailyWh / 1000;
  const solarContributionPercent = Math.min(
    100,
    Math.round((dailyGenerationKwh / dailyEnergyKwh) * 100),
  );
  const estimatedBackupHours =
    backupLoadKw > 0 ? (batteryKwh * config.usableBatteryFraction) / backupLoadKw : 0;

  if (inputs.hasGenerator) {
    notes.push(
      "You indicated an existing generator. TRES can review how it fits alongside a solar and storage system during assessment.",
    );
  }

  return {
    dailyEnergyKwh: r1(dailyEnergyKwh),
    peakLoadKw: r1(peakLoadW / 1000),
    solarKw: r1(solarKw),
    panelCount,
    batteryKwh,
    inverterKva,
    dailyGenerationKwh: r1(dailyGenerationKwh),
    solarContributionPercent,
    estimatedBackupHours: r1(Math.min(estimatedBackupHours, 72)),
    sunHours,
    energySource,
    notes,
  };
}

export function buildWhatsAppMessage(inputs: CalculatorInputs, result: CalculatorResult) {
  return [
    "Hello TRES,",
    "",
    "I used your Solar Calculator and would like a quotation.",
    "",
    `Property type: ${inputs.propertyType || "Not specified"}`,
    `Location: ${inputs.location || "Not specified"}`,
    `Estimated daily energy: ${result.dailyEnergyKwh} kWh`,
    `Estimated solar capacity: ${result.solarKw} kW`,
    `Estimated battery capacity: ${result.batteryKwh} kWh`,
    `Recommended inverter: ${result.inverterKva} kVA`,
    `Estimated backup requirement: ${inputs.backupHours} hours`,
    `Grid condition: ${inputs.gridCondition || "Not specified"}`,
    "",
    "I would like TRES to review this estimate and provide a quotation.",
  ].join("\n");
}
