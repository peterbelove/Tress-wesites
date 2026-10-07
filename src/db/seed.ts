import { and, count, eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import {
  adminUsers,
  calculatorAppliances,
  calculatorSettings,
  insights,
  markets,
  media,
  navigation,
  pageSections,
  projects,
  services,
  siteSettings,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { DEFAULT_APPLIANCES, DEFAULT_CALCULATOR_CONFIG } from "@/lib/calculator";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults";

const PX = (id: number, ext = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&w=1600`;
const PX_THUMB = (id: number, ext = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&w=400`;

type MediaSeed = {
  filename: string;
  url: string;
  thumbnailUrl?: string;
  title: string;
  altText: string;
  category: string;
  type?: "image" | "video";
  mimeType?: string;
  source?: "upload" | "external";
  credit?: string;
  width?: number;
  height?: number;
};

async function isEmpty(table: PgTable): Promise<boolean> {
  const [row] = await db.select({ c: count() }).from(table);
  return Number(row?.c ?? 0) === 0;
}

async function seedMedia() {
  const items: Record<string, MediaSeed> = {
    heroImage: {
      filename: "hero-solar-home.jpg",
      url: "/images/hero-solar-home.jpg",
      title: "Rooftop solar on a modern residence (illustrative)",
      altText: "Aerial view of a modern residence with rooftop solar panels at golden hour",
      category: "hero",
    },
    heroPoster: {
      filename: "hero-video-poster.jpg",
      url: "https://images.pexels.com/videos/2804595/free-video-2804595.jpg?auto=compress&cs=tinysrgb&w=1600",
      title: "Hero video poster — solar array",
      altText: "Rows of solar panels under a clear sky",
      category: "hero",
      source: "external",
      credit: "Pexels",
    },
    heroVideo: {
      filename: "hero-solar-array.mp4",
      url: "https://videos.pexels.com/video-files/2804595/2804595-hd_1920_1080_24fps.mp4",
      title: "Hero background — solar array (illustrative)",
      altText: "Slow aerial movement across rows of solar panels",
      category: "videos",
      type: "video",
      mimeType: "video/mp4",
      source: "external",
      credit: "Pexels",
      width: 1920,
      height: 1080,
    },
    heroVideoMobile: {
      filename: "hero-solar-array-mobile.mp4",
      url: "https://videos.pexels.com/video-files/2804595/2804595-sd_640_360_24fps.mp4",
      title: "Hero background — mobile variant",
      altText: "Slow aerial movement across rows of solar panels",
      category: "videos",
      type: "video",
      mimeType: "video/mp4",
      source: "external",
      credit: "Pexels",
      width: 640,
      height: 360,
    },
    renewable: {
      filename: "service-renewable.jpg",
      url: PX(11644973),
      thumbnailUrl: PX_THUMB(11644973),
      title: "Rooftop solar installation team (illustrative)",
      altText: "Installers positioning solar panels on a large rooftop under a clear sky",
      category: "services",
      source: "external",
      credit: "Pexels",
    },
    electrical: {
      filename: "service-electrical.jpg",
      url: PX(25537595),
      thumbnailUrl: PX_THUMB(25537595),
      title: "Electrical substation (illustrative)",
      altText: "Wide view of an electrical substation with power lines and towers",
      category: "services",
      source: "external",
      credit: "Pexels",
    },
    security: {
      filename: "service-security.jpg",
      url: PX(5650141),
      thumbnailUrl: PX_THUMB(5650141),
      title: "Surveillance camera (illustrative)",
      altText: "Security camera mounted on a post against a blue sky",
      category: "services",
      source: "external",
      credit: "Pexels",
    },
    automation: {
      filename: "smart-home-interior.jpg",
      url: "/images/smart-home-interior.jpg",
      title: "Smart home interior (illustrative)",
      altText: "Modern living room at dusk with a glowing wall-mounted smart control panel",
      category: "services",
    },
    procurement: {
      filename: "procurement-equipment.jpg",
      url: "/images/procurement-equipment.jpg",
      title: "Engineering equipment in a warehouse (illustrative)",
      altText: "Organised solar panels, battery cabinets, inverters and cable in a bright warehouse",
      category: "services",
    },
    projectMgmt: {
      filename: "engineer-site-plans.jpg",
      url: "/images/engineer-site-plans.jpg",
      title: "Engineer reviewing drawings on site (illustrative)",
      altText: "Engineer in a hard hat reviewing technical drawings beside a rooftop solar installation",
      category: "about",
    },
    residential: {
      filename: "market-residential.jpg",
      url: PX(31737859),
      thumbnailUrl: PX_THUMB(31737859),
      title: "Modern home at night (illustrative)",
      altText: "Modern residence illuminated at night with a landscaped garden",
      category: "markets",
      source: "external",
      credit: "Pexels",
    },
    commercial: {
      filename: "commercial-building.jpg",
      url: "/images/commercial-building.jpg",
      title: "Commercial office building (illustrative)",
      altText: "Modern glass office building at blue hour with rooftop solar panels",
      category: "markets",
    },
    industrial: {
      filename: "market-industrial.jpg",
      url: PX(34718930),
      thumbnailUrl: PX_THUMB(34718930),
      title: "Factory interior (illustrative)",
      altText: "Wide view of a modern factory interior with machinery and conveyors",
      category: "markets",
      source: "external",
      credit: "Pexels",
    },
    estates: {
      filename: "estate-aerial.jpg",
      url: "/images/estate-aerial.jpg",
      title: "Gated estate aerial (illustrative)",
      altText: "Aerial view of a gated residential estate with rooftop solar panels",
      category: "markets",
    },
    institutions: {
      filename: "institution-building.jpg",
      url: "/images/institution-building.jpg",
      title: "Institutional building (illustrative)",
      altText: "Modern public institutional building with rooftop solar panels",
      category: "markets",
    },
    agriculture: {
      filename: "agri-solar-pump.jpg",
      url: "/images/agri-solar-pump.jpg",
      title: "Solar-powered irrigation (illustrative)",
      altText: "Ground-mounted solar array powering irrigation on a green farm",
      category: "markets",
    },
    improve: {
      filename: "improve-lives.jpg",
      url: PX(19816447),
      thumbnailUrl: PX_THUMB(19816447),
      title: "Rooftop inspection (illustrative)",
      altText: "Worker in safety gear inspecting rooftop solar panels",
      category: "general",
      source: "external",
      credit: "Pexels",
    },
    pain: {
      filename: "transmission-towers.jpg",
      url: PX(20055881),
      thumbnailUrl: PX_THUMB(20055881),
      title: "Transmission towers (illustrative)",
      altText: "Electrical transmission towers against a pale sky",
      category: "general",
      source: "external",
      credit: "Pexels",
    },
    aboutHero: {
      filename: "about-hero.jpg",
      url: PX(4254159),
      thumbnailUrl: PX_THUMB(4254159),
      title: "Technician inspecting solar modules (illustrative)",
      altText: "Technician in a hard hat checking solar modules",
      category: "about",
      source: "external",
      credit: "Pexels",
    },
    projResidence1: {
      filename: "project-rooftop-array.jpg",
      url: PX(38171120),
      thumbnailUrl: PX_THUMB(38171120),
      title: "Rooftop solar array — placeholder cover",
      altText: "Close-up of rooftop solar panels in sunlight (illustrative placeholder)",
      category: "projects",
      source: "external",
      credit: "Pexels",
    },
    projFactory: {
      filename: "project-factory.jpg",
      url: PX(34207364),
      thumbnailUrl: PX_THUMB(34207364),
      title: "Industrial facility — placeholder cover",
      altText: "Industrial warehouse interior (illustrative placeholder)",
      category: "projects",
      source: "external",
      credit: "Pexels",
    },
    projSecurity: {
      filename: "project-security.jpg",
      url: PX(10919666),
      thumbnailUrl: PX_THUMB(10919666),
      title: "Mounted security camera — placeholder cover",
      altText: "Security camera mounted on a modern building facade (illustrative placeholder)",
      category: "projects",
      source: "external",
      credit: "Pexels",
    },
    projResidence2: {
      filename: "project-install.jpg",
      url: PX(4254164),
      thumbnailUrl: PX_THUMB(4254164),
      title: "Solar panel installation — placeholder cover",
      altText: "Electrician installing a solar photovoltaic panel (illustrative placeholder)",
      category: "projects",
      source: "external",
      credit: "Pexels",
    },
    insight1: {
      filename: "insight-sizing.jpg",
      url: PX(19895880),
      thumbnailUrl: PX_THUMB(19895880),
      title: "Engineer on rooftop with skyline",
      altText: "Engineer standing on a rooftop inspecting solar panels with a city skyline behind",
      category: "insights",
      source: "external",
      credit: "Pexels",
    },
    insight2: {
      filename: "insight-battery.jpg",
      url: PX(14384695),
      thumbnailUrl: PX_THUMB(14384695),
      title: "Technician working on solar panel",
      altText: "Technician using a tool to install a solar panel",
      category: "insights",
      source: "external",
      credit: "Pexels",
    },
    insight3: {
      filename: "insight-assessment.jpg",
      url: PX(36358684),
      thumbnailUrl: PX_THUMB(36358684),
      title: "Substation detail",
      altText: "Detailed view of electrical components in a power substation",
      category: "insights",
      source: "external",
      credit: "Pexels",
    },
  };

  const ids: Record<string, number> = {};
  for (const [key, item] of Object.entries(items)) {
    const [row] = await db
      .insert(media)
      .values({
        filename: item.filename,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl ?? null,
        title: item.title,
        altText: item.altText,
        description: "Temporary illustrative media. Replace with TRES photography from the Media Library.",
        type: item.type ?? "image",
        mimeType: item.mimeType ?? (item.type === "video" ? "video/mp4" : "image/jpeg"),
        category: item.category,
        source: item.source ?? "upload",
        credit: item.credit ?? "",
        width: item.width ?? null,
        height: item.height ?? null,
      })
      .returning({ id: media.id });
    ids[key] = row.id;
  }
  return ids;
}

const FOUNDER_MESSAGE = `TRES was born out of frustration. Too many families, business owners and institutions were paying again and again for poor advice, poor installations and solutions that were never designed around their real needs. Each time, the cost was more than money. It was lost productivity, lost comfort and lost trust.

We believe engineering should improve lives. A properly designed power system keeps a home comfortable through the night. A reliable installation keeps a business running and its people working. A well-planned security system lets a family rest. That is what engineering is for.

So we built TRES to do the right work, the right way, for the right people: assess honestly, design around what is actually there, install properly, test, commission and stand behind the result. If we can help you power, protect or improve something that matters to you, we would like to hear from you.`;

const CONTENT_VERSION = 4;

const PAIN_BODY =
  "Yet for many homes and businesses, it still is — unreliable supply, generators that never rest, bills that keep rising and systems that were never designed around real needs. TRES was created to change that.";

const PAIN_ITEMS = [
  { title: "Unreliable electricity", text: "Supply you cannot plan around." },
  { title: "Rising energy costs", text: "Bills that climb while reliability does not." },
  { title: "Generator dependence", text: "Fuel, noise and maintenance that never stop." },
  { title: "Poor installations", text: "Work done without design, testing or commissioning." },
  { title: "Unsuitable systems", text: "Packages sold without assessing the real load." },
  { title: "Security concerns", text: "Premises and people that cannot be seen or protected." },
  { title: "Downtime", text: "Every outage costs comfort, productivity and revenue." },
];

const PROCESS_TITLE = "FROM FIRST CONVERSATION TO LONG-TERM SUPPORT.";
const PROCESS_SUBTITLE = "One accountable team coordinates every stage, so nothing falls between contractors.";
const PROCESS_STEPS = [
  { title: "Understand", text: "What you need to power, protect or improve — and why." },
  { title: "Assess", text: "Site visit, load analysis, structure and budget before any equipment is proposed." },
  { title: "Design", text: "A system engineered around the assessment, not a standard package." },
  { title: "Procure", text: "Appropriate equipment sourced through a coordinated supplier network." },
  { title: "Install", text: "Trained installers working to the design." },
  { title: "Test", text: "Every circuit and component verified before it goes live." },
  { title: "Commission", text: "The complete system brought into service and handed over properly." },
  { title: "Support", text: "Operations, maintenance and honest advice after handover." },
];

const WHY_TRES = {
  title: "THE RIGHT WORK.\nTHE RIGHT WAY.\nFOR THE RIGHT PEOPLE.",
  body: "Standard packages are easy to sell and expensive to live with. TRES starts with assessment and designs around what is actually there — the load, the structure, the budget — then installs, tests and commissions so the system does what it was engineered to do.",
  items: [
    { title: "Assessment before packages", text: "Site assessment and actual load analysis come first." },
    { title: "Designed around reality", text: "Actual structure, actual demand, actual budget." },
    { title: "Appropriate equipment", text: "Specified for the application, not for the margin." },
    { title: "Trained installation", text: "Installed by people trained to do it properly." },
    { title: "Tested and commissioned", text: "Verified before handover, not assumed." },
    { title: "Maintainable and sensible", text: "Commercially sensible solutions you can keep running." },
  ],
};

const HOME_EYEBROWS: Record<string, string> = {
  pain: "The problem",
  improve: "The possibility",
  services: "What we engineer",
  projects: "Selected work",
  calculator: "Plan your system",
  cta: "The next step",
};
const HOME_ORDER = ["hero", "pain", "improve", "services", "projects", "calculator", "cta"];
const ABOUT_ORDER = ["hero", "who", "why-exists", "founder", "mission", "vision", "beliefs", "why-tres", "capabilities", "how-we-work", "cta"];

const ABOUT_HERO_SUBTITLE =
  "An engineering company focused on reliable renewable energy, electrical engineering, smart automation and security solutions across Nigeria — designed around the people who depend on them.";

const PRIVACY_OLD =
  "TRES is the public brand of The Rock Engineering Solution Limited (RC 9776971). This policy explains";
const PRIVACY_NEW =
  "This website is operated by The Rock Engineering Solution Limited (RC 9776971), trading as TRES. This policy explains";

async function seedSections(m: Record<string, number>) {
  const home = [
    {
      key: "hero",
      label: "Hero",
      eyebrow: "",
      title: "ENGINEERING BETTER LIVES.",
      subtitle: "Through renewable energy, electrical engineering and intelligent technology.",
      primaryLabel: "Explore Our Solutions",
      primaryHref: "/services",
      secondaryLabel: "Calculate Your Solar System",
      secondaryHref: "/solar-calculator",
      mediaId: m.heroImage,
      mobileMediaId: m.heroImage,
      videoMediaId: m.heroVideo,
      mobileVideoMediaId: m.heroVideoMobile,
      posterMediaId: m.heroPoster,
    },
    {
      key: "pain",
      label: "Customer problem",
      eyebrow: "",
      title: "POWER SHOULD NOT BE SOMETHING YOU HAVE TO WORRY ABOUT.",
      body: PAIN_BODY,
      items: PAIN_ITEMS,
      mediaId: m.pain,
    },
    {
      key: "improve",
      label: "Engineering should improve lives",
      eyebrow: "",
      title: "ENGINEERING SHOULD IMPROVE LIVES.",
      body: "Reliable power. Protected spaces. Connected, responsive environments. When engineering is done properly, people stop thinking about the system and get on with living and working. That is the standard TRES designs to.",
      items: [
        { title: "POWER", text: "Dependable energy, engineered around actual demand." },
        { title: "PROTECT", text: "Visibility and protection for the places that matter." },
        { title: "CONNECT", text: "Infrastructure that ties power, security and control together." },
        { title: "AUTOMATE", text: "Environments that respond intelligently to the people in them." },
        { title: "SUSTAIN", text: "Systems built to last, maintained to keep performing." },
      ],
      mediaId: m.improve,
    },
    {
      key: "services",
      label: "Services preview",
      eyebrow: "",
      title: "WHAT WE ENGINEER",
      subtitle: "Six connected disciplines, delivered through a single point of contact — so the system you end up with works as one.",
      primaryLabel: "Explore all services",
      primaryHref: "/services",
    },
    {
      key: "projects",
      label: "Featured projects",
      eyebrow: "",
      title: "PROJECTS WE HAVE ENGINEERED.",
      subtitle: "Selected systems designed, installed and commissioned by TRES.",
      primaryLabel: "View all projects",
      primaryHref: "/projects",
    },
    {
      key: "credentials",
      label: "Credentials & partners",
      eyebrow: "",
      title: "Credentials & partners",
      body: "",
      items: [],
      visible: false,
    },
    {
      key: "calculator",
      label: "Solar calculator promo",
      eyebrow: "",
      title: "HOW MUCH SOLAR POWER DO YOU NEED?",
      body: "Select what you run, how long you need backup and your grid situation. Get an indicative solar, battery and inverter estimate — then send it straight to TRES for engineering review.",
      primaryLabel: "Calculate Your Solar System",
      primaryHref: "/solar-calculator",
    },
    {
      key: "cta",
      label: "Final CTA",
      eyebrow: "",
      title: "LET'S ENGINEER SOMETHING BETTER.",
      body: "Tell us what you need to power, protect or improve.",
      primaryLabel: "Talk to TRES",
      primaryHref: "/contact",
    },
  ];

  const about = [
    {
      key: "hero",
      label: "Hero",
      eyebrow: "",
      title: "ENGINEERING BETTER LIVES.",
      subtitle: ABOUT_HERO_SUBTITLE,
      mediaId: m.aboutHero,
    },
    {
      key: "who",
      label: "Who we are",
      eyebrow: "",
      title: "AN ENGINEERING COMPANY, NOT A PRODUCT RESELLER.",
      body: "TRES provides tailored engineering solutions across Nigeria — renewable energy, electrical engineering and power, smart security, smart automation, procurement and project management — and acts as a single point of contact from planning through completion.\n\nWe work with homes, businesses, industrial facilities, estates, institutions and agricultural operations, designing each system around the actual demand, structure and budget in front of us.",
      mediaId: m.projectMgmt,
    },
    {
      key: "why-exists",
      label: "Why TRES exists",
      eyebrow: "",
      title: "TOO MANY PEOPLE PAY TWICE.",
      body: "Unreliable electricity is only part of the problem. Poor engineering practice, poor advice, low-quality installations and unsuitable solutions leave people paying repeatedly for systems that never worked as promised. TRES was created to address exactly that — with honest assessment, proper design and installations that are tested, commissioned and supported.",
      items: [
        { title: "Unreliable electricity", text: "" },
        { title: "Poor engineering practice", text: "" },
        { title: "Poor advice", text: "" },
        { title: "Low-quality installations", text: "" },
        { title: "Unsuitable solutions", text: "" },
      ],
    },
    {
      key: "founder",
      label: "Founder message",
      eyebrow: "",
      title: "A MESSAGE FROM OUR FOUNDER",
      subtitle: "Founder, TRES",
      body: FOUNDER_MESSAGE,
    },
    {
      key: "mission",
      label: "Mission",
      eyebrow: "",
      title: "OUR MISSION",
      body: "TRES exists to improve lives through reliable engineering solutions, honest advice, innovative technology and commitment to the communities it serves.",
    },
    {
      key: "vision",
      label: "Vision",
      eyebrow: "",
      title: "TO BECOME AFRICA'S MOST TRUSTED ENGINEERING AND TECHNOLOGY COMPANY.",
      body: "",
    },
    {
      key: "beliefs",
      label: "Beliefs",
      eyebrow: "",
      title: "THE RIGHT WORK. THE RIGHT WAY. FOR THE RIGHT PEOPLE.",
      items: [
        { title: "Engineering should improve lives", text: "A system is only successful if it makes someone's day measurably better." },
        { title: "Assess before you specify", text: "No standard packages. Load, structure and budget are measured first." },
        { title: "Honest advice", text: "If a solution is not right for you, we say so." },
        { title: "Built to be maintained", text: "Equipment and designs chosen so the system can keep performing." },
        { title: "One point of contact", text: "Accountability from planning to support." },
      ],
    },
    {
      key: "why-tres",
      label: "Why TRES",
      eyebrow: "",
      title: WHY_TRES.title,
      body: WHY_TRES.body,
      items: WHY_TRES.items,
    },
    {
      key: "capabilities",
      label: "Engineering capabilities",
      eyebrow: "",
      title: "SIX CONNECTED DISCIPLINES.",
      subtitle: "Power, protection and control delivered as one coordinated system.",
    },
    {
      key: "how-we-work",
      label: "Engineering process",
      eyebrow: "",
      title: PROCESS_TITLE,
      subtitle: PROCESS_SUBTITLE,
      items: PROCESS_STEPS,
    },
    {
      key: "cta",
      label: "CTA",
      title: "LET'S ENGINEER SOMETHING BETTER.",
      body: "Tell us what you need to power, protect or improve.",
      primaryLabel: "Talk to TRES",
      primaryHref: "/contact",
      secondaryLabel: "See Our Projects",
      secondaryHref: "/projects",
    },
  ];

  const legal = [
    {
      page: "privacy",
      key: "content",
      label: "Privacy policy",
      title: "PRIVACY POLICY",
      subtitle: "How TRES handles the information you share with us.",
      body: `## Who we are

This website is operated by The Rock Engineering Solution Limited (RC 9776971), trading as TRES. This policy explains how we handle personal information collected through this website.

## Information we collect

When you contact us, request a quotation or use the Solar Calculator, we may collect the details you choose to provide: your name, email address, phone or WhatsApp number, location, property type and the content of your message. The Solar Calculator may store the inputs and indicative results you generate so that we can review them when you request a quotation.

## How we use it

- To respond to your enquiry and prepare proposals or quotations.
- To carry out site assessments and deliver engineering services you request.
- To improve the website and the calculator's usefulness.

We do not sell personal information.

## Retention and security

Enquiries are retained for as long as needed to respond to you and to meet legitimate business or legal requirements. Access to enquiry data is restricted to authorised TRES personnel.

## Your choices

You may ask us to correct or delete the information we hold about you at any time by contacting tresengineeringltd@gmail.com.

## Changes

We may update this policy from time to time. The latest version will always be published on this page.`,
    },
    {
      page: "terms",
      key: "content",
      label: "Terms of use",
      title: "TERMS OF USE",
      subtitle: "Please read these terms before using this website.",
      body: `## About this website

This website is operated by The Rock Engineering Solution Limited (RC 9776971), trading publicly as TRES.

## Information on this site

Content is provided for general information about our engineering services. While we aim to keep it accurate and current, it does not constitute engineering advice for any specific site or project.

## Solar Calculator

The Solar Calculator provides an indicative estimate for planning purposes only. It is not a substitute for professional site assessment, load analysis or engineering design. Final system sizing, equipment selection and pricing are confirmed only through a formal TRES proposal.

## Quotations and pricing

No prices shown or implied on this website constitute an offer. Equipment and project pricing fluctuate and are confirmed in writing per project.

## Intellectual property

The TRES name, logo and original content on this site belong to The Rock Engineering Solution Limited. Some illustrative photography is licensed from third parties.

## Contact

Questions about these terms can be sent to tresengineeringltd@gmail.com.`,
    },
  ];

  let order = 0;
  for (const s of home) {
    await db.insert(pageSections).values({ page: "home", order: order++, ...s });
  }
  order = 0;
  for (const s of about) {
    await db.insert(pageSections).values({ page: "about", order: order++, ...s });
  }
  for (const s of legal) {
    await db.insert(pageSections).values({ order: 0, ...s });
  }
}

async function seedServices(m: Record<string, number>) {
  const rows = [
    {
      slug: "renewable-energy",
      number: "01",
      title: "Renewable Energy",
      shortTitle: "Renewable Energy",
      headline: "Turn unreliable electricity into dependable power engineered around your actual demand.",
      summary:
        "Solar PV, battery storage and hybrid power systems designed from a real assessment of your load, structure and budget — not a standard package.",
      description:
        "Reliable power starts with understanding what you actually run, when you run it and how long you need it to keep running when the grid does not. TRES designs solar and storage systems from that assessment: the right array for your roof or ground, storage sized to your backup requirement, an inverter matched to your real peak load, and the option to tie into the grid, run independently or combine sources in a hybrid system.\n\nFrom a single residence to a factory, a greenfield development or a microgrid, delivery is turnkey — design, procurement, installation, testing and commissioning — followed by operations and maintenance so the system keeps performing.",
      capabilities: [
        "Solar PV",
        "Grid-tied systems",
        "Off-grid systems",
        "Battery storage",
        "Inverter supply and installation",
        "Hybrid power",
        "Microgrid and storage solutions",
        "Rooftop solar",
        "Solar carports",
        "Ground-mounted solar",
        "Greenfield solar development",
        "Turnkey design and installation",
        "Operations and maintenance",
      ],
      outcomes: [
        { title: "Power that matches demand", text: "Sized from your actual load profile, not a brochure." },
        { title: "Backup you can plan around", text: "Storage specified for the hours you need, at the loads you run." },
        { title: "Less dependence on generators and the grid", text: "A system that works with what you have — or replaces it." },
      ],
      mediaId: m.renewable,
    },
    {
      slug: "electrical-engineering",
      number: "02",
      title: "Electrical Engineering & Power",
      shortTitle: "Electrical Engineering",
      headline: "Electrical infrastructure designed, installed and commissioned to carry real loads safely.",
      summary:
        "From residential wiring to industrial installations, substations and overhead lines — engineered for safety, capacity and the long term.",
      description:
        "Every reliable power system rests on sound electrical engineering. TRES designs and installs electrical infrastructure for homes, commercial buildings and industrial facilities, and delivers substation installation and commissioning and overhead line installation where power has to be brought in, stepped down or distributed across a site.\n\nDesign is driven by the actual load and future growth; installation is carried out by trained teams; and nothing is handed over until it has been tested and commissioned.",
      capabilities: [
        "Electrical design",
        "Residential electrical installation",
        "Commercial electrical installation",
        "Industrial electrical installation",
        "Substation installation",
        "Substation commissioning",
        "Overhead line installation",
      ],
      outcomes: [
        { title: "Capacity for today and tomorrow", text: "Designed around present loads with room to grow." },
        { title: "Safety by design", text: "Protection, earthing and distribution engineered properly." },
        { title: "Commissioned, not assumed", text: "Verified performance before the first day of service." },
      ],
      mediaId: m.electrical,
    },
    {
      slug: "smart-security",
      number: "03",
      title: "Smart Security",
      shortTitle: "Smart Security",
      headline: "See what matters. Protect what matters.",
      summary:
        "CCTV, surveillance, perimeter protection, intrusion detection and control-room monitoring designed around how your site is actually used.",
      description:
        "Security is about outcomes: knowing what is happening across your premises, being alerted when something is wrong and being able to respond. TRES designs surveillance and protection systems around your site — coverage without blind spots, perimeter protection that matches the real threat, intrusion detection that is reliable rather than noisy, and control-room monitoring where it is needed.\n\nBecause TRES also engineers the power behind it, your security system stays on when the grid does not.",
      capabilities: [
        "CCTV",
        "Surveillance systems",
        "Perimeter protection",
        "Intrusion detection",
        "Control-room monitoring",
      ],
      outcomes: [
        { title: "Coverage that is designed, not guessed", text: "Camera placement and perimeter protection planned from the site." },
        { title: "Alerts that mean something", text: "Intrusion detection tuned to reduce false alarms." },
        { title: "Always powered", text: "Integrated with reliable power so protection does not lapse." },
      ],
      mediaId: m.security,
    },
    {
      slug: "smart-automation",
      number: "04",
      title: "Smart Automation",
      shortTitle: "Smart Automation",
      headline: "Make your environment respond intelligently.",
      summary:
        "Access control, smart home automation, voice and app-based control, remote monitoring, automated gates and entry systems.",
      description:
        "Automation should remove friction. Gates that open for the right people, lighting and climate that respond to how spaces are used, access that is controlled without keys, and the ability to see and manage your home or facility from wherever you are. TRES designs automation that is simple to live with and built on dependable power and connectivity.",
      capabilities: [
        "Access control",
        "Smart home automation",
        "Voice control",
        "App-based control",
        "Remote monitoring",
        "Automated gates",
        "Automated entry systems",
      ],
      outcomes: [
        { title: "Convenience without complexity", text: "Control that works for everyone in the building." },
        { title: "Visibility from anywhere", text: "Remote monitoring of what matters to you." },
        { title: "Controlled access", text: "The right people in, everyone else out." },
      ],
      mediaId: m.automation,
    },
    {
      slug: "procurement",
      number: "05",
      title: "Procurement & Supply",
      shortTitle: "Procurement",
      headline: "If it is engineering-related, TRES can source it.",
      summary:
        "Electrical, renewable-energy and security equipment sourced through a coordinated supplier network and delivered to your project.",
      description:
        "Getting the right equipment to site, on time and to specification, is engineering work in its own right. TRES coordinates a supplier network for electrical equipment, renewable-energy equipment and security equipment, handles project procurement end to end and manages the coordination so that installation is never waiting on a missing component.\n\nEquipment is selected because it suits the application and can be maintained — not because it is the easiest thing to sell.",
      capabilities: [
        "Supplier network coordination",
        "Electrical equipment",
        "Renewable-energy equipment",
        "Security equipment",
        "Project procurement",
        "Delivery and site coordination",
      ],
      outcomes: [
        { title: "Right specification", text: "Equipment matched to the design, not substituted on site." },
        { title: "Coordinated delivery", text: "Procurement sequenced with the installation programme." },
        { title: "One accountable party", text: "TRES manages suppliers so you do not have to." },
      ],
      mediaId: m.procurement,
    },
    {
      slug: "project-management",
      number: "06",
      title: "Project Management",
      shortTitle: "Project Management",
      headline: "One point of contact from planning to handover — and after.",
      summary:
        "End-to-end coordination of planning, procurement, installation, testing, commissioning, handover and support.",
      description:
        "Engineering projects fail in the gaps between parties. TRES removes the gaps by acting as a single point of contact: one team plans the work, procures the equipment, manages installation, tests and commissions the system, hands it over properly and remains available for support.\n\nYou deal with one accountable team, and the system you receive works as one.",
      capabilities: ["Planning", "Procurement", "Installation", "Testing", "Commissioning", "Handover", "Support"],
      outcomes: [
        { title: "Single accountability", text: "No finger-pointing between contractors." },
        { title: "Coordinated delivery", text: "Each stage planned against the next." },
        { title: "Proper handover", text: "Documentation, walkthrough and ongoing support." },
      ],
      mediaId: m.projectMgmt,
    },
  ];
  let order = 0;
  for (const r of rows) {
    await db.insert(services).values({ ...r, order: order++, visible: true, showOnHome: true });
  }
}

async function seedMarkets(m: Record<string, number>) {
  const rows = [
    {
      slug: "residential",
      title: "Residential",
      headline: "RELIABLE POWER FOR MODERN HOMES.",
      summary: "Dependable electricity, backup that lasts, and a home that is secure and responsive.",
      description:
        "Homes feel the failures of the grid first — in the cost of running a generator, in food that spoils, in nights without fans or light. TRES designs residential power systems around how your household actually lives, and extends the same engineering to security and automation so the home is protected and easy to run.",
      painPoints: ["Rising electricity costs", "Unreliable grid supply", "Generator dependence", "Backup that runs out", "Security of the home", "Comfort and convenience"],
      solutions: [
        { title: "Solar and storage sized to your home", text: "Based on the appliances you run and the hours you need." },
        { title: "Backup power you can plan around", text: "Storage specified for your real backup requirement." },
        { title: "Security and automation", text: "CCTV, access control and smart control integrated with power." },
      ],
      ctaLabel: "Build Your Home Solution",
      mediaId: m.residential,
    },
    {
      slug: "commercial",
      title: "Commercial",
      headline: "POWER RELIABILITY IS BUSINESS RELIABILITY.",
      summary: "Protect productivity, revenue and premises with energy and security systems built for operations.",
      description:
        "Every hour of downtime is lost productivity and lost revenue. TRES engineers energy systems that keep shops, offices and facilities operating through outages, and security systems that protect staff, assets and premises — delivered through one point of contact so the business keeps running while the work is done.",
      painPoints: ["Downtime", "Lost productivity", "Lost revenue", "Generator running costs", "Security of staff, assets and premises", "Operational continuity"],
      solutions: [
        { title: "Energy systems for continuity", text: "Solar, storage and electrical infrastructure matched to operating hours and loads." },
        { title: "Security for premises", text: "Surveillance, access control and monitoring." },
        { title: "Single point of contact", text: "Planned around your operations." },
      ],
      ctaLabel: "Engineer Your Business Solution",
      mediaId: m.commercial,
    },
    {
      slug: "industrial",
      title: "Industrial",
      headline: "POWER BUILT FOR CONTINUOUS OPERATIONS.",
      summary: "Heavy loads, continuous production and large sites demand infrastructure that is engineered, not improvised.",
      description:
        "Industrial facilities run heavy loads for long hours, and production interruptions are costly. TRES delivers electrical infrastructure, solar and storage, substation work and large-scale security systems designed for continuous operation and the reliability the site depends on.",
      painPoints: ["Heavy loads", "Continuous operation", "Production interruptions", "Infrastructure reliability", "Large-scale site security"],
      solutions: [
        { title: "Electrical infrastructure", text: "Industrial installation, substations and distribution." },
        { title: "Solar and storage for industry", text: "Designed around production loads and schedules." },
        { title: "Large-scale security", text: "Perimeter protection and control-room monitoring." },
      ],
      ctaLabel: "Discuss Your Facility",
      mediaId: m.industrial,
    },
    {
      slug: "estates",
      title: "Estates & Gated Communities",
      headline: "SHARED INFRASTRUCTURE, ENGINEERED PROPERLY.",
      summary: "Shared power, perimeter security and centralised systems for communities that depend on them.",
      description:
        "Estates carry responsibilities no single home does: shared power, community security and infrastructure that many households rely on. TRES designs centralised power and security systems for estates and gated communities — from solar and storage to perimeter protection, access control and monitoring.",
      painPoints: ["Shared power supply", "Perimeter security", "Community infrastructure", "Centralised systems that must not fail"],
      solutions: [
        { title: "Shared power systems", text: "Centralised solar, storage and distribution." },
        { title: "Perimeter and access security", text: "Protection, automated entry and monitoring." },
        { title: "Community infrastructure", text: "Engineered and maintained as one system." },
      ],
      ctaLabel: "Plan Your Estate Infrastructure",
      mediaId: m.estates,
    },
    {
      slug: "institutions",
      title: "Government & Institutions",
      headline: "DEPENDABLE INFRASTRUCTURE FOR HEAVY DAILY USE.",
      summary: "Power and security that hold up under constant demand.",
      description:
        "Institutions run all day, every day, and their power and security systems have to be dependable under heavy use. TRES engineers infrastructure for government and institutional facilities with reliability as the first requirement — power, security and the electrical backbone that supports both.",
      painPoints: ["Constant power demand", "Heavy daily use", "Security", "Reliability under load"],
      solutions: [
        { title: "Reliable power", text: "Solar, storage and electrical infrastructure for continuous demand." },
        { title: "Institutional security", text: "Surveillance, access control and monitoring." },
        { title: "Built for maintainability", text: "Systems that can be kept running." },
      ],
      ctaLabel: "Talk to TRES",
      mediaId: m.institutions,
    },
    {
      slug: "agriculture",
      title: "Agriculture",
      headline: "POWER WHERE THE GRID DOES NOT REACH.",
      summary: "Energy for irrigation, equipment, storage and processing in remote locations.",
      description:
        "Agricultural operations are often remote, with unreliable or no grid access, yet they depend on power for irrigation, equipment, cold storage and processing. TRES designs off-grid and hybrid systems for farms and processing facilities so production is not held hostage to the grid.",
      painPoints: ["Remote locations", "Unreliable grid access", "Irrigation", "Equipment", "Storage", "Processing"],
      solutions: [
        { title: "Off-grid and hybrid power", text: "Solar and storage for remote sites." },
        { title: "Power for processing", text: "Systems sized for processing loads." },
        { title: "Irrigation and storage", text: "Pumps, cold storage and equipment kept running." },
      ],
      ctaLabel: "Power Your Operation",
      mediaId: m.agriculture,
    },
  ];
  let order = 0;
  for (const r of rows) {
    await db.insert(markets).values({ ...r, order: order++, visible: true, showOnHome: true });
  }
}

async function seedProjects(m: Record<string, number>) {
  const rows = [
    {
      slug: "private-residence-ondo",
      title: "Private Residence, Ondo State",
      category: "Residential Solar + Storage",
      location: "Ondo State",
      projectType: "Residential",
      systemCapacity: "6.2 kW solar",
      energyCapacity: "15 kWh storage",
      summary: "15 kWh battery storage with 6.2 kW solar PV for a private residence in Ondo State.",
      coverMediaId: m.projResidence1,
      featured: true,
      published: true,
    },
    {
      slug: "garri-processing-factory",
      title: "Garri Processing Factory",
      category: "Agro-processing Solar + Storage",
      location: "Ife, Osun State",
      projectType: "Industrial / Agriculture",
      systemCapacity: "20 kW solar",
      energyCapacity: "85 kWh storage",
      summary: "85 kWh battery storage with 20 kW solar PV for a garri processing factory in Ife, Osun State.",
      coverMediaId: m.projFactory,
      featured: true,
      published: true,
    },
    {
      slug: "gofamint-printing-press-bookshop",
      title: "Gofamint Printing Press Bookshop",
      category: "Smart Security",
      location: "Ibadan, Oyo State",
      projectType: "Commercial",
      systemCapacity: "40-camera full-site security",
      energyCapacity: "",
      summary: "40-camera full-site security system for a printing press and bookshop in Ibadan, Oyo State.",
      coverMediaId: m.projSecurity,
      featured: true,
      published: true,
    },
    {
      slug: "private-residence-ife",
      title: "Private Residence, Ife",
      category: "Residential Solar + Storage",
      location: "Ife, Osun State",
      projectType: "Residential",
      systemCapacity: "12 kW solar",
      energyCapacity: "20 kWh storage",
      summary: "20 kWh battery storage with 12 kW solar PV for a private residence in Ife, Osun State.",
      coverMediaId: m.projResidence2,
      featured: true,
      published: true,
    },
  ];
  let order = 0;
  for (const r of rows) {
    await db.insert(projects).values({ ...r, order: order++ });
  }
}

async function seedInsights(m: Record<string, number>) {
  const rows = [
    {
      slug: "how-solar-systems-are-sized",
      title: "How a solar system is actually sized — and why the appliance list matters",
      excerpt:
        "Solar, battery and inverter capacities are three different questions. Here is how each one is answered from your real energy use.",
      category: "Solar",
      featured: true,
      published: true,
      coverMediaId: m.insight1,
      content: `A solar system is not one number. It is at least three: how much solar generation you need, how much energy you need to store, and how much power the inverter must deliver at once. Each answers a different question about how you use electricity.

## Daily energy — the solar question

Start with what you run and for how long. A refrigerator, lights, fans, a television and a few chargers add up to a daily energy figure measured in kilowatt-hours (kWh). Solar capacity is sized so that the array produces that energy over the useful sun hours available at your location, after real-world losses in panels, wiring and conversion.

## Backup hours — the battery question

Battery storage is sized from the loads you want to keep running when there is no sun and no grid, multiplied by how long you need them to run. Not every appliance runs at once, and batteries should not be drained completely, so usable capacity — not the label — is what matters.

## Peak load — the inverter question

The inverter must handle the highest power you draw at one moment, with headroom for motors such as pumps and air conditioners that surge on start-up. That is why an inverter is rated in kVA and why it is chosen separately from the solar array.

## Why this needs a site assessment

An online estimate gets you to a sensible starting point. Roof orientation, shading, cable runs, existing wiring and your budget decide the final design. That is the work TRES does on site before any equipment is proposed.

- Use the TRES Solar Calculator for an indicative estimate.
- Share it with TRES for engineering review.`,
    },
    {
      slug: "battery-storage-explained",
      title: "Battery storage explained: kWh, usable capacity and backup time",
      excerpt:
        "The number on the battery is not the number you can use. Understanding usable capacity is the key to backup that actually lasts.",
      category: "Battery Storage",
      featured: true,
      published: true,
      coverMediaId: m.insight2,
      content: `When people say a system "has 10 kWh of battery", it tells you the nominal storage, not how long your lights stay on. Three things decide that.

## Usable capacity

Batteries are designed to be discharged to a limit, not to zero. The portion you can safely use each cycle is the usable capacity. Designing around the nominal figure leads to backup that falls short and batteries that age early.

## The load during backup

Backup time is usable energy divided by the power you draw. Running a refrigerator, lights and fans draws far less than running an air conditioner and a pump at the same time. Deciding which loads must stay on during an outage is one of the most useful conversations in a design.

## Recharge

Storage is only as good as what refills it. A battery that cannot be recharged by the array during the day will not be there for you the next night. Solar capacity, storage and expected grid availability are designed together.

## What to ask

- What is the usable capacity, not the nominal capacity?
- Which loads is the backup designed to carry, and for how long?
- How quickly will the array recharge the battery on a typical day?

These are the questions TRES answers during assessment and design.`,
    },
    {
      slug: "why-site-assessment-comes-first",
      title: "Why site assessment comes before equipment selection",
      excerpt:
        "Standard packages are easy to sell and expensive to live with. A proper assessment is what turns equipment into a system that works.",
      category: "Engineering Advice",
      featured: false,
      published: true,
      coverMediaId: m.insight3,
      content: `It is tempting to start with a product — a particular inverter, a panel brand, a camera model. Good engineering starts somewhere else: with the site.

## What an assessment looks at

- The actual load: what runs, when, and how much it draws.
- The structure: roof condition and orientation, available ground, cable routes, existing wiring and distribution.
- The budget: what is commercially sensible for the outcome you need.
- The environment: grid availability, security risks, access and maintenance.

## Why it changes the design

Two homes with the same bill can need very different systems. One may have a shaded roof and a well pump; the other may have a strong grid connection most of the day. Assessment is how those differences are discovered before money is spent.

## What it protects you from

Unsuitable equipment, undersized storage, overloaded inverters, poor cable sizing and installations that are never properly tested or commissioned. Each is a common reason people end up paying twice.

## How TRES works

Understand, assess, design, procure, install, test, commission, support — in that order. The assessment is where the engineering begins.`,
    },
  ];
  for (const r of rows) {
    await db.insert(insights).values(r);
  }
}

export async function seedDatabase() {
  // Admin user (single administrator; extensible to more later)
  if (await isEmpty(adminUsers)) {
    const email = (process.env.ADMIN_EMAIL || "admin@tres.ng").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "TresAdmin#2025";
    await db.insert(adminUsers).values({
      email,
      name: "TRES Administrator",
      passwordHash: hashPassword(password),
      role: "admin",
    });
  }

  const freshInstall = await isEmpty(siteSettings);
  if (freshInstall) {
    await db
      .insert(siteSettings)
      .values(Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value })));
    await setSetting("content_version", String(CONTENT_VERSION));
  }

  if (await isEmpty(navigation)) {
    const header = [
      ["Home", "/"],
      ["About", "/about"],
      ["Services", "/services"],
      ["Markets", "/markets"],
      ["Projects", "/projects"],
      ["Insights", "/insights"],
      ["Solar Calculator", "/solar-calculator"],
    ];
    const footer = [
      ["About TRES", "/about"],
      ["Projects", "/projects"],
      ["Insights", "/insights"],
      ["Solar Calculator", "/solar-calculator"],
      ["Contact", "/contact"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ];
    await db.insert(navigation).values([
      ...header.map(([label, href], i) => ({ location: "header", label, href, order: i })),
      ...footer.map(([label, href], i) => ({ location: "footer", label, href, order: i })),
    ]);
  }

  let m: Record<string, number> = {};
  if (await isEmpty(media)) {
    m = await seedMedia();
  }

  if (await isEmpty(pageSections)) await seedSections(m);
  if (await isEmpty(services)) await seedServices(m);
  if (await isEmpty(markets)) await seedMarkets(m);
  if (await isEmpty(projects)) await seedProjects(m);
  if (await isEmpty(insights)) await seedInsights(m);

  if (await isEmpty(calculatorSettings)) {
    await db.insert(calculatorSettings).values({
      settings: DEFAULT_CALCULATOR_CONFIG as unknown as Record<string, unknown>,
    });
  }
  if (await isEmpty(calculatorAppliances)) {
    await db
      .insert(calculatorAppliances)
      .values(DEFAULT_APPLIANCES.map((a, i) => ({ ...a, order: i, visible: true })));
  }

  await migrateContent();
}

/* ------------------------------------------------------------------ */
/* Content migrations — safe updates for already-populated databases   */
/* ------------------------------------------------------------------ */

async function getSetting(key: string) {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return row ? row.value : null;
}

async function setSetting(key: string, value: string) {
  await db
    .insert(siteSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
}

async function applyOrder(page: string, keys: string[]) {
  for (let i = 0; i < keys.length; i++) {
    await db
      .update(pageSections)
      .set({ order: i })
      .where(and(eq(pageSections.page, page), eq(pageSections.key, keys[i])));
  }
}

/** Runs pending migrations once; fresh installs are seeded at the latest version. */
async function migrateContent() {
  const current = parseInt((await getSetting("content_version")) || "1", 10) || 1;
  if (current >= CONTENT_VERSION) return;
  if (current < 2) await migrateToV2();
  if (current < 3) await migrateToV3();
  if (current < 4) await migrateToV4();
  await setSetting("content_version", String(CONTENT_VERSION));
}

/**
 * v4 — precision refinement:
 *  • remove all decorative eyebrows
 *  • heading wording where labels are gone / long all-caps -> sentence case
 *  • private client names -> neutral titles
 *  • reset header navigation to the canonical seven links
 */
async function migrateToV4() {
  const now = new Date();
  await db.update(pageSections).set({ eyebrow: "", updatedAt: now });

  const homeProjects = await db.select().from(pageSections).where(and(eq(pageSections.page, "home"), eq(pageSections.key, "projects"))).limit(1);
  if (homeProjects[0]) await db.update(pageSections).set({ title: "PROJECTS WE HAVE ENGINEERED.", updatedAt: now }).where(eq(pageSections.id, homeProjects[0].id));

  const aboutHero = await db.select().from(pageSections).where(and(eq(pageSections.page, "about"), eq(pageSections.key, "hero"))).limit(1);
  if (aboutHero[0]) await db.update(pageSections).set({ title: "AN ENGINEERING COMPANY FOR PEOPLE WHO DEPEND ON POWER.", updatedAt: now }).where(eq(pageSections.id, aboutHero[0].id));

  const aboutWho = await db.select().from(pageSections).where(and(eq(pageSections.page, "about"), eq(pageSections.key, "who"))).limit(1);
  if (aboutWho[0] && aboutWho[0].title === "AN ENGINEERING COMPANY, NOT A PRODUCT RESELLER.") {
    await db.update(pageSections).set({ title: "An engineering company, not a product reseller.", updatedAt: now }).where(eq(pageSections.id, aboutWho[0].id));
  }
  const aboutVision = await db.select().from(pageSections).where(and(eq(pageSections.page, "about"), eq(pageSections.key, "vision"))).limit(1);
  if (aboutVision[0] && aboutVision[0].title === "TO BECOME AFRICA'S MOST TRUSTED ENGINEERING AND TECHNOLOGY COMPANY.") {
    await db.update(pageSections).set({ title: "To become Africa's most trusted engineering and technology company.", updatedAt: now }).where(eq(pageSections.id, aboutVision[0].id));
  }

  const renames: [string, string, string][] = [
    ["mr-olorunmola-residence", "private-residence-ondo", "Private Residence, Ondo State"],
    ["mr-festus-residence", "private-residence-ife", "Private Residence, Ife"],
  ];
  for (const [oldSlug, newSlug, newTitle] of renames) {
    const rows = await db.select().from(projects).where(eq(projects.slug, oldSlug)).limit(1);
    if (rows[0]) await db.update(projects).set({ slug: newSlug, title: newTitle, updatedAt: now }).where(eq(projects.id, rows[0].id));
  }

  // Credentials & partners — hidden by default, owner-managed (never invent these).
  const existingCred = await db.select().from(pageSections).where(and(eq(pageSections.page, "home"), eq(pageSections.key, "credentials"))).limit(1);
  if (!existingCred[0]) {
    await db.insert(pageSections).values({
      page: "home",
      key: "credentials",
      label: "Credentials & partners",
      eyebrow: "",
      title: "Credentials & partners",
      subtitle: "",
      body: "",
      items: [],
      visible: false,
      order: 99,
    });
  }
  await applyOrder("home", ["hero", "pain", "improve", "services", "projects", "credentials", "calculator", "cta"]);

  await db.delete(navigation).where(eq(navigation.location, "header"));
  const header: [string, string][] = [
    ["Home", "/"],
    ["About", "/about"],
    ["Services", "/services"],
    ["Markets", "/markets"],
    ["Projects", "/projects"],
    ["Insights", "/insights"],
    ["Solar Calculator", "/solar-calculator"],
  ];
  await db.insert(navigation).values(header.map(([label, href], i) => ({ location: "header", label, href, order: i })));
}

/** v3 — Privacy policy opens with a plain legal statement rather than a brand explanation. */
async function migrateToV3() {
  const [privacy] = await db
    .select()
    .from(pageSections)
    .where(and(eq(pageSections.page, "privacy"), eq(pageSections.key, "content")))
    .limit(1);
  if (privacy && privacy.body.includes(PRIVACY_OLD)) {
    await db
      .update(pageSections)
      .set({ body: privacy.body.replace(PRIVACY_OLD, PRIVACY_NEW), updatedAt: new Date() })
      .where(eq(pageSections.id, privacy.id));
  }
}

/**
 * v2 — homepage refinement:
 *  • two structured phone numbers (WhatsApp remains independent)
 *  • Markets, Insights and the duplicate founder message leave the homepage
 *  • "Why TRES" and the engineering process move to About
 *  • decorative section numbering removed from eyebrows, pain copy tightened
 *  • explanatory brand sentences removed from About hero / Privacy
 */
async function migrateToV2() {
  if ((await getSetting("phone_primary")) === null) await setSetting("phone_primary", DEFAULT_SETTINGS.phone_primary);
  if ((await getSetting("phone_secondary")) === null) await setSetting("phone_secondary", DEFAULT_SETTINGS.phone_secondary);
  if ((await getSetting("logo_light_media_id")) === null) await setSetting("logo_light_media_id", "");
  if ((await getSetting("logo_show_wordmark")) === null) await setSetting("logo_show_wordmark", "true");
  await db.delete(siteSettings).where(eq(siteSettings.key, "phone"));

  const home = await db.select().from(pageSections).where(eq(pageSections.page, "home"));
  const about = await db.select().from(pageSections).where(eq(pageSections.page, "about"));
  const homeKey = (k: string) => home.find((s) => s.key === k);
  const aboutKey = (k: string) => about.find((s) => s.key === k);
  const now = new Date();

  // Why TRES → About
  const why = homeKey("why");
  if (why && !aboutKey("why-tres")) {
    await db
      .update(pageSections)
      .set({ page: "about", key: "why-tres", label: "Why TRES", eyebrow: "", updatedAt: now })
      .where(eq(pageSections.id, why.id));
  } else if (why) {
    await db.delete(pageSections).where(eq(pageSections.id, why.id));
  } else if (!aboutKey("why-tres")) {
    await db.insert(pageSections).values({
      page: "about", key: "why-tres", label: "Why TRES", eyebrow: "",
      title: WHY_TRES.title, body: WHY_TRES.body, items: WHY_TRES.items, order: 0,
    });
  }

  // Engineering process → About (replaces the shorter "how we work" list)
  const process = homeKey("process");
  const how = aboutKey("how-we-work");
  if (process && how) {
    await db
      .update(pageSections)
      .set({ label: "Engineering process", eyebrow: "", title: process.title, subtitle: process.subtitle, items: process.items, updatedAt: now })
      .where(eq(pageSections.id, how.id));
    await db.delete(pageSections).where(eq(pageSections.id, process.id));
  } else if (process) {
    await db
      .update(pageSections)
      .set({ page: "about", key: "how-we-work", label: "Engineering process", eyebrow: "", updatedAt: now })
      .where(eq(pageSections.id, process.id));
  }

  // Sections that now live exclusively on their dedicated pages
  for (const key of ["markets", "insights", "founder"]) {
    const row = homeKey(key);
    if (row) await db.delete(pageSections).where(eq(pageSections.id, row.id));
  }

  // Eyebrows without implementation numbers; tightened pain copy; CTA buttons
  for (const [key, eyebrow] of Object.entries(HOME_EYEBROWS)) {
    const row = homeKey(key);
    if (!row) continue;
    const patch: Partial<typeof pageSections.$inferInsert> = { updatedAt: now };
    if (/^\d{2}\s*—/.test(row.eyebrow)) patch.eyebrow = eyebrow;
    if (key === "pain" && row.body.startsWith("Yet for many homes, businesses and institutions")) {
      patch.body = PAIN_BODY;
      patch.items = PAIN_ITEMS;
    }
    if (key === "services" && row.primaryLabel === "All Services") patch.primaryLabel = "Explore all services";
    if (key === "projects" && row.primaryLabel === "View All Projects") patch.primaryLabel = "View all projects";
    if (key === "cta") {
      patch.secondaryLabel = "";
      patch.secondaryHref = "";
    }
    await db.update(pageSections).set(patch).where(eq(pageSections.id, row.id));
  }

  await applyOrder("home", HOME_ORDER);
  await applyOrder("about", ABOUT_ORDER);

  const aboutHero = aboutKey("hero");
  if (aboutHero && aboutHero.subtitle.includes("public brand of")) {
    await db.update(pageSections).set({ subtitle: ABOUT_HERO_SUBTITLE, updatedAt: now }).where(eq(pageSections.id, aboutHero.id));
  }
  const [privacy] = await db
    .select()
    .from(pageSections)
    .where(and(eq(pageSections.page, "privacy"), eq(pageSections.key, "content")))
    .limit(1);
  if (privacy && privacy.body.includes(PRIVACY_OLD)) {
    await db.update(pageSections).set({ body: privacy.body.replace(PRIVACY_OLD, PRIVACY_NEW), updatedAt: now }).where(eq(pageSections.id, privacy.id));
  }
}

const globalForSeed = globalThis as typeof globalThis & { __tresSeedPromise?: Promise<void> };

/** Runs the idempotent seed once per server process. Safe to call on every request. */
export function ensureSeeded() {
  if (!globalForSeed.__tresSeedPromise) {
    globalForSeed.__tresSeedPromise = seedDatabase().catch((err) => {
      globalForSeed.__tresSeedPromise = undefined;
      console.error("[tres] seed failed", err);
    });
  }
  return globalForSeed.__tresSeedPromise;
}
