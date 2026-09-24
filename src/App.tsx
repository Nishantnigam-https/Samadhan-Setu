import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/* ============================================================================
   SAMADHAN SETU — Jharkhand Societal Innovation Collaboration Portal
   Single-file build: data + AI engine + icons + UI kit + role desks + shell
   ==========================================================================*/

/* ---------------- Types & session ---------------- */
type Lang = "en" | "hi";
type Role =
  | "citizen"
  | "university"
  | "industry"
  | "govt"
  | "local_worker"
  | "field_verifier"
  | "state_admin"
  | "state_nodal_officer"
  | "department_head"
  | "district_officer"
  | "resolution_officer"
  | "field_officer"
  | "auditor";
type GovtDesk =
  "command" | "operations" | "university" | "industry" | "projects" | "trust";
type StateGovtRole =
  | "state_admin"
  | "state_nodal_officer"
  | "department_head"
  | "district_officer"
  | "resolution_field_officer"
  | "auditor_monitoring";
type CityDesk =
  | "city_admin"
  | "department_officer"
  | "field_verification_officer";
type CityDepartment =
  | "water_drainage"
  | "roads"
  | "electricity"
  | "sanitation"
  | "health"
  | "environment"
  | "education"
  | "other_municipal";
interface Session {
  id?: string;
  role: Role;
  name: string;
  org: string;
  orgId?: string;
    designation?: string;
    department?: string;
  sub?: string;
  govtDesk?: GovtDesk;
  stateRole?: StateGovtRole;
  cityDesk?: CityDesk;
  city_desk?: CityDesk;
  cityDepartment?: CityDepartment;
  city_department?: CityDepartment;
  token?: string;
  university_location?: string;
  university_capabilities?: string;
  labs_centres?: string;
  company_location?: string;
  company_capabilities?: string;
  csr_support_areas?: string;
}
const STATE_ADMIN_ROLES: Role[] = [
  "state_admin",
  "state_nodal_officer",
  "auditor",
];
const CITY_ADMIN_ROLES: Role[] = [
  "department_head",
  "district_officer",
  "resolution_officer",
  "field_officer",
  "field_verifier",
];
const isStateAdminRole = (role?: Role | null) =>
  role === "govt" || STATE_ADMIN_ROLES.includes(role as Role);
const isCityAdminRole = (role?: Role | null) =>
  role === "local_worker" ||
  role === "field_verifier" ||
  CITY_ADMIN_ROLES.includes(role as Role);
const roleCityDesk = (role: Role): CityDesk =>
  role === "department_head"
    ? "department_officer"
    : role === "district_officer"
      ? "city_admin"
      : role === "resolution_officer"
        ? "city_admin"
        : role === "field_officer" || role === "field_verifier"
          ? "field_verification_officer"
          : "city_admin";
const normalizeCityDesk = (value: unknown, fallback: CityDesk = "city_admin") =>
  typeof value === "string" &&
    ["city_admin", "department_officer", "field_verification_officer"].includes(
      value,
    )
    ? (value as CityDesk)
    : fallback;
const CITY_DESKS: { id: CityDesk; en: string; hi: string }[] = [
  {
    id: "city_admin",
    en: "Local Admin / Municipal Admin",
    hi: "लोकल एडमिन / नगरपालिका एडमिन",
  },
  { id: "department_officer", en: "Department Officer", hi: "विभाग अधिकारी" },
  {
    id: "field_verification_officer",
    en: "Field Verification Officer",
    hi: "फील्ड सत्यापन अधिकारी",
  },
];
const CITY_DEPARTMENTS: {
  id: CityDepartment;
  en: string;
  hi: string;
  categories: string[];
}[] = [
  {
    id: "water_drainage",
    en: "Water & Drainage",
    hi: "जल एवं drainage",
    categories: ["water_drainage"],
  },
  {
    id: "roads",
    en: "Roads",
    hi: "सड़क",
    categories: ["road_transport", "street_lighting"],
  },
  {
    id: "electricity",
    en: "Electricity",
    hi: "बिजली",
    categories: ["public_utilities", "street_lighting"],
  },
  {
    id: "sanitation",
    en: "Sanitation",
    hi: "स्वच्छता",
    categories: ["waste_management"],
  },
  {
    id: "health",
    en: "Health",
    hi: "स्वास्थ्य",
    categories: ["public_safety", "other_municipal"],
  },
  {
    id: "environment",
    en: "Environment",
    hi: "पर्यावरण",
    categories: ["public_safety", "other_municipal"],
  },
  {
    id: "education",
    en: "Education",
    hi: "शिक्षा",
    categories: ["other_municipal"],
  },
  {
    id: "other_municipal",
    en: "Other Municipal",
    hi: "अन्य नगरपालिका",
    categories: ["other_municipal"],
  },
];
const GOVT_DESKS: { id: GovtDesk; en: string; hi: string; view: string }[] = [
  {
    id: "command",
    en: "State Command & Policy",
    hi: "राज्य कमांड व नीति",
    view: "dashboard",
  },
  {
    id: "operations",
    en: "District & Municipal Operations",
    hi: "जिला व नगरपालिका संचालन",
    view: "registry",
  },
  {
    id: "university",
    en: "University & Innovation Partnerships",
    hi: "विश्वविद्यालय व नवाचार साझेदारी",
    view: "unis",
  },
  {
    id: "industry",
    en: "Industry & CSR Partnerships",
    hi: "उद्योग व CSR साझेदारी",
    view: "industry",
  },
  {
    id: "projects",
    en: "Project Delivery & Impact",
    hi: "परियोजना वितरण व प्रभाव",
    view: "projects",
  },
  {
    id: "trust",
    en: "Ledger & Trust Officer",
    hi: "लेजर व ट्रस्ट अधिकारी",
    view: "ledger",
  },
];
const STATE_GOVT_ROLES: {
  id: StateGovtRole;
  en: string;
  hi: string;
  desk: GovtDesk;
}[] = [
  { id: "state_admin", en: "State Admin", hi: "स्टेट एडमिन", desk: "command" },
];
declare const L: any;

const IMG = {
  mural:
    "https://image.qwenlm.ai/generated-images/66507f64-7860-4f43-8946-56312bf4d0bb/_result.png",
  water:
    "https://image.qwenlm.ai/generated-images/5bf7805c-f9f4-4e15-9d73-32330f113d16/_result.png",
  agri: "https://image.qwenlm.ai/generated-images/25d78cb2-a95c-44ee-9352-cfbf8cff05b5/_result.png",
  edu: "https://image.qwenlm.ai/generated-images/83555a54-9e40-4560-b879-094e7bbe9e8f/_result.png",
  health:
    "https://image.qwenlm.ai/generated-images/1ebfc99c-8820-4f85-abc4-d1bcfd446351/_result.png",
  waste:
    "https://image.qwenlm.ai/generated-images/1f2e7cf0-a96d-436c-95d2-809a364c9fda/_result.png",
  energy:
    "https://image.qwenlm.ai/generated-images/c6785c3c-a42d-4c2a-b225-64d4b18c7e46/_result.png",
};

/* ---------------- Python backend API ---------------- */
const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

async function apiError(r: Response, fallback: string): Promise<Error> {
  const body = await r.json().catch(() => ({}) as any);
  const detail =
    typeof body?.detail === "string"
      ? body.detail
      : Array.isArray(body?.detail)
        ? body.detail.map((x: any) => x?.msg || String(x)).join(", ")
        : "";
  return new Error(detail || `${fallback} (HTTP ${r.status})`);
}

const api = {
  async authenticate(
    mode: "login" | "register",
    role: Role,
    name: string,
    org: string,
    password: string,
    cityDesk?: CityDesk,
    cityDepartment?: CityDepartment,
  ): Promise<Session> {
    const r = await fetch(`${API_BASE}/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        name,
        org,
        password,
        city_desk:
          cityDesk ||
          (isCityAdminRole(role) ? roleCityDesk(role) : "city_admin"),
        city_department: cityDepartment || "other_municipal",
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.detail || "Authentication failed");
    return { ...j.user, token: j.token };
  },
  async logout(token: string) {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  async getProfile(token: string) {
    const r = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw await apiError(r, "Could not load profile");
    return r.json();
  },
  async updateProfile(
    token: string,
    profile: {
      university_name?: string;
      university_location?: string;
      university_capabilities?: string;
      labs_centres?: string;
      company_name?: string;
      company_location?: string;
      company_capabilities?: string;
      csr_support_areas?: string;
      phone: string;
      address: string;
      district: string;
      block: string;
      designation?: string;
      department?: string;
    },
  ) {
    const r = await fetch(`${API_BASE}/api/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });
    if (!r.ok) throw await apiError(r, "Could not update profile");
    return r.json();
  },
  async escalateProblem(id: string, token: string, reason: string) {
    const r = await fetch(
      `${API_BASE}/api/challenges/${encodeURIComponent(id)}/escalate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      },
    );
    if (!r.ok) throw await apiError(r, "Could not submit complaint");
    return r.json();
  },
  async listCityWorkers(
    token: string,
  ): Promise<
    {
      id: string;
      name: string;
      org: string;
      city_desk?: CityDesk;
      city_department?: CityDepartment;
    }[]
  > {
    const r = await fetch(`${API_BASE}/api/users/city-workers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw await apiError(r, "Could not load city workers");
    return (await r.json()).items ?? [];
  },
  async listActiveUniversities(
    token: string,
  ): Promise<{ id: string; name: string; org: string }[]> {
    const r = await fetch(`${API_BASE}/api/users/active-universities`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw await apiError(r, "Could not load active universities");
    return (await r.json()).items ?? [];
  },
  async listActiveIndustries(
    token: string,
  ): Promise<{ id: string; name: string; org: string }[]> {
    const r = await fetch(`${API_BASE}/api/users/active-industries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw await apiError(r, "Could not load active industries");
    return (await r.json()).items ?? [];
  },
  async resetPassword(
    role: Role,
    name: string,
    org: string,
    resetCode: string,
    newPassword: string,
  ) {
    const r = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        name,
        org,
        reset_code: resetCode,
        new_password: newPassword,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      if (r.status === 404) {
        throw new Error(
          "Password reset API not found. Restart the Samadhan Setu backend from this same project folder.",
        );
      }
      throw new Error(j.detail || `Password reset failed (HTTP ${r.status})`);
    }
    return j;
  },
  async listChallenges(token?: string): Promise<Challenge[]> {
    const r = await fetch(`${API_BASE}/api/challenges`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!r.ok) throw new Error("Backend unavailable");
    const j = await r.json();
    return j.items ?? [];
  },
  async createChallenge(c: Challenge, token?: string): Promise<Challenge> {
    const r = await fetch(`${API_BASE}/api/challenges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ data: c }),
    });
    if (!r.ok) throw await apiError(r, "Could not save challenge");
    return (await r.json()).item;
  },
  async updateChallenge(c: Challenge, token?: string): Promise<Challenge> {
    const r = await fetch(
      `${API_BASE}/api/challenges/${encodeURIComponent(c.id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ data: c }),
      },
    );
    if (!r.ok) throw await apiError(r, "Could not update challenge");
    return (await r.json()).item;
  },
  async analyze(title: string, description: string) {
    const r = await fetch(`${API_BASE}/api/ai/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (!r.ok) throw new Error("AI service unavailable");
    return r.json();
  },
  async voiceAssistant(transcript: string, lang: Lang) {
    const r = await fetch(`${API_BASE}/api/voice/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, lang }),
    });
    if (!r.ok) throw new Error("Voice assistant unavailable");
    return r.json();
  },
  async chat(
    message: string,
    lang: Lang,
    context: Record<string, unknown> = {},
  ) {
    const r = await fetch(`${API_BASE}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, lang, context }),
    });
    if (!r.ok) throw new Error("Samadhan Mitra unavailable");
    return r.json() as Promise<{
      reply: string;
      follow_up?: string;
      engine?: string;
    }>;
  },
  async health(): Promise<boolean> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);
    try {
      const r = await fetch(`${API_BASE}/api/health`, {
        signal: controller.signal,
        cache: "no-store",
      });
      return r.ok;
    } catch {
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  },
  async getChain(
    token?: string,
  ): Promise<{ chain: ChainBlock[]; publicKey: string; algorithm: string }> {
    const r = await fetch(`${API_BASE}/api/chain`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!r.ok) throw new Error("Ledger unavailable");
    return r.json();
  },
  async verifyChain(): Promise<ChainVerification> {
    const r = await fetch(`${API_BASE}/api/chain/verify`);
    if (!r.ok) throw new Error("Chain verification failed");
    return r.json();
  },
  async verifyProblem(id: string) {
    const r = await fetch(
      `${API_BASE}/api/challenges/${encodeURIComponent(id)}/verification`,
    );
    if (!r.ok) throw new Error("Verification unavailable");
    return r.json();
  },
  async confirmProblem(
    id: string,
    user: Session,
    decision: "confirm" | "dispute",
  ) {
    const r = await fetch(
      `${API_BASE}/api/challenges/${encodeURIComponent(id)}/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          user_id: user.id || `${user.role}:${user.name}`,
          user_name: user.name,
          decision,
        }),
      },
    );
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.detail || "Could not record verification");
    return j.verification;
  },
  async reviewProblem(id: string, user: Session, rating: number, text: string) {
    const r = await fetch(
      `${API_BASE}/api/challenges/${encodeURIComponent(id)}/reviews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          user_id: user.id || `${user.role}:${user.name}`,
          user_name: user.name,
          rating,
          text,
        }),
      },
    );
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.detail || "Could not save review");
    return j;
  },
  async getReviews(id: string) {
    const r = await fetch(
      `${API_BASE}/api/challenges/${encodeURIComponent(id)}/reviews`,
    );
    if (!r.ok) throw new Error("Reviews unavailable");
    return r.json();
  },
};

/* ---------------- Domains ---------------- */
interface Domain {
  id: string;
  en: string;
  hi: string;
  color: string;
  icon: string;
  kw: string[];
}

const DOMAINS: Domain[] = [
  {
    id: "education",
    en: "Education",
    hi: "शिक्षा",
    color: "#2E6FB7",
    icon: "edu",
    kw: [
      "school",
      "teacher",
      "classroom",
      "student",
      "education",
      "dropout",
      "anganwadi",
      "library",
      "exam",
      "midday",
      "meal",
      "vidyalaya",
      "shiksha",
      "smart",
      "kits",
      "literacy",
      "uniform",
    ],
  },
  {
    id: "healthcare",
    en: "Healthcare",
    hi: "स्वास्थ्य",
    color: "#C64456",
    icon: "health",
    kw: [
      "hospital",
      "doctor",
      "medicine",
      "health",
      "clinic",
      "phc",
      "ambulance",
      "vaccination",
      "malnutrition",
      "asha",
      "maternal",
      "disease",
      "fever",
      "dengue",
      "treatment",
      "ilaj",
      "nurse",
      "nutrition",
      "children",
    ],
  },
  {
    id: "agriculture",
    en: "Agriculture",
    hi: "कृषि",
    color: "#6E8F2E",
    icon: "agri",
    kw: [
      "farmer",
      "crop",
      "irrigation",
      "fertilizer",
      "seed",
      "soil",
      "mandi",
      "msp",
      "drought",
      "pest",
      "kisan",
      "kheti",
      "yield",
      "horticulture",
      "dairy",
      "livestock",
      "cattle",
      "stray",
      "tank",
      "canal",
    ],
  },
  {
    id: "water",
    en: "Water Resources",
    hi: "जल संसाधन",
    color: "#1F7FA6",
    icon: "water",
    kw: [
      "water",
      "drinking",
      "tap",
      "handpump",
      "borewell",
      "river",
      "dam",
      "groundwater",
      "arsenic",
      "pond",
      "siltation",
      "well",
      "nahar",
      "jal",
      "contaminated",
      "spring",
      "tank",
    ],
  },
  {
    id: "environment",
    en: "Environment & Forests",
    hi: "पर्यावरण",
    color: "#2E7D4F",
    icon: "env",
    kw: [
      "forest",
      "tree",
      "pollution",
      "air",
      "garbage",
      "waste",
      "mining",
      "deforestation",
      "wildlife",
      "elephant",
      "jharia",
      "coal",
      "fire",
      "hyacinth",
      "lake",
      "smoke",
      "fumes",
    ],
  },
  {
    id: "energy",
    en: "Energy & Power",
    hi: "ऊर्जा",
    color: "#DE9B12",
    icon: "energy",
    kw: [
      "electricity",
      "power",
      "solar",
      "transformer",
      "streetlight",
      "outage",
      "bijli",
      "grid",
      "renewable",
      "biogas",
      "microgrid",
      "voltage",
      "cuts",
    ],
  },
  {
    id: "urban",
    en: "Urban Development",
    hi: "शहरी विकास",
    color: "#557085",
    icon: "urban",
    kw: [
      "drain",
      "sewage",
      "traffic",
      "street",
      "parking",
      "slum",
      "municipality",
      "footpath",
      "pothole",
      "waterlogging",
      "underpass",
      "drainage",
      "sewer",
      "city",
    ],
  },
  {
    id: "accessibility",
    en: "Accessibility & Transport",
    hi: "सुगम्यता",
    color: "#B4692F",
    icon: "access",
    kw: [
      "road",
      "bridge",
      "transport",
      "bus",
      "rail",
      "connectivity",
      "ghat",
      "wheelchair",
      "disabled",
      "ramp",
      "village",
      "highway",
      "travel",
    ],
  },
  {
    id: "administration",
    en: "Public Administration",
    hi: "लोक प्रशासन",
    color: "#4E5D6B",
    icon: "admin",
    kw: [
      "panchayat",
      "certificate",
      "pension",
      "scheme",
      "ration",
      "aadhaar",
      "bribe",
      "service",
      "office",
      "portal",
      "grievance",
      "csc",
      "delay",
      "documents",
    ],
  },
  {
    id: "livelihoods",
    en: "Rural Livelihoods",
    hi: "ग्रामीण आजीविका",
    color: "#7C4A68",
    icon: "rural",
    kw: [
      "skill",
      "employment",
      "self",
      "help",
      "shg",
      "handicraft",
      "handloom",
      "weaving",
      "weavers",
      "mushroom",
      "lac",
      "tussar",
      "silk",
      "fisheries",
      "poultry",
      "income",
      "wage",
      "mgnrega",
      "cold",
      "storage",
    ],
  },
];

const domainById = (id: string) =>
  DOMAINS.find((d) => d.id === id) ?? DOMAINS[0];

/* ---------------- Specific departments (step 2 of classification) ----------------
 * Mirrors backend/ai_engine.py::DEPARTMENTS_BY_DOMAIN. Once a broad domain is
 * picked above, this routes to the one specific government department/authority
 * within it, so citizens and officers see exactly who a problem was sent to —
 * not just its broad theme. First entry per domain is that domain's default. */
const DEPARTMENTS_BY_DOMAIN: Record<string, { name: string; kw: string[] }[]> =
  {
    urban: [
      {
        name: "Municipal Corporation / Municipality / Nagar Parishad",
        kw: [
          "municipal road",
          "garbage",
          "drain",
          "overflowing drain",
          "public bench",
          "dirty public",
          "illegal dumping",
          "pothole",
          "street cleanliness",
          "municipal",
          "nagar parishad",
        ],
      },
      {
        name: "Urban Development & Housing Department",
        kw: [
          "urban drainage",
          "street infrastructure",
          "municipal service",
          "public space",
          "housing",
          "slum",
          "urban development",
        ],
      },
      {
        name: "Traffic Police",
        kw: [
          "traffic signal",
          "illegal parking",
          "traffic obstruction",
          "dangerous driving",
          "traffic jam",
          "signal malfunction",
        ],
      },
      {
        name: "Art, Culture & Sports Department",
        kw: [
          "sports ground",
          "playground",
          "stadium",
          "cultural facility",
          "community hall",
        ],
      },
    ],
    accessibility: [
      {
        name: "PWD / Road Construction Department",
        kw: [
          "pwd road",
          "bridge",
          "damaged bridge",
          "road crack",
          "culvert",
          "road maintenance",
          "state highway",
        ],
      },
      {
        name: "Rural Development Department",
        kw: [
          "rural road",
          "village drainage",
          "rural infrastructure",
          "kutcha road",
        ],
      },
      {
        name: "Transport Department",
        kw: [
          "bus permit",
          "bus service",
          "vehicle permit",
          "transport service",
          "auto rickshaw",
        ],
      },
    ],
    water: [
      {
        name: "Water Resources Department",
        kw: [
          "canal",
          "embankment",
          "irrigation channel",
          "water flow",
          "dam",
          "barrage",
        ],
      },
      {
        name: "Drinking Water & Sanitation Department",
        kw: [
          "public tap",
          "leaking pipeline",
          "water supply",
          "contaminated water",
          "irregular supply",
          "handpump",
          "borewell",
        ],
      },
      {
        name: "Public Health Engineering / Water Supply Authority",
        kw: [
          "drinking water infrastructure",
          "pipeline leakage",
          "water supply failure",
          "phe",
        ],
      },
    ],
    energy: [
      {
        name: "Electricity Distribution Company / Energy Department",
        kw: [
          "electric pole",
          "damaged wire",
          "transformer",
          "streetlight",
          "power outage",
          "voltage",
          "bijli",
        ],
      },
    ],
    healthcare: [
      {
        name: "Health Department",
        kw: [
          "health centre",
          "phc",
          "government hospital",
          "medicine availability",
          "hospital sanitation",
          "asha worker",
          "nurse",
          "doctor absent",
        ],
      },
    ],
    education: [
      {
        name: "Education Department",
        kw: [
          "classroom",
          "school toilet",
          "school water",
          "school furniture",
          "school electricity",
          "midday meal",
          "teacher",
        ],
      },
      {
        name: "Higher Education Department",
        kw: [
          "government college",
          "college infrastructure",
          "university facility",
          "higher education",
        ],
      },
    ],
    agriculture: [
      {
        name: "Agriculture Department",
        kw: [
          "seed distribution",
          "fertilizer",
          "agricultural service",
          "irrigation scheme",
          "crop insurance",
          "kisan",
        ],
      },
      {
        name: "Animal Husbandry Department",
        kw: [
          "veterinary",
          "vaccination camp",
          "livestock service",
          "cattle",
          "animal husbandry",
        ],
      },
    ],
    environment: [
      {
        name: "Forest Department",
        kw: [
          "illegal tree cutting",
          "forest encroachment",
          "forest fire",
          "forest infrastructure",
          "deforestation",
        ],
      },
      {
        name: "Environment Department / Pollution Control Board",
        kw: [
          "pollution",
          "industrial discharge",
          "excessive smoke",
          "noise pollution",
          "illegal dumping",
          "air quality",
        ],
      },
    ],
    livelihoods: [
      {
        name: "Skill Development Department",
        kw: ["skill training centre", "vocational course", "skill development"],
      },
      {
        name: "Labour Department",
        kw: [
          "labour law",
          "wage payment",
          "workplace",
          "unpaid wages",
          "labour dispute",
        ],
      },
      {
        name: "Fisheries Department",
        kw: [
          "fisheries",
          "government pond",
          "fish farming scheme",
          "beneficiary fisheries",
        ],
      },
      {
        name: "Tourism Department",
        kw: ["tourism facility", "tourist signage", "tourist infrastructure"],
      },
    ],
    administration: [
      {
        name: "District Administration / DC Office",
        kw: [
          "inter-departmental",
          "unresolved departmental",
          "coordination problem",
          "dc office",
        ],
      },
      {
        name: "Panchayati Raj Department / Gram Panchayat",
        kw: [
          "panchayat",
          "village sanitation",
          "community asset",
          "gram sabha",
        ],
      },
      {
        name: "Police Department",
        kw: [
          "theft",
          "crime",
          "public safety",
          "missing person",
          "illegal activity",
          "assault",
        ],
      },
      {
        name: "Fire & Emergency Services",
        kw: [
          "fire safety",
          "blocked emergency access",
          "fire hazard",
          "fire brigade",
        ],
      },
      {
        name: "Revenue / Land & Land Reforms Department",
        kw: [
          "land record",
          "mutation",
          "land boundary",
          "land encroachment",
          "revenue office",
        ],
      },
      {
        name: "Food & Civil Supplies Department",
        kw: ["ration shop", "ration distribution", "pds", "food supply"],
      },
      {
        name: "Social Welfare Department",
        kw: [
          "welfare scheme",
          "anganwadi service",
          "pension scheme",
          "disability benefit",
        ],
      },
      {
        name: "Women & Child Development / ICDS",
        kw: [
          "anganwadi infrastructure",
          "nutrition service",
          "child development",
          "icds",
        ],
      },
      {
        name: "Disaster Management Department",
        kw: [
          "flood response",
          "disaster relief",
          "emergency coordination",
          "cyclone",
          "drought relief",
        ],
      },
      {
        name: "Block Development Office (BDO)",
        kw: ["block level", "bdo office", "block development"],
      },
      {
        name: "Sub-Divisional Administration (SDO)",
        kw: ["sub-divisional", "sdo office", "multiple local departments"],
      },
    ],
  };

function specificDepartmentFor(domain: string, text: string): string {
  const t = text.toLowerCase();
  const entries =
    DEPARTMENTS_BY_DOMAIN[domain] ?? DEPARTMENTS_BY_DOMAIN.administration;
  let best = entries[0].name,
    bestScore = 0;
  for (const e of entries) {
    const score = e.kw.reduce((n, k) => (t.includes(k) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = e.name;
    }
  }
  return best;
}

/* ---------------- City Government categories ----------------
 * When the AI routes a problem straight to the City Government Worker
 * (routing_decision === "city_government" — a normal municipal issue that
 * needs no university research or outside investment), it is additionally
 * sorted into one of these 10 everyday city-service buckets so the worker's
 * dashboard can show a clear icon + label per card. */
interface CityCategory {
  id: string;
  en: string;
  hi: string;
  color: string;
  icon: string;
  kw: string[];
}

const CITY_CATEGORIES: CityCategory[] = [
  {
    id: "road_transport",
    en: "Road & Transport",
    hi: "सड़क एवं परिवहन",
    color: "#B4692F",
    icon: "access",
    kw: [
      "road",
      "pothole",
      "footpath",
      "pavement",
      "bridge",
      "traffic",
      "parking",
      "bus stop",
      "bus",
      "auto",
      "rickshaw",
      "highway",
      "flyover",
      "speed breaker",
      "zebra crossing",
    ],
  },
  {
    id: "water_drainage",
    en: "Water & Drainage",
    hi: "जल एवं जल निकासी",
    color: "#1F7FA6",
    icon: "water",
    kw: [
      "water",
      "drain",
      "drainage",
      "sewage",
      "sewer",
      "pipeline",
      "leak",
      "leaking",
      "waterlogging",
      "drinking water",
      "tap",
      "manhole",
      "gutter",
      "borewell",
    ],
  },
  {
    id: "waste_management",
    en: "Sanitation & Waste",
    hi: "स्वच्छता एवं कचरा",
    color: "#6E8F2E",
    icon: "trash",
    kw: [
      "garbage",
      "waste",
      "trash",
      "dump",
      "dumping",
      "dustbin",
      "litter",
      "sanitation worker",
      "sweeping",
      "compost",
      "landfill",
    ],
  },
  {
    id: "street_lighting",
    en: "Street Lighting",
    hi: "स्ट्रीट लाइटिंग",
    color: "#DE9B12",
    icon: "lamp",
    kw: [
      "streetlight",
      "street light",
      "street lamp",
      "lamp post",
      "bulb",
      "dark street",
      "lighting",
      "pole light",
      "no light",
    ],
  },
  {
    id: "public_utilities",
    en: "Public Utilities",
    hi: "सार्वजनिक उपयोगिता",
    color: "#557085",
    icon: "plug",
    kw: [
      "electricity",
      "power cut",
      "power outage",
      "gas",
      "utility",
      "meter",
      "connection",
      "wire",
      "transformer",
      "voltage",
    ],
  },
  {
    id: "public_safety",
    en: "Public Safety",
    hi: "सार्वजनिक सुरक्षा",
    color: "#CE4A3B",
    icon: "shield",
    kw: [
      "safety",
      "unsafe",
      "accident",
      "fire hazard",
      "emergency",
      "danger",
      "hazard",
      "stray dog",
      "open wire",
      "collapse risk",
    ],
  },
  {
    id: "other_municipal",
    en: "Other Municipal",
    hi: "अन्य नगरपालिका",
    color: "#7A8794",
    icon: "gov",
    kw: [],
  },
];
const CITY_GOVERNMENT_TABS = CITY_CATEGORIES.filter((c) =>
  [
    "road_transport",
    "water_drainage",
    "waste_management",
    "street_lighting",
    "public_utilities",
    "public_safety",
    "other_municipal",
  ].includes(c.id),
);

const CITY_DESK_CATEGORY_IDS: Record<CityDesk, string[] | "all"> = {
  city_admin: "all",
  department_officer: [],
  field_verification_officer: [],
};

const CITY_DESK_PERMISSIONS: Record<
  CityDesk,
  {
    assign: boolean;
    sla: boolean;
    workOrder: boolean;
    resolve: boolean;
    escalate: boolean;
    approve: boolean;
  }
> = {
  city_admin: {
    assign: true,
    sla: true,
    workOrder: true,
    resolve: false,
    escalate: false,
    approve: true,
  },
  department_officer: {
    assign: false,
    sla: true,
    workOrder: true,
    resolve: true,
    escalate: true,
    approve: false,
  },
  field_verification_officer: {
    assign: false,
    sla: false,
    workOrder: false,
    resolve: false,
    escalate: true,
    approve: false,
  },
};

const cityDeskCanSeeCategory = (desk: CityDesk, categoryId: string) => {
  const allowed = CITY_DESK_CATEGORY_IDS[desk];
  return allowed === "all" || allowed.includes(categoryId);
};

const cityDepartmentCanSeeCategory = (
  department: CityDepartment | undefined,
  categoryId: string,
) => {
  const item = CITY_DEPARTMENTS.find((entry) => entry.id === department);
  return Boolean(item?.categories.includes(categoryId));
};

const cityDepartmentCanSeeProblem = (
  department: CityDepartment | undefined,
  challenge: Challenge,
) => {
  const category = challenge.city_category
    ? cityCategoryById(challenge.city_category).id
    : cityCategoryFor(
        `${challenge.title} ${challenge.desc} ${challenge.department ?? ""}`,
      ).id;
  if (cityDepartmentCanSeeCategory(department, category)) return true;
  const text =
    `${challenge.title} ${challenge.desc} ${challenge.department ?? ""} ${challenge.domain}`.toLowerCase();
  const terms: Record<CityDepartment, string[]> = {
    water_drainage: ["water", "drain", "sewage", "pipeline"],
    roads: ["road", "pothole", "footpath", "bridge"],
    electricity: ["electricity", "power", "transformer", "voltage"],
    sanitation: ["garbage", "waste", "sanitation", "toilet"],
    health: ["health", "hospital", "doctor", "clinic"],
    environment: ["environment", "pollution", "forest", "tree"],
    education: ["education", "school", "teacher", "student"],
    other_municipal: [],
  };
  return Boolean(
    department && terms[department].some((term) => text.includes(term)),
  );
};

const CITY_PORTAL_PROFILES: Record<
  CityDesk,
  {
    title: string;
    titleHi: string;
    kicker: string;
    kickerHi: string;
    focus: string;
    focusHi: string;
    steps: string[];
    stepsHi: string[];
    assignedLabel: string;
    openLabel: string;
  }
> = {
  city_admin: {
    title: "Local Admin / Municipal Admin Portal",
    titleHi: "सिटी एडमिन / नगरपालिका एडमिन पोर्टल",
    kicker: "Municipal command centre",
    kickerHi: "नगरपालिका कमांड सेंटर",
    focus:
      "Control every city problem, AI decision, officer assignment, escalation, approval and municipal report.",
    focusHi:
      "सभी city problems, AI decision, officer assignment, escalation, approval और municipal reports को control करें।",
    steps: [
      "Review AI",
      "Assign officer",
      "Approve escalation",
      "Approve resolution",
    ],
    stepsHi: [
      "AI review",
      "officer assign",
      "escalation approve",
      "resolution approve",
    ],
    assignedLabel: "Admin assignments",
    openLabel: "All city problems",
  },
  department_officer: {
    title: "Department Officer Portal",
    titleHi: "विभाग अधिकारी पोर्टल",
    kicker: "Department response desk",
    kickerHi: "विभाग response desk",
    focus:
      "Accept assigned problems, create work orders and request State escalation.",
    focusHi:
      "assigned problems accept करें, work order बनाएं और State escalation request करें।",
    steps: ["Accept problem", "Create work order", "Escalate to State"],
    stepsHi: ["problem accept", "work order", "State escalation"],
    assignedLabel: "My department cases",
    openLabel: "Department queue",
  },
  field_verification_officer: {
    title: "Field Verification Officer Portal",
    titleHi: "फील्ड सत्यापन अधिकारी पोर्टल",
    kicker: "On-site verification desk",
    kickerHi: "स्थल सत्यापन डेस्क",
    focus:
      "Visit the reported location, verify GPS, capture photo/video evidence and submit a genuine ground report.",
    focusHi:
      "reported location पर जाएँ, GPS verify करें, photo/video evidence लें और ground report submit करें।",
    steps: ["Open location", "Verify GPS", "Capture evidence", "Submit result"],
    stepsHi: ["location खोलें", "GPS verify", "evidence लें", "result submit"],
    assignedLabel: "My verification visits",
    openLabel: "Assigned verification cases",
  },
};

const cityCategoryById = (id: string) =>
  CITY_CATEGORIES.find((c) => c.id === id) ??
  CITY_CATEGORIES[CITY_CATEGORIES.length - 1];

function cityCategoryFor(text: string): CityCategory {
  const t = text.toLowerCase();
  let best = CITY_CATEGORIES[CITY_CATEGORIES.length - 1],
    bestScore = 0;
  for (const c of CITY_CATEGORIES) {
    const score = c.kw.reduce((n, k) => (t.includes(k) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

/* ---------------- Stages ---------------- */
interface StageMeta {
  id: string;
  en: string;
  hi: string;
  color: string;
}
const STAGES: StageMeta[] = [
  { id: "submitted", en: "Submitted", hi: "प्रस्तुत", color: "#7A8794" },
  { id: "ai_review", en: "AI Review", hi: "एआई समीक्षा", color: "#DE9B12" },
  {
    id: "city_admin_review",
    en: "Local Admin Review",
    hi: "सिटी एडमिन समीक्षा",
    color: "#B4692F",
  },
  {
    id: "department_assignment",
    en: "Department Assignment",
    hi: "विभाग आवंटन",
    color: "#557085",
  },
  {
    id: "city_government",
    en: "Local Government",
    hi: "स्थानीय सरकार",
    color: "#2E7D4F",
  },
  {
    id: "government_review",
    en: "Government Review",
    hi: "सरकारी समीक्षा",
    color: "#CE4A3B",
  },
  {
    id: "field_verification",
    en: "Field Verification",
    hi: "फील्ड सत्यापन",
    color: "#557085",
  },
  {
    id: "rejected",
    en: "Rejected / Not Found",
    hi: "अस्वीकृत / नहीं मिला",
    color: "#CE4A3B",
  },
  { id: "work_order", en: "Work Order", hi: "वर्क ऑर्डर", color: "#41617A" },
  { id: "work_started", en: "Work Started", hi: "काम शुरू", color: "#B4692F" },
  {
    id: "work_in_progress",
    en: "Work In Progress",
    hi: "काम जारी",
    color: "#DE9B12",
  },
  {
    id: "work_completed",
    en: "Work Completed",
    hi: "काम पूरा",
    color: "#2E7D4F",
  },
  {
    id: "re_verification",
    en: "Re-verification",
    hi: "पुनः सत्यापन",
    color: "#557085",
  },
  { id: "validated", en: "Validated", hi: "सत्यापित", color: "#B4692F" },
  { id: "routed", en: "Routed to HEI", hi: "HEI को भेजा", color: "#41617A" },
  { id: "team", en: "Team & Proposal", hi: "टीम व प्रस्ताव", color: "#2E6FB7" },
  {
    id: "university_solution",
    en: "University Solution",
    hi: "विश्वविद्यालय समाधान",
    color: "#2E6FB7",
  },
  { id: "prototype", en: "Prototyping", hi: "प्रोटोटाइप", color: "#7C4A68" },
  {
    id: "industry_funding",
    en: "Industry / Investment",
    hi: "उद्योग / निवेश",
    color: "#DE9B12",
  },
  { id: "pilot", en: "Pilot Testing", hi: "पायलट परीक्षण", color: "#2E7D4F" },
  {
    id: "government_execution",
    en: "Government Execution",
    hi: "सरकारी क्रियान्वयन",
    color: "#1B5140",
  },
  {
    id: "deployed",
    en: "Resolved / Deployed",
    hi: "समाधान / तैनात",
    color: "#1B5140",
  },
];
const stageIdx = (id: string) =>
  Math.max(
    0,
    STAGES.findIndex((s) => s.id === id),
  );
const stageById = (id: string) => STAGES[stageIdx(id)];

/* ---------------- Geography ---------------- */
const DISTRICTS = [
  "Ranchi",
  "Dhanbad",
  "East Singhbhum",
  "Bokaro",
  "Giridih",
  "Hazaribagh",
  "Deoghar",
  "Dumka",
  "Godda",
  "Sahebganj",
  "Pakur",
  "Chatra",
  "Koderma",
  "Palamu",
  "Garhwa",
  "Latehar",
  "Lohardaga",
  "Gumla",
  "Simdega",
  "Khunti",
  "Saraikela-Kharsawan",
  "West Singhbhum",
  "Ramgarh",
  "Jamtara",
];

const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Dhanbad: { lat: 23.7957, lng: 86.4304 },
  "East Singhbhum": { lat: 22.8046, lng: 86.2029 },
  Bokaro: { lat: 23.6693, lng: 86.1511 },
  Giridih: { lat: 24.186, lng: 86.3 },
  Hazaribagh: { lat: 23.9966, lng: 85.3691 },
  Deoghar: { lat: 24.4763, lng: 86.6913 },
  Dumka: { lat: 24.2687, lng: 87.249 },
  Godda: { lat: 24.827, lng: 87.2125 },
  Sahebganj: { lat: 25.244, lng: 87.637 },
  Pakur: { lat: 24.6397, lng: 87.842 },
  Chatra: { lat: 24.2065, lng: 84.87 },
  Koderma: { lat: 24.4675, lng: 85.593 },
  Palamu: { lat: 24.037, lng: 84.07 },
  Garhwa: { lat: 24.16, lng: 83.8 },
  Latehar: { lat: 23.75, lng: 84.5 },
  Lohardaga: { lat: 23.434, lng: 84.682 },
  Gumla: { lat: 23.043, lng: 84.54 },
  Simdega: { lat: 22.615, lng: 84.51 },
  Khunti: { lat: 23.076, lng: 85.278 },
  "Saraikela-Kharsawan": { lat: 22.7, lng: 85.93 },
  "West Singhbhum": { lat: 22.56, lng: 85.8 },
  Ramgarh: { lat: 23.63, lng: 85.52 },
  Jamtara: { lat: 23.95, lng: 86.8 },
};
const JHARKHAND_BOUNDS = {
  minLat: 21.8,
  maxLat: 25.6,
  minLng: 83,
  maxLng: 88.2,
};
const isInJharkhand = (lat: number, lng: number) =>
  lat >= JHARKHAND_BOUNDS.minLat &&
  lat <= JHARKHAND_BOUNDS.maxLat &&
  lng >= JHARKHAND_BOUNDS.minLng &&
  lng <= JHARKHAND_BOUNDS.maxLng;

/* ---------------- Entity types ---------------- */
interface Milestone {
  id: string;
  label: string;
  due: string;
  done: boolean;
}
interface CommentT {
  who: string;
  role: string;
  text: string;
  time: string;
}
interface UpdateT {
  stage: string;
  time: string;
  note: string;
}
interface SolutionSubmission {
  id: string;
  university_id?: string;
  university_name: string;
  team_name: string;
  mentor: string;
  team: string[];
  solution: string;
  solution_pdf?: string;
  app_link?: string;
  solution_video?: string;
  submitted_at: string;
}
interface Challenge {
  id: string;
  title: string;
  desc: string;
  district: string;
  block: string;
  lat: number;
  lng: number;
  accuracy?: number;
  location_source?:
    "browser_gps" | "address_geocode" | "district_block_fallback";
  location_precision?:
    "exact_gps" | "address_geocode" | "approximate_district_center";
  location_address?: string;
  problem_location?: {
    lat: number;
    lng: number;
    source: "browser_gps" | "address_geocode" | "district_block_fallback";
    accuracy_meters?: number | null;
    accuracy_label: string;
    address?: string;
    district?: string;
    block?: string;
  };
  domain: string;
  department?: string;
  stage: string;
  priority: number;
  votes: number;
  evidence: string[];
  docs: string[];
  by: string;
  byType: string;
  date: string;
  phone?: string;
  org?: string;
  qr_url?: string;
  qr_image?: string;
  reporter?: {
    user_id: string;
    name: string;
    phone: string;
    type: string;
    organisation: string;
  };
  reports?: number;
  mine?: boolean;
  uni?: string;
  universities?: string[];
  partner?: string;
  fund?: string;
  funding_note?: string;
  team?: string[];
  team_name?: string;
  mentor?: string;
  solution?: string;
  solution_submissions?: SolutionSubmission[];
  solution_pdf?: string;
  app_link?: string;
  solution_video?: string;
  budget?: string;
  ip?: string;
  impact?: string;
  dupOf?: string;
  verification?: {
    score: number;
    status: string;
    confirmations: number;
    disputes: number;
    duplicates?: {
      id: string;
      title: string;
      distance_km: number;
      similarity: number;
      lat: number;
      lng: number;
    }[];
  };
  requires_government?: boolean;
  requires_university?: boolean;
  requires_investment?: boolean;
  routing_decision?:
    | "city_government"
    | "main_government"
    | "government_field"
    | "government_field_university"
    | "government_field_university_industry";
  routing_scope?: "local_city" | "main_government";
  returned_from?: "state_government";
  routing_reason?: string;
  city_category?: string;
  field_verification?: {
    verified_by: string;
    date: string;
    description: string;
    photos: string[];
    status: "verified" | "needs_review";
  };
  assigned_to?: {
    user_id?: string;
    name?: string;
    desk?: CityDesk;
    district?: string;
    ward?: string;
    department?: string;
  };
  work_order?: {
    number: string;
    team: string;
    contractor?: string;
    estimated_cost?: string;
    start_date?: string;
    expected_completion?: string;
    status?: string;
  };
  sla?: { due_at: string; status?: "on_track" | "breached" | "completed" };
  supervisor_approval?: {
    status: "pending" | "approved" | "rejected";
    approved_by?: string;
    approved_at?: string;
    note?: string;
  };
  field_report?: {
    visit_date: string;
    lat?: number;
    lng?: number;
    description: string;
    photos: string[];
    submitted_by: string;
  };
  citizen_updates?: { message: string; time: string; by: string }[];
  resolution_proof?: {
    photos: string[];
    description: string;
    resolved_by: string;
    date: string;
  };
  department_resolution?: {
    condition_before: string;
    materials_used: string;
    materials?: string;
    equipment?: string;
    funding?: string;
    completion_days: string;
    completion_date: string;
    summary: string;
    photos: string[];
    sent_to_government: boolean;
    sent_by: string;
  };
  department_reports?: {
    submitted_by: string;
    date: string;
    description: string;
  }[];
  monitoring_report?: {
    submitted_by: string;
    date: string;
    status: "verified_and_reported";
    description: string;
  };
  milestones: Milestone[];
  comments: CommentT[];
  updates: UpdateT[];
}
interface University {
  id: string;
  name: string;
  short: string;
  city: string;
  est: number;
  kind: string;
  domains: string[];
  labs: string[];
  blurb: string;
  stats: { students: number; faculty: number; active: number; success: number };
  featured?: boolean;
}
interface Partner {
  id: string;
  name: string;
  type: string;
  city: string;
  offers: string[];
  fund: string;
  projects: number;
  since: number;
}
interface ChainBlock {
  index: number;
  timestamp: number;
  event: string;
  refId: string | null;
  payload: Record<string, unknown>;
  dataHash: string;
  prevHash: string;
  hash: string;
  signature: string;
}
interface ChainVerification {
  valid: boolean;
  brokenAt: number | null;
  length?: number;
  reason?: string | null;
}

/* ---------------- Universities ---------------- */
const UNIVERSITIES: University[] = [
  {
    id: "iit-ism",
    name: "IIT (ISM) Dhanbad",
    short: "IIT ISM",
    city: "Dhanbad",
    est: 1926,
    kind: "Institute of National Importance",
    domains: ["environment", "energy", "water", "urban"],
    labs: [
      "Centre for Mining Environment",
      "AI & Data Science Lab",
      "Geomatics & Remote Sensing",
      "Fuel & Combustion Lab",
    ],
    blurb:
      "Premier institute for earth sciences, mining safety, environment engineering and applied AI — leads the state's technology missions.",
    stats: { students: 9800, faculty: 420, active: 14, success: 92 },
    featured: true,
  },
  {
    id: "bit-mesra",
    name: "Birla Institute of Technology, Mesra",
    short: "BIT Mesra",
    city: "Ranchi",
    est: 1955,
    kind: "Deemed University",
    domains: ["urban", "water", "education", "livelihoods"],
    labs: [
      "Space Applications Lab",
      "Biotech Incubator (BIT-STEP)",
      "IoT & Smart Systems Lab",
    ],
    blurb:
      "Engineering and applied research powerhouse with an active incubation ecosystem and strong industry linkages.",
    stats: { students: 7200, faculty: 350, active: 11, success: 88 },
    featured: true,
  },
  {
    id: "bau",
    name: "Birsa Agricultural University",
    short: "BAU",
    city: "Ranchi",
    est: 1981,
    kind: "State Agricultural University",
    domains: ["agriculture", "livelihoods", "environment"],
    labs: [
      "Soil & Water Engineering",
      "Agro-Forestry Centre",
      "Veterinary Research Unit",
    ],
    blurb:
      "The state's anchor for agronomy, horticulture, fisheries and livestock innovation across all agro-climatic zones.",
    stats: { students: 3100, faculty: 280, active: 9, success: 86 },
  },
  {
    id: "aiims-deoghar",
    name: "AIIMS Deoghar",
    short: "AIIMS Deoghar",
    city: "Deoghar",
    est: 2019,
    kind: "Institute of National Importance",
    domains: ["healthcare"],
    labs: [
      "Community Medicine Unit",
      "Telemedicine Centre",
      "Nutrition Research Cell",
    ],
    blurb:
      "Tertiary-care and public-health research institute driving last-mile healthcare innovation in Santhal Pargana.",
    stats: { students: 500, faculty: 160, active: 6, success: 90 },
  },
  {
    id: "nit-jsr",
    name: "NIT Jamshedpur",
    short: "NIT JSR",
    city: "Jamshedpur",
    est: 1960,
    kind: "Institute of National Importance",
    domains: ["urban", "water", "accessibility"],
    labs: [
      "Hydraulics & Water Resources Lab",
      "Civil Materials Lab",
      "Transportation Engineering Cell",
    ],
    blurb:
      "Civil, mechanical and production engineering strength for urban infrastructure, drainage and industrial systems.",
    stats: { students: 4300, faculty: 210, active: 8, success: 84 },
  },
  {
    id: "ru",
    name: "Ranchi University",
    short: "RU",
    city: "Ranchi",
    est: 1960,
    kind: "State University",
    domains: ["education", "administration", "livelihoods"],
    labs: [
      "Tribal & Regional Studies",
      "Environmental Sciences Dept",
      "Commerce & Policy Lab",
    ],
    blurb:
      "Broad multidisciplinary base in sciences, humanities and social research with deep community networks.",
    stats: { students: 22000, faculty: 540, active: 7, success: 78 },
  },
  {
    id: "cuj",
    name: "Central University of Jharkhand",
    short: "CUJ",
    city: "Ranchi",
    est: 2009,
    kind: "Central University",
    domains: ["energy", "healthcare", "environment"],
    labs: [
      "Energy & Environment Lab",
      "Public Health Research Cell",
      "Nanotechnology Lab",
    ],
    blurb:
      "Young central university with fast-growing research programmes in energy systems, public health and sustainability.",
    stats: { students: 2800, faculty: 190, active: 6, success: 81 },
  },
  {
    id: "vbu",
    name: "Vinoba Bhave University",
    short: "VBU",
    city: "Hazaribagh",
    est: 1992,
    kind: "State University",
    domains: ["accessibility", "education", "urban"],
    labs: ["Engineering & Technology Faculty", "Social Work Dept"],
    blurb:
      "Regional university serving North Chotanagpur with engineering, social sciences and teacher education.",
    stats: { students: 18500, faculty: 410, active: 5, success: 74 },
  },
  {
    id: "npu",
    name: "Nilamber-Pitamber University",
    short: "NPU",
    city: "Palamu",
    est: 2009,
    kind: "State University",
    domains: ["agriculture", "livelihoods", "water"],
    labs: ["Dryland Agriculture Cell", "Rural Development Centre"],
    blurb:
      "Focused on dryland agriculture and rural livelihood research for the drought-prone Palamu division.",
    stats: { students: 6900, faculty: 220, active: 4, success: 72 },
  },
  {
    id: "jut",
    name: "Jharkhand University of Technology",
    short: "JUT",
    city: "Ranchi",
    est: 2016,
    kind: "State Technical University",
    domains: ["livelihoods", "energy", "education"],
    labs: ["Product Design Studio", "Renewable Energy Lab"],
    blurb:
      "Technical university affiliating 200+ colleges; runs applied product-design sprints with MSME clusters.",
    stats: { students: 35000, faculty: 610, active: 5, success: 70 },
  },
];
const uniById = (id?: string) => UNIVERSITIES.find((u) => u.id === id);
const normalizeUniversityMatchText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const universityIdFromAccount = (org: string) => {
  const value = normalizeUniversityMatchText(org);
  if (!value) return undefined;
  if (value === "ranchi") return "ru";

  const aliasMap: Record<string, string[]> = {
    ru: ["ranchi university", "ranchi uni", "ru university"],
    cuj: ["central university of jharkhand", "cuj", "central university jharkhand"],
    "bit-mesra": ["bit mesra", "birla institute of technology mesra", "bit ranchi"],
    "nit-jsr": ["nit jamshedpur", "nit jsr", "jamshedpur national institute of technology"],
    "iit-ism": ["iit ism", "ism dhanbad", "indian institute of technology ism", "iit dhanbad"],
    bau: ["birsa agricultural university", "bau ranchi"],
    "aiims-deoghar": ["aiims deoghar", "aiims deogarh"],
    vbu: ["vinoba bhave university", "vbu hazaribagh"],
    npu: ["nilamber pitamber university", "npu palamu"],
    jut: ["jharkhand university of technology", "jut ranchi"],
  };

  for (const [id, aliases] of Object.entries(aliasMap)) {
    if (aliases.some((alias) => value.includes(alias) || alias.includes(value))) {
      return id;
    }
  }

  const match = UNIVERSITIES.find((u) => {
    const labels = [u.id, u.name, u.short].map(normalizeUniversityMatchText);
    return labels.some((label) => {
      if (!label) return false;
      return label === value || value.includes(label) || label.includes(value);
    });
  });

  return match?.id;
};

const FACULTY_POOL: Record<string, string[]> = {
  "iit-ism": [
    "Prof. A. Sinha (Env. Engg)",
    "Prof. K. Bhattacharjee (Mining Env.)",
    "Dr. P. Mukherjee (AI & DS)",
    "Dr. R. Ekka (Geomatics)",
  ],
  "bit-mesra": [
    "Prof. D. Ghosh (Biotech)",
    "Dr. S. Anand (IoT Systems)",
    "Dr. N. Verma (Civil)",
  ],
  bau: [
    "Dr. P. N. Singh (SW Engg)",
    "Dr. S. K. Roy (Fisheries)",
    "Dr. M. Kumari (Horticulture)",
  ],
  "aiims-deoghar": [
    "Dr. N. Mandal (Community Medicine)",
    "Dr. S. Jha (Nutrition Cell)",
    "Dr. T. Soren (Telemedicine)",
  ],
  "nit-jsr": [
    "Dr. S. Chatterjee (Hydraulics)",
    "Dr. A. Khan (Transportation)",
    "Dr. V. Singh (Materials)",
  ],
  ru: ["Dr. S. Jha (Commerce & Policy)", "Dr. R. Kerketta (Tribal Studies)"],
  cuj: ["Dr. V. Anand (Energy Systems)", "Dr. P. Das (Public Health)"],
  vbu: ["Dr. R. Prasad (Civil)", "Dr. K. Yadav (Social Work)"],
  npu: ["Dr. B. Pandey (Dryland Agri)", "Dr. S. Gupta (Rural Dev.)"],
  jut: ["Dr. M. Kumari (Product Design)", "Dr. A. Tirkey (Renewables)"],
};

/* ---------------- Industry partners ---------------- */
const PARTNERS: Partner[] = [
  {
    id: "tata-steel",
    name: "Tata Steel CSR",
    type: "CSR",
    city: "Jamshedpur",
    offers: ["Project funding", "Field pilots", "Community mobilisation"],
    fund: "₹4.2 Cr committed",
    projects: 9,
    since: 2021,
  },
  {
    id: "ccl",
    name: "Central Coalfields Ltd",
    type: "PSU",
    city: "Ranchi",
    offers: ["CSR fund — mine-area development", "Land for pilots"],
    fund: "₹2.0 Cr pool",
    projects: 5,
    since: 2022,
  },
  {
    id: "hec",
    name: "HEC Ranchi",
    type: "PSU",
    city: "Ranchi",
    offers: ["Prototyping workshop", "Fabrication support"],
    fund: "In-kind",
    projects: 6,
    since: 2022,
  },
  {
    id: "jusco",
    name: "JUSCO (Tata Utilities)",
    type: "Utility",
    city: "Jamshedpur",
    offers: ["Water-network testbeds", "SCADA data access"],
    fund: "In-kind",
    projects: 3,
    since: 2023,
  },
  {
    id: "jharcraft",
    name: "Jharcraft",
    type: "MSME",
    city: "Ranchi",
    offers: ["Artisan market linkages", "Sericulture & craft scale-up"],
    fund: "₹60 L",
    projects: 7,
    since: 2021,
  },
  {
    id: "cimfr",
    name: "CSIR-CIMFR",
    type: "Lab",
    city: "Dhanbad",
    offers: ["Certified testing", "Mining & fuel research"],
    fund: "Research grants",
    projects: 4,
    since: 2022,
  },
  {
    id: "iedc",
    name: "IEDC Jharkhand",
    type: "Incubator",
    city: "Ranchi",
    offers: ["Seed grants up to ₹10 L", "Incubation & IP support"],
    fund: "₹1.5 Cr fund",
    projects: 11,
    since: 2020,
  },
  {
    id: "tata-motors",
    name: "Tata Motors Jamshedpur",
    type: "Industry",
    city: "Jamshedpur",
    offers: ["Engineering mentorship", "EV & mobility pilots"],
    fund: "Mentorship",
    projects: 3,
    since: 2023,
  },
  {
    id: "pradan",
    name: "PRADAN",
    type: "NGO",
    city: "Deoghar",
    offers: ["SHG networks", "Last-mile delivery"],
    fund: "Field partner",
    projects: 8,
    since: 2021,
  },
];
const partnerById = (id?: string) => PARTNERS.find((p) => p.id === id);

const CSR_CALLS = [
  {
    id: "c1",
    title: "Safe Drinking Water Innovation Fund",
    by: "Tata Steel CSR",
    amount: "₹1.5 Cr",
    deadline: "28 Feb 2026",
    domains: ["water", "healthcare"],
    status: "Open",
  },
  {
    id: "c2",
    title: "Smart Classroom Adoption Challenge",
    by: "IEDC + Dept. of Education",
    amount: "₹80 L",
    deadline: "15 Mar 2026",
    domains: ["education"],
    status: "Open",
  },
  {
    id: "c3",
    title: "Mine-Land Rejuvenation & Livelihoods",
    by: "Central Coalfields CSR",
    amount: "₹2.0 Cr",
    deadline: "10 Feb 2026",
    domains: ["environment", "livelihoods"],
    status: "Closing",
  },
  {
    id: "c4",
    title: "Maternal Health Last-Mile Delivery",
    by: "Tata Trusts",
    amount: "₹1.2 Cr",
    deadline: "05 Apr 2026",
    domains: ["healthcare"],
    status: "Open",
  },
];

/* ---------------- Problem buckets (seed data) ---------------- */
const ms = (
  id: string,
  label: string,
  due: string,
  done: boolean,
): Milestone => ({ id, label, due, done });

const CHALLENGES: Challenge[] = [
  {
    id: "SS-JH-25-0481",
    title: "Arsenic-contaminated handpumps serving 14 habitations",
    desc: "Handpumps in Itkhori and Kunda blocks test above 50 ppb arsenic. Residents report skin lesions; women walk 3 km to a safe well. Field test kits attached from PHC survey.",
    district: "Chatra",
    block: "Itkhori",
    lat: 24.21,
    lng: 84.86,
    domain: "water",
    stage: "routed",
    priority: 94,
    votes: 342,
    reports: 14,
    mine: true,
    evidence: [IMG.water, IMG.health],
    docs: ["PHC water quality report.pdf", "Habitation list.xlsx"],
    by: "Sunita Devi (ASHA)",
    byType: "Community health worker",
    date: "04 Jan 2026",
    uni: "iit-ism",
    team: ["Prof. A. Sinha (Env. Engg)", "4 MTech scholars"],
    mentor: "Prof. A. Sinha (Env. Engg)",
    budget: "₹48 L",
    milestones: [
      ms(
        "m1",
        "Baseline water-quality mapping (50 samples)",
        "20 Jan 2026",
        true,
      ),
      ms("m2", "Shortlist 3 treatment technologies", "05 Feb 2026", false),
      ms("m3", "Bench prototype — community filter unit", "10 Mar 2026", false),
      ms("m4", "Field trial in 2 habitations", "30 Apr 2026", false),
    ],
    comments: [
      {
        who: "Dr. R. K. Verma",
        role: "District Magistrate, Chatra",
        text: "District administration will provide lab access and field staff for the baseline survey.",
        time: "06 Jan 2026",
      },
      {
        who: "Prof. A. Sinha",
        role: "IIT (ISM) Dhanbad",
        text: "Team constituted. Adsorbent media shortlisting underway with CIMFR.",
        time: "09 Jan 2026",
      },
    ],
    updates: [
      {
        stage: "submitted",
        time: "04 Jan 2026",
        note: "Received via mobile app with 2 photos and PHC report. 13 similar reports merged into this bucket.",
      },
      {
        stage: "ai_review",
        time: "04 Jan 2026",
        note: "Classified: Water Resources (96%) · Urgency: Critical.",
      },
      {
        stage: "validated",
        time: "05 Jan 2026",
        note: "Validated by District Water & Sanitation Committee.",
      },
      {
        stage: "routed",
        time: "06 Jan 2026",
        note: "Routed to IIT (ISM) Dhanbad — Environment Engineering match 94%.",
      },
    ],
  },
  {
    id: "SS-JH-25-0396",
    title: "NH-33 underpass near Kadru waterlogs every monsoon",
    desc: "The Kadru-Dhurwa underpass floods 40–60 cm within an hour of rain, stranding ambulances and school traffic. Drainage gradient and pump capacity suspected inadequate.",
    district: "Ranchi",
    block: "Kadru (Urban)",
    lat: 23.37,
    lng: 85.33,
    domain: "urban",
    stage: "prototype",
    priority: 86,
    votes: 289,
    reports: 9,
    evidence: [IMG.water, IMG.waste],
    docs: ["Rainfall data 2023-25.csv", "Underpass section drawing.dwg"],
    by: "Ranchi Citizens' Forum",
    byType: "Community organisation",
    date: "18 Aug 2025",
    uni: "nit-jsr",
    partner: "jusco",
    fund: "₹35 L (Tata Steel CSR)",
    team: ["Dr. S. Chatterjee", "6 BTech + 2 MTech"],
    mentor: "Dr. S. Chatterjee",
    budget: "₹35 L",
    ip: "Design registration filed",
    milestones: [
      ms("m1", "Topographic & drain network survey", "30 Sep 2025", true),
      ms("m2", "Hydraulic model (SWMM simulation)", "15 Nov 2025", true),
      ms("m3", "Redesigned sump + auto-pump prototype", "20 Jan 2026", true),
      ms("m4", "Install & instrument at underpass", "28 Feb 2026", false),
      ms("m5", "Monsoon performance validation", "30 Jul 2026", false),
    ],
    comments: [
      {
        who: "JUSCO Engineer",
        role: "Industry partner",
        text: "SCADA telemetry for the new pump set is ready for integration.",
        time: "22 Jan 2026",
      },
    ],
    updates: [
      {
        stage: "submitted",
        time: "18 Aug 2025",
        note: "Submitted with 3 photos and rainfall records; 8 similar citizen reports merged.",
      },
      {
        stage: "validated",
        time: "21 Aug 2025",
        note: "RMC confirmed recurring inundation logs.",
      },
      {
        stage: "routed",
        time: "24 Aug 2025",
        note: "NIT Jamshedpur — Hydraulic Lab match 91%.",
      },
      {
        stage: "team",
        time: "05 Sep 2025",
        note: "8-member team + JUSCO co-engineer.",
      },
      {
        stage: "prototype",
        time: "20 Jan 2026",
        note: "Auto-pump prototype ready for installation.",
      },
    ],
  },
  {
    id: "SS-JH-26-0512",
    title:
      "Boundary wall of Govt Middle School Bariyatipur on the verge of collapse",
    desc: "Cracks run through the 40-year-old boundary wall facing the playground. 214 students, classes currently held with the playground closed. Photos show leaning sections.",
    district: "Godda",
    block: "Sundar Pahari",
    lat: 24.93,
    lng: 87.22,
    domain: "education",
    stage: "validated",
    priority: 88,
    votes: 197,
    reports: 6,
    evidence: [IMG.edu],
    docs: ["School safety inspection.pdf"],
    by: "Mukhiya — Bariyatipur Gram Sabha",
    byType: "Panchayati Raj Institution",
    date: "15 Jan 2026",
    milestones: [],
    comments: [
      {
        who: "BDO Sundar Pahari",
        role: "Block Development Officer",
        text: "Interim barricading done. Requesting expedited technical assessment.",
        time: "16 Jan 2026",
      },
    ],
    updates: [
      {
        stage: "submitted",
        time: "15 Jan 2026",
        note: "Submitted via CSC operator with 4 photos; 5 parent reports merged into bucket.",
      },
      {
        stage: "ai_review",
        time: "15 Jan 2026",
        note: "Classified: Education (89%) · Urgency: High (child safety).",
      },
      {
        stage: "validated",
        time: "16 Jan 2026",
        note: "Validated — BDO field report attached.",
      },
    ],
  },
  {
    id: "SS-JH-25-0438",
    title: "PHC Bhawanathpur running without a doctor for 7 months",
    desc: "The only PHC for 31 villages has no medical officer since June. ANM managing referrals; 2 maternal emergencies last month had to travel 60 km to Garhwa Sadar.",
    district: "Garhwa",
    block: "Bhawanathpur",
    lat: 24.17,
    lng: 83.81,
    domain: "healthcare",
    stage: "routed",
    priority: 93,
    votes: 421,
    reports: 12,
    evidence: [IMG.health],
    docs: ["Vacancy record RTI.pdf"],
    by: "Ramesh Kumar Tiwari",
    byType: "Citizen",
    date: "28 Nov 2025",
    uni: "aiims-deoghar",
    team: ["Dr. N. Mandal (Community Medicine)", "2 MBBS interns"],
    mentor: "Dr. N. Mandal (Community Medicine)",
    milestones: [
      ms("m1", "Telemedicine kiosk needs assessment", "20 Dec 2025", true),
      ms("m2", "Hub-spoke tele-OPD pilot design", "25 Jan 2026", false),
      ms("m3", "Deploy kiosk + train ANM", "15 Mar 2026", false),
    ],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "28 Nov 2025",
        note: "Received with RTI vacancy record; 11 villager reports merged.",
      },
      {
        stage: "ai_review",
        time: "28 Nov 2025",
        note: "Classified: Healthcare (97%) · Urgency: Critical.",
      },
      {
        stage: "validated",
        time: "01 Dec 2025",
        note: "CMO Garhwa confirmed vacancy and referral burden.",
      },
      {
        stage: "routed",
        time: "03 Dec 2025",
        note: "AIIMS Deoghar — Community Medicine match 96%.",
      },
    ],
  },
  {
    id: "SS-JH-25-0371",
    title: "Bundu irrigation tank silted — 400 acres left to rainfed cropping",
    desc: "Katauna tank has lost ~60% storage to silt. Farmers reverted to single-crop paddy; yield down a third. Requesting desilting plan plus seepage control.",
    district: "Ranchi",
    block: "Bundu",
    lat: 23.16,
    lng: 85.58,
    domain: "agriculture",
    stage: "team",
    priority: 79,
    votes: 176,
    reports: 8,
    evidence: [IMG.agri, IMG.water],
    docs: ["Tank capacity memo.pdf"],
    by: "Katauna Pani Samiti",
    byType: "Farmer collective",
    date: "02 Jul 2025",
    uni: "bau",
    team: ["Dr. P. N. Singh (SW Engg)", "8 students — agri + civil"],
    mentor: "Dr. P. N. Singh (SW Engg)",
    budget: "₹22 L",
    milestones: [
      ms("m1", "Bathymetric survey of tank bed", "30 Jul 2025", true),
      ms("m2", "Desilting & reuse plan (brick-making)", "15 Oct 2025", true),
      ms("m3", "Community shramdaan drive + works", "20 Feb 2026", false),
    ],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "02 Jul 2025",
        note: "Farmer collective submission with drone photos; 7 farmer reports merged.",
      },
      {
        stage: "routed",
        time: "08 Jul 2025",
        note: "BAU Soil & Water Engineering match 90%.",
      },
      {
        stage: "team",
        time: "18 Jul 2025",
        note: "Multidisciplinary team with civil dept students.",
      },
    ],
  },
  {
    id: "SS-JH-25-0298",
    title: "Jharia coal-seam fumes reaching school zones of Lodna",
    desc: "Surface cracks and sulphur fumes intensify each winter near Lodna schools. 3,000+ students affected; 18% absenteeism on smog days. Need fire-spread mapping and early warning.",
    district: "Dhanbad",
    block: "Jharia",
    lat: 23.72,
    lng: 86.41,
    domain: "environment",
    stage: "pilot",
    priority: 91,
    votes: 388,
    reports: 11,
    evidence: [IMG.waste, IMG.energy],
    docs: ["CIMFR fire zone map.pdf", "School attendance data.xlsx"],
    by: "Jharia Jan Sangharsh Samiti",
    byType: "Community organisation",
    date: "14 Mar 2025",
    uni: "iit-ism",
    partner: "cimfr",
    fund: "₹60 L (CCL CSR)",
    team: ["Prof. K. Bhattacharjee", "PhD cohort ×5"],
    mentor: "Prof. K. Bhattacharjee (Mining Env.)",
    budget: "₹60 L",
    ip: "Patent filed 2025/004123 (sensor array)",
    milestones: [
      ms("m1", "Thermal drone survey of fire zones", "30 May 2025", true),
      ms("m2", "IoT gas sensor mesh deployment", "30 Sep 2025", true),
      ms("m3", "Early-warning dashboard for schools", "30 Nov 2025", true),
      ms("m4", "6-month pilot validation + SOP handover", "30 Apr 2026", false),
    ],
    comments: [
      {
        who: "CCL CSR Officer",
        role: "Funder",
        text: "Tranche 2 released on milestone 3 sign-off.",
        time: "02 Dec 2025",
      },
    ],
    updates: [
      {
        stage: "submitted",
        time: "14 Mar 2025",
        note: "Submitted with attendance data and 6 photos; 10 resident reports merged.",
      },
      {
        stage: "routed",
        time: "20 Mar 2025",
        note: "IIT ISM + CSIR-CIMFR joint routing.",
      },
      {
        stage: "pilot",
        time: "30 Nov 2025",
        note: "Sensor mesh live across 9 schools.",
      },
    ],
  },
  {
    id: "SS-JH-26-0523",
    title: "Erratic voltage and 6-hour cuts in Kisko block villages",
    desc: "Four feeders serving 22 villages trip daily; transformers overloaded since December. Rice mills and study hours disrupted. Two transformers burnt in 2025.",
    district: "Lohardaga",
    block: "Kisko",
    lat: 23.5,
    lng: 84.6,
    domain: "energy",
    stage: "ai_review",
    priority: 74,
    votes: 121,
    reports: 4,
    evidence: [IMG.energy],
    docs: [],
    by: "Suresh Oraon",
    byType: "Citizen",
    date: "22 Jan 2026",
    milestones: [],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "22 Jan 2026",
        note: "Received with transformer photo; 3 similar reports merged.",
      },
      {
        stage: "ai_review",
        time: "22 Jan 2026",
        note: "Classified: Energy (91%) · Awaiting feeder data from JBVNL.",
      },
    ],
  },
  {
    id: "SS-JH-25-0455",
    title: "Steep unprotected ghat section on Deoghar–Dumka SH-13",
    desc: "A 1.2 km ghat stretch near Sarath has no crash barriers or signage; two-wheelers skid regularly in fog. Four accidents this winter, one fatal.",
    district: "Dumka",
    block: "Sarath",
    lat: 24.27,
    lng: 86.8,
    domain: "accessibility",
    stage: "validated",
    priority: 82,
    votes: 204,
    reports: 5,
    evidence: [IMG.energy],
    docs: ["Accident log — Sarath PS.pdf"],
    by: "Sarath Vikas Manch",
    byType: "Community organisation",
    date: "08 Jan 2026",
    milestones: [],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "08 Jan 2026",
        note: "Submitted with PS accident extracts; 4 rider reports merged.",
      },
      {
        stage: "ai_review",
        time: "08 Jan 2026",
        note: "Classified: Accessibility (87%) · Urgency: High.",
      },
      {
        stage: "validated",
        time: "10 Jan 2026",
        note: "Road Construction Dept site inspection done.",
      },
    ],
  },
  {
    id: "SS-JH-26-0501",
    title: "Old-age pensions stuck for 11 months at CSC Deori",
    desc: "137 pensioners in Deori block have not received pensions since March; CSC server errors and document mismatch cited. Elderly forced to make repeated visits.",
    district: "Giridih",
    block: "Deori",
    lat: 24.13,
    lng: 86.3,
    domain: "administration",
    stage: "ai_review",
    priority: 71,
    votes: 156,
    reports: 5,
    dupOf: "SS-JH-25-0412",
    evidence: [],
    docs: ["Beneficiary list.pdf"],
    by: "Jharkhand Pensioners' Sangh",
    byType: "Civil society",
    date: "11 Jan 2026",
    milestones: [],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "11 Jan 2026",
        note: "Submitted with beneficiary list.",
      },
      {
        stage: "ai_review",
        time: "11 Jan 2026",
        note: "Classified: Public Administration (84%) · Possible duplicate of SS-JH-25-0412 (similarity 68%).",
      },
    ],
  },
  {
    id: "SS-JH-25-0332",
    title: "Tussar weavers losing yarn to monsoon — no drying technology",
    desc: "Khunti's 600+ reeling families dry tussar yarn in open; monsoon spoilage runs 20–25%. Need low-cost solar drying and moisture-controlled storage.",
    district: "Khunti",
    block: "Khunti Sadar",
    lat: 23.08,
    lng: 85.28,
    domain: "livelihoods",
    stage: "routed",
    priority: 77,
    votes: 231,
    reports: 8,
    evidence: [IMG.agri],
    docs: ["Weaver survey summary.pdf"],
    by: "Jharcraft Cluster Committee",
    byType: "MSME collective",
    date: "22 May 2025",
    uni: "jut",
    partner: "jharcraft",
    team: ["Dr. M. Kumari (Product Design)", "5 design students"],
    mentor: "Dr. M. Kumari (Product Design)",
    milestones: [
      ms("m1", "Cluster survey — drying practices", "20 Jun 2025", true),
      ms("m2", "Solar dryer prototype v1", "30 Sep 2025", false),
      ms("m3", "3-village field trial", "15 Jan 2026", false),
    ],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "22 May 2025",
        note: "Collective submission with weaver survey; 7 family reports merged.",
      },
      {
        stage: "routed",
        time: "28 May 2025",
        note: "JUT Product Design Studio match 89%; Jharcraft auto-suggested as industry partner.",
      },
    ],
  },
  {
    id: "SS-JH-26-0530",
    title: "Stray cattle destroying rabi crops across 30 villages",
    desc: "Cattle herds enter unprotected fields at night; 15–20% rabi loss reported around Hazaribagh town belt. Fencing alone unaffordable for smallholders.",
    district: "Hazaribagh",
    block: "Hazaribagh Sadar",
    lat: 23.99,
    lng: 85.36,
    domain: "agriculture",
    stage: "submitted",
    priority: 68,
    votes: 87,
    reports: 3,
    evidence: [IMG.agri],
    docs: [],
    by: "Anil Mehta",
    byType: "Citizen",
    date: "25 Jan 2026",
    milestones: [],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "25 Jan 2026",
        note: "Received via web portal; 2 farmer reports merged.",
      },
    ],
  },
  {
    id: "SS-JH-25-0410",
    title: "Open drain overflow flooding Bermo market weekly",
    desc: "Bermo's main drain, clogged with silt and sewage backflow, overflows every week flooding 60+ shops. Vendors report repeated stock losses.",
    district: "Bokaro",
    block: "Bermo",
    lat: 23.77,
    lng: 86.1,
    domain: "urban",
    stage: "routed",
    priority: 80,
    votes: 165,
    reports: 7,
    evidence: [IMG.waste, IMG.water],
    docs: ["Nala cross-section.pdf"],
    by: "Bermo Vyapar Mandal",
    byType: "Traders' association",
    date: "30 Sep 2025",
    uni: "nit-jsr",
    mentor: "Dr. S. Chatterjee",
    milestones: [
      ms("m1", "Drain network & gradient survey", "30 Oct 2025", false),
      ms("m2", "Remediation DPR", "15 Dec 2025", false),
    ],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "30 Sep 2025",
        note: "Traders' association submission; 6 shopkeeper reports merged.",
      },
      {
        stage: "routed",
        time: "06 Oct 2025",
        note: "NIT JSR — civil team match 88%.",
      },
    ],
  },
  {
    id: "SS-JH-25-0365",
    title: "Child malnutrition clustering in Simdega's eastern blocks",
    desc: "ICDS data shows severe malnutrition concentrated in Kurdeg–Bolba pockets. Anganwadi gaps: no weighing scales, irregular take-home rations, adolescent anaemia.",
    district: "Simdega",
    block: "Kurdeg",
    lat: 22.57,
    lng: 84.52,
    domain: "healthcare",
    stage: "team",
    priority: 85,
    votes: 244,
    reports: 10,
    evidence: [IMG.health],
    docs: ["ICDS block data.xlsx"],
    by: "District Child Protection Unit",
    byType: "Government department",
    date: "12 Jun 2025",
    uni: "aiims-deoghar",
    partner: "pradan",
    team: ["Dr. N. Mandal (Community Medicine)", "Nutrition cell + 4 interns"],
    mentor: "Dr. N. Mandal (Community Medicine)",
    budget: "₹18 L",
    milestones: [
      ms("m1", "Household nutrition census (2 blocks)", "30 Jul 2025", true),
      ms("m2", "Digitised growth-monitoring kit for AWWs", "30 Nov 2025", true),
      ms("m3", "Kitchen-garden + SHG meal programme", "28 Feb 2026", false),
    ],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "12 Jun 2025",
        note: "Departmental submission with ICDS data; 9 anganwadi reports merged.",
      },
      {
        stage: "routed",
        time: "16 Jun 2025",
        note: "AIIMS Deoghar nutrition cell match 93%.",
      },
      {
        stage: "team",
        time: "25 Jun 2025",
        note: "PRADAN SHG network onboarded as field partner.",
      },
    ],
  },
  {
    id: "SS-JH-26-0508",
    title: "Elephant corridor encroachment triggering crop raids in Latehar",
    desc: "New fencing and settlements block the Heranj–Mahuadanr corridor; 40+ crop-raid incidents this season. Need corridor mapping and community early-warning.",
    district: "Latehar",
    block: "Mahuadanr",
    lat: 23.39,
    lng: 84.62,
    domain: "environment",
    stage: "submitted",
    priority: 70,
    votes: 98,
    reports: 2,
    evidence: [IMG.agri],
    docs: [],
    by: "Forest Rights Committee, Mahuadanr",
    byType: "Community organisation",
    date: "17 Jan 2026",
    milestones: [],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "17 Jan 2026",
        note: "Received with incident register photos; 1 related report merged.",
      },
    ],
  },
  {
    id: "SS-JH-24-0211",
    title: "All-weather road missing for 12 villages beyond Simaria ghat",
    desc: "12 villages beyond Simaria ghat remain cut off in monsoon; patients carried on cots, school attendance halves. Requesting 9 km all-weather road with causeway.",
    district: "Chatra",
    block: "Simaria",
    lat: 24.02,
    lng: 84.94,
    domain: "accessibility",
    stage: "deployed",
    priority: 90,
    votes: 356,
    reports: 16,
    evidence: [IMG.energy, IMG.water],
    docs: ["DPR — 9 km road.pdf"],
    by: "Gram Sabha — Simaria East",
    byType: "Panchayati Raj Institution",
    date: "10 Sep 2024",
    uni: "vbu",
    partner: "hec",
    fund: "₹2.1 Cr (MGNREGS + CSR)",
    team: ["Dr. R. Prasad", "10 students"],
    mentor: "Dr. R. Prasad",
    budget: "₹2.1 Cr",
    impact:
      "12 villages connected · 9,400 residents · 2,100 school-days recovered annually",
    milestones: [
      ms("m1", "Alignment survey & DPR", "30 Nov 2024", true),
      ms("m2", "Causeway fabrication (HEC)", "30 Mar 2025", true),
      ms("m3", "Road works + drainage", "30 Oct 2025", true),
      ms("m4", "Completion & community handover", "20 Dec 2025", true),
    ],
    comments: [
      {
        who: "Mukhiya, Simaria East",
        role: "Citizen",
        text: "First December in memory when the ambulance reached our doorstep. Thank you.",
        time: "22 Dec 2025",
      },
    ],
    updates: [
      {
        stage: "submitted",
        time: "10 Sep 2024",
        note: "Gram Sabha resolution attached; 15 village reports merged into one bucket.",
      },
      {
        stage: "deployed",
        time: "20 Dec 2025",
        note: "Handover ceremony; maintenance SOP with Gram Sabha.",
      },
    ],
  },
  {
    id: "SS-JH-25-0388",
    title: "Solar microgrids dead in 7 Sahebganj villages after vendor exit",
    desc: "Microgrids installed in 2022 lie defunct — no local technician, spares unavailable. Villages back to kerosene. Need O&M model with local youth.",
    district: "Sahebganj",
    block: "Taljhari",
    lat: 24.95,
    lng: 87.34,
    domain: "energy",
    stage: "pilot",
    priority: 76,
    votes: 189,
    reports: 7,
    evidence: [IMG.energy],
    docs: ["Installation records.pdf"],
    by: "Taljhari Urja Samiti",
    byType: "Village energy committee",
    date: "01 Aug 2025",
    uni: "cuj",
    partner: "tata-steel",
    fund: "₹28 L (Tata Steel CSR)",
    team: ["Dr. V. Anand", "6 students"],
    mentor: "Dr. V. Anand (Energy Systems)",
    budget: "₹28 L",
    milestones: [
      ms("m1", "Grid health audit (7 sites)", "30 Sep 2025", true),
      ms(
        "m2",
        "Train 14 local technicians (Surya Mitras)",
        "30 Nov 2025",
        true,
      ),
      ms("m3", "Restore 7 grids + spares bank", "28 Feb 2026", false),
    ],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "01 Aug 2025",
        note: "Energy committee submission; 6 village reports merged.",
      },
      {
        stage: "pilot",
        time: "30 Nov 2025",
        note: "Technicians certified; 3 grids restored.",
      },
    ],
  },
  {
    id: "SS-JH-26-0519",
    title: "Smart-classroom kits lying unused in Pakur schools",
    desc: "140 smart kits delivered under a 2024 scheme sit boxed — no power backup, no teacher training, no maintenance clause. Children still on chalk-and-board.",
    district: "Pakur",
    block: "Pakuria",
    lat: 24.63,
    lng: 87.85,
    domain: "education",
    stage: "submitted",
    priority: 73,
    votes: 134,
    reports: 6,
    mine: true,
    evidence: [IMG.edu],
    docs: ["Delivery challans.pdf"],
    by: "Sunita Devi (Parents' Collective)",
    byType: "Community organisation",
    date: "20 Jan 2026",
    milestones: [],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "20 Jan 2026",
        note: "Received with delivery challans; 5 teacher reports merged.",
      },
      {
        stage: "ai_review",
        time: "20 Jan 2026",
        note: "Classified: Education (92%) · Flagged for Dept. of Education.",
      },
    ],
  },
  {
    id: "SS-JH-25-0352",
    title: "Water hyacinth choking Hazaribagh's Bokra lake, killing fish",
    desc: "Bokra lake is 70% choked with hyacinth; fish kills reported, washermen and boating livelihoods affected. Mechanical harvesting + bioconversion proposed.",
    district: "Hazaribagh",
    block: "Hazaribagh Sadar",
    lat: 24.0,
    lng: 85.35,
    domain: "environment",
    stage: "prototype",
    priority: 72,
    votes: 143,
    reports: 6,
    evidence: [IMG.waste],
    docs: ["Lake survey notes.pdf"],
    by: "Bokra Machhua Samaj",
    byType: "Fishers' cooperative",
    date: "05 Jun 2025",
    uni: "bit-mesra",
    partner: "iedc",
    team: ["Prof. D. Ghosh", "4 biotech students"],
    mentor: "Prof. D. Ghosh (Biotech)",
    budget: "₹15 L",
    ip: "Compost process under IP review",
    milestones: [
      ms("m1", "Biomass quantification survey", "30 Jun 2025", true),
      ms("m2", "Harvester-cum-shredder prototype", "30 Nov 2025", true),
      ms("m3", "Compost pilot with SHGs", "30 Mar 2026", false),
    ],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "05 Jun 2025",
        note: "Fishers' cooperative submission; 5 fisher reports merged.",
      },
      {
        stage: "prototype",
        time: "30 Nov 2025",
        note: "Harvester prototype trials at lake edge.",
      },
    ],
  },
  {
    id: "SS-JH-24-0198",
    title: "Mango growers of West Singhbhum losing 30% produce — no cold chain",
    desc: "Chaibasa belt's 4,000 small mango growers lose a third of the crop to heat and transport delays. Requesting solar cold rooms at mandi nodes.",
    district: "West Singhbhum",
    block: "Chaibasa",
    lat: 22.55,
    lng: 85.8,
    domain: "livelihoods",
    stage: "validated",
    priority: 81,
    votes: 267,
    reports: 13,
    evidence: [IMG.agri],
    docs: ["Mandi loss estimate.pdf"],
    by: "Chaibasa Mango Growers' Assoc.",
    byType: "Farmer collective",
    date: "28 Dec 2025",
    milestones: [],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "28 Dec 2025",
        note: "Association submission with loss estimates; 12 grower reports merged.",
      },
      {
        stage: "validated",
        time: "02 Jan 2026",
        note: "Horticulture Dept verified loss figures.",
      },
    ],
  },
  {
    id: "SS-JH-24-0187",
    title: "Fisheries co-op unable to reach Ranchi market before spoilage",
    desc: "Jamtara's 90-member fisheries co-op loses market value transporting live fish 220 km. Need insulated transit crates and a booking app for mandi slots.",
    district: "Jamtara",
    block: "Narayanpur",
    lat: 23.99,
    lng: 86.8,
    domain: "livelihoods",
    stage: "deployed",
    priority: 69,
    votes: 118,
    reports: 9,
    evidence: [IMG.water],
    docs: [],
    by: "Narayanpur Matsyajivi Sahkari Samiti",
    byType: "Fishers' cooperative",
    date: "20 Jul 2024",
    uni: "bau",
    partner: "jharcraft",
    fund: "₹12 L (IEDC seed)",
    team: ["Dr. S. K. Roy", "3 students"],
    budget: "₹12 L",
    ip: "Crate design — design registered",
    impact:
      "90 households · spoilage down from 26% to 6% · +₹38 L annual income",
    milestones: [
      ms("m1", "Transit loss study", "30 Aug 2024", true),
      ms("m2", "Insulated crate v2 + pilot run", "30 Dec 2024", true),
      ms("m3", "Mandi slot booking app", "30 Apr 2025", true),
      ms("m4", "Scale to 3 co-ops", "30 Nov 2025", true),
    ],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "20 Jul 2024",
        note: "Cooperative submission; 8 member reports merged.",
      },
      {
        stage: "deployed",
        time: "30 Nov 2025",
        note: "Replication agreed with 2 more co-ops in Sahibganj.",
      },
    ],
  },
  {
    id: "SS-JH-25-0412",
    title: "Pensioners' biometric failures blocking payments at CSC Chandwara",
    desc: "Aadhaar authentication failures at Chandwara CSC are stopping pension credits for about 90 elderly beneficiaries every month.",
    district: "Giridih",
    block: "Chandwara",
    lat: 24.03,
    lng: 86.36,
    domain: "administration",
    stage: "routed",
    priority: 66,
    votes: 92,
    reports: 5,
    evidence: [],
    docs: ["Failure logs.csv"],
    by: "Giridih Pensioners' Sangh",
    byType: "Civil society",
    date: "02 Oct 2025",
    uni: "ru",
    mentor: "Dr. S. Jha (Commerce & Policy Lab)",
    milestones: [
      ms("m1", "Failure-mode study across 12 CSCs", "30 Nov 2025", false),
      ms("m2", "Alternate-auth SOP with DSA", "28 Feb 2026", false),
    ],
    comments: [],
    updates: [
      {
        stage: "submitted",
        time: "02 Oct 2025",
        note: "Submitted with authentication logs; 4 pensioner reports merged.",
      },
      {
        stage: "routed",
        time: "08 Oct 2025",
        note: "Ranchi University policy lab match 82%.",
      },
    ],
  },
];

/* ---------------- AI engine (heuristic, explainable) ---------------- */
const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "are",
  "was",
  "were",
  "have",
  "has",
  "not",
  "our",
  "their",
  "from",
  "near",
  "every",
  "since",
  "after",
  "before",
  "into",
  "under",
  "over",
  "about",
  "than",
  "then",
  "there",
  "here",
  "will",
  "can",
  "need",
  "please",
  "requesting",
  "request",
  "km",
  "lakh",
  "villages",
  "village",
  "block",
  "district",
  "report",
  "attached",
  "photos",
  "photo",
  "data",
  "year",
  "years",
  "month",
  "months",
  "more",
  "some",
  "each",
  "daily",
  "weekly",
  "month",
  "across",
  "left",
  "two",
  "three",
  "one",
  "many",
]);

const tokenize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

function classify(text: string) {
  const t = " " + text.toLowerCase() + " ";
  const scored = DOMAINS.map((d) => {
    let score = 0;
    const hits: string[] = [];
    for (const k of d.kw)
      if (t.includes(k)) {
        score += k.length > 5 ? 2 : 1;
        hits.push(k);
      }
    return { id: d.id, score, hits };
  }).sort((a, b) => b.score - a.score);
  const top = scored[0];
  const conf = (s: number) => Math.min(97, Math.round(52 + s * 9));
  return {
    ranked: scored
      .slice(0, 3)
      .map((s) => ({
        id: s.id,
        conf: s.score === 0 ? 8 : conf(s.score),
        hits: s.hits,
      })),
    best: scored[0],
    second: scored[1],
    confidence: top.score === 0 ? 0 : conf(top.score),
  };
}

const URGENT = [
  "flood",
  "collapse",
  "collapsed",
  "death",
  "fatal",
  "emergency",
  "contaminated",
  "arsenic",
  "fire",
  "accident",
  "malnutrition",
  "children",
  "hospital",
  "doctor",
  "cuts",
  "sewage",
  "dengue",
  "encroachment",
  "spoilage",
  "spoiled",
  "dying",
  "dead",
  "unsafe",
  "danger",
  "leak",
  "burnt",
  "smoke",
  "fumes",
  "skid",
];
function urgency(text: string) {
  const t = " " + text.toLowerCase() + " ";
  let u = 22;
  for (const w of URGENT) if (t.includes(w)) u += 7;
  return Math.min(98, u);
}

function findDuplicate(title: string, desc: string, list: Challenge[]) {
  const qt = new Set(tokenize(title + " " + desc));
  if (qt.size < 4) return null;
  let best: { c: Challenge; sim: number } | null = null;
  for (const c of list) {
    const ct = new Set(tokenize(c.title + " " + c.desc));
    let inter = 0;
    qt.forEach((w) => {
      if (ct.has(w)) inter++;
    });
    const sim = inter / Math.sqrt(qt.size * ct.size);
    if (!best || sim > best.sim) best = { c, sim };
  }
  return best && best.sim > 0.22
    ? { c: best.c, sim: Math.round(best.sim * 100) }
    : null;
}

function matchUnis(
  domain: string,
  text: string,
  activeUniversityIds?: string[],
  activeUniversities?: { id: string; name: string; org: string }[],
  preferredUniversityIds?: string[],
  resultLimit = 3,
) {
  const toks = tokenize(text);
  const universities = activeUniversityIds
    ? (activeUniversities?.length
        ? activeUniversities.map((account) => {
            const accountName = normalizeUniversityMatchText(account.name || account.org);
            const catalog = UNIVERSITIES.find((university) => {
              const labels = [university.id, university.name, university.short].map(
                normalizeUniversityMatchText,
              );
              return labels.some(
                (label) =>
                  label === accountName ||
                  accountName.includes(label) ||
                  label.includes(accountName),
              );
            });
            return (
              catalog ?? {
                id: account.id,
                name: account.name || account.org,
                short: account.name || account.org,
                city: "",
                est: 0,
                kind: "Registered University",
                domains: [],
                labs: [],
                blurb: "",
                stats: { students: 0, faculty: 0, active: 0, success: 50 },
              }
            );
          })
        : UNIVERSITIES.filter((u) => activeUniversityIds.includes(u.id)))
    : UNIVERSITIES;
  const ranked = universities.map((u) => {
    let pts = u.domains.includes(domain) ? 26 : 0;
    u.domains.forEach((d, i) => {
      if (i > 0 && d === domain) pts += 4;
    });
    const labHits = u.labs.join(" ").toLowerCase();
    toks.forEach((w) => {
      if (labHits.includes(w)) pts += 2.5;
    });
    pts += u.stats.success / 10;
    return { uni: u, match: Math.min(97, Math.round(38 + pts * 1.35)) };
  }).sort((a, b) => b.match - a.match);
  const preferred = preferredUniversityIds?.length
    ? ranked.filter(({ uni }) => preferredUniversityIds.includes(uni.id))
    : ranked;
  return preferred.slice(0, resultLimit);
}

function priorityOf(confidence: number, urg: number, dupSim?: number | null) {
  let p = Math.round(confidence * 0.35 + urg * 0.65);
  if (dupSim && dupSim > 40) p = Math.max(30, p - 15);
  return Math.max(25, Math.min(98, p));
}

/* ---------------- i18n ---------------- */
const STR: Record<string, { en: string; hi: string }> = {
  nav_dashboard: { en: "Command Board", hi: "कमांड बोर्ड" },
  nav_registry: { en: "Problem Registry", hi: "समस्या रजिस्ट्री" },
  nav_unis: { en: "Universities", hi: "विश्वविद्यालय" },
  nav_industry: { en: "Industry & CSR", hi: "उद्योग और CSR" },
  nav_projects: { en: "Projects", hi: "परियोजनाएँ" },
  nav_impact: { en: "Impact", hi: "प्रभाव" },
  btn_submit: { en: "Submit a Problem", hi: "समस्या दर्ज करें" },
  track_mine: { en: "Track My Problems", hi: "मेरी समस्याएँ" },
  desk_uni: { en: "University Desk", hi: "विश्वविद्यालय डेस्क" },
  desk_ind: { en: "Industry Desk", hi: "उद्योग डेस्क" },
  merged_reports: { en: "merged reports", hi: "जुड़ी रिपोर्टें" },
  live: { en: "LIVE", hi: "लाइव" },
  search_ph: {
    en: "Search problems, districts, keywords…",
    hi: "समस्याएँ, ज़िले, कीवर्ड खोजें…",
  },
  all: { en: "All", hi: "सभी" },
  domain: { en: "Domain", hi: "क्षेत्र" },
  district: { en: "District", hi: "ज़िला" },
  stage: { en: "Stage", hi: "चरण" },
  priority: { en: "AI Priority", hi: "एआई प्राथमिकता" },
  view_details: { en: "View details", hi: "विवरण देखें" },
  votes: { en: "supports", hi: "समर्थन" },
  results: { en: "problems", hi: "समस्याएँ" },
  evidence: { en: "Evidence", hi: "प्रमाण" },
  ai_insights: { en: "AI Insights", hi: "एआई विश्लेषण" },
  discussion: { en: "Discussion", hi: "चर्चा" },
  milestones: { en: "Milestones", hi: "मील के पत्थर" },
  team_partners: { en: "Team & Partners", hi: "टीम और साझेदार" },
  overview: { en: "Overview", hi: "अवलोकन" },
  submit_title: {
    en: "Report a problem in your community",
    hi: "अपने समुदाय की समस्या दर्ज करें",
  },
  submit_sub: {
    en: "Citizens, Gram Sabhas, ULBs and departments can submit problems with photos, location and documents. AI classifies, prioritises and routes it to the right university.",
    hi: "नागरिक, ग्राम सभा, नगर निकाय और विभाग फोटो, स्थान और दस्तावेज़ों के साथ समस्या दर्ज कर सकते हैं। एआई इसे वर्गीकृत कर सही विश्वविद्यालय तक पहुँचाता है।",
  },
  your_name: { en: "Your name", hi: "आपका नाम" },
  phone: { en: "Mobile number", hi: "मोबाइल नंबर" },
  i_am: { en: "I am a", hi: "मैं हूँ" },
  ch_title: { en: "Problem title", hi: "समस्या का शीर्षक" },
  ch_desc: { en: "Describe the problem", hi: "समस्या का वर्णन करें" },
  ch_district: { en: "District", hi: "ज़िला" },
  ch_block: { en: "Block / Ward", hi: "प्रखण्ड / वार्ड" },
  photos: { en: "Photos / video evidence", hi: "फोटो / वीडियो प्रमाण" },
  docs: { en: "Supporting documents", hi: "सहायक दस्तावेज़" },
  severity: { en: "How severe is it?", hi: "कितनी गंभीर है?" },
  sev_low: { en: "Manageable", hi: "सामान्य" },
  sev_med: { en: "Affects many", hi: "बहुतों को प्रभावित" },
  sev_high: { en: "Urgent / unsafe", hi: "तत्काल / असुरक्षित" },
  ai_copilot: { en: "Samadhan Mitra", hi: "समाधान मित्र" },
  ai_thinking: {
    en: "Analysing your description…",
    hi: "विवरण का विश्लेषण हो रहा है…",
  },
  detected_domain: { en: "Detected domain", hi: "पहचाना गया क्षेत्र" },
  urgency_score: { en: "Urgency score", hi: "तात्कालिकता स्कोर" },
  duplicate_scan: { en: "Duplicate scan", hi: "डुप्लिकेट जाँच" },
  likely_route: {
    en: "Likely university routing",
    hi: "संभावित विश्वविद्यालय",
  },
  submit_now: { en: "Submit problem", hi: "समस्या जमा करें" },
  match: { en: "match", hi: "मिलान" },
  fund_committed: { en: "Funding committed", hi: "प्रतिबद्ध निधि" },
  deployed: { en: "Solutions deployed", hi: "तैनात समाधान" },
  universities_engaged: {
    en: "Universities engaged",
    hi: "जुड़े विश्वविद्यालय",
  },
  industry_partners: { en: "Industry partners", hi: "उद्योग साझेदार" },
};
const makeT = (lang: Lang) => (k: string) => STR[k]?.[lang] ?? k;

/* ============================================================================
   ICONS — hand-drawn inline SVG set
   ==========================================================================*/
const ICON_PATHS: Record<string, ReactNode> = {
  bridge: (
    <>
      <path d="M2.5 19h19" />
      <path d="M5 19v-7.5M19 19v-7.5" />
      <path d="M5 11.5c3.5-4.6 10.5-4.6 14 0" />
      <path d="M8.5 19v-4.6M12 19v-6.2M15.5 19v-4.6" />
    </>
  ),
  water: (
    <>
      <path d="M12 3.2c3.1 4 5.8 6.9 5.8 9.8a5.8 5.8 0 0 1-11.6 0c0-2.9 2.7-5.8 5.8-9.8z" />
      <path d="M9 13.6c1 .9 2 .9 3 0s2-.9 3 0" />
    </>
  ),
  health: (
    <>
      <path d="M9.2 4h5.6v5.2H20v5.6h-5.2V20H9.2v-5.2H4V9.2h5.2z" />
      <path d="M7 12h2.4l1.2-2 1.8 3.6 1.3-1.6H17" />
    </>
  ),
  edu: (
    <>
      <path d="M12 4 2.5 7.8 12 11.6l9.5-3.8z" />
      <path d="M6.2 9.9v4.6c0 1.6 11.6 1.6 11.6 0V9.9" />
      <path d="M21.5 8v5" />
    </>
  ),
  agri: (
    <>
      <path d="M12 21.5V9" />
      <path d="M12 9c-3.2 0-5.2-2-5.2-5.2C10 3.8 12 5.8 12 9z" />
      <path d="M12 9c3.2 0 5.2-2 5.2-5.2C14 3.8 12 5.8 12 9z" />
      <path d="M12 15c-3.2 0-5.2-2-5.2-5.2C10 9.8 12 11.8 12 15z" />
      <path d="M12 15c3.2 0 5.2-2 5.2-5.2C14 9.8 12 11.8 12 15z" />
    </>
  ),
  env: (
    <>
      <path d="M4.5 19.5C4.5 10.5 10.5 4.5 20 4.5c0 9.5-6 15.5-15.5 15z" />
      <path d="M4.5 19.5c3.6-5.6 7.5-9.5 12-12" />
    </>
  ),
  energy: <path d="M13 2.5 4.5 13.8h5.6L9 21.5l9.5-11.8h-5.8z" />,
  urban: (
    <>
      <path d="M2.5 20.5h19" />
      <path d="M4.5 20.5V8.5H11v12" />
      <path d="M11 20.5V4.5h8.5v16" />
      <path d="M6.8 11.5h1.9M6.8 14.5h1.9M6.8 17.5h1.9M13.8 8h1.9M13.8 11h1.9M13.8 14h1.9M13.8 17h1.9" />
    </>
  ),
  access: (
    <>
      <path d="M4.5 20.5 9.3 3.5h5.4l4.8 17" />
      <path d="M12 6v1.8M12 10.8v1.8M12 15.6v1.8" />
    </>
  ),
  admin: (
    <>
      <path d="M3.5 20.5h17" />
      <path d="M5 17.5h14" />
      <path d="M6.5 17.5v-7M10.2 17.5v-7M13.8 17.5v-7M17.5 17.5v-7" />
      <path d="M4 10.5h16L12 3.5z" />
    </>
  ),
  rural: (
    <>
      <path d="M3.5 20.5h17" />
      <path d="M5.5 20.5v-7.5M18.5 20.5v-7.5" />
      <path d="M3.5 13.5 12 5l8.5 8.5" />
      <path d="M9.5 20.5v-4.5h5v4.5" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 2 6 6 3-6 3-2 6-2-6-6-3 6-3z" />
      <path d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16.5v-6a6 6 0 0 1 12 0v6l1.8 2.5H4.2z" />
      <path d="M9.8 21.5a2.4 2.4 0 0 0 4.4 0" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.5s-7-6.4-7-11.5a7 7 0 0 1 14 0c0 5.1-7 11.5-7 11.5z" />
      <circle cx="12" cy="9.8" r="2.6" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3.5" />
    </>
  ),
  camera: (
    <>
      <path d="M4 7.5h3l1.5-2.5h7L17 7.5h3v11H4z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M8.8 12h6.4M8.8 15.5h6.4" />
    </>
  ),
  upload: (
    <>
      <path d="M4 16v4h16v-4" />
      <path d="M12 4v11" />
      <path d="m7.5 8.5 4.5-4.5L16.5 8.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.4 2.5-5.5 5.5-5.5s5.5 2.1 5.5 5.5" />
      <circle cx="16.8" cy="9.2" r="2.6" />
      <path d="M15.9 14.7c2.7.2 4.6 2.1 4.6 4.8" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3h5" />
      <path d="M10.5 3v5.5L5 18.5a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3L13.5 8.5V3" />
      <path d="M7.5 15h9" />
    </>
  ),
  factory: (
    <>
      <path d="M3.5 20.5h17" />
      <path d="M4.5 20.5V10l5 3v-3l5 3V6.5h4.5v14" />
      <path d="M16 3.5h2" />
    </>
  ),
  rupee: (
    <>
      <path d="M6.5 4h11" />
      <path d="M6.5 8.2h11" />
      <path d="M8.5 4c4.8 0 6.8 1.5 6.8 4.2S13 12.4 8.5 12.4H7l7.5 7.6" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M8 16v-5M12 16V7M16 16v-8" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.8c-.9.8-1.8 1.2-1.8 2.7" />
      <path d="M12 17h.01" />
    </>
  ),
  volume: (
    <>
      <path d="M4 10h3l4-3.5v11L7 14H4z" />
      <path d="M15.5 9a4.3 4.3 0 0 1 0 5.5M18 6.5a8 8 0 0 1 0 10.5" />
    </>
  ),
  chevR: <path d="m9 5.5 6.5 6.5L9 18.5" />,
  chevD: <path d="m5.5 9 6.5 6.5L18.5 9" />,
  arrowR: (
    <>
      <path d="M3.5 12h16" />
      <path d="m14 6.5 5.5 5.5-5.5 5.5" />
    </>
  ),
  up: (
    <>
      <path d="m5.5 11 6.5-6.5L18.5 11" />
      <path d="M12 5.5V19" />
      <path d="M5.5 21h13" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.5l3.5 2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 5.8v5.4c0 4.6 3 7.8 7 9.3 4-1.5 7-4.7 7-9.3V5.8z" />
      <path d="m9 11.5 2.2 2.2 4-4.4" />
    </>
  ),
  star: (
    <path d="m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9z" />
  ),
  patent: (
    <>
      <circle cx="12" cy="8.5" r="5" />
      <path d="M12 6v2.8l2 1.4" />
      <path d="m9 12.7-1.5 6.8 4.5-2.4 4.5 2.4-1.5-6.8" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3.5c3.5 1.6 5.5 5 5.5 9l-2.7 2.7h-5.6L6.5 12.5c0-4 2-7.4 5.5-9z" />
      <circle cx="12" cy="10" r="1.7" />
      <path d="M9.2 15.5 7 20.5l3-1.2M14.8 15.5l2.2 5-3-1.2" />
    </>
  ),
  gov: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18" />
    </>
  ),
  filter: <path d="M4 5.5h16l-6.2 7.2v5.5l-3.6 2.3v-7.8z" />,
  phone: (
    <path d="M6.8 3.5c.8 0 2 2.4 2 3.4 0 1.4-2 1.9-2 3 0 2.4 3.3 5.7 5.7 5.7 1.1 0 1.6-2 3-2 1 0 3.4 1.2 3.4 2 0 1.9-2.4 3.9-4.4 3.9-5.2 0-11.6-6.4-11.6-11.6 0-2 2-4.4 3.9-4.4z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c-4.7 4.9-4.7 12.1 0 17 4.7-4.9 4.7-12.1 0-17z" />
    </>
  ),
  trend: (
    <>
      <path d="m3.5 16.5 5.5-5.5 3.5 3.5 7.5-8" />
      <path d="M14.5 6.5H20V12" />
    </>
  ),
  send: (
    <>
      <path d="M20.5 3.5 3.5 10l7 2.5 2.5 7z" />
      <path d="M20.5 3.5 10.5 12.5" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3.5 8.5 4.5L12 12.5 3.5 8z" />
      <path d="m3.5 12.5 8.5 4.5 8.5-4.5" />
      <path d="m3.5 16.5 8.5 4.5 8.5-4.5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  cal: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="1.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  flag: (
    <>
      <path d="M5.5 21V4" />
      <path d="M5.5 4.5c4.5-2.5 8.5 2.5 13 0v9c-4.5 2.5-8.5-2.5-13 0" />
    </>
  ),
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="10" rx="1.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
      <path d="M12 14.5v2.5" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4.5H6v15h8" />
      <path d="M10.5 12H21" />
      <path d="m17 8 4 4-4 4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20.5c0-4 3.3-6.3 7.5-6.3s7.5 2.3 7.5 6.3" />
    </>
  ),
  idcard: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5.8 16c.4-1.5 1.4-2.2 2.7-2.2s2.3.7 2.7 2.2" />
      <path d="M14 9.5h4.5M14 12.5h4.5M14 15.5h2.5" />
    </>
  ),
  bucket: (
    <>
      <path d="M4 7h16l-1.6 12.5a1.5 1.5 0 0 1-1.5 1.3H7.1a1.5 1.5 0 0 1-1.5-1.3z" />
      <path d="M8 7c0-2.5 1.8-4 4-4s4 1.5 4 4" />
      <path d="M8.5 12v4M12 12v5M15.5 12v4" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15" />
      <path d="M9 7V4.6A1.6 1.6 0 0 1 10.6 3h2.8A1.6 1.6 0 0 1 15 4.6V7" />
      <path d="M6.7 7 7.7 20.4A1.6 1.6 0 0 0 9.3 21.9h5.4a1.6 1.6 0 0 0 1.6-1.5L17.3 7" />
      <path d="M10.2 11v7M13.8 11v7" />
    </>
  ),
  lamp: (
    <>
      <path d="M12 2.2v3" />
      <path d="M6.8 9 8.2 5.2h7.6L17.2 9z" />
      <path d="M6.8 9h10.4" />
      <path d="M12 9v11.8" />
      <path d="M8.3 21.5h7.4" />
    </>
  ),
  plug: (
    <>
      <path d="M9 2.2v5M15 2.2v5" />
      <path d="M6.3 7.2h11.4v4.3A5.7 5.7 0 0 1 12 17.2a5.7 5.7 0 0 1-5.7-5.7z" />
      <path d="M12 17.2v4.6" />
    </>
  ),
};

function Icon({
  name,
  className = "w-5 h-5",
  sw = 1.7,
}: {
  name: string;
  className?: string;
  sw?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS[name] ?? ICON_PATHS.spark}
    </svg>
  );
}

/* ============================================================================
   UI KIT — shared primitives & signature motion helpers
   ==========================================================================*/
const cx = (...a: (string | false | null | undefined)[]) =>
  a.filter(Boolean).join(" ");

function useInView<T extends HTMLElement>(th = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: th },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [th]);
  return { ref, inView };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cx("reveal", inView && "in", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Counter({
  to,
  prefix = "",
  suffix = "",
  dec = 0,
  className = "",
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  dec?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.35);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(to);
      return;
    }
    const t0 = performance.now();
    const dur = 1200;
    const f = Math.pow(10, dec);
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(to * f * (1 - Math.pow(1 - p, 3))) / f);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, dec]);
  return (
    <span ref={ref} className={cx("tabular", className)}>
      {prefix}
      {v.toLocaleString("en-IN", {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      })}
      {suffix}
    </span>
  );
}

function SectionHead({
  kicker,
  title,
  right,
  dark = false,
}: {
  kicker: string;
  title: string;
  right?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="h-[3px] w-8 bg-marigold-500 rounded-full" />
          <span
            className={cx(
              "text-[11px] font-bold tracking-[0.22em] uppercase",
              dark ? "text-marigold-400" : "text-pine-700",
            )}
          >
            {kicker}
          </span>
        </div>
        <h2
          className={cx(
            "font-display font-extrabold tracking-tight text-2xl md:text-[27px] leading-none",
            dark ? "text-paper" : "text-ink",
          )}
        >
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}

function StagePill({
  stage,
  className = "",
}: {
  stage: string;
  className?: string;
}) {
  const s = stageById(stage);
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-[3px] text-[11px] font-bold uppercase tracking-wide",
        className,
      )}
      style={{
        background: s.color + "1c",
        color: s.color,
        border: `1px solid ${s.color}45`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: s.color }}
      />
      {s.en}
    </span>
  );
}

function DomainTag({
  id,
  withName = true,
}: {
  id: string;
  withName?: boolean;
}) {
  const d = domainById(id);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-[3px] text-[11px] font-bold"
      style={{
        background: d.color + "18",
        color: d.color,
        border: `1px solid ${d.color}3a`,
      }}
    >
      <Icon name={d.icon} className="w-3.5 h-3.5" sw={2} />
      {withName && d.en}
    </span>
  );
}

function CityCategoryTag({
  id,
  withName = true,
}: {
  id: string;
  withName?: boolean;
}) {
  const c = cityCategoryById(id);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-[3px] text-[11px] font-bold"
      style={{
        background: c.color + "18",
        color: c.color,
        border: `1px solid ${c.color}3a`,
      }}
    >
      <Icon name={c.icon} className="w-3.5 h-3.5" sw={2} />
      {withName && c.en}
    </span>
  );
}

function PriorityRing({ score, size = 46 }: { score: number; size?: number }) {
  const color =
    score >= 85
      ? "#CE4A3B"
      : score >= 70
        ? "#DE9B12"
        : score >= 50
          ? "#41617A"
          : "#6E8F2E";
  const r = (size - 7) / 2;
  const C = 2 * Math.PI * r;
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <div
      ref={ref}
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={`AI priority ${score}/100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(23,32,26,0.1)"
          strokeWidth="4.5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={inView ? `${(score / 100) * C} ${C}` : `0 ${C}`}
          style={{
            transition: "stroke-dasharray 0.9s cubic-bezier(0.2,0.8,0.3,1)",
          }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[13px] font-extrabold tabular"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

function Donut({
  data,
  size = 190,
  thick = 24,
  center,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thick?: number;
  center?: ReactNode;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = (size - thick) / 2;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div
      ref={ref}
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          fill="none"
          stroke="rgba(23,32,26,0.08)"
          strokeWidth={thick}
        />
        {data.map((d) => {
          const frac = d.value / total;
          const start = acc;
          acc += frac;
          return (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth={thick}
              strokeDasharray={
                inView ? `${frac * C - 1.5} ${C - frac * C + 1.5}` : `0 ${C}`
              }
              strokeDashoffset={-start * C}
              className="donut-seg"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        {center}
      </div>
    </div>
  );
}

function Sparkline({
  points,
  color = "#EFAA2B",
  w = 220,
  h = 64,
}: {
  points: number[];
  color?: string;
  w?: number;
  h?: number;
}) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = max - min || 1;
  const coords = points
    .map(
      (p, i) =>
        `${(i / (points.length - 1)) * w},${h - 6 - ((p - min) / span) * (h - 12)}`,
    )
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      style={{ height: h }}
      preserveAspectRatio="none"
    >
      <polygon
        points={`0,${h} ${coords} ${w},${h}`}
        fill={color}
        opacity="0.14"
      />
      <polyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={(i / (points.length - 1)) * w}
          cy={h - 6 - ((p - min) / span) * (h - 12)}
          r={i === points.length - 1 ? 3.5 : 0}
          fill={color}
        />
      ))}
    </svg>
  );
}

/* ============================================================================
   GATE — role-based login screen
   ==========================================================================*/
const GATE_ROLES: {
  role: Role;
  en: string;
  hi: string;
  icon: string;
  desc: string;
  descHi: string;
  access: string;
  accessHi: string;
  color: string;
}[] = [
  {
    role: "citizen",
    en: "Citizen",
    hi: "नागरिक",
    icon: "user",
    desc: "Submit problems, preview nearby public issues, rate and review community reports.",
    descHi:
      "समस्या दर्ज करें, स्थानीय सार्वजनिक समस्याएँ देखें और रेटिंग/रिव्यू दें।",
    access: "Access: Submit · Local Preview · My Problems",
    accessHi: "पहुँच: सबमिट · स्थानीय प्रीव्यू · मेरी समस्याएँ",
    color: "#2E7D4F",
  },
  {
    role: "local_worker",
    en: "Local Government",
    hi: "नगर सरकार",
    icon: "gov",
    desc: "Handle normal city problems that do not need university research or external funding.",
    descHi:
      "सामान्य शहर की समस्याएँ संभालें जिनमें विश्वविद्यालय समाधान या बाहरी फंडिंग की जरूरत नहीं है।",
    access: "Access: Local Government Dashboard",
    accessHi: "पहुँच: Local Government Dashboard",
    color: "#B4692F",
  },
  {
    role: "govt",
    en: "State Government Officer",
    hi: "राज्य सरकारी अधिकारी",
    icon: "gov",
    desc: "Full command and decision dashboard for departments and authorities.",
    descHi: "विभागों और अधिकारियों के लिए पूर्ण कमांड और निर्णय डैशबोर्ड।",
    access: "Access: Full State Government Portal",
    accessHi: "पहुँच: पूर्ण राज्य सरकारी पोर्टल",
    color: "#CE4A3B",
  },
  {
    role: "university",
    en: "University",
    hi: "विश्वविद्यालय",
    icon: "edu",
    desc: "Faculty and students evaluate routed problems and build solutions.",
    descHi: "फैकल्टी और छात्र समस्याओं का मूल्यांकन कर समाधान बनाते हैं।",
    access: "Access: University Desk",
    accessHi: "पहुँच: विश्वविद्यालय डेस्क",
    color: "#2E6FB7",
  },
  {
    role: "industry",
    en: "Industry & CSR",
    hi: "उद्योग और CSR",
    icon: "factory",
    desc: "Partners fund, mentor and pilot solutions.",
    descHi: "साझेदार समाधान को फंड, मेंटर और पायलट करते हैं।",
    access: "Access: Industry Desk",
    accessHi: "पहुँच: उद्योग डेस्क",
    color: "#DE9B12",
  },
];

const CRYPTO_CARDS = [
  {
    icon: "lock",
    en: "Password security",
    hi: "पासवर्ड सुरक्षा",
    body_en:
      "Passwords are never stored — only a PBKDF2-SHA256 hash (100,000 rounds) with a unique random salt per account.",
    body_hi:
      "पासवर्ड कभी सहेजे नहीं जाते — प्रति खाता एक अद्वितीय रैंडम सॉल्ट के साथ केवल PBKDF2-SHA256 हैश (100,000 राउंड) रखा जाता है।",
  },
  {
    icon: "shield",
    en: "Encryption at rest",
    hi: "स्टोरेज एन्क्रिप्शन",
    body_en:
      "Sensitive account fields are encrypted with Fernet (AES-128-CBC + HMAC-SHA256) before they touch the database.",
    body_hi:
      "संवेदनशील खाता फ़ील्ड्स डेटाबेस में जाने से पहले Fernet (AES-128-CBC + HMAC-SHA256) से एन्क्रिप्ट की जाती हैं।",
  },
  {
    icon: "layers",
    en: "Digital signatures",
    hi: "डिजिटल हस्ताक्षर",
    body_en:
      "Every ledger block is signed with the server's Ed25519 private key. The matching public key lets anyone independently verify authenticity.",
    body_hi:
      "हर लेजर ब्लॉक सर्वर की Ed25519 प्राइवेट-की से हस्ताक्षरित होता है। पब्लिक-की से कोई भी इसकी प्रामाणिकता स्वतंत्र रूप से जांच सकता है।",
  },
  {
    icon: "target",
    en: "Hash-chained ledger",
    hi: "हैश-चेन लेजर",
    body_en:
      "Each block stores the SHA-256 hash of the block before it, so editing any past record breaks every hash that follows — the same tamper-evidence principle blockchains use.",
    body_hi:
      "हर ब्लॉक पिछले ब्लॉक का SHA-256 हैश रखता है, इसलिए किसी पुराने रिकॉर्ड को बदलने से आगे के सभी हैश टूट जाते हैं — यही सिद्धांत ब्लॉकचेन में छेड़छाड़ पकड़ने के लिए उपयोग होता है।",
  },
];

function Gate({
  lang,
  onLogin,
  publicChallenges,
}: {
  lang: Lang;
  onLogin: (s: Session) => void;
  publicChallenges: Challenge[];
}) {
  const [sel, setSel] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [pw, setPw] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [publicRadius, setPublicRadius] = useState(5);
  const [publicHighPriorityOnly, setPublicHighPriorityOnly] = useState(false);
  const [selectedPublicProblem, setSelectedPublicProblem] =
    useState<Challenge | null>(null);
  const [loginReviewQuery, setLoginReviewQuery] = useState("");
  const [loginReviewDomain, setLoginReviewDomain] = useState("all");
  const [selectedLoginReviewProblem, setSelectedLoginReviewProblem] =
    useState<Challenge | null>(null);
  const [loginReviewRatings, setLoginReviewRatings] = useState<
    Record<string, number>
  >({});
  const [govtDesk, setGovtDesk] = useState<GovtDesk>("command");
  const [stateRole, setStateRole] = useState<StateGovtRole>("state_admin");
  const [cityDesk, setCityDesk] = useState<CityDesk>("city_admin");
  const [cityDepartment, setCityDepartment] =
    useState<CityDepartment>("water_drainage");
  const hi = lang === "hi";
  const publicNearby = publicChallenges
    .filter((c) => !publicHighPriorityOnly || c.priority >= 80)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);
  const publicHighPriorityCount = publicChallenges.filter(
    (c) => c.priority >= 80,
  ).length;
  const loginReviewProblems = publicChallenges
    .filter((c) => {
      const query = loginReviewQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        `${c.title} ${c.desc} ${c.district} ${c.block} ${domainById(c.domain).en}`
          .toLowerCase()
          .includes(query);
      return (
        c.stage === "deployed" &&
        matchesQuery &&
        (loginReviewDomain === "all" || c.domain === loginReviewDomain)
      );
    })
    .slice(0, 10);

  const enter = async () => {
    if (!sel) return;
    if (
      name.trim().length < 2 ||
      (sel !== "citizen" && org.trim().length < 2) ||
      pw.trim().length < 8
    ) {
      setErr(
        hi
          ? "नाम, आवश्यक संगठन जानकारी और कम से कम 8 अक्षर का पासवर्ड भरें।"
          : "Enter your name, required organisation information and a password of at least 8 characters.",
      );
      return;
    }
    try {
      setBusy(true);
      setErr("");
      const user = await api.authenticate(
        mode,
        sel,
        name.trim(),
        org.trim(),
        pw,
        sel === "local_worker" ? cityDesk : undefined,
        sel === "local_worker" && cityDesk === "department_officer"
          ? cityDepartment
          : undefined,
      );
      onLogin(
        sel === "govt"
          ? {
              ...user,
              govtDesk:
                STATE_GOVT_ROLES.find((item) => item.id === stateRole)?.desk ||
                govtDesk,
              stateRole,
            }
          : sel === "local_worker"
            ? {
                ...user,
                cityDesk: normalizeCityDesk(user.city_desk, cityDesk),
                cityDepartment: user.city_department || cityDepartment,
              }
            : user,
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    if (!sel) return;
    if (
      name.trim().length < 2 ||
      (sel !== "citizen" && org.trim().length < 2) ||
      resetCode.trim().length < 4 ||
      newPw.length < 8
    ) {
      setErr(
        hi
          ? "नाम, आवश्यक संगठन जानकारी, रिकवरी कोड और कम से कम 8 अक्षर का नया पासवर्ड भरें।"
          : "Enter your name, required organisation information, recovery code and a new password of at least 8 characters.",
      );
      return;
    }
    try {
      setBusy(true);
      setErr("");
      await api.resetPassword(
        sel,
        name.trim(),
        org.trim(),
        resetCode.trim(),
        newPw,
      );
      setPw("");
      setNewPw("");
      setResetCode("");
      setResetOpen(false);
      setMode("login");
      setErr(
        hi
          ? "पासवर्ड बदल गया। अब नए पासवर्ड से लॉगिन करें।"
          : "Password changed successfully. Sign in with your new password.",
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Password reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="view-in">
      <div className="relative bg-pine-925 text-paper overflow-hidden">
        <img
          src={IMG.mural}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pine-925/60 via-pine-925/80 to-pine-925" />
        <div
          className="h-2 w-full relative"
          style={{
            background:
              "linear-gradient(90deg,#FF9933 0 33.3%,#F2F0E5 33.3% 66.6%,#2E7D4F 66.6% 100%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-12">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-sm bg-marigold-500 text-pine-925 flex items-center justify-center shadow-[3px_3px_0_rgba(0,0,0,0.35)]">
              <Icon name="bridge" className="w-6 h-6" sw={2} />
            </span>
            <div>
              <p className="font-display font-extrabold text-xl leading-none tracking-tight">
                Samadhan Setu
              </p>
              <p className="text-[10.5px] font-bold tracking-[0.28em] uppercase text-marigold-300 mt-1">
                समाधान सेतु · Govt. of Jharkhand
              </p>
            </div>
          </div>
          <div className="max-w-3xl mt-9">
            <p className="text-[11px] font-bold tracking-[0.24em] uppercase text-moss-400 mb-3">
              Societal Innovation Collaboration Portal
            </p>
            <h1 className="font-display font-extrabold tracking-tight text-3xl md:text-[52px] leading-[1.03]">
              {hi ? (
                <>
                  समस्या से <span className="text-marigold-400">समाधान</span> तक
                  —<br />
                  एक ही पोर्टल पर।
                </>
              ) : (
                <>
                  One secure door from{" "}
                  <span className="text-marigold-400">problem</span>
                  <br />
                  to deployed solution.
                </>
              )}
            </h1>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-brick-600 flex items-center gap-2">
              <Icon name="lock" className="w-4 h-4" sw={2.2} />
              {hi ? "भूमिका चुनें" : "Choose your gate"}
            </p>
            <h2 className="font-display font-extrabold tracking-tight text-2xl md:text-3xl text-ink mt-1.5">
              {hi ? "आप कौन हैं?" : "Who are you signing in as?"}
            </h2>
          </div>
          <p className="hidden md:block text-[12px] font-bold text-ink-soft max-w-[300px] text-right">
            {hi
              ? "अपनी वास्तविक जानकारी से साइन इन करें। पहली बार आपका अकाउंट सुरक्षित रूप से बनाया जाएगा।"
              : "Sign in with your own details. Your account is securely created on first sign-in."}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {GATE_ROLES.map((r, i) => (
            <button
              key={r.role}
              onClick={() => {
                setSel(r.role);
                setPw("");
                setErr("");
                setResetOpen(false);
                setResetCode("");
                setNewPw("");
                try {
                  const raw = localStorage.getItem(`ss_last_${r.role}`);
                  const last = raw
                    ? (JSON.parse(raw) as { name: string; org: string })
                    : null;
                  setName(last?.name ?? "");
                  setOrg(last?.org ?? "");
                } catch {
                  setName("");
                  setOrg("");
                }
              }}
              className={cx(
                "group text-left bg-card border rounded-md p-5 shadow-[5px_5px_0_rgba(11,44,33,0.07)] transition-all hover:-translate-y-1.5 hover:shadow-[8px_8px_0_rgba(11,44,33,0.14)] rise-in relative overflow-hidden",
                sel === r.role
                  ? "border-pine-800 ring-2 ring-marigold-500"
                  : "border-ink/10",
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                className="absolute top-0 left-0 w-full h-1.5"
                style={{ background: r.color }}
              />
              <span
                className="w-12 h-12 rounded-sm flex items-center justify-center text-paper"
                style={{ background: r.color }}
              >
                <Icon name={r.icon} className="w-6 h-6" sw={2} />
              </span>
              <h3 className="font-display font-extrabold text-lg tracking-tight text-ink mt-3.5">
                {hi ? r.hi : r.en}
              </h3>
              <p className="text-[12.5px] font-medium text-ink-soft leading-relaxed mt-1.5">
                {hi ? r.descHi : r.desc}
              </p>
            </button>
          ))}
        </div>
        {sel && (
          <div
            className="fixed inset-0 z-[100] flex justify-end bg-pine-925/45 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="signin-panel-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSel(null);
            }}
          >
            <div className="signin-slide-panel w-full max-w-xl h-full overflow-y-auto bg-pine-925 text-paper border-l border-paper/15 shadow-[-12px_0_30px_rgba(11,44,33,.25)]">
              <div
                className="h-1.5 w-full"
                style={{
                  background: GATE_ROLES.find((r) => r.role === sel)?.color,
                }}
              />
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-sm bg-paper/10 flex items-center justify-center">
                      <Icon
                        name="idcard"
                        className="w-5 h-5 text-marigold-400"
                        sw={2}
                      />
                    </span>
                    <div>
                      <p
                        id="signin-panel-title"
                        className="font-display font-extrabold text-lg leading-tight"
                      >
                        {hi
                          ? GATE_ROLES.find((r) => r.role === sel)!.hi
                          : GATE_ROLES.find((r) => r.role === sel)!.en}{" "}
                        sign-in
                      </p>
                      <p className="text-[12px] font-semibold text-moss-400">
                        {hi
                          ? "अपनी जानकारी दर्ज करें"
                          : "Enter your own information"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSel(null)}
                    aria-label={hi ? "बंद करें" : "Close sign in"}
                    className="w-9 h-9 rounded-sm border border-paper/20 text-paper/70 hover:text-paper hover:bg-paper/10 flex items-center justify-center"
                  >
                    <Icon name="x" className="w-4 h-4" sw={2.2} />
                  </button>
                </div>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      setMode("login");
                      setErr("");
                    }}
                    className={cx(
                      "px-4 py-2 text-xs font-extrabold rounded-sm",
                      mode === "login"
                        ? "bg-marigold-500 text-pine-925"
                        : "bg-paper/10 text-paper",
                    )}
                  >
                    {hi ? "लॉगिन" : "Login"}
                  </button>
                  <button
                    onClick={() => {
                      setMode("register");
                      setErr("");
                    }}
                    className={cx(
                      "px-4 py-2 text-xs font-extrabold rounded-sm",
                      mode === "register"
                        ? "bg-marigold-500 text-pine-925"
                        : "bg-paper/10 text-paper",
                    )}
                  >
                    {hi ? "रजिस्टर" : "Register"}
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-moss-400">
                      {hi ? "नाम" : "Name"}
                    </span>
                    <div className="mt-1 flex items-center gap-2 bg-paper/5 border border-paper/20 rounded-sm px-3 py-2.5">
                      <Icon
                        name="user"
                        className="w-4 h-4 text-marigold-400"
                        sw={2}
                      />
                      <input
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setErr("");
                        }}
                        placeholder={hi ? "अपना नाम लिखें" : "Enter your name"}
                        className="bg-transparent w-full text-sm font-bold outline-none placeholder:text-paper/30"
                      />
                    </div>
                  </label>
                  {sel !== "citizen" && (
                    <label className="block">
                      <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-moss-400">
                        {hi ? "संगठन" : "Organisation"}
                      </span>
                      <div className="mt-1 flex items-center gap-2 bg-paper/5 border border-paper/20 rounded-sm px-3 py-2.5">
                        <Icon
                          name="gov"
                          className="w-4 h-4 text-marigold-400"
                          sw={2}
                        />
                        <input
                          value={org}
                          onChange={(e) => {
                            setOrg(e.target.value);
                            setErr("");
                          }}
                          placeholder={
                            hi ? "अपना संगठन लिखें" : "Enter your organisation"
                          }
                          className="bg-transparent w-full text-sm font-bold outline-none placeholder:text-paper/30"
                        />
                      </div>
                    </label>
                  )}
                  {sel === "govt" && (
                    <label className="block sm:col-span-2">
                      <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-moss-400">
                        {hi
                          ? "State Government role type"
                          : "State Government role type"}
                      </span>
                      <div className="mt-1 flex items-center gap-2 bg-paper/5 border border-paper/20 rounded-sm px-3 py-2.5">
                        <Icon
                          name="gov"
                          className="w-4 h-4 text-marigold-400"
                          sw={2}
                        />
                        <select
                          value={stateRole}
                          onChange={(e) =>
                            setStateRole(e.target.value as StateGovtRole)
                          }
                          className="bg-transparent w-full text-sm font-bold outline-none text-paper"
                        >
                          {STATE_GOVT_ROLES.map((item) => (
                            <option
                              className="text-ink"
                              key={item.id}
                              value={item.id}
                            >
                              {hi ? item.hi : item.en}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="text-[10px] font-semibold text-moss-400 mt-1 block">
                        {hi
                          ? "चयनित role के अनुसार अलग State Government portal खुलेगा"
                          : "A separate State Government portal desk will open for the selected role"}
                      </span>
                    </label>
                  )}
                  {sel === "local_worker" && (
                    <label className="block sm:col-span-2">
                      <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-moss-400">
                        {hi
                          ? "Local Government role"
                          : "Local Government role type"}
                      </span>
                      <div className="mt-1 flex items-center gap-2 bg-paper/5 border border-paper/20 rounded-sm px-3 py-2.5">
                        <Icon
                          name="gov"
                          className="w-4 h-4 text-marigold-400"
                          sw={2}
                        />
                        <select
                          value={cityDesk}
                          onChange={(e) =>
                            setCityDesk(e.target.value as CityDesk)
                          }
                          className="bg-transparent w-full text-sm font-bold outline-none text-paper"
                        >
                          {CITY_DESKS.map((desk) => (
                            <option
                              className="text-ink"
                              key={desk.id}
                              value={desk.id}
                            >
                              {hi ? desk.hi : desk.en}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="text-[10px] font-semibold text-moss-400 mt-1 block">
                        {hi
                          ? "आपके role के अनुसार Local Government portal खुलेगा"
                          : "Your Local Government workspace will be identified by this role"}
                      </span>
                    </label>
                  )}
                  {sel === "local_worker" &&
                    cityDesk === "department_officer" && (
                      <label className="block sm:col-span-2">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-moss-400">
                          {hi ? "Department चुनें" : "Department"}
                        </span>
                        <div className="mt-1 flex items-center gap-2 bg-paper/5 border border-paper/20 rounded-sm px-3 py-2.5">
                          <Icon
                            name="layers"
                            className="w-4 h-4 text-marigold-400"
                            sw={2}
                          />
                          <select
                            value={cityDepartment}
                            onChange={(e) =>
                              setCityDepartment(
                                e.target.value as CityDepartment,
                              )
                            }
                            className="bg-transparent w-full text-sm font-bold outline-none text-paper"
                          >
                            {CITY_DEPARTMENTS.map((department) => (
                              <option
                                className="text-ink"
                                key={department.id}
                                value={department.id}
                              >
                                {hi ? department.hi : department.en}
                              </option>
                            ))}
                          </select>
                        </div>
                        <span className="text-[10px] font-semibold text-moss-400 mt-1 block">
                          {hi
                            ? "Officer को केवल इसी department की problems दिखेंगी"
                            : "This officer will see only this department's problems"}
                        </span>
                      </label>
                    )}
                  {!resetOpen ? (
                    <label className="block sm:col-span-2">
                      <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-moss-400">
                        {hi ? "पासवर्ड" : "Password"}
                      </span>
                      <div
                        className={cx(
                          "mt-1 flex items-center gap-2 bg-paper/5 border rounded-sm px-3 py-2.5 transition-colors",
                          err
                            ? "border-brick-500"
                            : "border-paper/20 focus-within:border-marigold-500",
                        )}
                      >
                        <Icon
                          name="lock"
                          className="w-4 h-4 text-marigold-400"
                          sw={2}
                        />
                        <input
                          type="password"
                          value={pw}
                          minLength={8}
                          maxLength={256}
                          autoComplete={
                            mode === "register"
                              ? "new-password"
                              : "current-password"
                          }
                          onChange={(e) => {
                            setPw(e.target.value);
                            setErr("");
                          }}
                          onKeyDown={(e) => e.key === "Enter" && enter()}
                          placeholder={
                            mode === "register"
                              ? hi
                                ? "कम से कम 8 अक्षर का पासवर्ड बनाएं"
                                : "Create a password (minimum 8 characters)"
                              : hi
                                ? "पासवर्ड लिखें"
                                : "Enter your password"
                          }
                          className="bg-transparent w-full text-sm font-bold outline-none placeholder:text-paper/30"
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-moss-400 mt-1 block">
                        {hi
                          ? "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए"
                          : "Password must be at least 8 characters"}
                      </span>
                      {err && (
                        <span className="text-[11px] font-bold text-brick-500 mt-1 block">
                          {err}
                        </span>
                      )}
                    </label>
                  ) : (
                    <>
                      <label className="block sm:col-span-2">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-moss-400">
                          {hi ? "रिकवरी कोड" : "Recovery code"}
                        </span>
                        <div className="mt-1 flex items-center gap-2 bg-paper/5 border border-paper/20 rounded-sm px-3 py-2.5">
                          <Icon
                            name="lock"
                            className="w-4 h-4 text-marigold-400"
                            sw={2}
                          />
                          <input
                            type="password"
                            value={resetCode}
                            minLength={4}
                            maxLength={128}
                            onChange={(e) => {
                              setResetCode(e.target.value);
                              setErr("");
                            }}
                            placeholder={
                              hi ? "रिकवरी कोड लिखें" : "Enter recovery code"
                            }
                            className="bg-transparent w-full text-sm font-bold outline-none placeholder:text-paper/30"
                          />
                        </div>
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-moss-400">
                          {hi ? "नया पासवर्ड" : "New password"}
                        </span>
                        <div className="mt-1 flex items-center gap-2 bg-paper/5 border border-paper/20 rounded-sm px-3 py-2.5">
                          <Icon
                            name="lock"
                            className="w-4 h-4 text-marigold-400"
                            sw={2}
                          />
                          <input
                            type="password"
                            value={newPw}
                            minLength={8}
                            maxLength={256}
                            autoComplete="new-password"
                            onChange={(e) => {
                              setNewPw(e.target.value);
                              setErr("");
                            }}
                            placeholder={
                              hi ? "कम से कम 8 अक्षर" : "Minimum 8 characters"
                            }
                            className="bg-transparent w-full text-sm font-bold outline-none placeholder:text-paper/30"
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-moss-400 mt-1 block">
                          {hi
                            ? "नया पासवर्ड कम से कम 8 अक्षरों का होना चाहिए"
                            : "New password must be at least 8 characters"}
                        </span>
                      </label>
                      {err && (
                        <span className="text-[11px] font-bold text-brick-500 mt-1 block sm:col-span-2">
                          {err}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
                    disabled={busy}
                    onClick={resetOpen ? resetPassword : enter}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-marigold-500 hover:bg-marigold-400 disabled:opacity-60 text-pine-925 font-extrabold text-sm px-7 py-3 rounded-sm"
                  >
                    {busy
                      ? hi
                        ? "कृपया प्रतीक्षा करें..."
                        : "Please wait..."
                      : resetOpen
                        ? hi
                          ? "पासवर्ड बदलें"
                          : "Reset password"
                        : mode === "register"
                          ? hi
                            ? "अकाउंट बनाएं"
                            : "Create account"
                          : hi
                            ? "पोर्टल में प्रवेश करें"
                            : "Enter portal"}
                    <Icon name="arrowR" className="w-4 h-4" sw={2.5} />
                  </button>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetOpen(!resetOpen);
                        setErr("");
                      }}
                      className="inline-flex items-center gap-1 text-[12.5px] font-bold text-marigold-300 hover:text-marigold-200 underline underline-offset-4"
                    >
                      <Icon name="lock" className="w-3.5 h-3.5" sw={2} />
                      {resetOpen
                        ? hi
                          ? "लॉगिन पर वापस जाएँ"
                          : "Back to login"
                        : hi
                          ? "पासवर्ड भूल गए?"
                          : "Forgot password?"}
                    </button>
                  )}
                  <button
                    onClick={() => setSel(null)}
                    className="text-[12.5px] font-bold text-paper/70 hover:text-paper underline underline-offset-4"
                  >
                    {hi ? "भूमिका बदलें" : "Change role"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <section
          className="mt-8 max-w-7xl rise-in"
          id="login-community-reports"
        >
          <div className="bg-card border border-ink/10 rounded-md shadow-[5px_5px_0_rgba(11,44,33,.08)] overflow-hidden">
            <div className="p-5 border-b border-ink/10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-pine-700">
                  {hi ? "कम्युनिटी रिपोर्ट" : "Community reports"}
                </p>
                <h2 className="font-display font-extrabold text-2xl text-ink mt-1">
                  {hi ? "आपके आसपास की समस्याएँ" : "Problems around you"}
                </h2>
                <p className="text-[11px] text-ink-soft mt-1">
                  {hi
                    ? "लॉगिन से पहले सार्वजनिक समस्याओं की प्राथमिकता और प्रगति देखें।"
                    : "Explore public problems, their priority and progress before signing in."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-extrabold text-ink-soft">
                  {hi ? "दायरा" : "Radius"}
                </label>
                <select
                  value={publicRadius}
                  onChange={(e) => setPublicRadius(Number(e.target.value))}
                  className="bg-paper border border-ink/15 rounded-sm px-2 py-1.5 text-[11px] font-bold"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-3 border-b border-ink/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-ink-soft">
                {hi
                  ? `${publicRadius} km क्षेत्र में सार्वजनिक feed`
                  : `Public feed within ${publicRadius} km`}
              </span>
              <button
                onClick={() => setPublicHighPriorityOnly((value) => !value)}
                className={cx(
                  "inline-flex items-center gap-1.5 px-3 py-2 rounded-sm text-[11px] font-extrabold transition-colors",
                  publicHighPriorityOnly
                    ? "bg-brick-500 text-paper"
                    : "border border-pine-800 text-pine-800 hover:bg-pine-100",
                )}
              >
                <Icon name="alert" className="w-3.5 h-3.5" sw={2.2} />
                {publicHighPriorityOnly
                  ? hi
                    ? "सभी समस्याएँ"
                    : "Show all"
                  : hi
                    ? "उच्च प्राथमिकता जाँचें"
                    : "Check priority"}
              </button>
            </div>
            <div className="p-5 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {publicNearby.map((c) => {
                const progress = Math.round(
                  ((stageIdx(c.stage) + 1) / STAGES.length) * 100,
                );
                return (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPublicProblem(c)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedPublicProblem(c);
                      }
                    }}
                    className="border border-ink/10 rounded-sm bg-paper p-4 cursor-pointer hover:border-pine-700 hover:shadow-[3px_3px_0_rgba(11,44,33,.08)] transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-extrabold tabular text-ink-soft">
                            {c.id}
                          </span>
                          <DomainTag id={c.domain} />
                        </div>
                        <h3 className="font-display font-extrabold text-base text-ink mt-1.5">
                          {c.title}
                        </h3>
                        <p className="text-[11px] text-ink-soft mt-1">
                          <Icon
                            name="pin"
                            className="inline w-3.5 h-3.5 mr-1"
                            sw={2.1}
                          />
                          {c.district} · {c.block}
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold text-brick-600">
                        {c.priority}/100
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-ink/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full progress-fill"
                          style={{
                            width: `${progress}%`,
                            background: stageById(c.stage).color,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-ink-soft">
                        {progress}%
                      </span>
                    </div>
                    <p className="text-[10.5px] font-bold text-ink-soft mt-1.5">
                      {hi ? stageById(c.stage).hi : stageById(c.stage).en}
                    </p>
                    <p className="text-[10px] font-extrabold text-pine-700 mt-2">
                      {hi ? "विस्तृत प्रगति देखने के लिए खोलें" : "Open to see detailed progress"}
                    </p>
                  </div>
                );
              })}
              {!publicNearby.length && (
                <div className="md:col-span-2 xl:col-span-3 p-8 text-center text-sm text-ink-soft border border-dashed border-ink/20 rounded-sm">
                  {hi
                    ? "इस क्षेत्र में अभी कोई दूसरी नागरिक समस्या नहीं मिली।"
                    : "No other citizen problems were found in this area yet."}
                </div>
              )}
            </div>
            {selectedPublicProblem && (
              <div className="mx-5 mb-5 border-2 border-pine-700/25 rounded-md bg-paper overflow-hidden shadow-[4px_4px_0_rgba(11,44,33,.08)]">
                <div className="p-4 border-b border-ink/10 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-pine-700">
                      {hi ? "समस्या की प्रगति" : "Problem progress"}
                    </p>
                    <h3 className="font-display font-extrabold text-xl text-ink mt-1">
                      {selectedPublicProblem.title}
                    </h3>
                    <p className="text-[10.5px] text-ink-soft mt-1">
                      {selectedPublicProblem.id} · {selectedPublicProblem.district} · {selectedPublicProblem.block}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPublicProblem(null)}
                    aria-label={hi ? "समस्या की प्रगति बंद करें" : "Close problem progress"}
                    className="inline-flex items-center gap-1.5 border border-pine-800 text-pine-800 hover:bg-pine-800 hover:text-paper px-2.5 py-1.5 rounded-sm text-xs font-extrabold"
                  >
                    <Icon name="close" className="w-3.5 h-3.5" sw={2.4} />
                    {hi ? "बंद करें" : "Close"}
                  </button>
                </div>
                <div className="p-4 grid md:grid-cols-[1fr_220px] gap-4">
                  <div>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      {selectedPublicProblem.desc}
                    </p>
                    <div className="mt-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-pine-700">
                        {hi ? "पूरी journey" : "Full journey"}
                      </p>
                      <div className="mt-2 grid gap-2">
                        {STAGES.map((stage, index) => {
                          const done = stageIdx(selectedPublicProblem.stage) >= index;
                          const update = selectedPublicProblem.updates.find(
                            (item) => item.stage === stage.id,
                          );
                          return (
                            <div key={stage.id} className="flex gap-2 items-start">
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0"
                                style={{
                                  background: done ? stage.color : "#e5e7eb",
                                  color: done ? "#fff" : "#6b7280",
                                }}
                              >
                                {done ? "✓" : index + 1}
                              </span>
                              <div>
                                <b className="text-[10.5px]">
                                  {hi ? stage.hi : stage.en}
                                </b>
                                {update && (
                                  <p className="text-[10px] text-ink-soft">
                                    {update.time} · {update.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border border-ink/10 rounded-sm p-3 h-fit">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                      {hi ? "अभी तक काम" : "Work completed"}
                    </p>
                    <p className="font-display font-extrabold text-3xl text-pine-800 mt-1">
                      {Math.round(((stageIdx(selectedPublicProblem.stage) + 1) / STAGES.length) * 100)}%
                    </p>
                    <div className="mt-2 h-2 bg-ink/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(((stageIdx(selectedPublicProblem.stage) + 1) / STAGES.length) * 100)}%`,
                          background: stageById(selectedPublicProblem.stage).color,
                        }}
                      />
                    </div>
                    <p className="text-[10.5px] font-bold text-ink-soft mt-2">
                      {hi ? "वर्तमान चरण" : "Current stage"}: {hi ? stageById(selectedPublicProblem.stage).hi : stageById(selectedPublicProblem.stage).en}
                    </p>
                    <p className="text-[10.5px] font-bold text-ink-soft mt-2">
                      {hi ? "प्राथमिकता" : "Priority"}: {selectedPublicProblem.priority}/100
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="px-5 pb-5 flex flex-wrap items-center justify-between gap-3 text-[10.5px] font-bold text-ink-soft">
              <span>
                {publicHighPriorityCount}{" "}
                {hi
                  ? "उच्च प्राथमिकता वाली समस्याएँ"
                  : "high-priority problems"}
              </span>
              <span>
                {hi
                  ? "पूरी journey देखने के लिए लॉगिन करें"
                  : "Sign in to open any problem and see its full journey"}
              </span>
            </div>
          </div>
        </section>
        <section className="mt-8 max-w-7xl rise-in" id="login-problem-review">
          <div className="bg-card border border-pine-700/20 rounded-md shadow-[5px_5px_0_rgba(11,44,33,.08)] overflow-hidden">
            <div className="p-5 border-b border-ink/10 bg-pine-100/50 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-pine-700">
                  {hi ? "सार्वजनिक समस्या समीक्षा" : "Public Problem Review"}
                </p>
                <h2 className="font-display font-extrabold text-2xl text-ink mt-1">
                  {hi
                    ? "पोर्टल पर दर्ज समस्याएँ देखें और रेट करें"
                    : "Review problems submitted on the portal"}
                </h2>
                <p className="text-[11px] text-ink-soft mt-1">
                  {hi
                    ? "किसी भी समस्या की पूरी journey देखें और समाधान को 1–5 स्टार दें। rating submit करने के लिए login करें।"
                    : "Open any public problem, follow its complete journey and rate the solution from 1–5 stars. Sign in to submit your rating."}
                </p>
              </div>
              <span className="text-[10px] font-extrabold bg-paper border border-ink/10 px-2 py-1.5 rounded-sm">
                {loginReviewProblems.length} {hi ? "दिख रही हैं" : "visible"}
              </span>
            </div>
            <div className="p-4 grid md:grid-cols-[1fr_190px] gap-2 border-b border-ink/10">
              <input
                value={loginReviewQuery}
                onChange={(e) => setLoginReviewQuery(e.target.value)}
                placeholder={
                  hi
                    ? "समस्या, जिला या प्रकार खोजें…"
                    : "Search problem, district or type…"
                }
                className="bg-paper border border-ink/15 rounded-sm px-3 py-2 text-xs outline-none"
              />
              <select
                value={loginReviewDomain}
                onChange={(e) => setLoginReviewDomain(e.target.value)}
                className="bg-paper border border-ink/15 rounded-sm px-2 py-2 text-xs font-semibold"
              >
                <option value="all">{hi ? "सभी प्रकार" : "All types"}</option>
                {DOMAINS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {hi ? d.hi : d.en}
                  </option>
                ))}
              </select>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-3">
              {loginReviewProblems.map((c) => {
                const progress = Math.round(
                  ((stageIdx(c.stage) + 1) / STAGES.length) * 100,
                );
                const selectedRating = loginReviewRatings[c.id] || 0;
                return (
                  <div
                    key={c.id}
                    className="border border-ink/10 rounded-md bg-paper p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[9px] font-extrabold text-ink-soft">
                            {c.id}
                          </span>
                          <DomainTag id={c.domain} />
                        </div>
                        <h3 className="font-display font-extrabold text-[16px] mt-1.5">
                          {c.title}
                        </h3>
                        <p className="text-[10.5px] text-ink-soft mt-1">
                          <Icon
                            name="pin"
                            className="inline w-3.5 h-3.5 mr-1"
                            sw={2.1}
                          />
                          {c.district} · {c.block}
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold text-brick-600">
                        {hi ? "प्राथमिकता" : "Priority"} {c.priority}/100
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-ink/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full progress-fill"
                          style={{
                            width: `${progress}%`,
                            background: stageById(c.stage).color,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-ink-soft">
                        {progress}%
                      </span>
                    </div>
                    <p className="text-[10.5px] font-bold text-ink-soft mt-1.5">
                      {hi ? stageById(c.stage).hi : stageById(c.stage).en}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedLoginReviewProblem(c)}
                      className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-pine-800 hover:text-brick-600"
                    >
                      <Icon name="arrowR" className="w-3.5 h-3.5" sw={2.2} />
                      {hi ? "पूरा workflow देखें" : "View full workflow"}
                    </button>
                    <div className="mt-3 pt-3 border-t border-ink/10 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-ink-soft">
                          {hi ? "समाधान rating" : "Solution rating"}
                        </p>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setLoginReviewRatings((ratings) => ({
                                  ...ratings,
                                  [c.id]: star,
                                }))
                              }
                              aria-label={`${star} stars`}
                              className={cx(
                                "text-xl leading-none",
                                selectedRating >= star
                                  ? "text-marigold-500"
                                  : "text-ink/20",
                              )}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <span className="text-[9.5px] font-bold text-ink-soft">
                        {selectedRating
                          ? `${selectedRating}/5`
                          : hi
                            ? "Login करके submit करें"
                            : "Sign in to submit"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {!loginReviewProblems.length && (
                <div className="md:col-span-2 p-8 text-center text-sm text-ink-soft border border-dashed border-ink/20 rounded-sm">
                  {hi
                    ? "अभी कोई सार्वजनिक समस्या उपलब्ध नहीं है।"
                    : "No public citizen problems are available yet."}
                </div>
              )}
            </div>
            {selectedLoginReviewProblem && (
              <div className="mx-4 mb-4 border-2 border-pine-700/25 rounded-md bg-paper overflow-hidden shadow-[4px_4px_0_rgba(11,44,33,.08)]">
                <div className="p-4 border-b border-ink/10 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-pine-700">
                      {hi ? "पूरा समाधान workflow" : "Complete solution workflow"}
                    </p>
                    <h3 className="font-display font-extrabold text-xl text-ink mt-1">
                      {selectedLoginReviewProblem.title}
                    </h3>
                    <p className="text-[10.5px] text-ink-soft mt-1">
                      {selectedLoginReviewProblem.id} · {selectedLoginReviewProblem.district} · {selectedLoginReviewProblem.block}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLoginReviewProblem(null)}
                    aria-label={hi ? "workflow बंद करें" : "Close workflow"}
                    className="inline-flex items-center gap-1.5 border border-pine-800 text-pine-800 hover:bg-pine-800 hover:text-paper px-2.5 py-1.5 rounded-sm text-xs font-extrabold"
                  >
                    <Icon name="close" className="w-3.5 h-3.5" sw={2.4} />
                    {hi ? "बंद करें" : "Close"}
                  </button>
                </div>
                <div className="p-4 grid md:grid-cols-[1fr_220px] gap-4">
                  <div>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      {selectedLoginReviewProblem.desc}
                    </p>
                    <div className="mt-4 grid gap-2">
                      {STAGES.map((stage, index) => {
                        const done = stageIdx(selectedLoginReviewProblem.stage) >= index;
                        const update = selectedLoginReviewProblem.updates.find(
                          (item) => item.stage === stage.id,
                        );
                        return (
                          <div key={stage.id} className="flex gap-2 items-start">
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0"
                              style={{
                                background: done ? stage.color : "#e5e7eb",
                                color: done ? "#fff" : "#6b7280",
                              }}
                            >
                              {done ? "✓" : index + 1}
                            </span>
                            <div>
                              <b className="text-[10.5px]">{hi ? stage.hi : stage.en}</b>
                              {update && (
                                <p className="text-[10px] text-ink-soft">
                                  {update.time} · {update.note}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-card border border-ink/10 rounded-sm p-3 h-fit">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                      {hi ? "काम पूरा" : "Work completed"}
                    </p>
                    <p className="font-display font-extrabold text-3xl text-pine-800 mt-1">100%</p>
                    <div className="mt-2 h-2 bg-ink/10 rounded-full overflow-hidden">
                      <div className="h-full w-full rounded-full bg-moss-500" />
                    </div>
                    <p className="text-[10.5px] font-bold text-ink-soft mt-2">
                      {hi ? "वर्तमान चरण" : "Current stage"}: {hi ? STAGES[STAGES.length - 1].hi : STAGES[STAGES.length - 1].en}
                    </p>
                    <p className="text-[10.5px] font-bold text-ink-soft mt-2">
                      {hi ? "प्राथमिकता" : "Priority"}: {selectedLoginReviewProblem.priority}/100
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        <div className="hidden mt-5 max-w-7xl rise-in">
          <div className="bg-card border border-pine-700/20 rounded-md shadow-[5px_5px_0_rgba(11,44,33,0.08)] overflow-hidden">
            <div className="p-5 border-b border-ink/10 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-pine-700">
                  {hi ? "सार्वजनिक समस्या समीक्षा" : "Public problem review"}
                </p>
                <h3 className="font-display font-extrabold text-2xl text-ink mt-1">
                  {hi
                    ? "नागरिकों द्वारा दर्ज समस्याएँ"
                    : "Problems submitted by citizens"}
                </h3>
                <p className="text-[12.5px] text-ink-soft mt-1 max-w-2xl">
                  {hi
                    ? "समस्या का प्रकार, प्राथमिकता और अभी तक की प्रगति एक ही जगह देखें। पूरी टाइमलाइन के लिए Citizen Desk में लॉगिन करें।"
                    : "See the problem type, priority and current progress in one place. Sign in to the Citizen Desk for the full timeline."}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="text-center bg-pine-100/70 border border-pine-700/15 rounded-sm px-4 py-2">
                  <div className="font-display font-extrabold text-xl text-pine-800">
                    {publicChallenges.length}
                  </div>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-ink-soft">
                    {hi ? "रिपोर्ट" : "Reports"}
                  </div>
                </div>
                <div className="text-center bg-marigold-500/10 border border-marigold-500/20 rounded-sm px-4 py-2">
                  <div className="font-display font-extrabold text-xl text-marigold-700">
                    {
                      publicChallenges.filter((c) => stageIdx(c.stage) >= 3)
                        .length
                    }
                  </div>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-ink-soft">
                    {hi ? "रूटेड+" : "Routed+"}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {publicChallenges.slice(0, 6).map((c) => {
                const progress = Math.round(
                  ((stageIdx(c.stage) + 1) / STAGES.length) * 100,
                );
                return (
                  <div
                    key={c.id}
                    className="border border-ink/10 rounded-sm bg-paper p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-extrabold tabular text-ink-soft">
                            {c.id}
                          </span>
                          <DomainTag id={c.domain} />
                        </div>
                        <h4 className="font-display font-extrabold text-base text-ink mt-1.5">
                          {c.title}
                        </h4>
                        <p className="text-[11.5px] text-ink-soft mt-1">
                          <Icon
                            name="pin"
                            className="inline w-3.5 h-3.5 mr-1"
                            sw={2.1}
                          />
                          {c.district} · {c.block}
                        </p>
                      </div>
                      <StagePill stage={c.stage} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-[10.5px] font-bold">
                      <span className="bg-card border border-ink/10 rounded-sm px-2 py-1.5">
                        <b>{hi ? "प्रकार" : "Type"}:</b>{" "}
                        {domainById(c.domain).en}
                      </span>
                      <span className="bg-card border border-ink/10 rounded-sm px-2 py-1.5">
                        <b>{hi ? "प्राथमिकता" : "Priority"}:</b> {c.priority}
                        /100
                      </span>
                      {c.department && (
                        <span className="col-span-2 bg-card border border-ink/10 rounded-sm px-2 py-1.5">
                          <b>{hi ? "विभाग" : "Dept"}:</b> {c.department}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-ink/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${progress}%`,
                            background: stageById(c.stage).color,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-ink-soft">
                        {progress}%
                      </span>
                    </div>
                    <p className="text-[10.5px] font-bold text-ink-soft mt-1.5">
                      {hi ? "वर्तमान चरण" : "Current stage"}:{" "}
                      {hi ? stageById(c.stage).hi : stageById(c.stage).en}
                    </p>
                  </div>
                );
              })}
              {!publicChallenges.length && (
                <div className="md:col-span-2 xl:col-span-3 p-8 text-center text-sm text-ink-soft border border-dashed border-ink/20 rounded-sm">
                  {hi
                    ? "अभी कोई सार्वजनिक समस्या उपलब्ध नहीं है।"
                    : "No public citizen problems are available yet."}
                </div>
              )}
            </div>
            {publicChallenges.length > 6 && (
              <div className="px-5 pb-5 text-[11px] font-bold text-ink-soft">
                {hi
                  ? `और ${publicChallenges.length - 6} समस्याएँ Citizen Desk में उपलब्ध हैं।`
                  : `${publicChallenges.length - 6} more problems are available in the Citizen Desk.`}
              </div>
            )}
          </div>
        </div>

        <section className="mt-8 max-w-7xl rise-in" id="login-workflow">
          <div className="mb-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-pine-700">
              {hi ? "पोर्टल कैसे काम करता है" : "How Samadhan Setu works"}
            </p>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-ink mt-1">
              {hi
                ? "नागरिक समस्या से वास्तविक समाधान तक"
                : "From citizen problem to real-world solution"}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              [
                "01",
                hi ? "रिपोर्ट" : "Report",
                hi
                  ? "नागरिक प्रमाण, पता और समस्या का स्थान भेजता है।"
                  : "Citizen submits the issue with evidence, address and problem location.",
              ],
              [
                "02",
                hi ? "AI ट्रायेज" : "AI triage",
                hi
                  ? "AI क्षेत्र, urgency और duplicate reports पहचानता है।"
                  : "AI classifies the domain, estimates urgency and finds duplicates.",
              ],
              [
                "03",
                hi ? "सत्यापन व रूटिंग" : "Verify & route",
                hi
                  ? "अधिकारी और community validate करके सही संस्था तक भेजते हैं।"
                  : "Officials and community validate it and route it to the best-fit institution.",
              ],
              [
                "04",
                hi ? "बनाएँ व तैनात करें" : "Build & deploy",
                hi
                  ? "University और industry teams prototype, pilot और impact measure करती हैं।"
                  : "University and industry teams prototype, pilot, measure impact and deploy the solution.",
              ],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="bg-card border border-ink/10 rounded-md p-4 shadow-[3px_3px_0_rgba(11,44,33,.05)]"
              >
                <span className="font-mono text-xs font-extrabold text-marigold-700">
                  {number}
                </span>
                <h3 className="font-display font-extrabold text-lg mt-1">
                  {title}
                </h3>
                <p className="text-[11px] text-ink-soft leading-relaxed mt-1.5">
                  {text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-pine-925 text-paper rounded-md p-4 flex flex-wrap items-center gap-2 text-[10.5px] font-extrabold">
            <span>{hi ? "प्रस्तुत" : "Submitted"}</span>
            <b>→</b>
            <span>AI Review</span>
            <b>→</b>
            <span>{hi ? "Validation" : "Validation"}</span>
            <b>→</b>
            <span>HEI</span>
            <b>→</b>
            <span>Team</span>
            <b>→</b>
            <span>Prototype</span>
            <b>→</b>
            <span>Pilot</span>
            <b>→</b>
            <span className="text-moss-400">Deployed</span>
          </div>
        </section>
        <div className="mt-8 max-w-7xl rise-in">
          <div className="bg-pine-925 text-paper rounded-md shadow-[5px_5px_0_rgba(11,44,33,0.18)] overflow-hidden">
            <div className="p-5 border-b border-paper/10 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-moss-400">
                  {hi ? "पारदर्शिता व अखंडता" : "Transparency & integrity"}
                </p>
                <h3 className="font-display font-extrabold text-2xl mt-1">
                  {hi
                    ? "ब्लॉकचेन व क्रिप्टोग्राफ़ी कैसे काम करती है"
                    : "How blockchain & cryptography protect this portal"}
                </h3>
                <p className="text-[12.5px] text-paper/70 mt-1 max-w-2xl">
                  {hi
                    ? "हर भूमिका — नागरिक, विश्वविद्यालय, उद्योग, सरकार — की गतिविधि एक छेड़छाड़-रोधी हैश-चेन लेजर में दर्ज होती है। पूरा लेजर व सत्यापन उपकरण देखने के लिए लॉगिन करें।"
                    : "Every role's activity — Citizen, University, Industry, Government and more — is recorded on a tamper-evident hash-chained ledger. Sign in to any portal to see the full ledger and run a live integrity check."}
                </p>
              </div>
            </div>
            <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {CRYPTO_CARDS.map((c) => (
                <div
                  key={c.en}
                  className="bg-paper/5 border border-paper/15 rounded-sm p-4"
                >
                  <span className="w-9 h-9 rounded-sm bg-marigold-500 text-pine-925 flex items-center justify-center mb-3">
                    <Icon
                      name={c.icon}
                      className="w-[18px] h-[18px]"
                      sw={2.2}
                    />
                  </span>
                  <p className="font-display font-extrabold text-[14px] mb-1.5">
                    {hi ? c.hi : c.en}
                  </p>
                  <p className="text-[12.5px] text-paper/70 leading-relaxed">
                    {hi ? c.body_hi : c.body_en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   SUBMIT PROBLEM — citizen intake with AI copilot, voice & bucket merge
   ==========================================================================*/
const SUBMIT_TYPES = [
  "Citizen",
  "Panchayati Raj Institution",
  "Urban Local Body",
  "Community organisation",
  "Government department",
  "NGO / civil society",
  "MSME / SHG collective",
];
const EMO = [IMG.water, IMG.agri, IMG.edu, IMG.health, IMG.waste, IMG.energy];

interface Think {
  cls: ReturnType<typeof classify>;
  urg: number;
  pri: number;
  dup: { c: Challenge; sim: number } | null;
  routes: { uni: { id: string; name: string; short: string }; match: number }[];
  dept: string;
  requires_government?: boolean;
  requires_university?: boolean;
  requires_investment?: boolean;
  routing_decision?: string;
  routing_reason?: string;
}

function thinkOf(title: string, desc: string, list: Challenge[]): Think | null {
  if (tokenize(title + " " + desc).length < 6) return null;
  const cls = classify(title + " " + desc);
  const urg = urgency(title + " " + desc);
  const dup = findDuplicate(title, desc, list);
  const cityCat = cityCategoryFor(title + " " + desc);

  // Normal city problems stay in the city-government flow only when they do
  // not need a university solution or external/industry funding.
  const city = cityCat.id !== "other_municipal";
  const text = `${title} ${desc}`.toLowerCase();
  const investment = [
    "fund",
    "funding",
    "budget",
    "investment",
    "costly",
    "expensive",
    "prototype",
    "pilot",
    "equipment",
    "capital",
    "large scale",
    "crore",
    "lakh",
  ].some((x) => text.includes(x));
  const research = [
    "prototype",
    "research",
    "technology",
    "innovation",
    "sensor",
    "algorithm",
    "technical solution",
    "treatment technology",
    "study",
    "experiment",
    "feasibility",
    "engineering design",
  ].some((x) => text.includes(x));
  const university =
    research ||
    (["education", "healthcare", "agriculture", "environment"].includes(
      cls.best.id,
    ) &&
      urg >= 85);
  const localNormalCityProblem = city && !university && !investment;
  const route = localNormalCityProblem ? "city_government" : "main_government";
  const government = !localNormalCityProblem;

  return {
    cls,
    urg,
    pri: priorityOf(cls.confidence, urg, dup?.sim ?? null),
    dup,
    routes: matchUnis(cls.best.id, title + " " + desc).map((r) => ({
      uni: { id: r.uni.id, name: r.uni.name, short: r.uni.short },
      match: r.match,
    })),
    dept: specificDepartmentFor(cls.best.id, title + " " + desc),
    requires_government: government,
    requires_university: university,
    requires_investment: investment,
    routing_decision: route,
    routing_reason: localNormalCityProblem
      ? "AI categorized this as a normal city-service problem with no university solution or external funding need — sent to the Local Government portal."
      : "AI categorized this as a non-local-city or higher-complexity problem — sent to the Main Government portal.",
  };
}

function SubmitChallenge({
  t,
  lang,
  challenges,
  patch,
  addChallenge,
  toast,
  notif,
  voiceBy,
  sessionToken,
  onSuccess,
  onReset,
}: {
  t: (k: string) => string;
  lang: Lang;
  challenges: Challenge[];
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  addChallenge: (c: Challenge) => Promise<Challenge>;
  toast: (m: string) => void;
  notif: (icon: string, text: string) => void;
  voiceBy?: string;
  sessionToken?: string;
  onSuccess?: () => void;
  onReset?: () => void;
}) {
  const hi = lang === "hi";
  const [name, setName] = useState(voiceBy ?? "");
  const [phone, setPhone] = useState("");
  const [who, setWho] = useState(SUBMIT_TYPES[0]);
  const [title, setTitle] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [whatHappening, setWhatHappening] = useState("");
  const [sinceWhen, setSinceWhen] = useState("");
  const [affectedPeople, setAffectedPeople] = useState("");
  const [desc, setDesc] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [address, setAddress] = useState("");
  const [sev, setSev] = useState(1);
  const [photos, setPhotos] = useState<{ src: string; kind: string }[]>([]);
  const [docs, setDocs] = useState<string[]>([]);
  const [geo, setGeo] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [geoSource, setGeoSource] = useState<
    "gps" | "address" | "district" | null
  >(null);
  const [geoOutside, setGeoOutside] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [mic, setMic] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [think, setThink] = useState<Think | null>(null);
  const [mitraQuestion, setMitraQuestion] = useState("");
  const [mitraReply, setMitraReply] = useState("");
  const [mitraBusy, setMitraBusy] = useState(false);
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [doneId, setDoneId] = useState<string | null>(null);
  const [doneMode, setDoneMode] = useState<"new" | "merged">("new");
  const deb = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const strongDup =
    think && think.dup && think.dup.sim >= 45 ? think.dup : null;
  const problemText = [whatHappening, sinceWhen, affectedPeople, desc]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (deb.current) clearTimeout(deb.current);
    if (!title && !problemText) {
      setThink(null);
      setThinking(false);
      return;
    }
    setThinking(true);
    deb.current = setTimeout(async () => {
      const local = thinkOf(title, problemText, challenges);
      if (!local) {
        setThink(null);
        setThinking(false);
        return;
      }
      try {
        const a = await api.analyze(title, problemText);
        const domainIndex = DOMAINS.findIndex(
          (d) => d.id === a.category || d.id === a.domain,
        );
        if (domainIndex >= 0) {
          const ranked = [...local.cls.ranked];
          const found = ranked.find((x) => x.id === DOMAINS[domainIndex].id);
          if (found)
            found.conf = Math.round(
              Number(a.confidence || found.conf * 0.01) *
                (Number(a.confidence || 0) <= 1 ? 100 : 1),
            );
          local.cls.best = { ...local.cls.best, id: DOMAINS[domainIndex].id };
        }
        local.urg = Number(a.urgency_score ?? a.priority ?? local.urg);
        local.pri = Number(a.priority ?? local.pri);
        // Step 2: the specific department the backend routed this to,
        // within whichever broad domain was just confirmed above.
        if (a.specific_department) local.dept = String(a.specific_department);
        (local as any).requires_government = Boolean(a.requires_government);
        (local as any).requires_university = Boolean(a.requires_university);
        (local as any).requires_investment = Boolean(a.requires_investment);
        (local as any).routing_decision = a.routing_decision;
        (local as any).routing_reason = a.routing_reason;
      } catch {
        /* local AI fallback keeps the form usable */
      }
      setThink(local);
      setThinking(false);
    }, 700);
    return () => {
      if (deb.current) clearTimeout(deb.current);
    };
  }, [title, problemText, challenges]);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .slice(0, 4)
      .forEach((f) => {
        if (f.type.startsWith("image/")) {
          const r = new FileReader();
          r.onload = () =>
            setPhotos((p) =>
              p.length >= 6
                ? p
                : [
                    ...p,
                    {
                      src: String(r.result),
                      kind: f.type.startsWith("video") ? "video" : "photo",
                    },
                  ],
            );
          r.readAsDataURL(f);
        } else {
          setDocs((d) => [...d, f.name]);
        }
      });
  };

  const voice = () => {
    if (mic) return;
    const w = window as Window & {
      webkitSpeechRecognition?: any;
      SpeechRecognition?: any;
    };
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) {
      toast(
        hi
          ? "इस ब्राउज़र में voice input समर्थित नहीं है। Chrome या Edge आज़माएँ।"
          : "Voice input is not supported in this browser. Try Chrome or Edge.",
      );
      return;
    }
    const recognition = new Recognition();
    recognition.lang = hi ? "hi-IN" : "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    setMic(true);
    recognition.onresult = async (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++)
        transcript += event.results[i][0].transcript;
      setDesc(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        try {
          const result = await api.voiceAssistant(transcript, lang);
          toast(result.reply);
          if ("speechSynthesis" in window) {
            const u = new SpeechSynthesisUtterance(result.reply);
            u.lang = hi ? "hi-IN" : "en-IN";
            window.speechSynthesis.speak(u);
          }
        } catch {
          toast(
            hi
              ? "आवाज़ मिली, लेकिन backend voice assistant उपलब्ध नहीं है।"
              : "Voice was captured, but the backend voice assistant is unavailable.",
          );
        }
      }
    };
    recognition.onerror = () => {
      setMic(false);
      toast(
        hi
          ? "आवाज़ समझने में समस्या हुई।"
          : "There was a problem understanding the voice input.",
      );
    };
    recognition.onend = () => setMic(false);
    recognition.start();
  };

  const useDistrictLocation = () => {
    const fallback = DISTRICT_COORDS[district];
    if (!fallback) return false;
    setGeo({ ...fallback });
    setGeoSource("district");
    setGeoOutside(true);
    return true;
  };

  const geocodeProblemAddress = async () => {
    const q = [
      address.trim(),
      block.trim(),
      district.trim(),
      "Jharkhand",
      "India",
    ]
      .filter(Boolean)
      .join(", ");
    if (!district) {
      toast(
        hi ? "पहले समस्या का ज़िला चुनें" : "First select the problem district",
      );
      return;
    }
    if (!address.trim() && !block.trim()) {
      if (useDistrictLocation())
        toast(
          hi
            ? "पता/ब्लॉक नहीं दिया गया — ज़िले का अनुमानित स्थान लगाया गया"
            : "No address/block provided — using the selected district approximately",
        );
      return;
    }
    setGeoBusy(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(q)}`;
      const r = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Accept-Language": hi ? "hi,en" : "en",
        },
      });
      const rows = await r.json();
      if (!Array.isArray(rows) || !rows.length) throw new Error("not found");
      const lat = Number(rows[0].lat),
        lng = Number(rows[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng))
        throw new Error("invalid coordinates");
      // Never let a loosely matched address move a Jharkhand problem outside
      // the state. If geocoding lands elsewhere, fall back to the selected
      // district/block location below.
      const inJharkhand =
        lat >= 21.8 && lat <= 25.6 && lng >= 83.0 && lng <= 88.2;
      if (!inJharkhand) throw new Error("address outside Jharkhand");
      setGeo({ lat, lng });
      setGeoSource("address");
      setGeoOutside(false);
      toast(
        hi
          ? "समस्या का पता map पर locate हो गया"
          : "Problem address located on the map",
      );
    } catch {
      if (useDistrictLocation())
        toast(
          hi
            ? "पता locate नहीं हुआ — चुने गए ज़िले का अनुमानित स्थान इस्तेमाल होगा"
            : "Address could not be located — using the selected district approximately",
        );
      else toast(hi ? "पता locate नहीं हुआ" : "Could not locate the address");
    } finally {
      setGeoBusy(false);
    }
  };

  const locate = () => {
    if (!navigator.geolocation) {
      if (useDistrictLocation())
        toast(
          hi
            ? "GPS उपलब्ध नहीं है — ज़िले के आधार पर अनुमानित स्थान लगाया गया"
            : "GPS is unavailable — using the selected district as an approximate location",
        );
      else
        toast(
          hi
            ? "पहले समस्या का ज़िला चुनें"
            : "First select the problem district",
        );
      return;
    }
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude,
          lng = pos.coords.longitude;
        if (isInJharkhand(lat, lng)) {
          setGeo({ lat, lng, accuracy: Math.round(pos.coords.accuracy) });
          setGeoSource("gps");
          setGeoOutside(false);
          toast(
            hi
              ? "झारखंड का वास्तविक GPS स्थान कैप्चर हो गया"
              : "Real Jharkhand GPS location captured",
          );
        } else {
          const used = useDistrictLocation();
          toast(
            used
              ? hi
                ? "आप झारखंड के बाहर हैं — चुने गए ज़िले के अनुमानित स्थान का उपयोग होगा"
                : "You are outside Jharkhand — the selected district's approximate location will be used"
              : hi
                ? "आप झारखंड के बाहर हैं — समस्या का ज़िला चुनें"
                : "You are outside Jharkhand — select the problem district",
          );
        }
        setGeoBusy(false);
      },
      () => {
        const used = useDistrictLocation();
        setGeoBusy(false);
        toast(
          used
            ? hi
              ? "GPS उपलब्ध नहीं — ज़िले के आधार पर अनुमानित स्थान इस्तेमाल होगा"
              : "GPS unavailable — using the district as an approximate location"
            : hi
              ? "GPS अनुमति दें या समस्या का ज़िला चुनें"
              : "Allow GPS or select the problem district",
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  };

  useEffect(() => {
    if (geoSource === "district" && district && DISTRICT_COORDS[district])
      setGeo({ ...DISTRICT_COORDS[district] });
  }, [district, geoSource]);

  const buildChallenge = (): Challenge => {
    const summaryText = [whatHappening, sinceWhen, affectedPeople, desc]
      .filter(Boolean)
      .join(" ") || (testMode ? "Testing problem for workflow verification." : "");
    const submissionTitle = title.trim() || (testMode ? "Test workflow problem" : "Untitled problem");
    const submissionDistrict = district || "Ranchi";
    const cls = classify(submissionTitle + " " + summaryText);
    const urg = urgency(submissionTitle + " " + summaryText);
    const d = think?.dup ?? findDuplicate(submissionTitle, summaryText, challenges);
    const now = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const ownerId = sessionToken || `citizen:${name || "anonymous"}`;
    return {
      id: `SS-JH-26-0${531 + challenges.length}`,
      title: submissionTitle,
      desc: summaryText.trim(),
      district: submissionDistrict,
      block: block || "—",
      lat: geo?.lat ?? DISTRICT_COORDS[submissionDistrict]?.lat ?? 23.37,
      lng: geo?.lng ?? DISTRICT_COORDS[submissionDistrict]?.lng ?? 85.33,
      accuracy: geoSource === "gps" ? geo?.accuracy : undefined,
      location_source:
        geoSource === "gps"
          ? "browser_gps"
          : geoSource === "address"
            ? "address_geocode"
            : "district_block_fallback",
      location_precision:
        geoSource === "gps"
          ? "exact_gps"
          : geoSource === "address"
            ? "address_geocode"
            : "approximate_district_center",
      location_address: address.trim(),
      problem_location: {
        lat: geo?.lat ?? DISTRICT_COORDS[district]?.lat ?? 23.37,
        lng: geo?.lng ?? DISTRICT_COORDS[district]?.lng ?? 85.33,
        source:
          geoSource === "gps"
            ? "browser_gps"
            : geoSource === "address"
              ? "address_geocode"
              : "district_block_fallback",
        accuracy_meters: geoSource === "gps" ? (geo?.accuracy ?? null) : null,
        accuracy_label:
          geoSource === "gps"
            ? `Exact GPS${geo?.accuracy ? ` · ±${geo.accuracy} m` : ""}`
            : geoSource === "address"
              ? "Address-based · Approximate"
              : "District/Ward fallback · Approximate",
        address: address.trim(),
        district: submissionDistrict,
        block: block || "—",
      },
      domain: cls.best.id,
      department:
        think?.dept ??
        specificDepartmentFor(cls.best.id, title + " " + summaryText),
      stage:
        think?.routing_decision === "city_government"
          ? "city_government"
          : "government_review",
      priority: priorityOf(cls.confidence, urg, d?.sim ?? null),
      requires_government: Boolean((think as any)?.requires_government ?? true),
      requires_university: Boolean((think as any)?.requires_university),
      requires_investment: Boolean((think as any)?.requires_investment),
      routing_decision:
        (think as any)?.routing_decision ??
        (cityCategoryFor(title + " " + summaryText).id !== "other_municipal"
          ? "city_government"
          : "main_government"),
      routing_reason: String(
        (think as any)?.routing_reason ??
          "AI routing completed using the local/open-source analysis engine.",
      ),
      routing_scope:
        (think as any)?.routing_decision === "city_government"
          ? "local_city"
          : "main_government",
      city_category:
        (think as any)?.city_category ??
        cityCategoryFor(title + " " + summaryText).id,
      uni: (think as any)?.requires_university
        ? ((think as any)?.routes?.[0]?.uni?.id ?? undefined)
        : undefined,
      votes: 1,
      reports: 1,
      mine: true,
      evidence: photos
        .map((p) => p.src)
        .concat(
          photos.length === 0 ? [EMO[cls.ranked.length % EMO.length]] : [],
        ),
      docs,
      by: name || "Anonymous citizen",
      byType: who,
      date: now,
      phone,
      org: sessionToken ? "Citizen" : "",
      reporter: {
        user_id: ownerId,
        name: name || "Anonymous citizen",
        phone: phone || "",
        type: who,
        organisation: sessionToken ? "Citizen" : "",
      },
      milestones: [],
      comments: [],
      updates: [
        {
          stage: "submitted",
          time: now,
          note: `Received via web portal${photos.length ? ` with ${photos.length} photo(s)` : ""}${geo ? " and GPS location" : ""}.`,
        },
        {
          stage: "ai_review",
          time: now,
          note: `Classified: ${domainById(cls.best.id).en} (${cls.confidence}%) · Urgency ${urg}/100.`,
        },
        {
          stage:
            (think as any)?.routing_decision === "city_government"
              ? "city_government"
              : "government_review",
          time: now,
          note: `AI route: ${(think as any)?.routing_decision === "city_government" ? "Local Government" : "Main Government"}. ${(think as any)?.routing_decision === "city_government" ? "Sent directly to the Local Government portal." : "Sent to the Main Government portal for review."}`,
        },
      ],
    };
  };

  const submit = async (mode: "new" | "merged") => {
    const e: Record<string, boolean> = {};
    const narrative = [whatHappening, sinceWhen, affectedPeople, desc]
      .filter(Boolean)
      .join(" ");
    if (!testMode && !name.trim()) e.name = true;
    if (!testMode && title.trim().length < 5) e.title = true;
    if (!testMode && tokenize(narrative).length < 8 && !whatHappening && !sinceWhen && !affectedPeople) {
      e.desc = true;
    }
    if (!testMode && !district) e.district = true;
    if (!geo && !DISTRICT_COORDS[district]) e.geo = true;
    setErrs(e);
    if (Object.keys(e).length) {
      toast(
        hi
          ? "कृपया लाल निशान वाले फ़ील्ड भरें और समस्या का ज़िला चुनें"
          : "Please complete the highlighted fields and select the problem district",
      );
      return;
    }

    if (mode === "merged" && strongDup) {
      const target = strongDup.c;
      patch(target.id, (x) => ({
        ...x,
        votes: x.votes + 1,
        reports: (x.reports ?? 1) + 1,
        updates: [
          ...x.updates,
          {
            stage: "submitted",
            time: "Today",
            note: `Report from ${name || "a citizen"} (${district}) merged into this bucket — similarity ${strongDup.sim}%.`,
          },
        ],
      }));
      notif(
        "bucket",
        `Your report merged into ${target.id} — now ${(target.reports ?? 1) + 1} reports, ${target.votes + 1} supporters`,
      );
      onSuccess?.();
      setDoneId(target.id);
      setDoneMode("merged");
      return;
    }

    const c = buildChallenge();
    const saved = await addChallenge(c);
    notif(
      "spark",
      `AI classified your problem: ${domainById(saved.domain).en} · priority ${saved.priority}/100`,
    );
    if (think?.dup)
      notif(
        "layers",
        `Possible duplicate of ${think.dup.c.id} (${think.dup.sim}% similar) — linked for review`,
      );
    onSuccess?.();
    setDoneId(saved.id);
    setDoneMode("new");
  };

  if (doneId) {
    const merged = doneMode === "merged";
    const doneProblem = challenges.find((x) => x.id === doneId);
    return (
      <div className="max-w-2xl mx-auto text-center py-10 rise-in">
        <div className="w-20 h-20 mx-auto rounded-sm bg-pine-800 text-paper flex items-center justify-center shadow-[5px_5px_0_rgba(239,170,43,0.9)] rotate-[-4deg] stamp-in">
          <Icon
            name={merged ? "bucket" : "check"}
            className="w-10 h-10"
            sw={2.4}
          />
        </div>
        <h2 className="font-display font-extrabold text-3xl tracking-tight text-ink mt-6">
          {merged
            ? hi
              ? "आपकी रिपोर्ट बकेट में जुड़ गई!"
              : "Your report joined the bucket!"
            : hi
              ? "समस्या दर्ज हो गई!"
              : "Problem received!"}
        </h2>
        <p className="text-ink-soft font-semibold mt-2 max-w-md mx-auto leading-relaxed">
          {merged ? (
            hi ? (
              <>
                AI ने मिलती-जुलती समस्या पहले से पाई, इसलिए आपकी रिपोर्ट को उसी{" "}
                <b className="text-ink">कम्युनिटी बकेट</b> में जोड़ा गया। हर
                रिपोर्ट उसकी प्राथमिकता बढ़ाती है।
              </>
            ) : (
              <>
                AI found a matching problem already being tracked, so your
                report was merged into that{" "}
                <b className="text-ink">community bucket</b>. Every merged
                report raises its priority.
              </>
            )
          ) : hi ? (
            <>
              आपकी समस्या पाइपलाइन में है। एआई वर्गीकरण और प्राथमिकता निर्धारण
              पूर्ण — सत्यापन के बाद इसे सही विश्वविद्यालय तक भेजा जाएगा।
            </>
          ) : (
            <>
              Your problem is now in the pipeline. AI classification and
              prioritisation are complete — after validation it will be routed
              to the right university.
            </>
          )}
        </p>
        <div className="mt-6 bg-card border border-ink/10 rounded-md p-5 text-left max-w-md mx-auto shadow-[5px_5px_0_rgba(11,44,33,0.07)]">
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-ink-soft">
            {merged
              ? hi
                ? "बकेट आईडी"
                : "Bucket ID"
              : hi
                ? "ट्रैकिंग आईडी"
                : "Tracking ID"}
          </p>
          <p className="font-display font-extrabold text-2xl text-pine-800 tabular mt-1">
            {doneId}
          </p>
          <p className="text-[12px] font-semibold text-ink-soft mt-2">
            {hi
              ? "इस आईडी से आप किसी भी समय स्थिति देख सकते हैं।"
              : "Use this ID any time to check live status of the problem."}
          </p>
        </div>
        {!merged && doneProblem?.qr_image && (
          <ProblemQRCode problem={doneProblem} />
        )}
        <button
          onClick={() => {
            onReset?.();
            setDoneId(null);
            setTitle("");
            setDesc("");
            setPhotos([]);
            setDocs([]);
            setGeo(null);
            setGeoSource(null);
            setGeoOutside(false);
            setBlock("");
            setAddress("");
            setThink(null);
          }}
          className="mt-7 inline-flex items-center gap-2 bg-marigold-500 hover:bg-marigold-400 text-pine-925 font-extrabold text-sm px-6 py-3 rounded-sm shadow-[4px_4px_0_rgba(11,44,33,0.9)] hover:-translate-y-0.5 transition-all"
        >
          <Icon name="plus" className="w-4 h-4" sw={2.5} />{" "}
          {hi ? "एक और समस्या दर्ज करें" : "Report another problem"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Form */}
      <div className="lg:col-span-3 bg-card border border-ink/10 rounded-md p-6 shadow-[6px_6px_0_rgba(11,44,33,0.08)]">
        <h2 className="font-display font-extrabold text-2xl tracking-tight text-ink">
          {t("submit_title")}
        </h2>
        <p className="text-[13px] font-semibold text-ink-soft mt-1.5 leading-relaxed">
          {t("submit_sub")}
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <FormField label={t("your_name")} err={errs.name}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inpCls(errs.name)}
              placeholder={hi ? "जैसे: सुनीता देवी" : "e.g. Sunita Devi"}
            />
          </FormField>
          <FormField label={t("phone")}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inpCls(false)}
              placeholder="98xxxxxxxx"
            />
          </FormField>
          <FormField label={t("i_am")} className="sm:col-span-2">
            <select
              value={who}
              onChange={(e) => setWho(e.target.value)}
              className={inpCls(false) + " cursor-pointer"}
            >
              {SUBMIT_TYPES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </FormField>
          <FormField
            label={t("ch_title")}
            err={errs.title}
            className="sm:col-span-2"
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inpCls(errs.title)}
              placeholder={
                hi
                  ? "जैसे: बरसात में सड़क पर पानी भर जाता है"
                  : "e.g. Main road waterlogs every monsoon"
              }
            />
          </FormField>
          <label className="sm:col-span-2 inline-flex items-center gap-2 text-xs font-bold text-ink-soft cursor-pointer">
            <input
              type="checkbox"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="h-4 w-4 accent-pine-800"
            />
            {hi
              ? "Testing mode: workflow check के लिए fake problem allow करें"
              : "Testing mode: allow a fake problem for workflow checking"}
          </label>
          <div className="sm:col-span-2 grid sm:grid-cols-3 gap-3 mt-1">
            <FormField label={hi ? "क्या हो रहा है?" : "What is happening?"}>
              <input
                value={whatHappening}
                onChange={(e) => setWhatHappening(e.target.value)}
                className={inpCls(false)}
                placeholder={
                  hi ? "जैसे: सड़क पर पानी भर रहा है" : "e.g. Water is overflowing on the road"
                }
              />
            </FormField>
            <FormField label={hi ? "कब से हो रहा है?" : "Since when?"}>
              <input
                value={sinceWhen}
                onChange={(e) => setSinceWhen(e.target.value)}
                className={inpCls(false)}
                placeholder={hi ? "जैसे: 3 दिन से" : "e.g. 3 days"}
              />
            </FormField>
            <FormField
              label={hi ? "कितने लोग प्रभावित हैं?" : "How many are affected?"}
            >
              <input
                value={affectedPeople}
                onChange={(e) => setAffectedPeople(e.target.value)}
                className={inpCls(false)}
                placeholder={hi ? "जैसे: 120 लोग" : "e.g. 120 people"}
              />
            </FormField>
          </div>

          <FormField
            label={t("ch_desc")}
            err={errs.desc}
            className="sm:col-span-2"
          >
            <div
              className={cx(
                "relative",
                inpCls(errs.desc),
                "p-0 focus-within:border-marigold-500",
              )}
            >
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                placeholder={
                  hi
                    ? "Observed condition, affected area, measurements, nearby landmark… जैसे: सड़क पर 1 फीट पानी, 200 मीटर तक प्रभावित, 8 सेमी गड्ढा, स्कूल के पास" 
                    : "Observed condition, affected area, measurements, nearby landmark… e.g. Water on road 1 ft deep, 200 m affected, 8 cm pothole near school gate"
                }
                className="w-full bg-transparent p-3 text-sm font-medium outline-none resize-none placeholder:text-ink-soft/60"
              />
              <button
                onClick={voice}
                aria-label="Voice input"
                className={cx(
                  "absolute right-2.5 bottom-2.5 inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1.5 rounded-sm border transition-all",
                  mic
                    ? "bg-brick-500 text-paper border-brick-600"
                    : "bg-pine-100 text-pine-800 border-pine-700/30 hover:bg-pine-800 hover:text-paper",
                )}
              >
                {mic ? (
                  <span className="wavebar">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  <Icon name="mic" className="w-3.5 h-3.5" sw={2.2} />
                )}
                {mic
                  ? hi
                    ? "सुन रहे हैं…"
                    : "Listening…"
                  : hi
                    ? "बोलकर बताएं"
                    : "Speak"}
              </button>
            </div>
          </FormField>
          <FormField label={t("ch_district")} err={errs.district}>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className={inpCls(errs.district) + " cursor-pointer"}
            >
              <option value="">{hi ? "ज़िला चुनें" : "Select district"}</option>
              {DISTRICTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t("ch_block")}>
            <input
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className={inpCls(false)}
              placeholder={hi ? "प्रखण्ड / वार्ड" : "Block / ward"}
            />
          </FormField>
          <FormField
            label={
              hi ? "समस्या का पता / Landmark" : "Problem address / landmark"
            }
            className="sm:col-span-2"
          >
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inpCls(false)}
              placeholder={
                hi
                  ? "गली, गांव, मोहल्ला, landmark…"
                  : "Street, village, locality, landmark…"
              }
            />
          </FormField>
        </div>

        {/* Location */}
        <div className="mt-4 rounded-md border border-ink/10 bg-paper/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-soft">
                {hi ? "समस्या का स्थान" : "Problem location"}
              </p>
              <p className="text-[11.5px] font-semibold text-ink-soft mt-1">
                {hi
                  ? "झारखंड में हों तो वास्तविक GPS लिया जाएगा। बाहर हों या GPS उपलब्ध न हो तो चुने गए ज़िले/ब्लॉक के आधार पर अनुमानित स्थान map होगा।"
                  : "Inside Jharkhand, real GPS is used. Outside Jharkhand or when GPS is unavailable, the selected district/block is used for an approximate map location."}
              </p>
            </div>
            <button
              onClick={locate}
              className="inline-flex items-center gap-2 border-2 border-pine-800 text-pine-800 hover:bg-pine-800 hover:text-paper font-extrabold text-[12.5px] px-3.5 py-2 rounded-sm transition-all"
            >
              <Icon name="pin" className="w-4 h-4" sw={2.2} />
              {geoBusy
                ? hi
                  ? "स्थान खोजा जा रहा है…"
                  : "Locating…"
                : hi
                  ? "GPS जाँचें"
                  : "Check GPS"}
            </button>
            <button
              onClick={geocodeProblemAddress}
              disabled={geoBusy}
              className="inline-flex items-center gap-2 border border-marigold-600 text-marigold-800 hover:bg-marigold-500/10 font-extrabold text-[12.5px] px-3.5 py-2 rounded-sm transition-all"
            >
              <Icon name="search" className="w-4 h-4" sw={2.2} />
              {hi ? "पते से समस्या locate करें" : "Locate problem by address"}
            </button>
          </div>
          {geo && (
            <div
              className={cx(
                "mt-3 inline-flex flex-wrap items-center gap-1.5 text-[12px] font-extrabold tabular px-2.5 py-1.5 rounded-sm",
                geoSource === "gps"
                  ? "text-pine-800 bg-pine-100/70 border border-pine-700/25"
                  : "text-marigold-800 bg-marigold-500/10 border border-marigold-500/30",
              )}
            >
              <Icon
                name={geoSource === "gps" ? "check" : "pin"}
                className="w-3.5 h-3.5"
                sw={2.6}
              />
              {geoSource === "gps"
                ? hi
                  ? "वास्तविक GPS स्थान"
                  : "Real GPS location"
                : geoSource === "address"
                  ? hi
                    ? "पते से map किया गया स्थान"
                    : "Address-mapped problem location"
                  : hi
                    ? "ज़िला/ब्लॉक आधारित अनुमानित स्थान"
                    : "District/block-based approximate location"}{" "}
              · {geo.lat.toFixed(5)}°N, {geo.lng.toFixed(5)}°E
              {geoSource === "gps" && geo.accuracy
                ? ` · ±${geo.accuracy}m`
                : ""}
            </div>
          )}
          {geoOutside && geoSource === "district" && (
            <p className="mt-2 text-[11px] font-bold text-marigold-800">
              {hi
                ? `आपका GPS झारखंड के बाहर है; रिपोर्ट ${district || "चयनित ज़िले"} के अनुमानित स्थान पर map होगी${block ? ` · ${block}` : ""}।`
                : `Your GPS is outside Jharkhand; the report will be mapped approximately to ${district || "the selected district"}${block ? ` · ${block}` : ""}.`}
            </p>
          )}
          {!geo && errs.geo && (
            <span className="block mt-2 text-[11px] font-extrabold text-brick-600">
              {hi
                ? "समस्या का ज़िला चुनें; GPS उपलब्ध न होने पर उसी ज़िले के आधार पर स्थान दिखाया जाएगा।"
                : "Select the problem district; if GPS is unavailable, the map will use that district as the location."}
            </span>
          )}
        </div>

        {/* Evidence */}
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-soft mb-2 flex items-center gap-1.5">
              <Icon name="camera" className="w-4 h-4" sw={2} />
              {t("photos")}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-ink/25 hover:border-marigold-500 hover:bg-marigold-500/5 rounded-sm p-4 text-center transition-colors group"
            >
              <Icon
                name="upload"
                className="w-6 h-6 mx-auto text-ink-soft group-hover:text-marigold-600 transition-colors"
              />
              <p className="text-[12px] font-bold text-ink-soft mt-1.5">
                {hi ? "फोटो / वीडियो जोड़ें" : "Attach photos / video"}
              </p>
            </button>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {photos.map((p, i) => (
                  <div
                    key={i}
                    className="relative w-16 h-16 rounded-sm overflow-hidden border border-ink/15 rise-in"
                  >
                    <img
                      src={p.src}
                      alt={`Evidence ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setPhotos((ph) => ph.filter((_, j) => j !== i))
                      }
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-pine-925/85 text-paper rounded-sm flex items-center justify-center"
                      aria-label="Remove"
                    >
                      <Icon name="close" className="w-2.5 h-2.5" sw={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-soft mb-2 flex items-center gap-1.5">
              <Icon name="doc" className="w-4 h-4" sw={2} />
              {t("docs")}
            </p>
            <label className="block w-full border-2 border-dashed border-ink/25 hover:border-marigold-500 hover:bg-marigold-500/5 rounded-sm p-4 text-center transition-colors group cursor-pointer">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
              <Icon
                name="doc"
                className="w-6 h-6 mx-auto text-ink-soft group-hover:text-marigold-600 transition-colors"
              />
              <p className="text-[12px] font-bold text-ink-soft mt-1.5">
                {hi ? "रिपोर्ट, आवेदन, डेटा…" : "Reports, applications, data…"}
              </p>
            </label>
            {docs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {docs.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-steel-500 bg-steel-500/8 border border-steel-500/25 px-2 py-1 rounded-sm rise-in"
                  >
                    <Icon name="doc" className="w-3.5 h-3.5" sw={2} />
                    {d}
                    <button
                      onClick={() => setDocs((dd) => dd.filter((x) => x !== d))}
                      aria-label="Remove document"
                    >
                      <Icon name="close" className="w-2.5 h-2.5" sw={3} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Severity */}
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-soft mt-5 mb-2">
          {t("severity")}
        </p>
        <div className="flex flex-wrap gap-2">
          {[t("sev_low"), t("sev_med"), t("sev_high")].map((s, i) => (
            <button
              key={s}
              onClick={() => setSev(i)}
              className={cx(
                "px-3.5 py-2 rounded-sm text-[12.5px] font-bold border-2 transition-all",
                sev === i
                  ? "border-pine-800 bg-pine-800 text-paper shadow-[3px_3px_0_rgba(239,170,43,0.8)]"
                  : "border-ink/15 text-ink-soft hover:border-pine-700",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Bucket / duplicate gate */}
        {strongDup && (
          <div className="mt-5 border-2 border-marigold-500 bg-marigold-500/10 rounded-md p-4 rise-in">
            <p className="flex items-center gap-2 font-extrabold text-[13px] text-marigold-700">
              <Icon name="bucket" className="w-5 h-5" sw={2.2} />
              {hi
                ? "AI ने इसी क्षेत्र की मिलती-जुलती समस्या पाई"
                : "AI found a matching problem in this area"}
            </p>
            <div className="mt-2.5 bg-card border border-marigold-500/40 rounded-sm p-3">
              <p className="text-[13px] font-extrabold text-ink leading-snug">
                {strongDup.c.title}
              </p>
              <p className="text-[11.5px] font-bold text-ink-soft mt-1">
                {strongDup.c.id} · {strongDup.c.district} · {strongDup.sim}%{" "}
                {t("match")} ·{" "}
                <span className="tabular">
                  {strongDup.c.reports ?? 1} {t("merged_reports")}
                </span>{" "}
                ·{" "}
                <span className="tabular">
                  {strongDup.c.votes} {t("votes")}
                </span>
              </p>
            </div>
            <p className="text-[12px] font-semibold text-ink-soft mt-2">
              {hi
                ? "एक ही क्षेत्र की कई रिपोर्टें एक बकेट में जुड़ती हैं — ताक़त बढ़ती है, दोहराव नहीं।"
                : "Many reports of the same area merge into one bucket — louder together, no duplication."}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => submit("merged")}
                className="inline-flex items-center gap-1.5 bg-pine-800 hover:bg-pine-700 text-paper font-extrabold text-[12.5px] px-3.5 py-2 rounded-sm transition-colors"
              >
                <Icon name="bucket" className="w-4 h-4" sw={2.2} />
                {hi
                  ? "इसी बकेट में जोड़ें (समर्थन +1)"
                  : "Join this bucket (+1 support)"}
              </button>
              <button
                onClick={() => submit("new")}
                className="inline-flex items-center gap-1.5 border-2 border-ink/20 hover:border-pine-800 text-ink font-bold text-[12.5px] px-3.5 py-2 rounded-sm transition-colors"
              >
                {hi
                  ? "अलग समस्या के रूप में दर्ज करें"
                  : "Submit as separate problem"}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => submit("new")}
          disabled={!!strongDup}
          className={cx(
            "mt-6 w-full inline-flex items-center justify-center gap-2 font-extrabold text-[15px] py-3.5 rounded-sm transition-all",
            strongDup
              ? "bg-ink/10 text-ink-soft cursor-not-allowed"
              : "bg-pine-800 hover:bg-pine-700 text-paper shadow-[5px_5px_0_rgba(239,170,43,0.9)] hover:shadow-[7px_7px_0_rgba(239,170,43,0.9)] hover:-translate-y-0.5",
          )}
        >
          <Icon name="send" className="w-5 h-5" sw={2.2} />
          {t("submit_now")}
        </button>
        {strongDup && (
          <p className="text-center text-[11.5px] font-bold text-marigold-700 mt-2">
            {hi
              ? "पहले ऊपर बकेट विकल्प चुनें"
              : "Choose a bucket option above first"}
          </p>
        )}
      </div>

      {/* AI copilot */}
      <div className="lg:col-span-2">
        <div className="bg-pine-925 text-paper rounded-md p-5 sticky top-24 shadow-[6px_6px_0_rgba(11,44,33,0.2)] relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border-[10px] border-marigold-500/12" />
          <p className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-marigold-300 flex items-center gap-2">
            <Icon name="spark" className="w-4 h-4" sw={2} />
            {t("ai_copilot")}
            {thinking && (
              <span className="ml-auto text-[10px] shimmer text-marigold-200 font-bold px-1.5 py-0.5 rounded-sm">
                {t("ai_thinking")}
              </span>
            )}
          </p>

          {!think && !thinking && (
            <div className="mt-5 space-y-4 text-paper/75">
              <p className="text-[13px] font-medium leading-relaxed">
                {hi
                  ? "जैसे ही आप लिखेंगे, एआई यह सब तुरंत करेगा:"
                  : "As you type, the AI will instantly:"}
              </p>
              {[
                [
                  "spark",
                  hi
                    ? "10 विषयों में स्वतः वर्गीकरण"
                    : "Auto-classify into 10 thematic domains",
                ],
                [
                  "flag",
                  hi
                    ? "तात्कालिकता व प्राथमिकता स्कोर"
                    : "Score urgency & priority",
                ],
                [
                  "bucket",
                  hi
                    ? "उसी क्षेत्र की रिपोर्टें खोजकर बकेट बनाना"
                    : "Find same-area reports to bucket them",
                ],
                [
                  "edu",
                  hi
                    ? "सही विश्वविद्यालय का मिलान"
                    : "Match the right university",
                ],
              ].map(([ic, s]) => (
                <p
                  key={s}
                  className="flex items-center gap-2.5 text-[12.5px] font-semibold"
                >
                  <span className="w-7 h-7 rounded-sm bg-paper/8 border border-paper/12 flex items-center justify-center shrink-0">
                    <Icon
                      name={ic}
                      className="w-3.5 h-3.5 text-marigold-400"
                      sw={2}
                    />
                  </span>
                  {s}
                </p>
              ))}
            </div>
          )}

          <div className="mt-5 border-t border-paper/10 pt-4">
            <p className="text-[12px] font-extrabold text-marigold-300">
              {hi ? "समाधान मित्र से पूछें" : "Ask Samadhan Mitra"}
            </p>
            <div className="flex gap-2 mt-2">
              <input
                value={mitraQuestion}
                onChange={(e) => setMitraQuestion(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && mitraQuestion.trim()) {
                    setMitraBusy(true);
                    try {
                      const r = await api.chat(mitraQuestion, lang, {
                        title,
                        description: desc,
                        district,
                        block,
                      });
                      setMitraReply(r.reply);
                    } catch {
                      setMitraReply(
                        hi
                          ? "अभी AI सेवा उपलब्ध नहीं है। कृपया फिर प्रयास करें।"
                          : "AI service is temporarily unavailable. Please try again.",
                      );
                    } finally {
                      setMitraBusy(false);
                    }
                  }
                }}
                placeholder={
                  hi ? "अपनी समस्या पूछें..." : "Ask about your problem..."
                }
                className="min-w-0 flex-1 bg-paper/10 border border-paper/20 rounded-sm px-3 py-2 text-[12px] text-paper outline-none"
              />
              <button
                disabled={mitraBusy || !mitraQuestion.trim()}
                onClick={async () => {
                  setMitraBusy(true);
                  try {
                    const r = await api.chat(mitraQuestion, lang, {
                      title,
                      description: desc,
                      district,
                      block,
                    });
                    setMitraReply(r.reply);
                  } catch {
                    setMitraReply(
                      hi
                        ? "अभी AI सेवा उपलब्ध नहीं है।"
                        : "AI service is temporarily unavailable.",
                    );
                  } finally {
                    setMitraBusy(false);
                  }
                }}
                className="px-3 py-2 bg-marigold-500 text-pine-950 rounded-sm text-[11px] font-extrabold"
              >
                {mitraBusy ? "..." : "Ask"}
              </button>
            </div>
            {mitraReply && (
              <p className="mt-2 text-[12px] leading-relaxed bg-paper/5 border border-paper/10 rounded-sm p-2.5">
                {mitraReply}
              </p>
            )}
          </div>

          {think && (
            <div className="mt-5 space-y-4 fade-in">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-moss-400 mb-2">
                  {t("detected_domain")}
                </p>
                <div className="space-y-2">
                  {think.cls.ranked.map((r) => {
                    const d = domainById(r.id);
                    return (
                      <div key={r.id} className="flex items-center gap-2.5">
                        <span
                          className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0"
                          style={{ background: d.color + "26", color: d.color }}
                        >
                          <Icon name={d.icon} className="w-4 h-4" sw={2} />
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between text-[12px] font-bold">
                            <span>{hi ? d.hi : d.en}</span>
                            <span className="tabular text-marigold-300">
                              {r.conf}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-paper/10 overflow-hidden mt-1">
                            <div
                              className="h-full rounded-full donut-seg"
                              style={{
                                width: `${r.conf}%`,
                                background: d.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 bg-paper/5 border border-paper/12 rounded-sm p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-moss-400">
                    {hi ? "भेजा जाएगा" : "Will be routed to"}
                  </p>
                  <p className="text-[12.5px] font-extrabold text-paper mt-0.5">
                    {think.dept}
                  </p>
                </div>
              </div>
              <div className="bg-paper/5 border border-paper/12 rounded-sm p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-moss-400">
                  {hi ? "AI निर्णय: कहाँ भेजना है" : "AI routing decision"}
                </p>
                <p className="text-[13px] font-extrabold text-paper mt-1">
                  {String(
                    (think as any).routing_decision ?? "city_government",
                  ).replace(/_/g, " → ")}
                </p>
                <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-bold">
                  <span className="px-2 py-1 rounded bg-paper/8">
                    Government:{" "}
                    {(think as any).requires_government ? "YES" : "NO"}
                  </span>
                  <span className="px-2 py-1 rounded bg-paper/8">
                    University:{" "}
                    {(think as any).requires_university ? "YES" : "NO"}
                  </span>
                  <span className="px-2 py-1 rounded bg-paper/8">
                    Investment:{" "}
                    {(think as any).requires_investment ? "YES" : "NO"}
                  </span>
                </div>
                <p className="text-[11px] text-paper/65 mt-2">
                  {String((think as any).routing_reason ?? "")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-paper/5 border border-paper/12 rounded-sm p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-moss-400">
                    {t("urgency_score")}
                  </p>
                  <p
                    className="font-display font-extrabold text-2xl tabular mt-1"
                    style={{ color: think.urg >= 70 ? "#F3B841" : "#E9EFE4" }}
                  >
                    {think.urg}
                    <span className="text-xs text-paper/60">/100</span>
                  </p>
                </div>
                <div className="bg-paper/5 border border-paper/12 rounded-sm p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-moss-400">
                    {t("priority")}
                  </p>
                  <p className="font-display font-extrabold text-2xl tabular mt-1 text-marigold-300">
                    {think.pri}
                    <span className="text-xs text-paper/60">/100</span>
                  </p>
                </div>
              </div>
              <div className="bg-paper/5 border border-paper/12 rounded-sm p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-moss-400 flex items-center gap-1.5">
                  <Icon name="bucket" className="w-3.5 h-3.5" sw={2.2} />
                  {t("duplicate_scan")}
                </p>
                {think.dup ? (
                  <p className="text-[12px] font-semibold mt-1.5 leading-snug">
                    {hi
                      ? `${think.dup.sim}% मिलान:`
                      : `${think.dup.sim}% match:`}{" "}
                    <span
                      className={
                        think.dup.sim >= 45
                          ? "text-marigold-300 font-extrabold"
                          : ""
                      }
                    >
                      {think.dup.c.title}
                    </span>
                    {think.dup.sim >= 45 && (
                      <span className="block text-[11px] text-marigold-200/90 mt-1">
                        →{" "}
                        {hi
                          ? "बकेट में जोड़ने की सिफ़ारिश"
                          : "Recommended to join this bucket"}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-[12px] font-semibold mt-1.5 text-moss-400">
                    {hi
                      ? "कोई दोहराव नहीं मिला — नई समस्या"
                      : "No duplicates found — new problem"}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-moss-400 mb-2">
                  {t("likely_route")}
                </p>
                {think.routes.map((r) => (
                  <div
                    key={r.uni.id}
                    className="flex items-center gap-2.5 py-1.5"
                  >
                    <span className="w-7 h-7 rounded-sm bg-marigold-500/15 text-marigold-300 font-display font-extrabold text-[9px] flex items-center justify-center shrink-0">
                      {r.uni.short
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 3)
                        .join("")}
                    </span>
                    <span className="flex-1 text-[12px] font-bold truncate">
                      {r.uni.name}
                    </span>
                    <span className="tabular text-[11.5px] font-extrabold text-marigold-300">
                      {r.match}% {t("match")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inpCls = (err?: boolean) =>
  cx(
    "w-full bg-paper border rounded-sm px-3 py-2.5 text-sm font-medium outline-none transition-colors placeholder:text-ink-soft/50",
    err
      ? "border-brick-500 bg-brick-500/5"
      : "border-ink/15 focus:border-marigold-500",
  );

function FormField({
  label,
  err,
  className = "",
  children,
}: {
  label: string;
  err?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cx("block", className)}>
      <span
        className={cx(
          "text-[11px] font-extrabold uppercase tracking-[0.14em]",
          err ? "text-brick-600" : "text-ink-soft",
        )}
      >
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

/* ============================================================================
   CITIZEN DESK — submit + track my problems
   ==========================================================================*/
function CitizenProblemMap({
  challenges,
  session,
  patch,
  toast,
  hi,
}: {
  challenges: Challenge[];
  session: Session;
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  toast: (m: string) => void;
  hi: boolean;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);
  const [selected, setSelected] = useState<Challenge | null>(null);
  const valid = challenges.filter(
    (c) => Number.isFinite(c.lat) && Number.isFinite(c.lng),
  );
  useEffect(() => {
    if (!mapRef.current || typeof L === "undefined") return;
    if (mapObj.current) {
      mapObj.current.remove();
      mapObj.current = null;
    }
    const center = valid.length ? [valid[0].lat, valid[0].lng] : [23.37, 85.33];
    const map = L.map(mapRef.current).setView(center, valid.length ? 7 : 6);
    mapObj.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    valid.forEach((c) => {
      const score = c.verification?.score ?? 0;
      const color =
        score >= 75 ? "#2E7D4F" : score >= 50 ? "#DE9B12" : "#C64456";
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 1px 6px rgba(0,0,0,.45)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker([c.lat, c.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<b>${c.title.replace(/</g, "&lt;")}</b><br/>${c.location_source === "browser_gps" ? "Exact GPS location" : c.location_source === "address_geocode" ? "Address-mapped problem location" : "Approximate district/block location"}<br/>Verification: ${score}/100`,
        )
        .on("click", () => setSelected(c));
    });
    return () => {
      map.remove();
      mapObj.current = null;
    };
  }, [challenges]);
  const decide = async (decision: "confirm" | "dispute") => {
    if (!selected) return;
    try {
      const v = await api.confirmProblem(selected.id, session, decision);
      patch(selected.id, (c) => ({
        ...c,
        verification: v,
        votes: decision === "confirm" ? c.votes + 1 : c.votes,
      }));
      setSelected((c) => (c ? { ...c, verification: v } : c));
      toast(
        decision === "confirm"
          ? hi
            ? "आपकी पुष्टि दर्ज हो गई"
            : "Your confirmation was recorded"
          : hi
            ? "आपकी आपत्ति समीक्षा के लिए दर्ज हुई"
            : "Your dispute was recorded for review",
      );
    } catch (e: any) {
      toast(e.message || "Could not record verification");
    }
  };
  const v = selected?.verification;
  return (
    <div className="grid lg:grid-cols-3 gap-6 view-in">
      <div className="lg:col-span-2 bg-card border border-ink/10 rounded-md overflow-hidden shadow-[6px_6px_0_rgba(11,44,33,0.08)]">
        <div className="p-5 border-b border-ink/10">
          <h2 className="font-display font-extrabold text-2xl text-ink flex items-center gap-2">
            <Icon name="globe" className="w-6 h-6 text-pine-800" />
            {hi
              ? "लाइव समस्या इंटेलिजेंस मैप"
              : "Live Problem Intelligence Map"}
          </h2>
          <p className="text-[12.5px] font-semibold text-ink-soft mt-1">
            {hi
              ? "रंग: हरा = उच्च विश्वसनीयता, पीला = समीक्षा, लाल = कम विश्वसनीयता"
              : "Green = highly credible, yellow = under review, red = low confidence."}
          </p>
        </div>
        <div ref={mapRef} style={{ height: 560, width: "100%" }} />
      </div>
      <div className="bg-card border border-ink/10 rounded-md p-5 shadow-[6px_6px_0_rgba(11,44,33,0.08)]">
        {!selected ? (
          <div className="text-center py-12 text-ink-soft">
            <Icon name="pin" className="w-10 h-10 mx-auto" />
            <p className="font-bold mt-3">
              {hi
                ? "विवरण देखने के लिए मानचित्र पर मार्कर चुनें"
                : "Click a map marker to inspect and verify a problem"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
              {selected.id}
            </p>
            <h3 className="font-display font-bold text-lg text-ink mt-1">
              {selected.title}
            </h3>
            <div className="mt-4 p-4 rounded-sm bg-pine-100/60 border border-pine-700/20">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-pine-800">
                {hi ? "सत्यापन स्कोर" : "Verification score"}
              </p>
              <p className="font-display font-extrabold text-4xl text-pine-800 mt-1">
                {v?.score ?? 0}
                <span className="text-base">/100</span>
              </p>
              <p className="text-[12px] font-bold text-ink-soft mt-2">
                GPS + description + evidence + nearby reports + community
                confirmation
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-[12px] font-bold">
              <div className="p-2 border border-ink/10 rounded-sm">
                Confirm: {v?.confirmations ?? 0}
              </div>
              <div className="p-2 border border-ink/10 rounded-sm">
                Dispute: {v?.disputes ?? 0}
              </div>
            </div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-soft mt-5">
              {hi ? "समुदाय सत्यापन" : "Community verification"}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => decide("confirm")}
                className="flex-1 bg-pine-800 text-paper font-extrabold text-[12px] py-2.5 rounded-sm"
              >
                ✓ {hi ? "पुष्टि" : "Confirm"}
              </button>
              <button
                onClick={() => decide("dispute")}
                className="flex-1 border-2 border-brick-500 text-brick-600 font-extrabold text-[12px] py-2 rounded-sm"
              >
                {hi ? "आपत्ति" : "Dispute"}
              </button>
            </div>
            {(v?.duplicates?.length ?? 0) > 0 && (
              <div className="mt-5">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-soft">
                  {hi ? "पास की समान रिपोर्ट" : "Nearby similar reports"}
                </p>
                {v!.duplicates!.slice(0, 4).map((d) => (
                  <div
                    key={d.id}
                    className="mt-2 p-2.5 bg-paper border border-ink/10 rounded-sm text-[11px]"
                  >
                    <b>{d.title}</b>
                    <br />
                    <span className="text-ink-soft">
                      {d.distance_km} km · {d.similarity}% similar
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProblemQRCode({
  problem,
  compact = false,
}: {
  problem: Challenge;
  compact?: boolean;
}) {
  if (!problem.qr_image || !problem.qr_url) return null;
  const downloadQr = () => {
    const a = document.createElement("a");
    a.href = problem.qr_image!;
    a.download = `${problem.id}-QR.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const printQr = () => {
    const w = window.open("", "_blank", "width=520,height=720");
    if (!w) return;
    w.document.write(
      `<html><head><title>${problem.id} QR</title></head><body style="font-family:Arial;text-align:center;padding:32px"><h2>Samadhan Setu</h2><p>${problem.id}</p><img src="${problem.qr_image}" style="width:320px;height:320px"/><p>Scan to open this problem</p></body></html>`,
    );
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  };
  return (
    <div
      className={cx(
        "rounded-md border border-marigold-500/35 bg-marigold-500/10",
        compact ? "p-3 mt-3" : "p-5 mt-6",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-pine-800">
            Problem QR Scanner
          </p>
          <p className="text-[12px] font-semibold text-ink-soft mt-1">
            Scan this code to open the problem directly.
          </p>
        </div>
        <span className="font-mono text-[11px] font-bold text-pine-800">
          {problem.id}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
        <div className="bg-white p-3 rounded-md border border-ink/10 shadow-sm">
          <img
            src={problem.qr_image}
            alt={`QR code for ${problem.id}`}
            className={compact ? "w-32 h-32" : "w-44 h-44"}
          />
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <a
            href={problem.qr_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-pine-800 text-paper font-extrabold text-[12px] px-3 py-2 rounded-sm"
          >
            Open problem page
          </a>
          <button
            onClick={downloadQr}
            className="inline-flex items-center justify-center gap-2 border border-ink/20 bg-card text-ink font-extrabold text-[12px] px-3 py-2 rounded-sm"
          >
            Download QR
          </button>
          <button
            onClick={printQr}
            className="inline-flex items-center justify-center gap-2 border border-ink/20 bg-card text-ink font-extrabold text-[12px] px-3 py-2 rounded-sm"
          >
            Print QR
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportCenter({
  challenges,
  session,
  patch,
  toast,
  hi,
}: {
  challenges: Challenge[];
  session: Session;
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  toast: (m: string) => void;
  hi: boolean;
}) {
  const desk = session.cityDesk || session.city_desk;
  const isFieldOfficer =
    session.role === "field_verifier" ||
    session.role === "field_officer" ||
    desk === "field_verification_officer";
  const reportable = challenges.filter((c) => {
    if (isFieldOfficer)
      return (
        ["field_verification", "re_verification"].includes(c.stage) &&
        (c.assigned_to?.user_id === session.id ||
          desk === "field_verification_officer")
      );
    return (
      c.assigned_to?.user_id === session.id || desk === "department_officer"
    );
  });
  const [selectedId, setSelectedId] = useState(reportable[0]?.id ?? "");
  const [report, setReport] = useState("");
  const selected = reportable.find((c) => c.id === selectedId);

  useEffect(() => {
    if (!selectedId && reportable[0]) setSelectedId(reportable[0].id);
    const current = reportable.find((c) => c.id === selectedId);
    setReport(
      isFieldOfficer ? (current?.field_verification?.description ?? "") : "",
    );
  }, [selectedId, reportable.length]);

  const submitReport = () => {
    if (!selected) {
      toast(hi ? "पहले समस्या चुनें" : "Select a problem first");
      return;
    }
    if (report.trim().length < 10) {
      toast(
        hi
          ? "कम से कम 10 अक्षरों की रिपोर्ट लिखें"
          : "Write a report of at least 10 characters",
      );
      return;
    }
    const now = new Date().toLocaleString("en-IN");
    patch(selected.id, (c) =>
      isFieldOfficer
        ? {
            ...c,
            field_report: {
              visit_date: now,
              lat: c.lat,
              lng: c.lng,
              description: report.trim(),
              photos: c.field_verification?.photos ?? [],
              submitted_by: session.name,
            },
            field_verification: {
              verified_by: session.name,
              date: now,
              description: report.trim(),
              photos: c.field_verification?.photos ?? [],
              status: "needs_review",
            },
            updates: [
              ...c.updates,
              {
                stage: "field_verification",
                time: now,
                note: `Field report submitted by ${session.name}: ${report.trim()}`,
              },
            ],
          }
        : {
            ...c,
            department_reports: [
              ...(c.department_reports || []),
              {
                submitted_by: session.name,
                date: now,
                description: report.trim(),
              },
            ],
            citizen_updates: [
              ...(c.citizen_updates || []),
              { message: report.trim(), time: now, by: session.name },
            ],
            updates: [
              ...c.updates,
              {
                stage: c.stage,
                time: now,
                note: `Department work report submitted by ${session.name}: ${report.trim()}`,
              },
            ],
          },
    );
    toast(
      hi ? "रिपोर्ट सफलतापूर्वक जमा हो गई" : "Report submitted successfully",
    );
    setReport("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 view-in">
      <div className="max-w-4xl mx-auto">
        <div className="bg-pine-925 text-paper rounded-md p-6 md:p-8 mb-6 shadow-[6px_6px_0_rgba(11,44,33,0.16)]">
          <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-marigold-300">
            {isFieldOfficer
              ? "Field report center"
              : "Department report center"}
          </p>
          <h1 className="font-display font-extrabold text-3xl mt-2">
            {isFieldOfficer
              ? "Submit field verification report"
              : "Submit work report"}
          </h1>
          <p className="text-paper/70 text-sm mt-2">
            {isFieldOfficer
              ? "Record what you observed at the problem location."
              : "Share progress, action taken, or a blocker for the assigned problem."}
          </p>
        </div>
        <div className="bg-card border border-ink/10 rounded-md p-5 md:p-6">
          <label
            className="block text-xs font-extrabold uppercase tracking-widest text-ink-soft"
            htmlFor="report-problem"
          >
            Problem
          </label>
          <select
            id="report-problem"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="mt-2 w-full rounded-sm border border-ink/15 bg-paper px-3 py-2.5 text-sm font-bold outline-none focus:border-pine-700"
          >
            <option value="">Select assigned problem</option>
            {reportable.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} · {c.title}
              </option>
            ))}
          </select>
          {selected && (
            <div className="mt-4 rounded-sm border border-ink/10 bg-paper p-3">
              <p className="font-display font-extrabold">{selected.title}</p>
              <p className="text-xs text-ink-soft mt-1">
                {selected.district} · {selected.block} · Priority{" "}
                {selected.priority}
              </p>
            </div>
          )}
          <label
            className="block mt-5 text-xs font-extrabold uppercase tracking-widest text-ink-soft"
            htmlFor="work-report"
          >
            {isFieldOfficer
              ? "Ground verification report"
              : "Work progress report"}
          </label>
          <textarea
            id="work-report"
            value={report}
            onChange={(event) => setReport(event.target.value)}
            rows={6}
            placeholder={
              isFieldOfficer
                ? "What did you observe at the site? Mention severity, measurements, affected people, and evidence."
                : "What work was completed? Mention progress, blockers, next action, and expected completion."
            }
            className="mt-2 w-full rounded-sm border border-ink/15 bg-paper p-3 text-sm outline-none focus:border-pine-700"
          />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={submitReport}
              disabled={!reportable.length}
              className="rounded-sm bg-pine-800 px-4 py-2.5 text-xs font-extrabold text-paper disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit report
            </button>
          </div>
          {!reportable.length && (
            <p className="mt-4 text-center text-sm text-ink-soft">
              No assigned problems are available for reporting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CityGovernmentDashboard({
  challenges,
  session,
  patch,
  toast,
  hi,
}: {
  challenges: Challenge[];
  session: Session;
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  toast: (m: string) => void;
  hi: boolean;
}) {
  const desk = session.cityDesk || session.city_desk || "city_admin";
  const department = session.cityDepartment || session.city_department;
  const departmentLabel = CITY_DEPARTMENTS.find(
    (item) => item.id === department,
  );
  const basePortal = CITY_PORTAL_PROFILES[desk];
  const portal =
    desk === "department_officer" && departmentLabel
      ? {
          ...basePortal,
          title: `${departmentLabel.en} Department Portal`,
          titleHi: `${departmentLabel.hi} विभाग पोर्टल`,
          kicker: `${departmentLabel.en} response desk`,
          kickerHi: `${departmentLabel.hi} response desk`,
        }
      : basePortal;
  const permissions = CITY_DESK_PERMISSIONS[desk];
  const [assignedOnly, setAssignedOnly] = useState(false);
  const [cityWorkers, setCityWorkers] = useState<
    {
      id: string;
      name: string;
      org: string;
      city_desk?: CityDesk;
      city_department?: CityDepartment;
    }[]
  >([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [receiveFilter, setReceiveFilter] = useState<
    "department" | "field" | "complaints"
  >("department");
  const [dashboardDetail, setDashboardDetail] = useState<
    "total" | "assigned" | "queue" | "resolved" | "overdue" | null
  >(null);
  const [selectedProblemStatus, setSelectedProblemStatus] = useState("New");
  const [slaTarget, setSlaTarget] = useState<Challenge | null>(null);
  const [slaDays, setSlaDays] = useState("7");
  const [assignTarget, setAssignTarget] = useState<Challenge | null>(null);
  const [assignDepartment, setAssignDepartment] = useState("");
  const [assignOfficerId, setAssignOfficerId] = useState("");
  const [workOrderTarget, setWorkOrderTarget] = useState<Challenge | null>(
    null,
  );
  const [workOrderStatus, setWorkOrderStatus] = useState<
    "started" | "in_progress" | "completed"
  >("started");
  const city = challenges.filter((c) => {
    if (c.stage === "government_review" && c.requires_government) return false;
    if (
      c.routing_decision !== "city_government" &&
      (c.routing_decision || c.domain !== "urban")
    )
      return false;
    const category = c.city_category
      ? cityCategoryById(c.city_category).id
      : cityCategoryFor(`${c.title} ${c.desc} ${c.department ?? ""}`).id;
    const assigned = c.assigned_to?.user_id === session.id;
    if (desk === "city_admin") return true;
    if (desk === "field_verification_officer")
      return (
        ["field_verification", "re_verification"].includes(c.stage) &&
        (assigned || cityDeskCanSeeCategory(desk, category))
      );
    if (desk === "department_officer")
      return (
        ["department_assignment", "work_order", "government_execution", "city_admin_review"].includes(
          c.stage,
        ) &&
        (assigned || cityDepartmentCanSeeProblem(department, c))
      );
    return assigned;
  });
  const tagged = city.map((c) => ({
    c,
    cat: c.city_category
      ? cityCategoryById(c.city_category)
      : cityCategoryFor(`${c.title} ${c.desc} ${c.department ?? ""}`),
  }));
  const getCityStatus = (c: Challenge) => {
    if (c.stage === "deployed") return "Resolved";
    if (c.resolution_proof) return "Resolution Proof";
    if (c.work_order) return "Work Order Created";
    if (c.assigned_to?.user_id) return "Assigned to Ward";
    if (c.stage === "city_government") return "Local Government Review";
    return "Submitted";
  };
  const openAll = tagged.filter((x) => x.c.stage !== "deployed");
  const resolvedAll = tagged.filter((x) => x.c.stage === "deployed");
  const [tab, setTab] = useState<"open" | "resolved">("open");
  const activeList = tab === "open" ? openAll : resolvedAll;
  const [activeCat, setActiveCat] = useState<string>("all");
  const scopedList = assignedOnly
    ? activeList.filter(({ c }) => c.assigned_to?.user_id === session.id)
    : activeList;
  const list =
    activeCat === "all"
      ? scopedList
      : scopedList.filter((x) => x.cat.id === activeCat);
  const overdue = city.filter(
    ({ stage, sla }) =>
      stage !== "deployed" &&
      Boolean(sla?.due_at && Date.now() > Date.parse(sla.due_at)),
  ).length;
  const assignedCount = city.filter(
    ({ assigned_to }) => assigned_to?.user_id === session.id,
  ).length;
  const adminMetrics = [
    ["Total Problems", city.length],
    [
      "New",
      tagged.filter(({ c }) => ["submitted", "ai_review"].includes(c.stage))
        .length,
    ],
    [
      "Under Verification",
      tagged.filter(
        ({ c }) =>
          c.stage === "field_verification" ||
          c.supervisor_approval?.status === "pending",
      ).length,
    ],
    [
      "Assigned",
      tagged.filter(({ c }) => Boolean(c.assigned_to?.user_id)).length,
    ],
    [
      "In Progress",
      tagged.filter(({ c }) => c.stage !== "deployed" && Boolean(c.work_order))
        .length,
    ],
    ["Overdue", overdue],
    ["Resolved", resolvedAll.length],
  ];
  const totalProblemsCount = city.length;
  const statusCards = [
    {
      label: "New",
      value: tagged.filter(({ c }) =>
        ["submitted", "ai_review"].includes(c.stage),
      ).length,
      color: "bg-sky-100 text-sky-700 border-sky-200",
      bar: "bg-sky-500",
    },
    {
      label: "Under Verification",
      value: tagged.filter(
        ({ c }) =>
          c.stage === "field_verification" ||
          c.supervisor_approval?.status === "pending",
      ).length,
      color: "bg-violet-100 text-violet-700 border-violet-200",
      bar: "bg-violet-500",
    },
    {
      label: "Assigned",
      value: tagged.filter(({ c }) => Boolean(c.assigned_to?.user_id)).length,
      color: "bg-amber-100 text-amber-700 border-amber-200",
      bar: "bg-amber-500",
    },
    {
      label: "In Progress",
      value: tagged.filter(
        ({ c }) => c.stage !== "deployed" && Boolean(c.work_order),
      ).length,
      color: "bg-cyan-100 text-cyan-700 border-cyan-200",
      bar: "bg-cyan-500",
    },
    {
      label: "Overdue",
      value: overdue,
      color: "bg-rose-100 text-rose-700 border-rose-200",
      bar: "bg-rose-500",
    },
    {
      label: "Resolved",
      value: resolvedAll.length,
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      bar: "bg-emerald-500",
    },
  ];
  const maxStatusValue = Math.max(1, ...statusCards.map((item) => item.value));
  const problemsForStatus = (label: string) =>
    city.filter((c) => {
      if (label === "New") return ["submitted", "ai_review"].includes(c.stage);
      if (label === "Under Verification")
        return (
          c.stage === "field_verification" ||
          c.supervisor_approval?.status === "pending"
        );
      if (label === "Assigned") return Boolean(c.assigned_to?.user_id);
      if (label === "In Progress")
        return c.stage !== "deployed" && Boolean(c.work_order);
      if (label === "Overdue")
        return (
          c.stage !== "deployed" &&
          Boolean(c.sla?.due_at && Date.now() > Date.parse(c.sla.due_at))
        );
      if (label === "Resolved") return c.stage === "deployed";
      return true;
    });
  const selectedStatusProblems = problemsForStatus(selectedProblemStatus);
  const [selectedManagementProblem, setSelectedManagementProblem] =
    useState<Challenge | null>(null);
  const receivedDepartmentReports = city.filter(
    (c) => (c.department_reports?.length ?? 0) > 0 || Boolean(c.department_resolution),
  );
  const receivedFieldReports = city.filter(
    (c) => Boolean(c.field_report || c.field_verification),
  );
  const receivedComplaints = city.filter(
    (c) =>
      Boolean(c.title && c.desc) &&
      Boolean(
        c.assigned_to?.user_id ||
          !["submitted", "ai_review"].includes(c.stage),
      ),
  );
  const receivedReports =
    receiveFilter === "department"
      ? receivedDepartmentReports
      : receiveFilter === "field"
        ? receivedFieldReports
        : receivedComplaints;
  const detailProblems =
    dashboardDetail === "assigned"
      ? city.filter((c) => c.assigned_to?.user_id === session.id)
      : dashboardDetail === "queue"
        ? openAll.map(({ c }) => c)
        : dashboardDetail === "resolved"
          ? resolvedAll.map(({ c }) => c)
          : dashboardDetail === "overdue"
            ? city.filter(
                (c) =>
                  c.stage !== "deployed" &&
                  Boolean(
                    c.sla?.due_at && Date.now() > Date.parse(c.sla.due_at),
                  ),
              )
            : selectedStatusProblems;
  const detailTitle =
    dashboardDetail === "assigned"
      ? portal.assignedLabel
      : dashboardDetail === "queue"
        ? portal.openLabel
        : dashboardDetail === "resolved"
          ? "Resolved"
          : dashboardDetail === "overdue"
            ? "Overdue"
            : "Total Problems";
  const exportCsv = () => {
    const rows = [
      [
        "ID",
        "Title",
        "District",
        "Block",
        "Department",
        "Priority",
        "Status",
        "SLA due",
      ],
      ...list.map(({ c }) => [
        c.id,
        c.title,
        c.district,
        c.block,
        c.department || "",
        String(c.priority),
        c.stage,
        c.sla?.due_at || "",
      ]),
    ];
    const blob = new Blob(
      [
        rows
          .map((row) =>
            row
              .map((value) => `"${String(value).replace(/"/g, '""')}"`)
              .join(","),
          )
          .join("\n"),
      ],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "city-government-problems.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Draft state for the "proof of resolution" form, keyed by challenge id so
  // multiple cards can be mid-edit without clobbering each other.
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [proofDesc, setProofDesc] = useState<Record<string, string>>({});
  const [beforeCondition, setBeforeCondition] = useState<Record<string, string>>({});
  const [materialsUsed, setMaterialsUsed] = useState<Record<string, string>>({});
  const [equipmentUsed, setEquipmentUsed] = useState<Record<string, string>>({});
  const [resolutionFunding, setResolutionFunding] = useState<Record<string, string>>({});
  const [completionDays, setCompletionDays] = useState<Record<string, string>>({});
  const [sendToGovernment, setSendToGovernment] = useState<Record<string, boolean>>({});
  const [proofPhotos, setProofPhotos] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (
      !(desk === "city_admin" || desk === "department_officer") ||
      !session.token
    )
      return;
    api
      .listCityWorkers(session.token)
      .then(setCityWorkers)
      .catch(() =>
        toast(
          hi ? "अधिकारी सूची लोड नहीं हुई" : "Could not load city officers",
        ),
      );
  }, [desk, session.token]);

  const onProofPhotos = (id: string, files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .slice(0, 5)
      .forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const r = new FileReader();
        r.onload = () =>
          setProofPhotos((p) => {
            const cur = p[id] ?? [];
            if (cur.length >= 5) return p;
            return { ...p, [id]: [...cur, String(r.result)] };
          });
        r.readAsDataURL(file);
      });
  };
  const removeProofPhoto = (id: string, idx: number) =>
    setProofPhotos((p) => ({
      ...p,
      [id]: (p[id] ?? []).filter((_, i) => i !== idx),
    }));

  const startResolve = (id: string) => {
    setResolvingId(id);
    setProofDesc((d) => ({ ...d, [id]: d[id] ?? "" }));
    setBeforeCondition((d) => ({ ...d, [id]: d[id] ?? "" }));
    setMaterialsUsed((d) => ({ ...d, [id]: d[id] ?? "" }));
    setEquipmentUsed((d) => ({ ...d, [id]: d[id] ?? "" }));
    setResolutionFunding((d) => ({ ...d, [id]: d[id] ?? "" }));
    setCompletionDays((d) => ({ ...d, [id]: d[id] ?? "" }));
    setSendToGovernment((d) => ({ ...d, [id]: d[id] ?? false }));
    setProofPhotos((p) => ({ ...p, [id]: p[id] ?? [] }));
  };
  const cancelResolve = () => setResolvingId(null);

  const confirmResolve = (c: Challenge) => {
    const desc = (proofDesc[c.id] ?? "").trim();
    const before = (beforeCondition[c.id] ?? "").trim();
    const materials = (materialsUsed[c.id] ?? "").trim();
    const equipment = (equipmentUsed[c.id] ?? "").trim();
    const funding = (resolutionFunding[c.id] ?? "").trim();
    const days = (completionDays[c.id] ?? "").trim();
    const photos = proofPhotos[c.id] ?? [];
    const sendGov = false;
    if (before.length < 10) {
      toast(
        hi
          ? "कृपया कार्य शुरू होने से पहले की स्थिति लिखें (कम से कम 10 अक्षर)।"
          : "Please describe the problem condition before work (at least 10 characters).",
      );
      return;
    }
    if (materials.length < 2 && equipment.length < 2) {
      toast(
        hi
          ? "कृपया उपयोग की गई सामग्री या उपकरण का विवरण लिखें।"
          : "Please add the materials or equipment used.",
      );
      return;
    }
    if (desc.length < 10) {
      toast(
        hi
          ? "कृपया समाधान का विवरण लिखें (कम से कम 10 अक्षर)।"
          : "Please describe how it was resolved (at least 10 characters).",
      );
      return;
    }
    if (photos.length < 1) {
      toast(
        hi
          ? "कृपया समाधान के बाद की कम से कम एक फोटो जोड़ें।"
          : "Please add at least one after-resolution photo as proof.",
      );
      return;
    }
    const now = new Date().toLocaleString("en-IN");
    const nextStage = "city_admin_review";
    patch(c.id, (x) => ({
      ...x,
      stage: nextStage,
      requires_government: x.requires_government,
      supervisor_approval: {
        status: "pending",
        note: "Department resolution sent to Local Admin for final review.",
      },
      resolution_proof: {
        photos,
        description: desc,
        resolved_by: session.name,
        date: now,
      },
      department_resolution: {
        condition_before: before,
        materials_used: [
          materials ? `Materials: ${materials}` : "",
          equipment ? `Equipment: ${equipment}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
        materials,
        equipment,
        funding,
        completion_days: days || "N/A",
        completion_date: now,
        summary: desc,
        photos,
        sent_to_government: sendGov,
        sent_by: session.name,
      },
      citizen_updates: [
        ...(x.citizen_updates || []),
        {
            message: "Department resolution submitted to Local Admin for final review.",
          time: now,
          by: session.name,
        },
      ],
      updates: [
        ...x.updates,
        {
          stage: "city_admin_review",
          time: now,
          note: `Department resolved the issue and sent the full details to Local Admin for final review. Materials: ${materials}. Days: ${days || "N/A"}. ${desc}`,
        },
      ],
    }));
    toast(
      sendGov
        ? hi
          ? "समाधान Local Government को भेज दिया गया"
          : "Resolution sent to Government for review"
        : hi
          ? "समाधान सफलतापूर्वक complete हो गया"
          : "Problem marked resolved with proof",
    );
    setResolvingId(null);
    setProofDesc((d) => {
      const n = { ...d };
      delete n[c.id];
      return n;
    });
    setBeforeCondition((d) => {
      const n = { ...d };
      delete n[c.id];
      return n;
    });
    setMaterialsUsed((d) => {
      const n = { ...d };
      delete n[c.id];
      return n;
    });
    setCompletionDays((d) => {
      const n = { ...d };
      delete n[c.id];
      return n;
    });
    setSendToGovernment((d) => {
      const n = { ...d };
      delete n[c.id];
      return n;
    });
    setProofPhotos((p) => {
      const n = { ...p };
      delete n[c.id];
      return n;
    });
  };

  const approveResolution = (c: Challenge) => {
    const now = new Date().toLocaleString("en-IN");
    patch(c.id, (x) => ({
      ...x,
      stage: "deployed",
      supervisor_approval: {
        status: "approved",
        approved_by: session.name,
        approved_at: now,
        note: "Resolution proof approved by Local Government supervisor.",
      },
      sla: x.sla ? { ...x.sla, status: "completed" } : x.sla,
      citizen_updates: [
        ...(x.citizen_updates || []),
        {
          message:
            "Resolution proof approved. The municipal issue is resolved.",
          time: now,
          by: session.name,
        },
      ],
      updates: [
        ...x.updates,
        {
          stage: "deployed",
          time: now,
          note: `Resolution proof approved by ${session.name}.`,
        },
      ],
    }));
    toast(hi ? "समाधान प्रमाण approve हो गया" : "Resolution proof approved");
  };

  const assignWard = (
    c: Challenge,
    workerId = selectedWorkerId,
    assignmentDepartment = "",
  ) => {
    const now = new Date().toLocaleString("en-IN");
    const target =
      desk === "city_admin" && workerId
        ? cityWorkers.find((worker) => worker.id === workerId)
        : undefined;
    patch(c.id, (x) => ({
      ...x,
      assigned_to: {
        ...(x.assigned_to || {}),
        user_id: target?.id || session.id,
        name: target?.name || session.name,
        desk: target?.city_desk || session.cityDesk,
        district: x.district,
        ward: x.block,
        department:
          assignmentDepartment ||
          target?.city_department ||
          x.department ||
          catForChallenge(x),
      },
      stage:
        target?.city_desk === "department_officer"
          ? "department_assignment"
          : x.stage === "submitted"
            ? "city_admin_review"
            : x.stage,
      updates: [
        ...x.updates,
        {
          stage:
            target?.city_desk === "department_officer"
              ? "department_assignment"
              : "city_admin_review",
          time: now,
          note: `Assigned to ${target?.name || "ward"} for ${x.block || x.district} by ${session.name}.`,
        },
      ],
    }));
    toast(
      target
        ? hi
          ? `${target.name} को समस्या assign हो गई`
          : `Assigned to ${target.name}`
        : hi
          ? "समस्या वार्ड को assign हो गई"
          : "Problem assigned to the ward",
    );
  };
  const openAssignModal = (c: Challenge) => {
    setAssignTarget(c);
    setAssignDepartment(c.assigned_to?.department || c.department || "");
    setAssignOfficerId("");
  };
  const confirmAssign = () => {
    if (!assignTarget) return;
    if (assignTarget.field_verification?.status !== "verified") {
      if (!assignOfficerId) {
        toast(
          hi
            ? "पहले field verification officer चुनें"
            : "Select a field verification officer first",
        );
        return;
      }
      acceptForFieldVerification(assignTarget, assignOfficerId);
    } else {
      if (!assignDepartment) {
        toast(hi ? "Field department चुनें" : "Select a field department");
        return;
      }
      assignWard(assignTarget, assignOfficerId, assignDepartment);
    }
    setAssignTarget(null);
  };
  const acceptForFieldVerification = (c: Challenge, workerId?: string) => {
    const now = new Date().toLocaleString("en-IN");
    const worker = cityWorkers.find((entry) => entry.id === workerId);
    patch(c.id, (x) => ({
      ...x,
      assigned_to: {
        ...(x.assigned_to || {}),
        user_id: worker?.id || workerId || session.id,
        name: worker?.name || session.name,
        desk: worker?.city_desk || "field_verification_officer",
        district: x.district,
        ward: x.block,
        department: x.department || catForChallenge(x),
      },
      stage: "field_verification",
      updates: [
        ...x.updates,
        {
          stage: "field_verification",
          time: now,
          note: `Problem assigned to ${worker?.name || session.name} for Field Verification by ${session.name}.`,
        },
      ],
    }));
    toast(
      worker
        ? hi
          ? `${worker.name} को field verification के लिए assign किया गया`
          : `Assigned to ${worker.name} for field verification`
        : hi
          ? "समस्या field officer को accept कर दी गई"
          : "Problem accepted by the field officer",
    );
  };
  const openWorkOrderModal = (c: Challenge) => {
    setWorkOrderTarget(c);
    setWorkOrderStatus(
      c.work_order?.status === "in_progress"
        ? "in_progress"
        : c.work_order?.status === "completed"
          ? "completed"
          : "started",
    );
  };
  const confirmWorkOrderUpdate = () => {
    if (!workOrderTarget) return;
    if (workOrderTarget.work_order)
      updateWorkStatus(workOrderTarget, workOrderStatus);
    else createWorkOrder(workOrderTarget);
    setWorkOrderTarget(null);
  };
  const openSlaModal = (c: Challenge) => {
    setSlaTarget(c);
    setSlaDays("7");
  };
  const setSla = () => {
    if (!slaTarget) return;
    const days = Number(slaDays);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      toast(
        hi
          ? "कृपया 1 से 365 दिनों के बीच संख्या डालें।"
          : "Enter a whole number between 1 and 365 days.",
      );
      return;
    }
    const due = new Date(Date.now() + days * 86400000);
    patch(slaTarget.id, (x) => ({
      ...x,
      sla: { due_at: due.toISOString(), status: "on_track" },
      updates: [
        ...x.updates,
        {
          stage: x.stage,
          time: new Date().toLocaleString("en-IN"),
          note: `SLA set to ${due.toLocaleDateString("en-IN")}. Follow-up due in ${days} days.`,
        },
      ],
    }));
    toast(
      hi ? `${days} दिनों का SLA तय कर दिया गया` : `SLA set for ${days} days`,
    );
    setSlaTarget(null);
  };
  const acceptProblem = (c: Challenge) => {
    const now = new Date().toLocaleString("en-IN");
    patch(c.id, (x) => ({
      ...x,
      stage: "city_admin_review",
      assigned_to: {
        ...(x.assigned_to || {}),
        user_id: session.id,
        name: session.name,
        desk,
        district: x.district,
        ward: x.block,
        department: x.department || catForChallenge(x),
      },
      updates: [
        ...x.updates,
        {
          stage: "city_admin_review",
          time: now,
          note: `Problem accepted by ${session.name}.`,
        },
      ],
    }));
    toast(hi ? "Problem accept हो गई" : "Problem accepted");
  };
  const updateWorkStatus = (
    c: Challenge,
    status: "started" | "in_progress" | "completed",
  ) => {
    const now = new Date().toLocaleString("en-IN");
    const nextStage =
      status === "started"
        ? "work_started"
        : status === "in_progress"
          ? "work_in_progress"
          : "re_verification";
    patch(c.id, (x) => ({
      ...x,
      stage: nextStage,
      work_order: x.work_order
        ? { ...x.work_order, status }
        : {
            number: `WO-${c.id.replace(/[^A-Z0-9]/g, "")}`,
            team: session.name,
            status,
          },
      updates: [
        ...x.updates,
        {
          stage: nextStage,
          time: now,
          note: `Work ${status.replace(/_/g, " ")} by ${session.name}.`,
        },
      ],
      citizen_updates: [
        ...(x.citizen_updates || []),
        {
          message:
            status === "completed"
              ? "Work completed and sent for re-verification."
              : `Municipal work status updated: ${status.replace(/_/g, " ")}.`,
          time: now,
          by: session.name,
        },
      ],
    }));
    toast(
      hi
        ? `काम का status: ${status}`
        : status === "completed"
          ? "Work completed; re-verification requested"
          : `Work status: ${status.replace(/_/g, " ")}`,
    );
  };
  const reportCompletedWorkToGovernment = (c: Challenge) => {
    if (c.work_order?.status !== "completed") {
      toast(
        hi
          ? "पहले काम को completed mark करें"
          : "Mark the work completed before reporting it",
      );
      return;
    }
    const now = new Date().toLocaleString("en-IN");
    patch(c.id, (x) => ({
      ...x,
      stage: "government_review",
      requires_government: true,
      monitoring_report: {
        submitted_by: session.name,
        date: now,
        status: "verified_and_reported",
        description: `Work checked after completion. Work order ${x.work_order?.number || ""} was verified by ${session.name} and reported directly to Government.`,
      },
      supervisor_approval: {
        status: "pending",
        note: "Completion verified by Local Government monitoring officer and sent directly to Government.",
      },
      updates: [
        ...x.updates,
        {
          stage: "government_review",
          time: now,
          note: `Completed work checked by ${session.name} and reported directly to Government.`,
        },
      ],
      citizen_updates: [
        ...(x.citizen_updates || []),
        {
          message: "Completed work was checked and reported to Government.",
          time: now,
          by: session.name,
        },
      ],
    }));
    toast(
      hi
        ? "काम verify करके Government को report भेज दी गई"
        : "Completed work verified and reported directly to Government",
    );
  };
  const sendToUniversityAfterVerification = (c: Challenge) => {
    if (c.field_verification?.status !== "verified") {
      toast(
        hi
          ? "पहले Field Verification पूरा करें"
          : "Complete Field Verification first",
      );
      return;
    }
    const now = new Date().toLocaleString("en-IN");
    const universityId = c.uni || UNIVERSITIES[0].id;
    const university = uniById(universityId);
    patch(c.id, (x) => ({
      ...x,
      stage: "routed",
      uni: universityId,
      requires_university: true,
      requires_government: false,
      routing_decision: "government_field_university",
      routing_scope: "main_government",
      updates: [
        ...x.updates,
        {
          stage: "routed",
          time: now,
          note: `Field verification completed. Sent to ${university?.name || universityId} for solution research; University can route the solution to Industry/CSR next.`,
        },
      ],
      citizen_updates: [
        ...(x.citizen_updates || []),
        {
          message: `Field verification completed. Problem sent to ${university?.name || universityId} for solution research.`,
          time: now,
          by: session.name,
        },
      ],
    }));
    toast(
      hi
        ? "Problem University को भेज दी गई; आगे Industry/CSR flow चलेगा"
        : "Problem sent to University; it can proceed to Industry/CSR next",
    );
  };
  const escalate = (c: Challenge) => {
    const now = new Date().toLocaleString("en-IN");
    patch(c.id, (x) => ({
      ...x,
      stage: "government_review",
      requires_government: true,
      routing_decision: x.routing_decision || "city_government",
      updates: [
        ...x.updates,
        {
          stage: "government_review",
          time: now,
          note: `Local Government could not resolve this issue directly. Escalated to Government for proper solution review.`,
        },
      ],
    }));
    toast(
      hi
        ? "समस्या Government Review में भेजी गई"
        : "Problem escalated to Government for proper-solution review",
    );
  };
  const sendDirectlyToStateAdmin = (c: Challenge) => {
    const now = new Date().toLocaleString("en-IN");
    patch(c.id, (x) => ({
      ...x,
      stage: "government_review",
      requires_government: true,
      routing_decision: "main_government",
      routing_scope: "main_government",
      updates: [
        ...x.updates,
        {
          stage: "government_review",
          time: now,
          note: `Problem sent directly from Local Government to State Government Admin by ${session.name}.`,
        },
      ],
      citizen_updates: [
        ...(x.citizen_updates || []),
        {
          message: "Local Government sent this problem directly to State Government Admin for proper solution.",
          time: now,
          by: session.name,
        },
      ],
    }));
    toast(
      hi
        ? "Problem State Government Admin को भेज दी गई"
        : "Problem sent directly to State Government Admin",
    );
  };
  const createWorkOrder = (c: Challenge) => {
    const now = new Date();
    const due = new Date(
      now.getTime() + Math.max(3, 14 - c.priority / 10) * 86400000,
    );
    const officer = cityWorkers.find(
      (worker) => worker.id === selectedWorkerId,
    );
    if (desk === "department_officer" && !officer) {
      toast(
        hi
          ? "पहले officer चुनें"
          : "Select an officer first",
      );
      return;
    }
    patch(c.id, (x) => ({
      ...x,
      assigned_to: {
        ...(x.assigned_to || {}),
        user_id: officer?.id || session.id,
        name: officer?.name || session.name,
        desk: officer?.city_desk || session.cityDesk,
        district: x.district,
        ward: x.block,
        department: x.department || catForChallenge(x),
      },
      stage: "work_order",
      work_order: {
        number: `WO-${c.id.replace(/[^A-Z0-9]/g, "")}`,
        team: officer?.name || session.name,
        start_date: now.toISOString().slice(0, 10),
        expected_completion: due.toISOString().slice(0, 10),
        status: "open",
      },
      sla: { due_at: due.toISOString(), status: "on_track" },
      citizen_updates: [
        ...(x.citizen_updates || []),
        {
          message: `Work order created and assigned to ${officer?.name || session.name}.`,
          time: now.toLocaleString("en-IN"),
          by: session.name,
        },
      ],
    }));
    toast(
      hi
        ? "Work order officer को assign हो गया"
        : "Work order created and assigned",
    );
  };
  const catForChallenge = (c: Challenge) =>
    c.department || cityCategoryFor(`${c.title} ${c.desc}`).en;

  if (dashboardDetail) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 view-in">
        <div className="bg-pine-925 text-paper rounded-md overflow-hidden mb-6 shadow-[6px_6px_0_rgba(11,44,33,0.16)]">
          <div className="p-6 md:p-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-marigold-300">
                Main Problem Management
              </p>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl mt-2">
                {detailTitle}
              </h1>
              <p className="text-paper/70 mt-2 max-w-2xl text-sm">
                Status-wise problem management
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-moss-400 font-extrabold">
                All Problems
              </p>
              <p className="font-display font-extrabold text-3xl">
                {detailProblems.length}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDashboardDetail(null)}
          className="mb-5 inline-flex items-center gap-2 rounded-sm border border-ink/15 bg-card px-3 py-2 text-xs font-extrabold text-ink-soft"
        >
          ← Back to dashboard
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 mb-6">
          {statusCards.map((item) => (
            <button
              type="button"
              key={item.label}
              onClick={() => setSelectedProblemStatus(item.label)}
              className={cx(
                "rounded-sm border p-3 text-left transition",
                item.color,
                selectedProblemStatus === item.label
                  ? "ring-2 ring-pine-900 ring-offset-2"
                  : "opacity-80 hover:opacity-100",
              )}
            >
              <div className="flex items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-[0.1em]">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/60">
                <div
                  className={cx("h-full rounded-full", item.bar)}
                  style={{
                    width: `${Math.max(8, (item.value / maxStatusValue) * 100)}%`,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
        <div className="bg-card border border-ink/10 rounded-md p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-pine-700">
                Selected status
              </p>
              <h2 className="font-display font-extrabold text-2xl mt-1">
                {selectedProblemStatus}
              </h2>
            </div>
            <span className="rounded-sm bg-pine-100 px-3 py-2 text-sm font-extrabold text-pine-900">
              {selectedStatusProblems.length} problems
            </span>
          </div>
          {selectedStatusProblems.length === 0 ? (
            <div className="border border-dashed border-ink/15 rounded-sm p-8 text-center text-sm text-ink-soft">
              No problems in this status.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {selectedStatusProblems.map((problem) => (
                <div
                  key={problem.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedManagementProblem(problem)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedManagementProblem(problem);
                    }
                  }}
                  className="border border-ink/10 rounded-sm p-4 cursor-pointer hover:border-pine-700 hover:shadow-[3px_3px_0_rgba(11,44,33,.08)] transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-ink-soft">
                      {problem.id}
                    </span>
                    <span className="rounded-sm bg-marigold-500/15 px-2 py-1 text-[10px] font-extrabold">
                      Priority {problem.priority}
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-lg mt-3">
                    {problem.title}
                  </h3>
                  <p className="text-xs text-ink-soft mt-1">
                    {problem.district} · {problem.block}
                  </p>
                  <p className="text-sm mt-3 leading-relaxed line-clamp-3">
                    {problem.desc}
                  </p>

                  {selectedProblemStatus === "Resolved" && problem.resolution_proof && (
                    <div className="mt-3 rounded-sm border border-pine-700/20 bg-pine-100/50 p-3">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-pine-800">
                        Resolution details
                      </p>
                      <p className="mt-2 text-[11px] font-bold text-ink">
                        Resolved by: {problem.resolution_proof.resolved_by}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                        {problem.resolution_proof.description}
                      </p>

                      {problem.department_resolution && (
                        <div className="mt-2 grid gap-1 text-[10px] font-semibold text-ink-soft">
                          <span>
                            Before: {problem.department_resolution.condition_before}
                          </span>
                          <span>
                            Materials: {problem.department_resolution.materials || problem.department_resolution.materials_used}
                          </span>
                          {problem.department_resolution.equipment && (
                            <span>Equipment: {problem.department_resolution.equipment}</span>
                          )}
                          {problem.department_resolution.funding && (
                            <span>Funding: {problem.department_resolution.funding}</span>
                          )}
                          <span>
                            Completion: {problem.department_resolution.completion_days}
                          </span>
                        </div>
                      )}

                      {problem.resolution_proof.photos.length > 0 && (
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {problem.resolution_proof.photos.map((src, index) => (
                            <img
                              key={index}
                              src={src}
                              alt={`Resolved proof ${index + 1}`}
                              className="h-16 w-full rounded-sm border border-ink/10 object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-sm border border-pine-700/15 bg-pine-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest text-pine-800">
                      {getCityStatus(problem)}
                    </span>
                    {problem.assigned_to?.name && (
                      <span className="rounded-sm border border-ink/10 bg-paper px-2 py-1 text-[9px] font-bold">
                        {problem.assigned_to.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedManagementProblem && (
            <div className="mt-5 border-2 border-pine-700/25 rounded-md bg-paper overflow-hidden shadow-[4px_4px_0_rgba(11,44,33,.08)]">
              <div className="p-4 border-b border-ink/10 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-pine-700">
                    Complete problem workflow
                  </p>
                  <h3 className="font-display font-extrabold text-xl text-ink mt-1">
                    {selectedManagementProblem.title}
                  </h3>
                  <p className="text-[10.5px] text-ink-soft mt-1">
                    {selectedManagementProblem.id} · {selectedManagementProblem.district} · {selectedManagementProblem.block}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedManagementProblem(null)}
                  className="inline-flex items-center gap-1.5 border border-pine-800 text-pine-800 hover:bg-pine-800 hover:text-paper px-2.5 py-1.5 rounded-sm text-xs font-extrabold"
                >
                  <Icon name="close" className="w-3.5 h-3.5" sw={2.4} />
                  Close
                </button>
              </div>
              <div className="p-4 grid md:grid-cols-[1fr_220px] gap-4">
                <div>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    {selectedManagementProblem.desc}
                  </p>
                  <div className="mt-4 grid gap-2">
                    {STAGES.map((stage, index) => {
                      const done = stageIdx(selectedManagementProblem.stage) >= index;
                      const update = selectedManagementProblem.updates.find(
                        (item) => item.stage === stage.id,
                      );
                      return (
                        <div key={stage.id} className="flex gap-2 items-start">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0"
                            style={{
                              background: done ? stage.color : "#e5e7eb",
                              color: done ? "#fff" : "#6b7280",
                            }}
                          >
                            {done ? "✓" : index + 1}
                          </span>
                          <div>
                            <b className="text-[10.5px]">{stage.en}</b>
                            {update && (
                              <p className="text-[10px] text-ink-soft">
                                {update.time} · {update.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-card border border-ink/10 rounded-sm p-3 h-fit">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                    Work completed
                  </p>
                  <p className="font-display font-extrabold text-3xl text-pine-800 mt-1">
                    {Math.round(((stageIdx(selectedManagementProblem.stage) + 1) / STAGES.length) * 100)}%
                  </p>
                  <div className="mt-2 h-2 bg-ink/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(((stageIdx(selectedManagementProblem.stage) + 1) / STAGES.length) * 100)}%`,
                        background: stageById(selectedManagementProblem.stage).color,
                      }}
                    />
                  </div>
                  <p className="text-[10.5px] font-bold text-ink-soft mt-2">
                    Current stage: {stageById(selectedManagementProblem.stage).en}
                  </p>
                  <p className="text-[10.5px] font-bold text-ink-soft mt-2">
                    Priority: {selectedManagementProblem.priority}/100
                  </p>
                  {selectedManagementProblem.resolution_proof && (
                    <p className="text-[10.5px] font-bold text-moss-700 mt-2">
                      Resolution proof submitted
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 view-in">
      {workOrderTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-pine-925/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="work-order-dialog-title"
        >
          <div className="w-full max-w-lg rounded-md border border-ink/10 bg-card p-5 shadow-[8px_8px_0_rgba(11,44,33,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-pine-700">
                  Work order progress
                </p>
                <h2
                  id="work-order-dialog-title"
                  className="font-display font-extrabold text-2xl mt-1"
                >
                  {workOrderTarget.work_order
                    ? "Update work order"
                    : "Create work order"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setWorkOrderTarget(null)}
                aria-label="Close work order dialog"
                className="text-xl leading-none text-ink-soft hover:text-ink"
              >
                ×
              </button>
            </div>
            <div className="mt-4 rounded-sm border border-ink/10 bg-paper p-3">
              <p className="font-display font-extrabold">
                {workOrderTarget.title}
              </p>
              <p className="text-xs text-ink-soft mt-1">
                {workOrderTarget.id} · {workOrderTarget.district} ·{" "}
                {workOrderTarget.block}
              </p>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span>Current progress</span>
                <span className="text-pine-700">
                  {workOrderTarget.work_order?.status === "completed"
                    ? "100%"
                    : workOrderTarget.work_order?.status === "in_progress"
                      ? "60%"
                      : workOrderTarget.work_order
                        ? "25%"
                        : "Not started"}
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-paper">
                <div
                  className={cx(
                    "h-full rounded-full transition-all",
                    workOrderTarget.work_order?.status === "completed"
                      ? "w-full bg-pine-700"
                      : workOrderTarget.work_order?.status === "in_progress"
                        ? "w-3/5 bg-steel-500"
                        : workOrderTarget.work_order
                          ? "w-1/4 bg-marigold-500"
                          : "w-0",
                  )}
                />
              </div>
            </div>
            <label
              className="mt-5 block text-xs font-extrabold uppercase tracking-widest text-ink-soft"
              htmlFor="work-order-status"
            >
              Where has the work reached?
            </label>
            <select
              id="work-order-status"
              value={workOrderStatus}
              onChange={(event) =>
                setWorkOrderStatus(
                  event.target.value as "started" | "in_progress" | "completed",
                )
              }
              className="mt-2 w-full rounded-sm border border-ink/15 bg-paper px-3 py-2.5 text-sm font-bold outline-none focus:border-pine-700"
            >
              <option value="started">Work started</option>
              <option value="in_progress">Work in progress</option>
              <option value="completed">Work completed</option>
            </select>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWorkOrderTarget(null)}
                className="rounded-sm border border-ink/15 px-4 py-2 text-xs font-extrabold text-ink-soft"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmWorkOrderUpdate}
                className="rounded-sm bg-pine-800 px-4 py-2 text-xs font-extrabold text-paper"
              >
                Save progress
              </button>
            </div>
          </div>
        </div>
      )}
      {assignTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-pine-925/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-dialog-title"
        >
          <div className="w-full max-w-lg rounded-md border border-ink/10 bg-card p-5 shadow-[8px_8px_0_rgba(11,44,33,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-pine-700">
                  Ward assignment
                </p>
                <h2
                  id="assign-dialog-title"
                  className="font-display font-extrabold text-2xl mt-1"
                >
                  {assignTarget.field_verification?.status === "verified"
                    ? "Assign verified problem"
                    : "Send for field verification"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
                aria-label="Close assignment dialog"
                className="text-xl leading-none text-ink-soft hover:text-ink"
              >
                ×
              </button>
            </div>
            <div className="mt-4 rounded-sm border border-ink/10 bg-paper p-3">
              <p className="font-display font-extrabold">
                {assignTarget.title}
              </p>
              <p className="text-xs text-ink-soft mt-1">
                {assignTarget.id} · {assignTarget.district} ·{" "}
                {assignTarget.block}
              </p>
              <p className="text-xs text-ink-soft mt-2 line-clamp-2">
                {assignTarget.desc}
              </p>
            </div>
            {assignTarget.field_verification?.status !== "verified" ? (
              <>
                <div className="mt-4 rounded-sm border border-marigold-500/30 bg-marigold-500/10 p-3 text-xs font-bold text-marigold-700">
                  This problem will be sent to the Field Verification queue for
                  on-site checking. Choose the field officer who will accept it.
                </div>
                <label
                  className="mt-4 block text-xs font-extrabold uppercase tracking-widest text-ink-soft"
                  htmlFor="assignment-officer"
                >
                  Field verification officer
                </label>
                <select
                  id="assignment-officer"
                  value={assignOfficerId}
                  onChange={(event) => setAssignOfficerId(event.target.value)}
                  className="mt-2 w-full rounded-sm border border-ink/15 bg-paper px-3 py-2.5 text-sm font-bold outline-none focus:border-pine-700"
                >
                  <option value="">
                    {hi ? "field officer चुनें" : "Select field officer"}
                  </option>
                  {cityWorkers
                    .filter(
                      (worker) => worker.city_desk === "field_verification_officer",
                    )
                    .map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name} · {worker.org}
                      </option>
                    ))}
                </select>
              </>
            ) : (
              <>
                <div className="mt-4 rounded-sm border border-pine-700/20 bg-pine-100 p-3 text-xs font-bold text-pine-800">
                  Field verification completed. Now choose the department or
                  work team that should take this problem forward.
                </div>
                <label
                  className="mt-4 block text-xs font-extrabold uppercase tracking-widest text-ink-soft"
                  htmlFor="assignment-department"
                >
                  Field department
                </label>
                <select
                  id="assignment-department"
                  value={assignDepartment}
                  onChange={(event) => {
                    setAssignDepartment(event.target.value);
                    setAssignOfficerId("");
                  }}
                  className="mt-2 w-full rounded-sm border border-ink/15 bg-paper px-3 py-2.5 text-sm font-bold outline-none focus:border-pine-700"
                >
                  <option value="">Select field department</option>
                  {CITY_DEPARTMENTS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {hi ? item.hi : item.en}
                    </option>
                  ))}
                </select>
                <label
                  className="mt-4 block text-xs font-extrabold uppercase tracking-widest text-ink-soft"
                  htmlFor="assignment-officer"
                >
                  Department officer (optional)
                </label>
                <select
                  id="assignment-officer"
                  value={assignOfficerId}
                  onChange={(event) => setAssignOfficerId(event.target.value)}
                  className="mt-2 w-full rounded-sm border border-ink/15 bg-paper px-3 py-2.5 text-sm font-bold outline-none focus:border-pine-700"
                >
                  <option value="">Assign to department / current admin</option>
                  {cityWorkers
                    .filter(
                      (worker) =>
                        !assignDepartment ||
                        worker.city_department === assignDepartment,
                    )
                    .map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name} · {worker.org}
                      </option>
                    ))}
                </select>
              </>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
                className="rounded-sm border border-ink/15 px-4 py-2 text-xs font-extrabold text-ink-soft"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAssign}
                className="rounded-sm bg-pine-800 px-4 py-2 text-xs font-extrabold text-paper"
              >
                {assignTarget.field_verification?.status === "verified"
                  ? hi
                    ? "Department को भेजें"
                    : "Send to department"
                  : hi
                    ? "Field officer को भेजें"
                    : "Send to field officer"}
              </button>
            </div>
          </div>
        </div>
      )}
      {slaTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-pine-925/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sla-dialog-title"
        >
          <div className="w-full max-w-md rounded-md border border-ink/10 bg-card p-5 shadow-[8px_8px_0_rgba(11,44,33,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-pine-700">
                  Service Level Agreement
                </p>
                <h2
                  id="sla-dialog-title"
                  className="font-display font-extrabold text-2xl mt-1"
                >
                  Set response time
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSlaTarget(null)}
                aria-label="Close SLA dialog"
                className="text-xl leading-none text-ink-soft hover:text-ink"
              >
                ×
              </button>
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              How many days should the team get to resolve this problem?
            </p>
            <p className="mt-2 rounded-sm bg-paper px-3 py-2 text-xs font-bold text-ink-soft">
              {slaTarget.title}
            </p>
            <label
              className="mt-4 block text-xs font-extrabold uppercase tracking-widest text-ink-soft"
              htmlFor="sla-days"
            >
              Time limit in days
            </label>
            <input
              id="sla-days"
              type="number"
              min="1"
              max="365"
              step="1"
              value={slaDays}
              onChange={(event) => setSlaDays(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") setSla();
              }}
              autoFocus
              className="mt-2 w-full rounded-sm border border-ink/15 bg-paper px-3 py-2.5 text-lg font-extrabold outline-none focus:border-pine-700"
            />
            <p className="mt-2 text-[11px] text-ink-soft">
              Enter a whole number from 1 to 365 days.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSlaTarget(null)}
                className="rounded-sm border border-ink/15 px-4 py-2 text-xs font-extrabold text-ink-soft"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={setSla}
                className="rounded-sm bg-pine-800 px-4 py-2 text-xs font-extrabold text-paper"
              >
                Set SLA
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-pine-925 text-paper rounded-md overflow-hidden mb-6 shadow-[6px_6px_0_rgba(11,44,33,0.16)]">
        <div className="p-6 md:p-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-marigold-300">
              {hi ? portal.kickerHi : portal.kicker}
            </p>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl mt-2">
              {hi ? portal.titleHi : portal.title}
            </h1>
            <p className="text-paper/70 mt-2 max-w-2xl text-sm">
              {hi ? portal.focusHi : portal.focus}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-moss-400 font-extrabold">
              Logged in as
            </p>
            <p className="font-display font-extrabold text-lg">
              {session.name}
            </p>
            <p className="text-xs text-paper/60">{session.org}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-paper/10">
          {(hi ? portal.stepsHi : portal.steps).map((step, index) => (
            <div
              key={step}
              className="px-4 py-3 border-r border-paper/10 last:border-r-0 text-[11px] font-extrabold"
            >
              <span className="text-marigold-300 mr-2">0{index + 1}</span>
              {step}
            </div>
          ))}
        </div>
      </div>
      {desk === "city_admin" && (
        <div className="mb-6 rounded-md border border-ink/10 bg-card p-4 md:p-5 shadow-[3px_3px_0_rgba(11,44,33,0.05)]">
          <button
            type="button"
            onClick={() => setDashboardDetail("total")}
            className="w-full text-left hover:bg-pine-50/40 rounded-sm p-1 transition"
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-pine-700">
                  <Icon name="layers" className="h-4 w-4" sw={2.2} />
                  Total Problems Detail
                </span>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-pine-700">
                  Main Problem Management
                </p>
                <h2 className="font-display font-extrabold text-2xl md:text-3xl mt-1">
                  Total Problems
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-sm border border-pine-700/15 bg-pine-50 px-3 py-2">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-pine-700">
                  Total
                </span>
                <span className="text-2xl font-display font-extrabold text-pine-900">
                  {totalProblemsCount}
                </span>
              </div>
            </div>
          </button>
        </div>
      )}
      {desk === "city_admin" && (
        <div className="mb-6 rounded-md border border-ink/10 bg-card p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-pine-700">Complaint received</p><h2 className="font-display font-extrabold text-2xl mt-1">Citizen complaints</h2></div>
            <span className="rounded-sm bg-pine-100 px-3 py-2 text-sm font-extrabold text-pine-800">{city.length} total</span>
          </div>
          {city.length ? <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-3">{city.slice(0, 6).map((complaint) => <div key={complaint.id} className="rounded-sm border border-ink/10 bg-paper p-3"><div className="flex items-center justify-between gap-2"><span className="font-mono text-[10px] text-ink-soft">{complaint.id}</span><span className="rounded-sm bg-marigold-500/15 px-2 py-1 text-[9px] font-extrabold">Priority {complaint.priority}</span></div><p className="mt-2 text-sm font-bold line-clamp-2">{complaint.title}</p><p className="mt-1 text-[10px] text-ink-soft">{complaint.district} · {complaint.block}</p><span className="mt-2 inline-flex rounded-sm border border-pine-700/15 bg-pine-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-pine-800">{getCityStatus(complaint)}</span></div>)}</div> : <div className="mt-4 rounded-sm border border-dashed border-ink/15 p-6 text-center text-sm text-ink-soft">No complaints received yet.</div>}
        </div>
      )}
      {desk === "city_admin" && (
        <div className="mb-6 rounded-md border border-ink/10 bg-card p-4 md:p-5 shadow-[3px_3px_0_rgba(11,44,33,0.05)]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-pine-700">
                Report receive box
              </p>
              <h2 className="font-display font-extrabold text-2xl mt-1">
                Reports & complaints received
              </h2>
              <p className="text-xs text-ink-soft mt-1">
                Department, field verification और accepted citizen complaints एक जगह देखें।
              </p>
            </div>
            <span className="rounded-sm bg-marigold-500/15 px-3 py-2 text-sm font-extrabold text-marigold-700">
              {receivedReports.length} received
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["department", "Department reports", receivedDepartmentReports.length],
              ["field", "Field verification", receivedFieldReports.length],
              [
                "complaints",
                "Problem complaints",
                receivedComplaints.length,
              ],
            ].map(([value, label, count]) => (
              <button
                key={String(value)}
                type="button"
                onClick={() =>
                  setReceiveFilter(
                    value as
                      | "department"
                      | "field"
                      | "complaints",
                  )
                }
                className={cx(
                  "rounded-sm border px-3 py-2 text-xs font-extrabold transition",
                  receiveFilter === value
                    ? "border-pine-800 bg-pine-800 text-paper"
                    : "border-ink/15 bg-paper text-ink-soft hover:border-pine-700/40",
                )}
              >
                {label} ({count})
              </button>
            ))}
          </div>
          {receivedReports.length ? (
            <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {receivedReports.slice(0, 9).map((problem) => {
                const departmentReports = problem.department_reports || [];
                const departmentReport =
                  departmentReports[departmentReports.length - 1];
                const reportText =
                  receiveFilter === "department"
                    ? departmentReport?.description ||
                      problem.department_resolution?.summary ||
                      "Department resolution details received."
                    : receiveFilter === "field"
                      ? problem.field_report?.description ||
                        problem.field_verification?.description ||
                        "Field verification details received."
                        : problem.desc;
                const reportBy =
                  receiveFilter === "department"
                    ? departmentReport?.submitted_by ||
                      problem.department_resolution?.sent_by ||
                      problem.assigned_to?.name
                    : receiveFilter === "field"
                      ? problem.field_report?.submitted_by ||
                        problem.field_verification?.verified_by
                      : problem.reporter?.name || problem.by;
                return (
                  <div
                    key={`${receiveFilter}-${problem.id}`}
                    className="rounded-sm border border-ink/10 bg-paper p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-ink-soft">
                        {problem.id}
                      </span>
                      <span className="rounded-sm bg-pine-100 px-2 py-1 text-[9px] font-extrabold text-pine-800">
                        {problem.department || problem.city_category || "Municipal"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold line-clamp-2">
                      {problem.title}
                    </p>
                    <p className="mt-1 text-[10px] text-ink-soft">
                      {problem.district} · {problem.block}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed line-clamp-4">
                      {reportText}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-bold text-ink-soft">
                      <span>By: {reportBy || "Citizen / officer"}</span>
                      <span>{problem.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-sm border border-dashed border-ink/15 p-6 text-center text-sm text-ink-soft">
              No reports received in this category yet.
            </div>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-pine-700">
            {hi ? portal.kickerHi : portal.kicker}
          </p>
          <h2 className="font-display font-extrabold text-2xl">
            {hi ? "कार्य सूची" : "Work queue"}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setDashboardDetail("assigned")}
            className="bg-card border border-ink/10 rounded-sm px-3 py-2 text-center text-left hover:border-pine-700/40 transition"
          >
            <b className="text-xl font-display block">{assignedCount}</b>
            <div className="text-[9px] uppercase tracking-widest font-extrabold text-ink-soft">
              {portal.assignedLabel}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setDashboardDetail("queue")}
            className="bg-card border border-ink/10 rounded-sm px-3 py-2 text-center text-left hover:border-pine-700/40 transition"
          >
            <b className="text-xl font-display block">{openAll.length}</b>
            <div className="text-[9px] uppercase tracking-widest font-extrabold text-ink-soft">
              {portal.openLabel}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setDashboardDetail("resolved")}
            className="bg-pine-100 border border-pine-700/15 rounded-sm px-3 py-2 text-center text-left hover:border-pine-700/50 transition"
          >
            <b className="text-xl font-display block">{resolvedAll.length}</b>
            <div className="text-[9px] uppercase tracking-widest font-extrabold text-ink-soft">
              Resolved
            </div>
          </button>
          <button
            type="button"
            onClick={() => setDashboardDetail("overdue")}
            className={cx(
              "border rounded-sm px-3 py-2 text-center text-left hover:border-pine-700/40 transition",
              overdue
                ? "bg-brick-500/10 border-brick-500/25"
                : "bg-card border-ink/10",
            )}
          >
            <b className="text-xl font-display block">{overdue}</b>
            <div className="text-[9px] uppercase tracking-widest font-extrabold text-ink-soft">
              Overdue
            </div>
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setAssignedOnly((value) => !value)}
          className={cx(
            "px-3 py-2 rounded-sm text-[11px] font-extrabold border",
            assignedOnly
              ? "bg-pine-800 text-paper border-pine-800"
              : "bg-card text-ink-soft border-ink/15",
          )}
        >
          {assignedOnly ? `✓ ${portal.assignedLabel}` : portal.openLabel}
        </button>
        <button
          onClick={exportCsv}
          className="px-3 py-2 rounded-sm text-[11px] font-extrabold border border-ink/15 bg-card text-ink-soft"
        >
          Export CSV
        </button>
        <span className="text-[10px] font-bold text-ink-soft">
          {selectedIds.size} selected ·{" "}
          {hi ? "आपके portal के scope में" : "within this portal scope"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCat("all")}
          className={cx(
            "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[11px] font-bold border transition",
            activeCat === "all"
              ? "bg-pine-800 text-paper border-pine-800"
              : "bg-card border-ink/15 text-ink-soft",
          )}
        >
          {hi ? "सभी" : "All"} ({activeList.length})
        </button>
        {CITY_GOVERNMENT_TABS.filter((cat) =>
          desk === "department_officer"
            ? cityDepartmentCanSeeCategory(department, cat.id)
            : cityDeskCanSeeCategory(desk, cat.id),
        ).map((cat) => {
          const count = activeList.filter((x) => x.cat.id === cat.id).length;
          const active = activeCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[11px] font-bold border transition"
              style={
                active
                  ? {
                      background: cat.color,
                      color: "#fff",
                      borderColor: cat.color,
                    }
                  : {
                      background: cat.color + "14",
                      color: cat.color,
                      borderColor: cat.color + "3a",
                    }
              }
            >
              <Icon name={cat.icon} className="w-3.5 h-3.5" sw={2} />
              {hi ? cat.hi : cat.en} ({count})
            </button>
          );
        })}
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map(({ c, cat }) => (
          <div
            key={c.id}
            className="bg-card border border-ink/10 rounded-md overflow-hidden shadow-sm flex flex-col"
          >
            <iframe
              title={`Map for ${c.id}`}
              loading="lazy"
              className="w-full h-40 border-b border-ink/10"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${c.lng - 0.006}%2C${c.lat - 0.006}%2C${c.lng + 0.006}%2C${c.lat + 0.006}&layer=mapnik&marker=${c.lat}%2C${c.lng}`}
            />
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between gap-2">
                <label className="inline-flex items-center gap-2 text-[10px] font-mono text-ink-soft">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.id)}
                    onChange={() =>
                      setSelectedIds((ids) => {
                        const next = new Set(ids);
                        next.has(c.id) ? next.delete(c.id) : next.add(c.id);
                        return next;
                      })
                    }
                  />
                  {c.id}
                </label>
                <span className="text-[10px] font-extrabold bg-marigold-500/15 px-2 py-1 rounded">
                  Priority {c.priority}
                </span>
              </div>
              <div className="mt-2">
                <CityCategoryTag id={cat.id} />
              </div>
              <h3 className="font-display font-extrabold text-lg mt-2">
                {c.title}
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                {c.district} · {c.block} · {c.department}
              </p>
              <p className="text-sm mt-3 leading-relaxed">{c.desc}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={cx(
                    "px-2 py-1 rounded-sm text-[9px] font-extrabold uppercase tracking-[0.12em] border",
                    c.stage === "deployed"
                      ? "bg-pine-100 text-pine-800 border-pine-700/15"
                      : c.resolution_proof
                        ? "bg-marigold-500/10 text-marigold-700 border-marigold-500/20"
                        : c.work_order
                          ? "bg-steel-100 text-steel-700 border-steel-500/20"
                          : c.assigned_to?.user_id
                            ? "bg-pine-100 text-pine-800 border-pine-700/15"
                            : "bg-paper text-ink-soft border-ink/15",
                  )}
                >
                  {getCityStatus(c)}
                </span>
                {c.sla?.due_at &&
                  c.stage !== "deployed" &&
                  Date.now() > Date.parse(c.sla.due_at) && (
                    <span className="px-2 py-1 rounded-sm text-[9px] font-extrabold uppercase tracking-[0.12em] border border-brick-500/30 bg-brick-500/10 text-brick-600">
                      SLA overdue
                    </span>
                  )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold">
                <span className="bg-paper border border-ink/10 rounded-sm p-2">
                  Ward: {c.assigned_to?.ward || c.block || "Unassigned"}
                </span>
                <span className="bg-paper border border-ink/10 rounded-sm p-2">
                  Dept: {c.assigned_to?.department || c.department || cat.en}
                </span>
                <span className="bg-paper border border-ink/10 rounded-sm p-2">
                  WO: {c.work_order?.number || "Not created"}
                </span>
                <span
                  className={cx(
                    "rounded-sm p-2",
                    c.sla?.due_at && Date.now() > Date.parse(c.sla.due_at)
                      ? "bg-brick-500/10 text-brick-600"
                      : "bg-pine-100/60 text-pine-800",
                  )}
                >
                  {c.stage === "deployed"
                    ? "SLA complete"
                    : c.sla?.due_at
                      ? `Due ${new Date(c.sla.due_at).toLocaleDateString("en-IN")}`
                      : "SLA not set"}
                </span>
              </div>
              {c.work_order && (
                <p className="mt-2 text-[10px] font-bold text-ink-soft">
                  Team: {c.work_order.team || "—"} · Cost:{" "}
                  {c.work_order.estimated_cost || "—"} · Start:{" "}
                  {c.work_order.start_date || "—"}
                </p>
              )}
              {c.supervisor_approval && (
                <p className="mt-2 text-[10px] font-extrabold text-pine-800">
                  Supervisor approval: {c.supervisor_approval.status}
                </p>
              )}
              {(c.requires_investment || c.funding_note || c.solution || c.team_name) && (
                <div className="mt-3 grid sm:grid-cols-2 gap-2 text-[11px] border border-pine-700/40 bg-pine-925 text-paper rounded-sm p-3 shadow-[3px_3px_0_rgba(11,44,33,.18)]">
                  <div className="sm:col-span-2">
                    <p className="font-extrabold uppercase tracking-wider text-marigold-300">State-approved solution package</p>
                    <p className="font-semibold text-paper mt-1">{c.solution || "No solution recorded"}</p>
                  </div>
                  <p><b>University:</b> {uniById(c.uni)?.name || c.uni || "Not assigned"}</p>
                  <p><b>Team:</b> {c.team_name || "Not recorded"} · {c.mentor || "No mentor"}</p>
                  <p><b>Members:</b> {c.team?.join(" · ") || "No members"}</p>
                  <p><b>Funding:</b> {c.fund || "Pending"}</p>
                  <p className="sm:col-span-2"><b>Funding note:</b> {c.funding_note || "No funding note"}</p>
                </div>
              )}
              <div className="mt-3 text-[11px] bg-paper border border-ink/10 rounded-sm p-3">
                <b>AI decision:</b> Local Government · {hi ? cat.hi : cat.en}
                <br />
                <span className="text-ink-soft">{c.routing_reason}</span>
              </div>

              {tab === "open" && resolvingId !== c.id && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=17/${c.lat}/${c.lng}`}
                    className="text-center border border-ink/15 px-3 py-2 rounded-sm text-xs font-extrabold"
                  >
                    {hi ? "बड़ा मानचित्र खोलें" : "Open full map"}
                  </a>
                  {permissions.assign && (
                    <button
                      onClick={() => openAssignModal(c)}
                      className="border border-steel-500/30 text-steel-500 px-3 py-2 rounded-sm text-xs font-extrabold"
                    >
                      Assign to ward
                    </button>
                  )}
                  {permissions.workOrder &&
                    !c.work_order &&
                    (desk === "city_admin" ||
                      ["department_assignment", "work_order"].includes(
                        c.stage,
                      )) && (
                    <button
                      onClick={() => openWorkOrderModal(c)}
                      className="border border-steel-500/30 text-steel-500 px-3 py-2 rounded-sm text-xs font-extrabold"
                    >
                      Create work order
                    </button>
                  )}
                  {permissions.sla && (
                    <button
                      onClick={() => openSlaModal(c)}
                      className="border border-steel-500/30 text-steel-500 px-3 py-2 rounded-sm text-xs font-extrabold"
                    >
                      Set SLA
                    </button>
                  )}
                  {desk === "city_admin" && c.stage !== "deployed" && (
                    <button
                      type="button"
                      disabled={c.assigned_to?.user_id === session.id}
                      onClick={() => acceptProblem(c)}
                      aria-label={
                        c.assigned_to?.user_id === session.id
                          ? "Problem accepted"
                          : "Accept problem"
                      }
                      className="col-span-2 inline-flex items-center justify-center gap-2 border-2 border-marigold-500 bg-marigold-500 text-pine-925 px-3 py-2.5 rounded-sm text-sm font-extrabold shadow-[3px_3px_0_rgba(222,155,18,.28)] hover:bg-marigold-400 hover:border-marigold-400 disabled:border-pine-700/20 disabled:bg-pine-100 disabled:text-pine-800 disabled:shadow-none"
                    >
                      <Icon name="check" className="w-4 h-4" sw={2.8} />
                      {c.assigned_to?.user_id === session.id
                        ? "Accepted"
                        : "Accept problem"}
                    </button>
                  )}
                  {permissions.resolve && (
                    <button
                      onClick={() => startResolve(c.id)}
                      className="bg-pine-800 text-paper px-3 py-2 rounded-sm text-xs font-extrabold"
                    >
                      {hi ? "समाधान करें" : "Resolve"}
                    </button>
                  )}
                  {permissions.escalate && (
                    <button
                      onClick={() => escalate(c)}
                      className="col-span-2 border-2 border-brick-500 text-brick-600 px-3 py-2 rounded-sm text-xs font-extrabold"
                    >
                      {hi
                        ? "उचित समाधान चाहिए → सरकार"
                        : "Needs proper solution → Government"}
                    </button>
                  )}
                  {desk === "city_admin" && (
                    <button
                      onClick={() => sendDirectlyToStateAdmin(c)}
                      className="col-span-2 border-2 border-pine-700 bg-pine-100 text-pine-900 px-3 py-2 rounded-sm text-xs font-extrabold"
                    >
                      {hi
                        ? "सीधे State Government Admin को भेजें"
                        : "Send directly to State Government Admin"}
                    </button>
                  )}
                  {permissions.approve &&
                    c.supervisor_approval?.status === "pending" && (
                      <button
                        onClick={() => approveResolution(c)}
                        className="col-span-2 bg-marigold-500 text-pine-925 px-3 py-2 rounded-sm text-xs font-extrabold"
                      >
                        Approve resolution proof
                      </button>
                    )}
                </div>
              )}

              {tab === "open" && resolvingId === c.id && (
                <div className="mt-4 border-t border-ink/10 pt-4">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-pine-700">
                    {hi ? "समाधान का प्रमाण" : "Proof of resolution"}
                  </p>
                  <p className="text-[11px] text-ink-soft mt-1">
                    {hi
                      ? "समाधान के बाद की स्थिति की फोटो और विवरण जोड़ें।"
                      : "Add an after-fix photo and a short description before marking this resolved."}
                  </p>
                  <div className="grid gap-3 mt-3">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                      {hi ? "कार्य से पहले की स्थिति" : "Condition before work"}
                    </label>
                    <textarea
                      value={beforeCondition[c.id] ?? ""}
                      onChange={(e) =>
                        setBeforeCondition((d) => ({
                          ...d,
                          [c.id]: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full border border-ink/15 bg-paper rounded-sm p-2.5 text-sm outline-none focus:border-pine-700"
                      placeholder={
                        hi
                          ? "किस तरह की समस्या थी, कितनी गहरी/असुविधा थी..."
                          : "Describe the problem before work, e.g. flooding depth, blockage, affected length..."
                      }
                    />
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                          {hi ? "उपयोग की गई सामग्री" : "Materials used"}
                        </label>
                        <textarea
                          value={materialsUsed[c.id] ?? ""}
                          onChange={(e) =>
                            setMaterialsUsed((d) => ({
                              ...d,
                              [c.id]: e.target.value,
                            }))
                          }
                          rows={2}
                          className="mt-2 w-full border border-ink/15 bg-paper rounded-sm p-2.5 text-sm outline-none focus:border-pine-700"
                          placeholder={hi ? "जैसे: पाइप, सीमेंट, रेत..." : "e.g. pipes, cement, sand..."}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                          {hi ? "उपयोग किए गए उपकरण" : "Equipment used"}
                        </label>
                        <textarea
                          value={equipmentUsed[c.id] ?? ""}
                          onChange={(e) =>
                            setEquipmentUsed((d) => ({
                              ...d,
                              [c.id]: e.target.value,
                            }))
                          }
                          rows={2}
                          className="mt-2 w-full border border-ink/15 bg-paper rounded-sm p-2.5 text-sm outline-none focus:border-pine-700"
                          placeholder={hi ? "जैसे: पंप, मशीन, ट्रेंच..." : "e.g. pump, machine, trench..."}
                        />
                      </div>
                    </div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                      {hi ? "कुल फंडिंग" : "Funding used"}
                    </label>
                    <input
                      value={resolutionFunding[c.id] ?? ""}
                      onChange={(e) =>
                        setResolutionFunding((d) => ({
                          ...d,
                          [c.id]: e.target.value,
                        }))
                      }
                      className="w-full border border-ink/15 bg-paper rounded-sm p-2.5 text-sm outline-none focus:border-pine-700"
                      placeholder={hi ? "जैसे: ₹50,000 / विभागीय बजट" : "e.g. ₹50,000 / Department budget"}
                    />
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                          {hi ? "कितने दिन में पूरा हुआ" : "Days to complete"}
                        </label>
                        <input
                          value={completionDays[c.id] ?? ""}
                          onChange={(e) =>
                            setCompletionDays((d) => ({
                              ...d,
                              [c.id]: e.target.value,
                            }))
                          }
                          className="mt-2 w-full border border-ink/15 bg-paper rounded-sm p-2.5 text-sm outline-none focus:border-pine-700"
                          placeholder={hi ? "उदा: 3 दिन" : "e.g. 3 days"}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                          {hi ? "Local Admin को भेजें" : "Send to Local Admin"}
                        </label>
                        <p className="mt-2 rounded-sm border border-ink/15 bg-paper px-3 py-2.5 text-sm font-bold text-ink">
                          {hi
                            ? "समाधान प्रमाण की समीक्षा के लिए Local Admin को भेजा जाएगा।"
                            : "The resolution proof will be sent to Local Admin for final approval."}
                        </p>
                      </div>
                    </div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                      {hi ? "समाधान का विस्तृत विवरण" : "Resolution summary"}
                    </label>
                    <textarea
                      value={proofDesc[c.id] ?? ""}
                      onChange={(e) =>
                        setProofDesc((d) => ({ ...d, [c.id]: e.target.value }))
                      }
                      rows={3}
                      className="w-full border border-ink/15 bg-paper rounded-sm p-2.5 text-sm outline-none focus:border-pine-700"
                      placeholder={
                        hi
                          ? "क्या ठीक किया गया, कैसे और कब..."
                          : "What was fixed, how, and when..."
                      }
                    />
                  </div>
                  <label className="mt-3 flex items-center justify-center border-2 border-dashed border-ink/15 rounded-sm p-4 cursor-pointer hover:border-pine-700/40">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => onProofPhotos(c.id, e.target.files)}
                    />
                    <span className="text-xs font-bold">
                      📷{" "}
                      {hi
                        ? "समाधान के बाद की फोटो जोड़ें (अधिकतम 5)"
                        : "Add after-fix photos (up to 5)"}
                    </span>
                  </label>
                  {(proofPhotos[c.id]?.length ?? 0) > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {proofPhotos[c.id]!.map((src, i) => (
                        <div key={i} className="relative">
                          <img
                            src={src}
                            alt={`Proof ${i + 1}`}
                            className="w-full h-16 object-cover rounded-sm border border-ink/10"
                          />
                          <button
                            onClick={() => removeProofPhoto(c.id, i)}
                            className="absolute -top-1.5 -right-1.5 bg-brick-600 text-paper rounded-full w-4 h-4 text-[10px] leading-4 font-extrabold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => confirmResolve(c)}
                      className="flex-1 bg-pine-800 text-paper px-3 py-2 rounded-sm text-xs font-extrabold"
                    >
                      {hi ? "✓ Local Admin को भेजें" : "✓ Send to Local Admin"}
                    </button>
                    <button
                      onClick={cancelResolve}
                      className="border border-ink/15 px-3 py-2 rounded-sm text-xs font-extrabold"
                    >
                      {hi ? "रद्द करें" : "Cancel"}
                    </button>
                  </div>
                </div>
              )}

              {tab === "resolved" && (
                <div className="mt-4 border-t border-ink/10 pt-4">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-pine-700">
                    {hi ? "समाधान का प्रमाण" : "Proof of resolution"}
                  </p>
                  {c.resolution_proof ? (
                    <>
                      <p className="text-xs text-ink-soft mt-1">
                        {c.resolution_proof.resolved_by} ·{" "}
                        {c.resolution_proof.date}
                      </p>
                      <p className="text-sm mt-2 leading-relaxed">
                        {c.resolution_proof.description}
                      </p>
                      {c.resolution_proof.photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {c.resolution_proof.photos.map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt={`Resolved proof ${i + 1}`}
                              className="w-full h-20 object-cover rounded-sm border border-ink/10"
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-ink-soft mt-1">
                      {hi
                        ? "इस पुराने रिकॉर्ड के लिए कोई फोटो प्रमाण दर्ज नहीं है।"
                        : "No photo proof was recorded for this older entry."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {!list.length && (
          <div className="md:col-span-2 xl:col-span-3 p-10 text-center bg-card border border-dashed border-ink/20 rounded-md text-sm text-ink-soft">
            {tab === "open"
              ? hi
                ? "आपके account पर अभी कोई problem assign नहीं है।"
                : "No problems are assigned to your account yet."
              : hi
                ? "आपके account से कोई assigned problem अभी हल नहीं हुई है।"
                : "No assigned problem has been resolved by your account yet."}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldVerificationDesk({
  challenges,
  session,
  patch,
  toast,
  hi,
}: {
  challenges: Challenge[];
  session: Session;
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  toast: (m: string) => void;
  hi: boolean;
}) {
  const assigned = challenges.filter(
    (c) =>
      ["field_verification", "re_verification"].includes(c.stage) &&
      (!c.field_verification?.status ||
        c.field_verification.status === "needs_review") &&
      (session.role === "field_verifier" ||
        session.cityDesk === "field_verification_officer" ||
        c.assigned_to?.user_id === session.id),
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    assigned[0]?.id ?? null,
  );
  const [report, setReport] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const selected = assigned.find((c) => c.id === selectedId) ?? assigned[0];

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
    setReport(selected?.field_verification?.description ?? "");
    setPhotos(selected?.field_verification?.photos ?? []);
  }, [selectedId, selected?.id]);

  const onPhotos = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .slice(0, 5)
      .forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const r = new FileReader();
        r.onload = () =>
          setPhotos((p) => (p.length >= 5 ? p : [...p, String(r.result)]));
        r.readAsDataURL(file);
      });
  };

  const save = (
    status: "verified" | "not_found" | "need_more_evidence" | "escalated",
  ) => {
    if (!selected) return;
    if (report.trim().length < 10) {
      toast(
        hi
          ? "कृपया कम से कम एक स्पष्ट जमीनी विवरण लिखें।"
          : "Please write a clear ground verification description.",
      );
      return;
    }
    const now = new Date().toLocaleString("en-IN");
    const returnedToState =
      status === "verified" && selected.returned_from === "state_government";
    patch(selected.id, (c) => ({
      ...c,
      assigned_to: {
        ...(c.assigned_to || {}),
        user_id: undefined,
        name: returnedToState
          ? "State Government Review Queue"
          : "Local Admin Review Queue",
        desk: returnedToState ? undefined : "city_admin",
        district: c.district,
        ward: c.block,
        department: c.department || cityCategoryFor(`${c.title} ${c.desc}`).en,
      },
      field_verification: {
        verified_by: session.name,
        date: now,
        description: report.trim(),
        photos,
        status: status === "verified" ? "verified" : "needs_review",
      },
      stage:
        status === "verified"
          ? returnedToState
            ? "government_review"
            : "city_admin_review"
          : status === "not_found"
            ? c.stage === "re_verification"
              ? "department_assignment"
              : "rejected"
            : status === "escalated"
              ? "government_review"
              : c.stage,
      supervisor_approval:
        status === "verified" && c.stage === "re_verification"
          ? {
              status: "pending",
              note: "Awaiting Local Admin final approval after re-verification.",
            }
          : c.supervisor_approval,
      requires_government:
        status === "escalated" || returnedToState
          ? true
          : c.requires_government,
      routing_decision: returnedToState
        ? "main_government"
        : c.routing_decision,
      updates: [
        ...c.updates,
        {
          stage:
            status === "escalated" || returnedToState
              ? "government_review"
              : "city_admin_review",
          time: now,
          note:
            status === "verified"
              ? returnedToState
                ? `Field verification completed by ${session.name}. Sent back to State Government for solution and University review. ${report.trim()}`
                : `Field verification completed by ${session.name}. Sent back to Local Admin for department assignment. ${report.trim()}`
              : `${status.replace(/_/g, " ")} by ${session.name}. ${report.trim()}`,
        },
      ],
    }));
    toast(
      status === "verified"
        ? hi
          ? "फील्ड सत्यापन सेव हो गया"
          : "Field verification saved"
        : status === "not_found"
          ? hi
            ? "समस्या location पर नहीं मिली"
            : "Problem marked not found"
          : status === "need_more_evidence"
            ? hi
              ? "और evidence मांगा गया"
              : "More evidence requested"
            : hi
              ? "State escalation request बन गई"
              : "State escalation requested",
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 view-in">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-pine-700">
            Field operations
          </p>
          <h1 className="font-display font-extrabold text-3xl">
            {hi ? "फील्ड सत्यापन डैशबोर्ड" : "Field Verification Dashboard"}
          </h1>
          <p className="text-ink-soft mt-1">
            {hi
              ? "मानचित्र पर समस्या देखें → स्थल पर जाएँ → फोटो और जमीनी विवरण जमा करें।"
              : "View the problem on the map → visit the site → upload proof photos and submit the ground report."}
          </p>
        </div>
        <div className="bg-card border border-ink/10 rounded-sm px-4 py-2 text-center">
          <b className="text-2xl font-display">{assigned.length}</b>
          <div className="text-[9px] uppercase tracking-widest font-extrabold text-ink-soft">
            Pending visits
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[330px_1fr] gap-5">
        <div className="bg-card border border-ink/10 rounded-md p-3 space-y-2 max-h-[720px] overflow-y-auto">
          {assigned.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={cx(
                "w-full text-left p-3 rounded-sm border transition",
                selected?.id === c.id
                  ? "border-pine-700 bg-pine-100/70"
                  : "border-ink/10 hover:border-pine-700/40",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-ink-soft">
                  {c.id}
                </span>
                <span className="text-[10px] font-extrabold bg-marigold-500/15 px-2 py-1 rounded">
                  {c.priority}/100
                </span>
              </div>
              <h3 className="font-display font-bold text-sm mt-1">{c.title}</h3>
              <p className="text-[11px] text-ink-soft mt-1">
                {c.district} · {c.block}
              </p>
            </button>
          ))}
          {!assigned.length && (
            <div className="p-8 text-center text-sm text-ink-soft">
              {hi
                ? "अभी कोई field visit pending नहीं है।"
                : "No field visits are pending."}
            </div>
          )}
        </div>
        {selected && (
          <div className="space-y-4">
            <div className="bg-card border border-ink/10 rounded-md overflow-hidden">
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-ink-soft">
                      {selected.id}
                    </span>
                    <h2 className="font-display font-extrabold text-2xl mt-1">
                      {selected.title}
                    </h2>
                    <p className="text-sm text-ink-soft mt-1">
                      {selected.district} · {selected.block} ·{" "}
                      {selected.department}
                    </p>
                  </div>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=17/${selected.lat}/${selected.lng}`}
                    className="bg-pine-800 text-paper px-3 py-2 rounded-sm text-xs font-extrabold"
                  >
                    Open in OpenStreetMap
                  </a>
                </div>
              </div>
              <iframe
                title="Problem location map"
                className="w-full h-[340px] border-t border-ink/10"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.lng - 0.015}%2C${selected.lat - 0.015}%2C${selected.lng + 0.015}%2C${selected.lat + 0.015}&layer=mapnik&marker=${selected.lat}%2C${selected.lng}`}
              />
              <div className="p-4 grid sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-paper border border-ink/10 rounded-sm p-3">
                  <b>Location source</b>
                  <p className="text-ink-soft mt-1">
                    {selected.location_precision ?? "Approximate"}
                  </p>
                </div>
                <div className="bg-paper border border-ink/10 rounded-sm p-3">
                  <b>Coordinates</b>
                  <p className="text-ink-soft mt-1">
                    {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
                  </p>
                </div>
                <div className="bg-paper border border-ink/10 rounded-sm p-3">
                  <b>AI route</b>
                  <p className="text-ink-soft mt-1">
                    {(selected.routing_decision ?? "government_field").replace(
                      /_/g,
                      " → ",
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-ink/10 rounded-md p-5">
              <h3 className="font-display font-extrabold text-xl">
                Ground verification report
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                {hi
                  ? "जाकर वास्तविक स्थिति लिखें और साइट की फोटो लगाएँ।"
                  : "Record what you actually observed at the site and attach proof photos."}
              </p>
              <textarea
                value={report}
                onChange={(e) => setReport(e.target.value)}
                rows={5}
                className="mt-4 w-full border border-ink/15 bg-paper rounded-sm p-3 text-sm outline-none focus:border-pine-700"
                placeholder="Observed condition, severity, affected area, measurements, nearby landmark..."
              />
              <label className="mt-4 flex items-center justify-center border-2 border-dashed border-ink/15 rounded-sm p-5 cursor-pointer hover:border-pine-700/40">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onPhotos(e.target.files)}
                />
                <span className="text-sm font-bold">
                  📷{" "}
                  {hi
                    ? "साइट फोटो जोड़ें (अधिकतम 5)"
                    : "Add site photos (up to 5)"}
                </span>
              </label>
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                  {photos.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Verification ${i + 1}`}
                      className="w-full h-24 object-cover rounded-sm border border-ink/10"
                    />
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-5">
                <button
                  onClick={() => save("verified")}
                  className="bg-pine-800 text-paper px-4 py-2.5 rounded-sm text-sm font-extrabold"
                >
                  ✅ Verified
                </button>
                <button
                  onClick={() => save("not_found")}
                  className="border border-brick-500 text-brick-600 px-4 py-2.5 rounded-sm text-sm font-extrabold"
                >
                  ❌ Not Found
                </button>
                <button
                  onClick={() => save("need_more_evidence")}
                  className="border border-marigold-500 text-marigold-700 px-4 py-2.5 rounded-sm text-sm font-extrabold"
                >
                  ⚠ Need More Evidence
                </button>
                <button
                  onClick={() => save("escalated")}
                  className="border-2 border-brick-600 text-brick-700 px-4 py-2.5 rounded-sm text-sm font-extrabold"
                >
                  🚨 Escalate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CitizenLocalPreview({
  challenges,
  session,
  hi,
  toast,
}: {
  challenges: Challenge[];
  session: Session;
  hi: boolean;
  toast: (m: string) => void;
}) {
  const [district, setDistrict] = useState("");
  const [domain, setDomain] = useState("");
  const [stage, setStage] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [rating, setRating] = useState<Record<string, number>>({});
  const [review, setReview] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<
    Record<string, { average: number; count: number; items: any[] }>
  >({});
  const loadReviews = async (id: string) => {
    try {
      const x = await api.getReviews(id);
      setReviews((r) => ({ ...r, [id]: x }));
    } catch {}
  };
  useEffect(() => {
    challenges.slice(0, 30).forEach((c) => loadReviews(c.id));
  }, [challenges.length]);

  const publicProblems = challenges
    .filter((c) => !district || c.district === district)
    .filter((c) => !domain || c.domain === domain)
    .filter((c) => !stage || c.stage === stage);
  const districts = Array.from(
    new Set(challenges.map((c) => c.district).filter(Boolean)),
  ).sort();
  const domains = Array.from(
    new Set(challenges.map((c) => c.domain).filter(Boolean)),
  );
  const activeStages = STAGES.filter((s) =>
    challenges.some((c) => c.stage === s.id),
  );
  const submit = async (id: string) => {
    const stars = rating[id] || 0;
    if (stars < 1) {
      toast(hi ? "कृपया रेटिंग चुनें" : "Please choose a rating");
      return;
    }
    try {
      await api.reviewProblem(id, session, stars, review[id] || "");
      await loadReviews(id);
      setReview((r) => ({ ...r, [id]: "" }));
      toast(hi ? "रिव्यू सेव हो गया" : "Review saved");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save review");
    }
  };
  const stageProgress = (c: Challenge) =>
    Math.round(((stageIdx(c.stage) + 1) / STAGES.length) * 100);

  return (
    <div>
      <div className="bg-card border border-ink/10 rounded-md p-5 mb-5 shadow-[4px_4px_0_rgba(11,44,33,.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-pine-700">
              {hi ? "नागरिक समस्या समीक्षा" : "Citizen Problem Review"}
            </p>
            <h2 className="font-display font-extrabold text-2xl text-ink mt-1">
              {hi
                ? "लोगों द्वारा दर्ज समस्याएँ"
                : "Problems submitted by citizens"}
            </h2>
            <p className="text-[12.5px] text-ink-soft mt-1 max-w-2xl">
              {hi
                ? "हर समस्या का प्रकार, प्राथमिकता और वर्तमान चरण एक ही जगह देखें। किसी कार्ड को खोलकर पूरी प्रगति और अपडेट देखें।"
                : "See the problem type, priority and current stage in one place. Open any card to view its complete progress and latest updates."}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-center bg-pine-100/70 border border-pine-700/15 rounded-sm px-4 py-2">
              <div className="font-display font-extrabold text-xl text-pine-800">
                {challenges.length}
              </div>
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-ink-soft">
                {hi ? "कुल रिपोर्ट" : "Reports"}
              </div>
            </div>
            <div className="text-center bg-marigold-500/10 border border-marigold-500/20 rounded-sm px-4 py-2">
              <div className="font-display font-extrabold text-xl text-marigold-700">
                {challenges.filter((c) => stageIdx(c.stage) >= 3).length}
              </div>
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-ink-soft">
                {hi ? "आगे भेजी गई" : "Routed+"}
              </div>
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-2 mt-4">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-paper border border-ink/15 rounded-sm px-3 py-2.5 text-sm font-bold"
          >
            <option value="">{hi ? "सभी जिले" : "All districts"}</option>
            {districts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="bg-paper border border-ink/15 rounded-sm px-3 py-2.5 text-sm font-bold"
          >
            <option value="">
              {hi ? "सभी समस्या प्रकार" : "All problem types"}
            </option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {domainById(d).en}
              </option>
            ))}
          </select>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="bg-paper border border-ink/15 rounded-sm px-3 py-2.5 text-sm font-bold"
          >
            <option value="">{hi ? "सभी स्थिति" : "All stages"}</option>
            {activeStages.map((s) => (
              <option key={s.id} value={s.id}>
                {hi ? s.hi : s.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {publicProblems.map((c, i) => {
          const rv = reviews[c.id];
          const avg = rv?.average ?? 0;
          const di = stageIdx(c.stage);
          const progress = stageProgress(c);
          const open = openId === c.id;
          return (
            <Reveal key={c.id} delay={Math.min(i * 45, 250)}>
              <div className="bg-card border border-ink/10 rounded-md overflow-hidden shadow-[4px_4px_0_rgba(11,44,33,.06)]">
                <button
                  onClick={() => setOpenId(open ? null : c.id)}
                  className="w-full text-left p-5 hover:bg-pine-100/30 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold tabular text-ink-soft">
                          {c.id}
                        </span>
                        <DomainTag id={c.domain} />
                        {c.priority >= 80 && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-brick-500/10 text-brick-600 border border-brick-500/20">
                            {hi ? "उच्च प्राथमिकता" : "High priority"}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-extrabold text-lg text-ink">
                        {c.title}
                      </h3>
                      <p className="text-[12px] text-ink-soft mt-1 flex items-center gap-1.5">
                        <Icon name="pin" className="w-3.5 h-3.5" sw={2.2} />
                        {c.district} · {c.block} · {c.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <StagePill stage={c.stage} />
                      <p className="text-[10px] font-extrabold text-ink-soft mt-2">
                        {progress}% {hi ? "पूरा" : "progress"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-ink/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${progress}%`,
                          background: stageById(c.stage).color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-extrabold text-ink-soft">
                      {hi ? STAGES[di].hi : STAGES[di].en}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px] font-bold">
                    <span className="bg-paper border border-ink/10 rounded-sm px-2 py-1.5">
                      <b>{hi ? "प्रकार" : "Type"}:</b> {domainById(c.domain).en}
                    </span>
                    <span className="bg-paper border border-ink/10 rounded-sm px-2 py-1.5">
                      <b>{hi ? "प्राथमिकता" : "Priority"}:</b> {c.priority}/100
                    </span>
                    <span className="bg-paper border border-ink/10 rounded-sm px-2 py-1.5">
                      <b>{hi ? "रिपोर्ट" : "Reports"}:</b> {c.reports ?? 1}
                    </span>
                    <span className="bg-paper border border-ink/10 rounded-sm px-2 py-1.5">
                      <b>{hi ? "समर्थन" : "Support"}:</b> {c.votes}
                    </span>
                  </div>
                </button>
                {open && (
                  <div className="px-5 pb-5 border-t border-ink/10 bg-paper/50">
                    <div className="grid md:grid-cols-[1.4fr_.8fr] gap-5 pt-5">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                          {hi ? "समस्या का विवरण" : "Problem details"}
                        </p>
                        <p className="text-sm leading-relaxed text-ink mt-2">
                          {c.desc}
                        </p>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft mt-5 mb-3">
                          {hi ? "अब तक की प्रगति" : "Progress so far"}
                        </p>
                        <div className="space-y-3">
                          {c.updates.map((u: any, idx: number) => (
                            <div key={idx} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <span
                                  className="w-3 h-3 rounded-full mt-1.5"
                                  style={{
                                    background: stageById(u.stage).color,
                                  }}
                                />
                                {idx < c.updates.length - 1 && (
                                  <span className="w-px flex-1 bg-ink/15 mt-1" />
                                )}
                              </div>
                              <div className="pb-2">
                                <p
                                  className="text-xs font-extrabold"
                                  style={{ color: stageById(u.stage).color }}
                                >
                                  {hi
                                    ? stageById(u.stage).hi
                                    : stageById(u.stage).en}{" "}
                                  <span className="text-ink-soft font-semibold">
                                    · {u.time}
                                  </span>
                                </p>
                                <p className="text-[12px] text-ink-soft mt-0.5">
                                  {u.note}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="bg-card border border-ink/10 rounded-md p-4">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                            {hi ? "समुदाय की राय" : "Community rating"}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl font-display font-extrabold text-marigold-600">
                              {avg.toFixed(1)}
                            </span>
                            <span className="text-marigold-500 text-lg">★</span>
                            <span className="text-xs text-ink-soft">
                              ({rv?.count ?? 0} ratings)
                            </span>
                          </div>
                          <div className="mt-3 flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={() =>
                                  setRating((r) => ({ ...r, [c.id]: n }))
                                }
                                className={cx(
                                  "text-2xl leading-none",
                                  (rating[c.id] || 0) >= n
                                    ? "text-marigold-500"
                                    : "text-ink/20",
                                )}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={review[c.id] || ""}
                            onChange={(e) =>
                              setReview((r) => ({
                                ...r,
                                [c.id]: e.target.value,
                              }))
                            }
                            maxLength={500}
                            placeholder={
                              hi
                                ? "वैकल्पिक टिप्पणी"
                                : "Optional community comment"
                            }
                            className="mt-2 w-full border border-ink/15 rounded-sm p-2 text-sm bg-paper outline-none"
                          />
                          <button
                            onClick={() => submit(c.id)}
                            className="mt-2 bg-pine-800 text-paper px-3 py-2 rounded-sm text-xs font-extrabold"
                          >
                            {hi ? "रिव्यू भेजें" : "Submit review"}
                          </button>
                        </div>
                        {(rv?.items || []).slice(0, 3).map((x: any) => (
                          <div
                            key={x.id}
                            className="mt-3 bg-pine-100/50 border border-pine-700/10 p-3 rounded-sm text-xs"
                          >
                            <b>{x.user_name}</b> · {"★".repeat(x.rating)}
                            <div className="text-ink-soft mt-1">
                              {x.text || "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
      {!publicProblems.length && (
        <div className="p-10 text-center text-ink-soft bg-card border border-dashed border-ink/20">
          {hi
            ? "इस फ़िल्टर में कोई सार्वजनिक समस्या नहीं मिली।"
            : "No citizen problems match these filters."}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   CITIZEN DASHBOARD MAP — problem location + current citizen location
   ==========================================================================*/
function CitizenDashboardMap({
  challenges,
  currentCoords,
  openId,
  setOpenId,
  hi,
}: {
  challenges: Challenge[];
  currentCoords: { lat: number; lng: number; accuracy?: number } | null;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  hi: boolean;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const esc = (v: unknown) =>
    String(v ?? "").replace(
      /[&<>\"]/g,
      (ch) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch] || ch,
    );
  const locationMeta = (c: Challenge) => {
    const source = c.problem_location?.source || c.location_source;
    if (source === "browser_gps")
      return {
        label: "Exact GPS",
        accuracy: c.problem_location?.accuracy_meters ?? c.accuracy,
        cls: "Exact GPS",
      };
    if (source === "address_geocode")
      return {
        label: "Address-based · Approximate",
        accuracy: null,
        cls: "Address-based",
      };
    return {
      label: "District / Ward fallback · Approximate",
      accuracy: null,
      cls: "District/Ward fallback",
    };
  };
  useEffect(() => {
    if (!mapRef.current || typeof L === "undefined") return;
    if (!mapObj.current) {
      mapObj.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([23.65, 85.3], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapObj.current);
      layerRef.current = L.layerGroup().addTo(mapObj.current);
    }
    const layer = layerRef.current;
    layer.clearLayers();
    const bounds: any[] = [];
    if (currentCoords) {
      bounds.push([currentCoords.lat, currentCoords.lng]);
      const me = L.circleMarker([currentCoords.lat, currentCoords.lng], {
        radius: 10,
        color: "#fff",
        weight: 3,
        fillColor: "#2563eb",
        fillOpacity: 0.98,
      }).addTo(layer);
      const accuracy = Number.isFinite(currentCoords.accuracy)
        ? `Accuracy: ±${currentCoords.accuracy} m`
        : "GPS accuracy unavailable";
      me.bindPopup(
        `<div style="min-width:190px;font-family:Arial"><b>🔵 ${hi ? "आपकी वर्तमान location" : "Your current location"}</b><br/><span>${accuracy}</span><br/><span>${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}</span></div>`,
      );
    }
    challenges
      .filter(
        (c) => Number.isFinite(Number(c.lat)) && Number.isFinite(Number(c.lng)),
      )
      .forEach((c) => {
        const lat = Number(c.problem_location?.lat ?? c.lat),
          lng = Number(c.problem_location?.lng ?? c.lng);
        bounds.push([lat, lng]);
        const isOpen = openId === c.id;
        const marker = L.circleMarker([lat, lng], {
          radius: isOpen ? 10 : 7,
          color: "#fff",
          weight: 2,
          fillColor: "#dc2626",
          fillOpacity: 0.95,
        }).addTo(layer);
        const meta = locationMeta(c);
        const accuracyText = meta.accuracy ? ` · ±${meta.accuracy} m` : "";
        const address = c.problem_location?.address || c.location_address || "";
        marker.bindPopup(
          `<div style="min-width:235px;font-family:Arial"><b>🔴 ${esc(c.title)}</b><br/><span>${esc(c.district)} · ${esc(c.block)}</span>${address ? `<br/><span>${esc(address)}</span>` : ""}<br/><span><b>Location:</b> ${meta.label}${accuracyText}</span><br/><b>Stage:</b> ${esc(stageById(c.stage)?.en || c.stage)}<br/><b>Progress:</b> ${Math.round(((stageIdx(c.stage) + 1) / STAGES.length) * 100)}%</div>`,
        );
        marker.on("click", () => setOpenId(c.id));
        if (isOpen) marker.openPopup();
      });
    if (bounds.length > 1)
      mapObj.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    else if (bounds.length === 1) mapObj.current.setView(bounds[0], 14);
    else mapObj.current.setView([23.65, 85.3], 7);
    setTimeout(() => mapObj.current?.invalidateSize(), 60);
  }, [challenges, currentCoords, openId, hi, setOpenId]);
  useEffect(
    () => () => {
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
      }
    },
    [],
  );
  return (
    <div className="bg-card border border-ink/10 rounded-md overflow-hidden shadow-[4px_4px_0_rgba(11,44,33,.06)]">
      <div className="p-4 border-b border-ink/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-pine-700">
            {hi ? "समस्या स्थान मानचित्र" : "Problem location map"}
          </p>
          <h3 className="font-display font-extrabold text-xl text-ink mt-1">
            {hi
              ? "आप कहाँ हैं और समस्या कहाँ है"
              : "Where you are vs where the problem is"}
          </h3>
          <p className="text-[11px] text-ink-soft mt-1">
            {hi
              ? "नीला = आपकी current GPS · लाल = problem location"
              : "Blue = your current GPS · Red = actual problem location"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-extrabold">
          <span className="inline-flex items-center gap-1.5 bg-blue-600/10 text-blue-700 px-2 py-1 rounded-sm">
            <i className="w-2.5 h-2.5 rounded-full bg-blue-600" />{" "}
            {hi ? "आप" : "You"}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-red-600/10 text-red-700 px-2 py-1 rounded-sm">
            <i className="w-2.5 h-2.5 rounded-full bg-red-600" />{" "}
            {hi ? "समस्या" : "Problem"}
          </span>
        </div>
      </div>
      <div ref={mapRef} className="h-[390px] w-full" />
      <div className="px-4 py-3 grid sm:grid-cols-3 gap-2 text-[10px] font-semibold bg-pine-100/50 border-t border-ink/10">
        <div>🟢 {hi ? "Exact GPS" : "Exact GPS"} — ±meters</div>
        <div>
          🟡 {hi ? "Address आधारित — अनुमानित" : "Address-based — approximate"}
        </div>
        <div>
          🟠{" "}
          {hi
            ? "District/Ward fallback — अनुमानित"
            : "District/Ward fallback — approximate"}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   CITIZEN DASHBOARD — public problem review, how-it-works and solved stories
   ==========================================================================*/
function CitizenDashboardExtras({
  challenges,
  session,
  lang,
  toast,
  patch,
}: {
  challenges: Challenge[];
  session: Session;
  lang: Lang;
  toast: (m: string) => void;
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
}) {
  const hi = lang === "hi";
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("all");
  const [stage, setStage] = useState("all");
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [reviews, setReviews] = useState<
    Record<string, { average: number; count: number; items: any[] }>
  >({});
  const [rating, setRating] = useState<Record<string, number>>({});
  const [text, setText] = useState<Record<string, string>>({});
  const [openReview, setOpenReview] = useState<string | null>(null);

  // The dashboard review is a portal-wide public view. A citizen's own report
  // should remain reviewable here instead of making the panel appear empty.
  const publicProblems = challenges;
  const filtered = publicProblems.filter((c) => {
    const q = query.trim().toLowerCase();
    const matchesQ =
      !q ||
      `${c.title} ${c.desc} ${c.district} ${c.block} ${domainById(c.domain).en}`
        .toLowerCase()
        .includes(q);
    return (
      matchesQ &&
      (domain === "all" || c.domain === domain) &&
      (stage === "all" || c.stage === stage)
    );
  });
  const solved = challenges.filter((c) => c.stage === "deployed").slice(0, 4);
  const loadReviews = async (id: string) => {
    try {
      const x = await api.getReviews(id);
      setReviews((r) => ({ ...r, [id]: x }));
    } catch {}
  };
  const submitReview = async (c: Challenge) => {
    const stars = rating[c.id] || 0;
    if (stars < 1) {
      toast(hi ? "पहले 1–5 स्टार चुनें" : "Choose a 1–5 star rating first");
      return;
    }
    try {
      await api.reviewProblem(c.id, session, stars, text[c.id] || "");
      await loadReviews(c.id);
      setText((t) => ({ ...t, [c.id]: "" }));
      toast(hi ? "Review सेव हो गया" : "Review saved");
    } catch (e: any) {
      toast(e?.message || "Could not save review");
    }
  };

  return (
    <>
      <section
        id="problem-review"
        className="mt-6 bg-card border border-ink/10 rounded-md overflow-hidden shadow-[4px_4px_0_rgba(11,44,33,.06)]"
      >
        <div className="p-5 border-b border-ink/10 bg-pine-100/50 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-pine-700">
              {hi ? "सार्वजनिक समस्या समीक्षा" : "Public Problem Review"}
            </p>
            <h2 className="font-display font-extrabold text-2xl">
              {hi
                ? "पोर्टल पर दर्ज समस्याएँ देखें और समाधान को रेट करें"
                : "Review problems submitted on the portal"}
            </h2>
            <p className="text-[11px] text-ink-soft mt-1">
              {hi
                ? "किसी भी नागरिक की समस्या खोलें, उसकी पूरी यात्रा देखें और समाधान को 1–5 स्टार दें।"
                : "Open any public problem, follow its complete journey and rate the solution from 1–5 stars."}
            </p>
          </div>
          <span className="text-[10px] font-extrabold bg-paper border border-ink/10 px-2 py-1.5 rounded-sm">
            {filtered.length} {hi ? "दिख रही हैं" : "visible"}
          </span>
        </div>
        <div className="p-4 grid md:grid-cols-[1fr_180px_180px] gap-2 border-b border-ink/10">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              hi
                ? "समस्या, जिला या प्रकार खोजें…"
                : "Search problem, district or type…"
            }
            className="bg-paper border border-ink/15 rounded-sm px-3 py-2 text-xs outline-none"
          />
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="bg-paper border border-ink/15 rounded-sm px-2 py-2 text-xs font-semibold"
          >
            <option value="all">{hi ? "सभी प्रकार" : "All types"}</option>
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>
                {hi ? d.hi : d.en}
              </option>
            ))}
          </select>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="bg-paper border border-ink/15 rounded-sm px-2 py-2 text-xs font-semibold"
          >
            <option value="all">{hi ? "सभी चरण" : "All stages"}</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {hi ? s.hi : s.en}
              </option>
            ))}
          </select>
        </div>
        <div className="p-4 grid md:grid-cols-2 gap-3">
          {filtered.slice(0, 10).map((c) => {
            const progress = Math.round(
              ((stageIdx(c.stage) + 1) / STAGES.length) * 100,
            );
            const isSel = selected?.id === c.id;
            return (
              <div
                key={c.id}
                className={cx(
                  "border rounded-md overflow-hidden transition-all",
                  isSel
                    ? "border-pine-700 shadow-[3px_3px_0_rgba(11,44,33,.08)]"
                    : "border-ink/10",
                )}
              >
                <button
                  onClick={() => {
                    setSelected(isSel ? null : c);
                    if (!isSel) loadReviews(c.id);
                  }}
                  className="w-full text-left p-4 hover:bg-pine-100/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="font-mono text-[9px] text-ink-soft">
                          {c.id}
                        </span>
                        <DomainTag id={c.domain} />
                      </div>
                      <h3 className="font-display font-extrabold text-[16px] mt-1">
                        {c.title}
                      </h3>
                      <p className="text-[10.5px] text-ink-soft mt-1">
                        {c.district} · {c.block} · {c.byType}
                      </p>
                    </div>
                    <div className="text-right">
                      <StagePill stage={c.stage} />
                      <b className="block text-[10px] mt-1">{progress}%</b>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-ink/10 rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background: stageById(c.stage).color,
                      }}
                    />
                  </div>
                </button>
                {isSel && (
                  <div className="border-t border-ink/10 p-4 bg-paper/70">
                    <p className="text-[11px] leading-relaxed">{c.desc}</p>
                    <div className="mt-3 grid sm:grid-cols-3 gap-2 text-[10px] font-bold">
                      <span className="bg-card border border-ink/10 p-2 rounded-sm">
                        Type: {domainById(c.domain).en}
                      </span>
                      <span className="bg-card border border-ink/10 p-2 rounded-sm">
                        Priority: {c.priority}/100
                      </span>
                      <span className="bg-card border border-ink/10 p-2 rounded-sm">
                        Support: {c.votes}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-pine-700">
                        {hi ? "समाधान की पूरी यात्रा" : "Full solution journey"}
                      </p>
                      <div className="mt-2 grid gap-2">
                        {STAGES.map((s, i) => {
                          const done = stageIdx(c.stage) >= i;
                          const update = c.updates.find(
                            (u) => u.stage === s.id,
                          );
                          return (
                            <div key={s.id} className="flex gap-2 items-start">
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0"
                                style={{
                                  background: done ? s.color : "#e5e7eb",
                                  color: done ? "#fff" : "#6b7280",
                                }}
                              >
                                {done ? "✓" : i + 1}
                              </span>
                              <div>
                                <b className="text-[10.5px]">
                                  {hi ? s.hi : s.en}
                                </b>
                                {update && (
                                  <p className="text-[10px] text-ink-soft">
                                    {update.time} · {update.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-ink/10">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest">
                          {hi ? "Community rating" : "Community rating"}
                        </p>
                        <b className="text-marigold-700">
                          {(reviews[c.id]?.average || 0).toFixed(1)} ★ (
                          {reviews[c.id]?.count || 0})
                        </b>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() =>
                              setRating((r) => ({ ...r, [c.id]: n }))
                            }
                            className={cx(
                              "text-2xl leading-none",
                              (rating[c.id] || 0) >= n
                                ? "text-marigold-500"
                                : "text-ink/20",
                            )}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={text[c.id] || ""}
                        onChange={(e) =>
                          setText((t) => ({ ...t, [c.id]: e.target.value }))
                        }
                        maxLength={500}
                        placeholder={
                          hi
                            ? "समाधान पर अपना review लिखें…"
                            : "Write your solution review…"
                        }
                        className="mt-2 w-full bg-card border border-ink/15 rounded-sm p-2 text-xs outline-none"
                      />
                      <button
                        onClick={() => submitReview(c)}
                        className="mt-2 bg-pine-800 text-paper px-3 py-2 rounded-sm text-[11px] font-extrabold"
                      >
                        {hi ? "Review भेजें" : "Submit review"}
                      </button>
                      {(reviews[c.id]?.items || [])
                        .slice(0, 3)
                        .map((r: any) => (
                          <div
                            key={r.id}
                            className="mt-2 p-2 bg-pine-100/50 rounded-sm text-[10px]"
                          >
                            <b>{r.user_name || "Community member"}</b> ·{" "}
                            {"★".repeat(r.rating)}
                            {r.text && (
                              <span className="text-ink-soft"> · {r.text}</span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {filtered.length > 10 && (
          <div className="px-5 pb-4 text-[10px] font-bold text-ink-soft">
            Showing 10 at a time. Use search and filters to review more.
          </div>
        )}
      </section>

      <section id="how-it-works" className="mt-6">
        <div className="mb-3">
          <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-pine-700">
            {hi ? "पोर्टल कैसे काम करता है" : "How Samadhan Setu works"}
          </p>
          <h2 className="font-display font-extrabold text-2xl">
            {hi
              ? "समस्या से समाधान तक पूरा सफर"
              : "From citizen problem to real-world solution"}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            [
              "01",
              "Report",
              "Citizen submits the issue with evidence, address and problem location.",
            ],
            [
              "02",
              "AI triage",
              "AI classifies the domain, estimates urgency and finds duplicates.",
            ],
            [
              "03",
              "Verify & route",
              "Officials/community validate it and the platform routes it to the best-fit institution.",
            ],
            [
              "04",
              "Build & deploy",
              "University + industry teams prototype, pilot, measure impact and hand over the solution.",
            ],
          ].map(([n, t, d]) => (
            <div
              key={n}
              className="bg-card border border-ink/10 rounded-md p-4"
            >
              <span className="font-mono text-xs font-extrabold text-marigold-700">
                {n}
              </span>
              <h3 className="font-display font-extrabold text-lg mt-1">{t}</h3>
              <p className="text-[11px] text-ink-soft leading-relaxed mt-1.5">
                {d}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-pine-925 text-paper rounded-md p-4 flex flex-wrap items-center gap-2 text-[10.5px] font-extrabold">
          <span>Citizen</span>
          <b>→</b>
          <span>AI Review</span>
          <b>→</b>
          <span>Validation</span>
          <b>→</b>
          <span>HEI</span>
          <b>→</b>
          <span>Prototype</span>
          <b>→</b>
          <span>Pilot</span>
          <b>→</b>
          <span className="text-moss-400">Deployed</span>
        </div>
      </section>

      <section id="solved-problems" className="mt-6">
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-pine-700">
              {hi ? "समाधान के उदाहरण" : "Solved problem demos"}
            </p>
            <h2 className="font-display font-extrabold text-2xl">
              {hi
                ? "देखें एक समस्या कैसे पूरी हुई"
                : "See how a problem was actually finished"}
            </h2>
          </div>
          <span className="text-[10px] font-extrabold bg-moss-400/15 text-pine-800 px-2 py-1 rounded-sm">
            {solved.length} deployed demos
          </span>
        </div>
        <div className="grid lg:grid-cols-3 gap-3">
          {solved.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-ink/10 rounded-md p-4 shadow-[3px_3px_0_rgba(11,44,33,.05)]"
            >
              <div className="flex items-center justify-between gap-2">
                <DomainTag id={c.domain} />
                <span className="text-[9px] font-extrabold uppercase bg-moss-400/15 text-pine-800 px-2 py-1 rounded-sm">
                  ✓ Deployed
                </span>
              </div>
              <h3 className="font-display font-extrabold text-[16px] mt-2">
                {c.title}
              </h3>
              <p className="text-[10.5px] text-ink-soft mt-1">
                {c.district} · {c.block}
              </p>
              <div className="mt-3 space-y-2">
                {c.updates.map((u, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-pine-800 text-paper flex items-center justify-center text-[8px] font-extrabold shrink-0">
                      ✓
                    </span>
                    <div>
                      <b className="text-[10px]">
                        {stageById(u.stage)?.en || u.stage}
                      </b>
                      <p className="text-[9.5px] text-ink-soft">
                        {u.time} · {u.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {c.impact && (
                <div className="mt-3 p-2 bg-pine-100/60 border border-pine-700/10 rounded-sm text-[10px] font-extrabold">
                  Impact: {c.impact}
                </div>
              )}
              <button
                onClick={() => {
                  setSelected(c);
                  document
                    .getElementById("problem-review")
                    ?.scrollIntoView({ behavior: "smooth" });
                  loadReviews(c.id);
                }}
                className="mt-3 text-[10px] font-extrabold text-pine-800 underline"
              >
                Review this solved problem →
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ============================================================================
   CITIZEN DASHBOARD — personal + nearby community problem intelligence
   ==========================================================================*/
function CitizenDashboard({
  challenges,
  session,
  lang,
  toast,
  patch,
  onSubmit,
  onReview,
  onComplaint,
}: {
  challenges: Challenge[];
  session: Session;
  lang: Lang;
  toast: (m: string) => void;
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  onSubmit: () => void;
  onReview: () => void;
  onComplaint: () => void;
}) {
  const hi = lang === "hi";
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [radius, setRadius] = useState(10);
  const [districtFilter, setDistrictFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showHighPriorityOnly, setShowHighPriorityOnly] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedMyReportId, setSelectedMyReportId] = useState<string | null>(
    null,
  );
  const [sameAreaOpen, setSameAreaOpen] = useState(false);
  const [myReportsInlineOpen, setMyReportsInlineOpen] = useState(false);
  const [myReportsView, setMyReportsView] = useState<"active" | "solved">(
    "active",
  );
  const [locationRequested, setLocationRequested] = useState(false);
  const [reviews, setReviews] = useState<
    Record<string, { average: number; count: number; items: any[] }>
  >({});
  const [rating, setRating] = useState<Record<string, number>>({});
  const [reviewText, setReviewText] = useState<Record<string, string>>({});
  const loadReviews = async (id: string) => {
    try {
      const x = await api.getReviews(id);
      setReviews((r) => ({ ...r, [id]: x }));
    } catch {}
  };

  const districtOptions = Array.from(
    new Set(challenges.map((c) => c.district).filter(Boolean)),
  ).sort();
  const quickActions = [
    {
      label: hi ? "नई समस्या दर्ज करें" : "Submit new problem",
      icon: "plus",
      onClick: onSubmit,
    },
    {
      label: hi ? "मेरी रिपोर्ट देखें" : "View my reports",
      icon: "doc",
      onClick: () => {
        setMyReportsInlineOpen(true);
        setMyReportsView("active");
        if (filteredMine.length)
          setSelectedMyReportId(
            filteredMine.find((c) => c.stage !== "deployed")?.id ??
              filteredMine[0].id,
          );
      },
    },
    {
      label: hi ? "हल की गई रिपोर्टें" : "Solved problems",
      icon: "check",
      onClick: () => {
        setMyReportsInlineOpen(true);
        setMyReportsView("solved");
        if (filteredMine.length)
          setSelectedMyReportId(
            filteredMine.find((c) => c.stage === "deployed")?.id ??
              filteredMine[0].id,
          );
      },
    },
  ];

  const requestLocation = () => {
    if (!navigator.geolocation) return Promise.resolve(false);
    setLocationRequested(true);
    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          });
          resolve(true);
        },
        () => resolve(false),
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 300000 },
      );
    });
  };

  useEffect(() => {
    if (!navigator.geolocation || locationRequested) return;
    requestLocation();
  }, [locationRequested]);

  const myReportIds = useMemo(() => {
    const key = `ss_my_reports_${session?.token || session?.id || "anon"}`;
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(
        Array.isArray(parsed)
          ? parsed.filter((value): value is string => typeof value === "string")
          : [],
      );
    } catch {
      return new Set<string>();
    }
  }, [session?.token, session?.id]);

  const isMyIssue = (c: Challenge) => {
    const norm = (value?: string) => (value ?? "").trim().toLowerCase();
    const userIds = [session.id, session.sub, session.token].filter(
      Boolean,
    ) as string[];
    const userNames = [norm(session.name)];
    const userOrgs = [norm(session.org)];

    const reporterUserId = c.reporter?.user_id ?? "";
    const reporterName = norm(c.reporter?.name);
    const reportByName = norm(c.by);
    const reporterOrg = norm(c.reporter?.organisation);
    const issueOrg = norm(c.org);

    const reporterMatches = Boolean(
      userIds.includes(reporterUserId) ||
      userNames.includes(reporterName) ||
      userNames.includes(reportByName) ||
      userOrgs.includes(reporterOrg) ||
      userOrgs.includes(issueOrg),
    );

    // Ignore static demo flags like `mine: true` when they are not tied to the signed-in user.
    // We only trust the backend/session identity or persisted local IDs for the current citizen.
    return Boolean(
      myReportIds.has(c.id) || (c.mine === true && reporterMatches),
    );
  };
  const mine = challenges.filter(isMyIssue);
  const distanceKm = (a: Challenge) => {
    if (!coords || !Number.isFinite(a.lat) || !Number.isFinite(a.lng))
      return Infinity;
    const R = 6371,
      rad = Math.PI / 180;
    const dLat = (a.lat - coords.lat) * rad,
      dLng = (a.lng - coords.lng) * rad;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(coords.lat * rad) *
        Math.cos(a.lat * rad) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };
  const nearby = challenges
    .filter((c) => !mine.some((m) => m.id === c.id))
    .map((c) => ({ c, d: distanceKm(c) }))
    .filter((x) => (coords ? x.d <= radius : true))
    .sort((a, b) => (coords ? a.d - b.d : b.c.priority - a.c.priority));
  const filteredMine = mine.filter(
    (c) =>
      (districtFilter === "all" || c.district === districtFilter) &&
      (categoryFilter === "all" || c.domain === categoryFilter) &&
      (!showHighPriorityOnly || c.priority >= 80),
  );
  const myReportsList =
    myReportsView === "active"
      ? filteredMine.filter((c) => c.stage !== "deployed")
      : filteredMine.filter((c) => c.stage === "deployed");
  const selectedMyReport =
    myReportsList.find((c) => c.id === selectedMyReportId) ??
    myReportsList[0] ??
    null;
  const filteredNearby = nearby
    .filter(
      (x) =>
        (districtFilter === "all" || x.c.district === districtFilter) &&
        (categoryFilter === "all" || x.c.domain === categoryFilter) &&
        (!showHighPriorityOnly || x.c.priority >= 80),
    )
    .slice(0, 8);
  const sameAreaComplaints = coords
    ? challenges
        .map((c) => ({ c, d: distanceKm(c) }))
        .filter(({ c, d }) => Number.isFinite(d) && d <= 10 && c.id !== openId)
        .sort((a, b) => a.d - b.d)
        .slice(0, 6)
    : [];
  const active = filteredMine.filter((c) => c.stage !== "deployed").length;
  const deployed = filteredMine.filter((c) => c.stage === "deployed").length;
  const highPriority = filteredNearby.filter((x) => x.c.priority >= 80).length;
  const totalIssues = challenges.length;
  const openIssues = challenges.filter((c) => c.stage !== "deployed").length;
  const resolvedIssues = challenges.filter(
    (c) => c.stage === "deployed",
  ).length;
  const resolutionRate = Math.round(
    totalIssues ? (resolvedIssues / totalIssues) * 100 : 0,
  );
  const communityImpact = challenges.reduce(
    (sum, c) => sum + (c.votes || 0) + (c.reports || 0),
    0,
  );
  const averageResolutionDays = resolvedIssues
    ? Math.max(
        1,
        Math.round(
          challenges
            .filter((c) => c.stage === "deployed")
            .reduce(
              (sum, c) =>
                sum +
                Math.max(
                  1,
                  Math.round(
                    (Date.now() - new Date(c.date || Date.now()).getTime()) /
                      86400000,
                  ),
                ),
              0,
            ) / resolvedIssues,
        ),
      )
    : 0;
  const govtReviewPending = challenges.filter(
    (c) => c.stage === "government_review" || c.stage === "field_verification",
  ).length;
  const urgentChallenges = [...challenges]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
  const mostActiveDistricts = Object.entries(
    challenges.reduce<Record<string, number>>((acc, c) => {
      const key = c.district || "Unspecified";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  const resolutionTrend = Math.round(
    challenges.length ? (resolvedIssues / challenges.length) * 100 : 0,
  );
  const latestActivity = [...challenges]
    .sort((a, b) => {
      const aTime = Number(new Date(String(a.date || "1970-01-01")).getTime());
      const bTime = Number(new Date(String(b.date || "1970-01-01")).getTime());
      return bTime - aTime;
    })
    .slice(0, 5);
  const aiRecommendations = [
    {
      title: hi ? "तत्काल ध्यान" : "Urgent attention",
      text: urgentChallenges[0]
        ? `${urgentChallenges[0].title} is the highest priority issue.`
        : hi
          ? "कोई सबसे अधिक प्राथमिकता वाला मामला मौजूद नहीं है।"
          : "No highest-priority issue is active right now.",
    },
    {
      title: hi ? "सबसे सक्रिय क्षेत्र" : "Active districts",
      text: mostActiveDistricts.length
        ? `${mostActiveDistricts.map(([name]) => name).join(", ")} are generating the most reports.`
        : hi
          ? "अभी कोई सक्रिय जिला नहीं मिला।"
          : "No active districts found yet.",
    },
    {
      title: hi ? "रिज़ॉल्यूशन ट्रेंड" : "Resolution trend",
      text: `${resolutionTrend}% of all issues have reached a deployed or completed state.`,
    },
    {
      title: hi ? "AI सुझाव" : "AI recommendation",
      text: govtReviewPending
        ? `${govtReviewPending} review items need government attention.`
        : hi
          ? "सभी review queue साफ़ हैं।"
          : "The review queue is clear.",
    },
  ];
  const open = (id: string) => {
    const next = openId === id ? null : id;
    setOpenId(next);
    if (next) loadReviews(next);
  };
  const openMyReport = (id: string) => {
    const next = selectedMyReportId === id ? null : id;
    setSelectedMyReportId(next);
    setOpenId(id);
    if (next) loadReviews(id);
  };
  const submitReview = async (c: Challenge) => {
    const stars = rating[c.id] || 0;
    if (stars < 1) {
      toast(
        hi ? "पहले 1–5 स्टार rating चुनें" : "Choose a 1–5 star rating first",
      );
      return;
    }
    try {
      await api.reviewProblem(c.id, session, stars, reviewText[c.id] || "");
      await loadReviews(c.id);
      setReviewText((x) => ({ ...x, [c.id]: "" }));
      toast(hi ? "आपका review सेव हो गया" : "Your review was saved");
    } catch (e: any) {
      toast(e?.message || "Could not save review");
    }
  };
  const reopenProblem = (c: Challenge) => {
    const now = new Date().toLocaleString("en-IN");
    patch(c.id, (x) => ({
      ...x,
      stage: "department_assignment",
      supervisor_approval: {
        status: "rejected",
        note: "Citizen reported that the problem is still unresolved; reopened for department action.",
      },
      updates: [
        ...x.updates,
        {
          stage: "department_assignment",
          time: now,
          note: `Reopened by citizen ${session.name}: problem is still unresolved.`,
        },
      ],
      citizen_updates: [
        ...(x.citizen_updates || []),
        {
          message:
            "Your report has been reopened and sent back to the department.",
          time: now,
          by: session.name,
        },
      ],
    }));
    toast(
      hi
        ? "समस्या फिर से department को भेज दी गई"
        : "Problem reopened and sent back to the department",
    );
  };

  const ProblemCard = ({
    c,
    distance,
  }: {
    c: Challenge;
    distance?: number;
  }) => {
    const progress = Math.round(
      ((stageIdx(c.stage) + 1) / STAGES.length) * 100,
    );
    const isOpen = openId === c.id;
    const isVerified =
      c.verification?.status === "verified" ||
      c.field_verification?.status === "verified";
    const confidence = Math.max(
      0,
      Math.min(100, c.verification?.score ?? (isVerified ? 88 : 62)),
    );
    const communityRating = reviews[c.id]?.average ?? 0;
    const communityRatingCount = reviews[c.id]?.count ?? 0;
    const ledgerLinked = Boolean(c.qr_url || c.qr_image || c.resolution_proof);
    return (
      <div
        id={`problem-card-${c.id}`}
        className="bg-card border border-ink/10 rounded-md overflow-hidden shadow-[4px_4px_0_rgba(11,44,33,.06)]"
      >
        <button
          onClick={() => open(c.id)}
          className="w-full text-left p-4.5 hover:bg-pine-100/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-[9.5px] font-extrabold text-ink-soft">
                  {c.id}
                </span>
                <DomainTag id={c.domain} />
                {c.priority >= 80 && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-brick-500/10 text-brick-600 border border-brick-500/20">
                    {hi ? "उच्च प्राथमिकता" : "High priority"}
                  </span>
                )}
              </div>
              <h3 className="font-display font-extrabold text-[17px] text-ink leading-tight">
                {c.title}
              </h3>
              <p className="text-[11px] text-ink-soft mt-1 flex flex-wrap items-center gap-1.5">
                <Icon name="pin" className="w-3.5 h-3.5" sw={2.2} />
                {c.district} · {c.block}
                {distance !== undefined && Number.isFinite(distance)
                  ? ` · ${distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}`
                  : ""}
              </p>
            </div>
            <div className="text-right shrink-0">
              <StagePill stage={c.stage} />
              <p className="text-[10px] font-extrabold text-ink-soft mt-1.5">
                {progress}%
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 flex-1 bg-ink/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full progress-fill"
                style={{
                  width: `${progress}%`,
                  background: stageById(c.stage).color,
                }}
              />
            </div>
            <span className="text-[10px] font-extrabold tabular text-ink-soft">
              {progress}%
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[10px] font-bold">
            <span className="bg-paper border border-ink/10 rounded-sm px-2 py-1.5">
              <b>{hi ? "प्रकार" : "Type"}:</b> {domainById(c.domain).en}
            </span>
            <span className="bg-paper border border-ink/10 rounded-sm px-2 py-1.5">
              <b>{hi ? "प्राथमिकता" : "Priority"}:</b> {c.priority}/100
            </span>
            <span className="bg-paper border border-ink/10 rounded-sm px-2 py-1.5">
              <b>{hi ? "रिपोर्ट" : "Reports"}:</b> {c.reports ?? 1}
            </span>
            <span className="bg-paper border border-ink/10 rounded-sm px-2 py-1.5">
              <b>{hi ? "समर्थन" : "Support"}:</b> {c.votes}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-bold text-ink-soft">
            <span className="bg-pine-100/60 border border-pine-700/10 rounded-sm px-2 py-1">
              {hi ? "विभाग" : "Department"}:{" "}
              {c.department || domainById(c.domain).en}
            </span>
            <span className="bg-marigold-500/10 border border-marigold-500/15 rounded-sm px-2 py-1">
              {hi ? "अनुमानित समाधान" : "Estimated resolution"}:{" "}
              {c.stage === "deployed"
                ? hi
                  ? "पूरा"
                  : "Complete"
                : `${Math.max(3, 14 - stageIdx(c.stage))} ${hi ? "दिन" : "days"}`}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span
              className={cx(
                "trust-chip",
                isVerified ? "trust-chip-good" : "trust-chip-muted",
              )}
            >
              <Icon name="shield" className="w-3 h-3" sw={2.3} />
              {isVerified
                ? hi
                  ? "सत्यापित"
                  : "Verified"
                : hi
                  ? "सत्यापन लंबित"
                  : "Verification pending"}
            </span>
            <span className="trust-chip trust-chip-score">
              <Icon name="target" className="w-3 h-3" sw={2.3} />
              {hi ? "विश्वास" : "Confidence"} {confidence}%
            </span>
            <span className="trust-chip trust-chip-rating">
              <Icon name="star" className="w-3 h-3" sw={2.3} />
              {communityRating ? communityRating.toFixed(1) : "—"} (
              {communityRatingCount})
            </span>
            {ledgerLinked && (
              <span className="trust-chip trust-chip-ledger">
                <Icon name="lock" className="w-3 h-3" sw={2.2} />
                {hi ? "लेजर लिंक" : "Ledger linked"}
              </span>
            )}
          </div>
        </button>
        {isOpen && (
          <div className="border-t border-ink/10 bg-paper/60 p-4.5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
              {hi ? "समस्या विवरण" : "Problem details"}
            </p>
            <p className="text-[12px] leading-relaxed mt-1.5 text-ink">
              {c.desc}
            </p>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft mt-4 mb-2">
              {hi ? "कहाँ तक पहुँची" : "Where it has reached"}
            </p>
            <div className="space-y-2.5">
              {c.updates.map((u, idx) => (
                <div key={`${c.id}-${idx}`} className="flex gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                    style={{ background: stageById(u.stage).color }}
                  />
                  <div>
                    <p
                      className="text-[11px] font-extrabold"
                      style={{ color: stageById(u.stage).color }}
                    >
                      {hi ? stageById(u.stage).hi : stageById(u.stage).en}{" "}
                      <span className="text-ink-soft font-semibold">
                        · {u.time}
                      </span>
                    </p>
                    <p className="text-[11px] text-ink-soft">{u.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-ink/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                  {hi
                    ? "समाधान की community rating"
                    : "Solution/community rating"}
                </p>
                <span className="font-display font-extrabold text-lg text-marigold-700">
                  {(reviews[c.id]?.average || 0).toFixed(1)} ★{" "}
                  <span className="text-[10px] font-bold text-ink-soft">
                    ({reviews[c.id]?.count || 0})
                  </span>
                </span>
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating((r) => ({ ...r, [c.id]: n }))}
                    className={cx(
                      "text-2xl leading-none",
                      (rating[c.id] || 0) >= n
                        ? "text-marigold-500"
                        : "text-ink/20",
                    )}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText[c.id] || ""}
                onChange={(e) =>
                  setReviewText((r) => ({ ...r, [c.id]: e.target.value }))
                }
                maxLength={500}
                placeholder={
                  hi ? "समाधान पर टिप्पणी…" : "Comment on the solution…"
                }
                className="mt-2 w-full border border-ink/15 rounded-sm p-2 text-xs bg-paper outline-none"
              />
              <button
                onClick={() => submitReview(c)}
                className="mt-2 bg-pine-800 text-paper px-3 py-2 rounded-sm text-xs font-extrabold"
              >
                {hi ? "Review भेजें" : "Submit review"}
              </button>
              {c.stage === "deployed" && (
                <button
                  onClick={() => reopenProblem(c)}
                  className="mt-2 ml-2 border-2 border-brick-500 text-brick-600 px-3 py-2 rounded-sm text-xs font-extrabold"
                >
                  {hi ? "समस्या अभी हल नहीं हुई" : "Problem still unresolved"}
                </button>
              )}
              {(reviews[c.id]?.items || []).slice(0, 2).map((r: any) => (
                <div
                  key={r.id}
                  className="mt-2 p-2 bg-pine-100/50 border border-pine-700/10 rounded-sm text-[10.5px]"
                >
                  <b>{r.user_name}</b> · {"★".repeat(r.rating)}
                  {r.text && (
                    <div className="text-ink-soft mt-0.5">{r.text}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 view-in flex flex-col">
      <div className="bg-pine-925 text-paper rounded-2xl overflow-hidden border border-pine-900 shadow-[7px_7px_0_rgba(11,44,33,.18)]">
        <div
          className="h-2"
          style={{
            background:
              "linear-gradient(90deg,#FF9933 0 33.3%,#F2F0E5 33.3% 66.6%,#2E7D4F 66.6% 100%)",
          }}
        />
        <div className="p-6 md:p-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-moss-400">
              {hi ? "नागरिक डैशबोर्ड" : "Citizen Dashboard"}
            </p>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl mt-1">
              {hi ? "समस्या इंटेलिजेंस" : "Community intelligence"}
            </h1>
            <p className="text-[12px] text-paper/70 mt-2 max-w-2xl">
              {hi
                ? "आपके आसपास की समस्याएँ, प्राथमिकता, और सार्वजनिक प्रगति को एक साफ़ और सरल पेज पर देखें।"
                : "Track community issues, urgency, and live problem progress on a clean and simple dashboard."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onSubmit}
              className="bg-marigold-500 text-pine-925 font-extrabold text-[12px] px-4 py-2.5 rounded-sm"
            >
              <Icon name="plus" className="w-4 h-4 inline mr-1" sw={2.5} />
              {hi ? "समस्या दर्ज करें" : "Submit problem"}
            </button>
            <button
              onClick={onComplaint}
              className="bg-brick-500 text-paper font-extrabold text-[12px] px-4 py-2.5 rounded-sm"
            >
              <Icon name="alert" className="w-4 h-4 inline mr-1" sw={2.2} />
              {hi ? "शिकायत दर्ज करें" : "Submit complaint"}
            </button>
            <button
              onClick={onReview}
              className="border border-paper/25 bg-paper/10 text-paper font-extrabold text-[12px] px-4 py-2.5 rounded-sm"
            >
              {hi ? "सभी समीक्षा देखें" : "Review all"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid lg:grid-cols-[1.45fr_.85fr] gap-5">
        <section className="bg-card border border-ink/10 rounded-2xl p-4 shadow-[4px_4px_0_rgba(11,44,33,.06)]">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-pine-700">
                {hi ? "अन्य नागरिकों की रिपोर्ट" : "Community reports"}
              </p>
              <h2 className="font-display font-extrabold text-2xl">
                {hi ? "आपके आसपास दर्ज समस्याएँ" : "Problems around you"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-extrabold text-ink-soft">
                {hi ? "दायरा" : "Radius"}
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="bg-card border border-ink/15 rounded-sm px-2 py-1.5 text-[11px] font-bold"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
          </div>
          {!coords && (
            <div className="mb-3 p-3 rounded-sm bg-marigold-500/10 border border-marigold-500/20 text-[11px] font-semibold text-ink-soft">
              {hi
                ? "आपकी location permission नहीं मिली, इसलिए फिलहाल सभी सार्वजनिक समस्याएँ priority के आधार पर दिखाई जा रही हैं।"
                : "Location permission was not available, so public problems are shown by priority for now. Allow location access to see the nearest reports first."}
            </div>
          )}
          <div className="space-y-3">
            {filteredNearby.map((x) => (
              <ProblemCard key={x.c.id} c={x.c} distance={x.d} />
            ))}
          </div>
          {!filteredNearby.length && (
            <div className="p-8 text-center bg-card border border-dashed border-ink/15 text-sm text-ink-soft">
              {hi
                ? "इस क्षेत्र में अभी कोई दूसरी नागरिक समस्या नहीं मिली।"
                : "No other citizen problems were found in this area yet."}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="bg-card border border-ink/10 rounded-2xl p-4 shadow-[4px_4px_0_rgba(11,44,33,.06)]">
            <div className="mb-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-pine-700">
                {hi ? "त्वरित क्रियाएँ" : "Quick actions"}
              </p>
              <h2 className="font-display font-extrabold text-xl mt-1">
                {hi ? "आगे बढ़ें" : "Continue"}
              </h2>
            </div>
            <div className="grid gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="inline-flex items-center justify-between gap-2 border border-ink/10 bg-paper hover:bg-pine-100/40 text-[11px] font-extrabold px-3 py-2.5 rounded-sm text-ink transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon name={action.icon} className="w-3.5 h-3.5" sw={2.2} />
                    {action.label}
                  </span>
                  <span>→</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-ink/10 rounded-2xl p-4 shadow-[4px_4px_0_rgba(11,44,33,.06)]">
            <div className="mb-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-pine-700">
                {hi ? "आपकी नज़रिया" : "Your overview"}
              </p>
              <h2 className="font-display font-extrabold text-xl">
                {hi ? "जनता की स्थिति" : "Public pulse"}
              </h2>
            </div>
            <div className="space-y-3">
              {aiRecommendations.map((item) => (
                <div
                  key={item.title}
                  className="rounded-sm border border-ink/10 bg-paper p-3"
                >
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-ink-soft">
                    {item.title}
                  </p>
                  <p className="text-[12px] text-ink mt-1 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div id="dashboard-map" className="mt-5 order-1">
        <CitizenDashboardMap
          challenges={challenges}
          currentCoords={coords}
          openId={openId}
          setOpenId={setOpenId}
          hi={hi}
        />
      </div>

      {myReportsInlineOpen && (
        <section className="mt-5 border border-ink/10 bg-card rounded-2xl p-4 shadow-[4px_4px_0_rgba(11,44,33,.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-pine-700">
                {hi ? "मेरी रिपोर्ट" : "My reports"}
              </p>
              <h3 className="font-display font-extrabold text-2xl">
                {myReportsView === "active"
                  ? hi
                    ? "सक्रिय रिपोर्टें"
                    : "Active reports"
                  : hi
                    ? "हल की गई रिपोर्टें"
                    : "Solved reports"}
              </h3>
            </div>
            <button
              onClick={() => setMyReportsInlineOpen(false)}
              className="border border-ink/15 px-3 py-2 rounded-sm text-[11px] font-extrabold text-ink-soft"
            >
              {hi ? "बंद करें" : "Close"}
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMyReportsView("active")}
              className={cx(
                "px-3 py-2 rounded-sm text-[11px] font-extrabold",
                myReportsView === "active"
                  ? "bg-pine-800 text-paper"
                  : "border border-ink/15 text-ink-soft",
              )}
            >
              {hi ? "सक्रिय" : "Active"}
            </button>
            <button
              onClick={() => setMyReportsView("solved")}
              className={cx(
                "px-3 py-2 rounded-sm text-[11px] font-extrabold",
                myReportsView === "solved"
                  ? "bg-pine-800 text-paper"
                  : "border border-ink/15 text-ink-soft",
              )}
            >
              {hi ? "हल की गई" : "Solved"}
            </button>
          </div>

          {myReportsList.length === 0 ? (
            <div className="p-8 text-center bg-paper border border-dashed border-ink/15 rounded-sm text-sm text-ink-soft">
              {hi
                ? "आपकी कोई रिपोर्ट इस श्रेणी में नहीं है।"
                : "You do not have any reports in this view yet."}
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-4">
              <div className="space-y-3">
                {myReportsList.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openMyReport(c.id)}
                    className={cx(
                      "w-full text-left rounded-sm border p-3 transition-colors",
                      selectedMyReportId === c.id
                        ? "border-pine-800 bg-pine-100/50"
                        : "border-ink/10 bg-paper hover:bg-pine-100/30",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-ink-soft">
                          {c.id}
                        </p>
                        <h4 className="font-display font-extrabold text-lg mt-1">
                          {c.title}
                        </h4>
                      </div>
                      <StagePill stage={c.stage} />
                    </div>
                    <p className="text-[11px] text-ink-soft mt-2">
                      {c.district} · {c.block} · {c.date}
                    </p>
                  </button>
                ))}
              </div>

              {selectedMyReport && (
                <div className="border border-ink/10 bg-paper rounded-sm p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-ink-soft">
                    {selectedMyReport.id}
                  </p>
                  <h4 className="font-display font-extrabold text-2xl mt-1">
                    {selectedMyReport.title}
                  </h4>
                  <p className="text-[12px] leading-relaxed text-ink-soft mt-2">
                    {selectedMyReport.desc}
                  </p>
                  {selectedMyReport.resolution_proof && (
                    <div className="mt-4 rounded-sm border border-pine-700/25 bg-pine-100/60 p-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-pine-800">
                        {hi ? "समाधान का पूरा विवरण" : "Resolution details"}
                      </p>
                      <p className="text-[12px] font-bold text-ink mt-2">
                        {hi ? "समाधान किया: " : "Resolved by: "}
                        {selectedMyReport.resolution_proof.resolved_by}
                      </p>
                      <p className="text-[12px] leading-relaxed text-ink-soft mt-1">
                        {selectedMyReport.resolution_proof.description}
                      </p>
                      {selectedMyReport.department_resolution && (
                        <div className="grid sm:grid-cols-2 gap-2 mt-3 text-[11px] font-semibold text-ink-soft">
                          <span>
                            {hi ? "पहले की स्थिति: " : "Before: "}
                            {selectedMyReport.department_resolution.condition_before}
                          </span>
                          <span>
                            {hi ? "सामग्री/उपकरण: " : "Materials/equipment: "}
                            {selectedMyReport.department_resolution.materials_used}
                          </span>
                          <span>
                            {hi ? "पूरा होने का समय: " : "Completion time: "}
                            {selectedMyReport.department_resolution.completion_days}
                          </span>
                          <span>
                            {hi ? "पूरा किया: " : "Completed on: "}
                            {selectedMyReport.resolution_proof.date}
                          </span>
                        </div>
                      )}
                      {selectedMyReport.resolution_proof.photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {selectedMyReport.resolution_proof.photos.map((src, index) => (
                            <img
                              key={index}
                              src={src}
                              alt={`Resolution proof ${index + 1}`}
                              className="h-20 w-full rounded-sm border border-ink/10 object-cover"
                            />
                          ))}
                        </div>
                      )}
                      {selectedMyReport.stage === "deployed" && (
                        <div className="mt-4 border-t border-pine-700/20 pt-3">
                          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-pine-800">
                            {hi ? "समाधान को रेट करें" : "Rate the resolution"}
                          </p>
                          <div className="mt-2 flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                aria-label={`${star} stars`}
                                onClick={() =>
                                  setRating((current) => ({
                                    ...current,
                                    [selectedMyReport.id]: star,
                                  }))
                                }
                                className={cx(
                                  "text-2xl leading-none",
                                  (rating[selectedMyReport.id] || 0) >= star
                                    ? "text-marigold-500"
                                    : "text-ink/20",
                                )}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={reviewText[selectedMyReport.id] || ""}
                            onChange={(event) =>
                              setReviewText((current) => ({
                                ...current,
                                [selectedMyReport.id]: event.target.value,
                              }))
                            }
                            maxLength={500}
                            rows={2}
                            placeholder={
                              hi
                                ? "वैकल्पिक feedback लिखें..."
                                : "Optional feedback..."
                            }
                            className="mt-2 w-full rounded-sm border border-ink/15 bg-card p-2 text-xs outline-none focus:border-pine-700"
                          />
                          <button
                            type="button"
                            onClick={() => submitReview(selectedMyReport)}
                            className="mt-2 rounded-sm bg-pine-800 px-3 py-2 text-xs font-extrabold text-paper"
                          >
                            {hi ? "Rating भेजें" : "Submit rating"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <DomainTag id={selectedMyReport.domain} />
                    <span className="text-[10px] font-extrabold bg-marigold-500/10 text-marigold-700 border border-marigold-500/20 px-2 py-1 rounded-sm">
                      {hi ? "प्राथमिकता" : "Priority"}:{" "}
                      {selectedMyReport.priority}
                    </span>
                  </div>
                  <div className="mt-4 border-t border-ink/10 pt-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-ink-soft mb-2">
                      {hi ? "अद्यतन" : "Updates"}
                    </p>
                    <div className="space-y-2">
                      {selectedMyReport.updates.slice(-3).map((u, idx) => (
                        <div
                          key={`${selectedMyReport.id}-${idx}`}
                          className="flex gap-2"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full mt-1.5"
                            style={{ background: stageById(u.stage).color }}
                          />
                          <div>
                            <p
                              className="text-[11px] font-extrabold"
                              style={{ color: stageById(u.stage).color }}
                            >
                              {hi
                                ? stageById(u.stage).hi
                                : stageById(u.stage).en}
                            </p>
                            <p className="text-[11px] text-ink-soft">
                              {u.note}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <div className="mt-5 p-4 bg-card border border-ink/10 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-[4px_4px_0_rgba(11,44,33,.06)]">
        <div>
          <p className="font-display font-extrabold text-lg">
            {hi
              ? "समस्या को खोलकर पूरी यात्रा देखें"
              : "Open any problem to see its full journey"}
          </p>
          <p className="text-[11px] text-ink-soft mt-0.5">
            {hi
              ? "Submitted → AI Review → Validation → HEI → Team → Prototype → Pilot → Deployed"
              : "Submitted → AI Review → Validation → HEI → Team → Prototype → Pilot → Deployed"}
          </p>
        </div>
        <button
          onClick={() =>
            toast(
              hi
                ? `${highPriority} उच्च प्राथमिकता वाली समस्याएँ दिख रही हैं`
                : `${highPriority} high-priority problems are visible nearby`,
            )
          }
          className="border border-pine-800 text-pine-800 px-3 py-2 rounded-sm text-xs font-extrabold"
        >
          {hi ? "Priority check" : "Check priority"}
        </button>
      </div>
    </div>
  );
}

function CitizenDesk({
  t,
  session,
  lang,
  challenges,
  patch,
  addChallenge,
  toast,
  notif,
  openComplaint,
}: {
  t: (k: string) => string;
  lang: "en" | "hi";
  session: Session;
  challenges: Challenge[];
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  addChallenge: (c: Challenge) => Promise<Challenge>;
  toast: (m: string) => void;
  notif: (icon: string, text: string) => void;
  openComplaint?: boolean;
}) {
  const hi = lang === "hi";
  const myReportIds = useMemo(() => {
    const key = `ss_my_reports_${session?.token || session?.id || "anon"}`;
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(
        Array.isArray(parsed)
          ? parsed.filter((value): value is string => typeof value === "string")
          : [],
      );
    } catch {
      return new Set<string>();
    }
  }, [session?.token, session?.id]);

  const isMyIssue = (c: Challenge) => {
    const norm = (value?: string) => (value ?? "").trim().toLowerCase();
    const userIds = [session.id, session.sub, session.token].filter(
      Boolean,
    ) as string[];
    const userNames = [norm(session.name)];
    const userOrgs = [norm(session.org)];

    const reporterUserId = c.reporter?.user_id ?? "";
    const reporterName = norm(c.reporter?.name);
    const reportByName = norm(c.by);
    const reporterOrg = norm(c.reporter?.organisation);
    const issueOrg = norm(c.org);

    const reporterMatches = Boolean(
      userIds.includes(reporterUserId) ||
      userNames.includes(reporterName) ||
      userNames.includes(reportByName) ||
      userOrgs.includes(reporterOrg) ||
      userOrgs.includes(issueOrg),
    );

    return Boolean(
      myReportIds.has(c.id) || (c.mine === true && reporterMatches),
    );
  };
  const firstUnresolved = challenges.find(
    (c) => isMyIssue(c) && c.stage !== "deployed",
  );
  const [tab, setTab] = useState<"submit" | "track" | "map" | "preview">(
    openComplaint ? "track" : "submit",
  );
  const [q, setQ] = useState("");
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [escalatingId, setEscalatingId] = useState<string | null>(null);
  const [escalationReason, setEscalationReason] = useState("");
  const [escalated, setEscalated] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (openComplaint && firstUnresolved) {
      setTab("track");
      setEscalatingId(firstUnresolved.id);
    }
  }, [openComplaint, firstUnresolved?.id]);
  // The backend marks ownership using the authenticated citizen account.
  // Do not rely on the old static `mine` flag from demo data.
  const mine = challenges.filter(isMyIssue);
  const shown = mine.filter(
    (c) =>
      !q ||
      (c.id + " " + c.title + " " + c.district)
        .toLowerCase()
        .includes(q.toLowerCase()),
  );

  const upvote = (c: Challenge) => {
    if (voted.has(c.id)) {
      toast(hi ? "समर्थन पहले ही दर्ज हो चुका है" : "Support already counted");
      return;
    }
    setVoted((v) => new Set(v).add(c.id));
    patch(c.id, (x) => ({ ...x, votes: x.votes + 1 }));
    toast(
      hi
        ? "समर्थन दर्ज हुआ — प्राथमिकता बढ़ेगी"
        : "Support recorded — this raises the priority",
    );
  };
  const submitEscalation = async (c: Challenge) => {
    if (escalationReason.trim().length < 5) {
      toast(
        hi
          ? "कृपया शिकायत का कारण लिखें"
          : "Please describe the reason for the complaint",
      );
      return;
    }
    try {
      await api.escalateProblem(
        c.id,
        session.token || "",
        escalationReason.trim(),
      );
      setEscalated((ids) => new Set(ids).add(c.id));
      setEscalatingId(null);
      setEscalationReason("");
      notif(
        "alert",
        hi
          ? `${c.id} की follow-up complaint दर्ज हुई`
          : `Follow-up complaint submitted for ${c.id}`,
      );
      toast(
        hi
          ? "शिकायत दर्ज हो गई — Toll-free: 1800-345-0420"
          : "Complaint submitted — Toll-free: 1800-345-0420",
      );
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not submit complaint",
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 view-in">
      {/* Desk header */}
      <div className="bg-pine-925 text-paper rounded-md border border-pine-900 relative overflow-hidden shadow-[7px_7px_0_rgba(11,44,33,0.18)] mb-7">
        <div className="absolute right-0 top-0 shimmer w-24 h-full opacity-15" />
        <div
          className="h-2 w-full"
          style={{
            background:
              "linear-gradient(90deg,#FF9933 0 33.3%,#F2F0E5 33.3% 66.6%,#2E7D4F 66.6% 100%)",
          }}
        />
        <div className="px-6 py-6 flex flex-wrap items-center gap-5">
          <span className="w-14 h-14 rounded-sm bg-marigold-500 text-pine-925 flex items-center justify-center font-display font-extrabold text-xl shadow-[3px_3px_0_rgba(0,0,0,0.3)]">
            {session.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div className="flex-1 min-w-[220px]">
            <p className="text-[10.5px] font-extrabold tracking-[0.24em] uppercase text-moss-400">
              {hi ? "नागरिक डेस्क" : "Citizen Desk"} ·{" "}
              {hi ? "नमस्ते" : "Namaste"},
            </p>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">
              {session.name}
            </h1>
            <p className="text-[12.5px] font-semibold text-paper/75 mt-0.5">
              {session.org}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-marigold-400 tabular">
                {mine.length}
              </p>
              <p className="text-[9.5px] font-extrabold uppercase tracking-widest text-moss-400">
                {hi ? "मेरी समस्याएँ" : "My problems"}
              </p>
            </div>
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-marigold-400 tabular">
                {mine.filter((c) => stageIdx(c.stage) >= 3).length}
              </p>
              <p className="text-[9.5px] font-extrabold uppercase tracking-widest text-moss-400">
                {hi ? "HEI को भेजी गईं" : "With HEIs"}
              </p>
            </div>
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-marigold-400 tabular">
                {mine.filter((c) => c.stage === "deployed").length}
              </p>
              <p className="text-[9.5px] font-extrabold uppercase tracking-widest text-moss-400">
                {hi ? "समाधान तैनात" : "Deployed"}
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2">
          <button
            onClick={() => setTab("submit")}
            className={cx(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-[13px] font-extrabold transition-all",
              tab === "submit"
                ? "bg-marigold-500 text-pine-925 shadow-[3px_3px_0_rgba(0,0,0,0.3)]"
                : "bg-paper/8 text-paper/85 hover:bg-paper/15 border border-paper/15",
            )}
          >
            <Icon name="mic" className="w-4 h-4" sw={2.2} /> {t("btn_submit")}
          </button>
          <button
            onClick={() => setTab("track")}
            className={cx(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-[13px] font-extrabold transition-all",
              tab === "track"
                ? "bg-marigold-500 text-pine-925 shadow-[3px_3px_0_rgba(0,0,0,0.3)]"
                : "bg-paper/8 text-paper/85 hover:bg-paper/15 border border-paper/15",
            )}
          >
            <Icon name="eye" className="w-4 h-4" sw={2.2} /> {t("track_mine")}
            <span className="tabular bg-pine-925/20 border border-pine-925/30 px-1.5 py-[1px] rounded-sm text-[11px]">
              {mine.length}
            </span>
          </button>
          <button
            onClick={() => setTab("map")}
            className={cx(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-[13px] font-extrabold transition-all",
              tab === "map"
                ? "bg-marigold-500 text-pine-925 shadow-[3px_3px_0_rgba(0,0,0,0.3)]"
                : "bg-paper/8 text-paper/85 hover:bg-paper/15 border border-paper/15",
            )}
          >
            <Icon name="globe" className="w-4 h-4" sw={2.2} />{" "}
            {hi ? "लाइव समस्या मानचित्र" : "Live problem map"}
          </button>
          <button
            onClick={() => setTab("preview")}
            className={cx(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-[13px] font-extrabold transition-all",
              tab === "preview"
                ? "bg-marigold-500 text-pine-925 shadow-[3px_3px_0_rgba(0,0,0,0.3)]"
                : "bg-paper/8 text-paper/85 hover:bg-paper/15 border border-paper/15",
            )}
          >
            <Icon name="eye" className="w-4 h-4" sw={2.2} />{" "}
            {hi ? "समस्या समीक्षा" : "Problem review"}
          </button>
          <button
            onClick={() => {
              setTab("track");
              if (firstUnresolved) setEscalatingId(firstUnresolved.id);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-[13px] font-extrabold bg-brick-500 text-paper hover:bg-brick-600 transition-all"
          >
            <Icon name="alert" className="w-4 h-4" sw={2.2} />{" "}
            {hi ? "शिकायत दर्ज करें" : "Submit complaint"}
          </button>
        </div>
      </div>

      {tab === "submit" ? (
        <SubmitChallenge
          t={t}
          lang={lang}
          challenges={challenges}
          patch={patch}
          addChallenge={addChallenge}
          toast={toast}
          notif={notif}
          voiceBy={session.name}
          sessionToken={session.token}
          onSuccess={() => setTab("submit")}
          onReset={() => setTab("submit")}
        />
      ) : tab === "map" ? (
        <CitizenProblemMap
          challenges={challenges}
          session={session}
          patch={patch}
          toast={toast}
          hi={hi}
        />
      ) : tab === "preview" ? (
        <CitizenLocalPreview
          challenges={challenges}
          session={session}
          hi={hi}
          toast={toast}
        />
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display font-extrabold text-2xl tracking-tight text-ink">
                {t("track_mine")}
              </h2>
              <p className="text-[12.5px] font-semibold text-ink-soft mt-0.5">
                {hi
                  ? "हर चरण पर पारदर्शी स्थिति — सबमिशन से तैनाती तक।"
                  : "Transparent status at every step — from submission to deployment."}
              </p>
            </div>
            <label className="flex items-center gap-2 bg-card border border-ink/15 rounded-sm px-3 focus-within:border-marigold-500 transition-colors">
              <Icon name="search" className="w-4 h-4 text-ink-soft" sw={2} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  hi ? "ID या शीर्षक खोजें…" : "Search by ID or title…"
                }
                className="bg-transparent py-2.5 text-sm font-medium outline-none w-52 placeholder:text-ink-soft/60"
              />
            </label>
          </div>

          {shown.length === 0 && (
            <div className="bg-card border border-dashed border-ink/25 rounded-md p-14 text-center">
              <Icon name="eye" className="w-8 h-8 mx-auto text-ink-soft" />
              <p className="font-display font-bold text-lg mt-3 text-ink">
                {hi ? "कुछ नहीं मिला" : "Nothing found"}
              </p>
              <p className="text-sm text-ink-soft mt-1">
                {hi
                  ? "नई समस्या दर्ज करें — स्थिति यहाँ दिखेगी।"
                  : "Submit a new problem — its status will appear here."}
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {shown.map((c, i) => {
              const di = stageIdx(c.stage);
              const last = c.updates[c.updates.length - 1];
              return (
                <Reveal key={c.id} delay={Math.min(i * 70, 280)}>
                  <div className="bg-card border border-ink/10 rounded-md p-5 shadow-[5px_5px_0_rgba(11,44,33,0.07)] hover:shadow-[8px_8px_0_rgba(11,44,33,0.13)] hover:-translate-y-0.5 transition-all h-full flex flex-col">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <span className="text-[10.5px] font-extrabold tabular text-ink-soft">
                        {c.id}
                      </span>
                      <StagePill stage={c.stage} />
                    </div>
                    <h3 className="font-display font-bold text-[15.5px] leading-snug text-ink">
                      {c.title}
                    </h3>
                    <p className="text-[12px] font-semibold text-ink-soft mt-1.5 flex items-center gap-1.5">
                      <Icon name="pin" className="w-3.5 h-3.5" sw={2.2} />
                      {c.district} · {c.block} · {c.date}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10.5px] font-bold text-ink-soft">
                      {Number.isFinite(c.lat) && Number.isFinite(c.lng) && (
                        <span className="inline-flex items-center gap-1 rounded-sm border border-pine-700/20 bg-pine-100/50 px-2 py-1">
                          <Icon name="globe" className="w-3 h-3" sw={2.2} />
                          GPS {c.lat.toFixed(5)}, {c.lng.toFixed(5)}
                          {c.accuracy ? ` · ±${c.accuracy}m` : ""}
                        </span>
                      )}
                      {c.qr_url && (
                        <a
                          href={c.qr_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-sm border border-marigold-500/40 bg-marigold-500/10 px-2 py-1 text-pine-800 hover:bg-marigold-500/20"
                        >
                          <Icon name="qr" className="w-3 h-3" sw={2.2} />
                          Open QR page
                        </a>
                      )}
                    </div>
                    {c.qr_image && <ProblemQRCode problem={c} compact />}

                    {/* Mini pipeline */}
                    <div className="mt-4">
                      <div className="flex items-center">
                        {STAGES.map((s, j) => (
                          <div key={s.id} className="flex-1 flex items-center">
                            <span
                              title={s.en}
                              className={cx(
                                "w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-all",
                                j < di
                                  ? "border-transparent"
                                  : j === di
                                    ? "border-transparent ring-[3px]"
                                    : "bg-card",
                              )}
                              style={
                                j <= di
                                  ? {
                                      background: s.color,
                                      boxShadow:
                                        j === di
                                          ? `0 0 0 3px ${s.color}30`
                                          : undefined,
                                    }
                                  : { borderColor: "rgba(23,32,26,0.25)" }
                              }
                            />
                            {j < STAGES.length - 1 && (
                              <span
                                className="flex-1 h-[3px] rounded-full mx-[2px]"
                                style={{
                                  background:
                                    j < di
                                      ? STAGES[j + 1].color
                                      : "rgba(23,32,26,0.12)",
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1.5 text-[9px] font-extrabold uppercase tracking-wide text-ink-soft">
                        <span>{hi ? STAGES[0].hi : STAGES[0].en}</span>
                        <span className="text-center">
                          {hi ? STAGES[4].hi : STAGES[4].en}
                        </span>
                        <span>{hi ? STAGES[7].hi : STAGES[7].en}</span>
                      </div>
                      <p
                        className="mt-2.5 text-[12.5px] font-bold leading-snug"
                        style={{ color: stageById(c.stage).color }}
                      >
                        <Icon
                          name="clock"
                          className="w-3.5 h-3.5 inline mr-1 -mt-0.5"
                          sw={2.2}
                        />
                        {hi ? STAGES[di].hi : STAGES[di].en} — {last?.note}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3.5 border-t border-dashed border-ink/15 mt-auto">
                      <div className="flex items-center gap-2.5">
                        <DomainTag id={c.domain} />
                        {(c.reports ?? 1) > 1 && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-pine-800 bg-pine-100/70 border border-pine-700/25 px-1.5 py-[2px] rounded-sm">
                            <Icon name="bucket" className="w-3 h-3" sw={2.2} />
                            {c.reports} {t("merged_reports")}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => upvote(c)}
                        className={cx(
                          "inline-flex items-center gap-1.5 text-[12px] font-extrabold tabular px-2.5 py-1.5 rounded-sm border transition-all",
                          voted.has(c.id)
                            ? "bg-marigold-500 border-marigold-600 text-pine-925"
                            : "border-ink/15 text-ink-soft hover:border-marigold-500 hover:text-marigold-700",
                        )}
                      >
                        <Icon name="up" className="w-3.5 h-3.5" sw={2.4} />
                        {c.votes}
                      </button>
                    </div>
                    {c.stage !== "deployed" && (
                      <div className="mt-3 pt-3 border-t border-ink/10">
                        {escalated.has(c.id) ? (
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-extrabold text-pine-800 bg-pine-100/60 border border-pine-700/15 rounded-sm px-3 py-2">
                            <span>
                              ✓{" "}
                              {hi
                                ? "Follow-up complaint दर्ज है"
                                : "Follow-up complaint submitted"}
                            </span>
                            <span>1800-345-0420</span>
                          </div>
                        ) : escalatingId === c.id ? (
                          <div className="bg-marigold-500/10 border border-marigold-500/20 rounded-sm p-3">
                            <p className="text-[10px] font-extrabold text-ink">
                              {hi
                                ? "कार्रवाई नहीं हुई? शिकायत दर्ज करें"
                                : "No action taken? File a follow-up complaint"}
                            </p>
                            <textarea
                              value={escalationReason}
                              onChange={(e) =>
                                setEscalationReason(e.target.value)
                              }
                              maxLength={1000}
                              placeholder={
                                hi
                                  ? "समस्या पर अब तक क्या कार्रवाई नहीं हुई?"
                                  : "What action is still pending on this problem?"
                              }
                              className="mt-2 w-full bg-paper border border-ink/15 rounded-sm p-2 text-[11px] outline-none"
                            />
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[10px] font-bold text-ink-soft">
                                Toll-free: 1800-345-0420
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEscalatingId(null);
                                    setEscalationReason("");
                                  }}
                                  className="text-[10px] font-extrabold text-ink-soft px-2 py-1.5"
                                >
                                  {hi ? "रद्द" : "Cancel"}
                                </button>
                                <button
                                  onClick={() => submitEscalation(c)}
                                  className="bg-brick-600 text-paper px-3 py-1.5 rounded-sm text-[10px] font-extrabold"
                                >
                                  {hi ? "शिकायत भेजें" : "Submit complaint"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <button
                              onClick={() => setEscalatingId(c.id)}
                              className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold text-brick-600 border border-brick-500/25 bg-brick-500/5 px-2.5 py-1.5 rounded-sm"
                            >
                              <Icon
                                name="alert"
                                className="w-3.5 h-3.5"
                                sw={2.2}
                              />
                              {hi
                                ? "कार्रवाई नहीं हुई? शिकायत करें"
                                : "No action? File complaint"}
                            </button>
                            <a
                              href="tel:18003450420"
                              className="text-[10px] font-extrabold text-pine-800 underline underline-offset-2"
                            >
                              1800-345-0420
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   UNIVERSITY DESK — evaluation, teams, proposals, milestones
   ==========================================================================*/
function UniversityDesk({
  t,
  lang,
  session,
  challenges,
  patch,
  toast,
  notif,
}: {
  t: (k: string) => string;
  lang: Lang;
  session: Session;
  challenges: Challenge[];
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  toast: (m: string) => void;
  notif: (icon: string, text: string) => void;
}) {
  const hi = lang === "hi";
  const uniId =
    universityIdFromAccount(session.org) ??
    session.orgId ??
    session.id ??
    "iit-ism";
  const uni = uniById(uniId) ?? UNIVERSITIES[0];
  const profileCapabilities = session.university_capabilities
    ?.split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const profileLabs = session.labs_centres
    ?.split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const displayedCapabilities = profileCapabilities?.length
    ? profileCapabilities
    : uni.domains.map((domain) => domainById(domain).en);
  const displayedLabs = profileLabs?.length ? profileLabs : uni.labs;
  const accountUniversityIds = new Set(
    [uniId, universityIdFromAccount(session.org), session.orgId, session.id].filter(
      (id): id is string => Boolean(id),
    ),
  );
  if (session.org.trim().toLowerCase() === "ranchi") accountUniversityIds.add("ru");
  const mine = challenges
    .filter(
      (c) =>
        (c.uni && accountUniversityIds.has(c.uni)) ||
        c.universities?.some((id) => accountUniversityIds.has(id)),
    )
    .map((c) => ({
      ...c,
      milestones: c.milestones ?? [],
      updates: c.updates ?? [],
      team: c.team ?? [],
    }));
  const pending = mine.filter(
    (c) => c.stage === "university_solution" || c.stage === "routed",
  );
  const active = mine.filter(
    (c) =>
      c.stage !== "government_review" &&
      stageIdx(c.stage) >= 4,
  );
  const deployed = mine.filter((c) => c.stage === "deployed");

  const [member, setMember] = useState("");
  const [teamName, setTeamName] = useState<Record<string, string>>({});
  const [mentorName, setMentorName] = useState<Record<string, string>>({});
  const [proposal, setProposal] = useState<Record<string, string>>({});
  const [solutionPdf, setSolutionPdf] = useState<Record<string, string>>({});
  const [appLink, setAppLink] = useState<Record<string, string>>({});
  const [solutionVideo, setSolutionVideo] = useState<Record<string, string>>({});
  const [proposed, setProposed] = useState<Set<string>>(new Set());

  const accept = (c: Challenge) => {
    patch(c.id, (x) => ({
      ...x,
      stage: "team",
      team: x.team ?? [],
      updates: [
        ...x.updates,
        {
          stage: "team",
          time: "Today",
          note: `${uni?.short} accepted the problem — multidisciplinary team being constituted.`,
        },
      ],
    }));
    notif("users", `${uni?.short} accepted ${c.id} — team formation started`);
    toast("Accepted — now constitute your team and submit a proposal");
  };

  const decline = (c: Challenge) => {
    patch(c.id, (x) => ({
      ...x,
      uni: undefined,
      stage: "validated",
      updates: [
        ...x.updates,
        {
          stage: "validated",
          time: "Today",
          note: `Returned by ${uni?.short} — re-opening for AI re-routing to another HEI.`,
        },
      ],
    }));
    notif("edu", `${c.id} returned to pool for re-routing`);
    toast("Returned to the pool — AI will re-route it");
  };

  const addMember = (c: Challenge) => {
    if (!member.trim()) return;
    patch(c.id, (x) => ({ ...x, team: [...(x.team ?? []), member.trim()] }));
    setMember("");
    toast("Team member added");
  };

  const removeMember = (c: Challenge, memberToRemove: string) => {
    patch(c.id, (x) => ({
      ...x,
      team: (x.team ?? []).filter((item) => item !== memberToRemove),
    }));
    toast("Team member removed");
  };

  const setMentor = (c: Challenge, m: string) => {
    patch(c.id, (x) => ({ ...x, mentor: m }));
    toast(`Faculty mentor assigned: ${m}`);
  };

  const submitProposal = (c: Challenge) => {
    const text = (proposal[c.id] ?? c.solution ?? "").trim();
    const name = (teamName[c.id] ?? c.team_name ?? "").trim();
    const mentor = (mentorName[c.id] ?? c.mentor ?? "").trim();
    const submittedTeam = c.team ?? [];
    const pdf = solutionPdf[c.id] || "";
    const app = (appLink[c.id] ?? "").trim();
    const video = (solutionVideo[c.id] ?? "").trim();
    const submission: SolutionSubmission = {
      id: `${c.id}-${uniId}-${Date.now()}`,
      university_id: uniId,
      university_name: uni?.name || session.org,
      team_name: name,
      mentor,
      team: submittedTeam,
      solution: text,
      solution_pdf: pdf || undefined,
      app_link: app || undefined,
      solution_video: video || undefined,
      submitted_at: new Date().toLocaleString("en-IN"),
    };
    if (!name || !mentor || text.length < 12) {
      toast(
        hi
          ? "टीम का नाम, मेंटर और विस्तृत समाधान भरें"
          : "Enter a team name, mentor and a fuller solution",
      );
      return;
    }
    patch(c.id, (x) => ({
      ...x,
      stage: "government_review",
      team_name: name,
      mentor,
      team: submittedTeam,
      solution: text,
      solution_submissions: [
        ...(x.solution_submissions || []).filter(
          (item) => item.university_id !== uniId,
        ),
        submission,
      ],
      solution_pdf: pdf || x.solution_pdf,
      app_link: app || x.app_link,
      solution_video: video || x.solution_video,
      requires_government: true,
      requires_investment: false,
      routing_decision: "government_field_university",
      routing_scope: "main_government",
      updates: [
        ...x.updates,
        {
          stage: "government_review",
          time: "Today",
          note: `University team ${name} submitted its solution: “${text.slice(0, 90)}${text.length > 90 ? "…" : ""}” — sent directly to State Government for review.`,
        },
      ],
    }));
    setProposed((s) => new Set(s).add(c.id));
    notif("doc", `Proposal submitted for ${c.id} — review committee notified`);
    toast("Solution submitted to State Government");
  };

  const completeMilestone = (c: Challenge, mid: string) => {
    patch(c.id, (x) => ({
      ...x,
      milestones: x.milestones.map((m) =>
        m.id === mid ? { ...m, done: true } : m,
      ),
    }));
    toast("Milestone signed off");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 view-in">
      {/* Desk header */}
      <div className="bg-pine-925 text-paper rounded-md border border-pine-900 relative overflow-hidden shadow-[7px_7px_0_rgba(11,44,33,0.18)] mb-7">
        <div className="absolute -right-10 -bottom-14 w-52 h-52 rounded-full border-[16px] border-marigold-500/10" />
        <div
          className="h-2 w-full"
          style={{
            background:
              "linear-gradient(90deg,#FF9933 0 33.3%,#F2F0E5 33.3% 66.6%,#2E7D4F 66.6% 100%)",
          }}
        />
        <div className="px-6 py-6 flex flex-wrap items-center gap-5">
          <span className="w-14 h-14 rounded-sm bg-marigold-500 text-pine-925 font-display font-extrabold text-sm flex items-center justify-center shadow-[3px_3px_0_rgba(0,0,0,0.3)]">
            {uni?.short
              .split(" ")
              .map((w) => w[0])
              .slice(0, 3)
              .join("")}
          </span>
          <div className="flex-1 min-w-[240px]">
            <p className="text-[10.5px] font-extrabold tracking-[0.24em] uppercase text-moss-400">
              {t("desk_uni")} ·{" "}
              {session.sub === "faculty"
                ? hi
                  ? "फैकल्टी लॉगिन"
                  : "Faculty login"
                : hi
                  ? "छात्र लॉगिन"
                  : "Student login"}
            </p>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">
              {session.org || uni?.name}
            </h1>
            <p className="text-[12.5px] font-semibold text-paper/75 mt-0.5">
              {session.name} · {session.university_location || uni?.city} · {uni?.kind}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-marigold-400 tabular">
                {pending.length}
              </p>
              <p className="text-[9.5px] font-extrabold uppercase tracking-widest text-moss-400">
                {hi ? "मूल्यांकन हेतु" : "To evaluate"}
              </p>
            </div>
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-marigold-400 tabular">
                {active.length}
              </p>
              <p className="text-[9.5px] font-extrabold uppercase tracking-widest text-moss-400">
                {hi ? "सक्रिय परियोजनाएँ" : "Active projects"}
              </p>
            </div>
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-marigold-400 tabular">
                {mine.length}
              </p>
              <p className="text-[9.5px] font-extrabold uppercase tracking-widest text-moss-400">
                {hi ? "सौंपी गई समस्याएँ" : "Assigned problems"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-card border border-ink/10 rounded-md p-5 mb-7 shadow-[5px_5px_0_rgba(11,44,33,0.07)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brick-600">
              University profile
            </p>
            <h2 className="font-display font-extrabold text-xl text-ink mt-1">
              {session.name}
            </h2>
            <p className="text-[12px] font-bold text-ink-soft mt-1">
              {session.sub === "faculty" ? "Faculty / mentor" : "Student / university member"} · {uni.name}
            </p>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-pine-100 text-pine-800 border border-pine-700/25 px-2.5 py-1.5 rounded-sm">
            University login verified
          </span>
        </div>
        <p className="text-[13px] font-medium text-ink-soft leading-relaxed mt-3 max-w-4xl">
          {uni.blurb}
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed border-ink/15">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
              University capabilities
            </p>
            <p className="text-[12px] font-bold text-ink mt-1">
              {displayedCapabilities.join(" · ")}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
              Labs and centres
            </p>
            <p className="text-[12px] font-bold text-ink mt-1">
              {displayedLabs.join(" · ")}
            </p>
          </div>
        </div>
      </section>

      {/* Expertise strip */}
      <div className="flex flex-wrap items-center gap-1.5 mb-7">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-ink-soft mr-1">
          {hi ? "विशेषज्ञता" : "Expertise"}:
        </span>
        {uni?.domains.map((d) => {
          const dd = domainById(d);
          return (
            <span
              key={d}
              className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-1 rounded-sm"
              style={{
                background: dd.color + "16",
                color: dd.color,
                border: `1px solid ${dd.color}38`,
              }}
            >
              <Icon name={dd.icon} className="w-3 h-3" sw={2.4} />
              {hi ? dd.hi : dd.en}
            </span>
          );
        })}
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-ink-soft ml-3 mr-1">
          {hi ? "प्रयोगशालाएँ" : "Labs"}:
        </span>
        {uni?.labs.slice(0, 3).map((l) => (
          <span
            key={l}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-steel-500 bg-steel-500/8 border border-steel-500/25 px-2 py-1 rounded-sm"
          >
            <Icon name="flask" className="w-3 h-3" sw={2.2} />
            {l}
          </span>
        ))}
      </div>

      {/* Pending evaluation */}
      <section className="mb-9">
        <h2 className="font-display font-extrabold text-xl tracking-tight text-ink flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-sm bg-brick-500 text-paper flex items-center justify-center">
            <Icon name="eye" className="w-4 h-4" sw={2.2} />
          </span>
          {hi
            ? "मूल्यांकन प्रतीक्षित समस्याएँ"
            : "Problems awaiting evaluation"}
          <span className="tabular text-sm bg-brick-500/12 text-brick-600 border border-brick-500/35 px-2 py-0.5 rounded-sm">
            {pending.length}
          </span>
        </h2>
        {pending.length === 0 && (
          <p className="text-[13.5px] font-semibold text-ink-soft bg-card border border-dashed border-ink/25 rounded-md p-6 text-center">
            {hi
              ? "कोई नई समस्या प्रतीक्षित नहीं — सब मूल्यांकित।"
              : "No new problems pending — all evaluated."}
          </p>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {pending.map((c, i) => (
            <Reveal key={c.id} delay={Math.min(i * 70, 250)}>
              <div className="bg-card border-2 border-brick-500/30 rounded-md p-5 shadow-[5px_5px_0_rgba(11,44,33,0.07)] h-full flex flex-col">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <span className="text-[10.5px] font-extrabold tabular text-ink-soft">
                    {c.id}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-brick-600 bg-brick-500/10 border border-brick-500/30 px-2 py-0.5 rounded-sm">
                    {hi ? "निर्णय आवश्यक" : "Decision needed"}
                  </span>
                </div>
                <h3 className="font-display font-bold text-[15.5px] leading-snug text-ink">
                  {c.title}
                </h3>
                <p className="text-[12.5px] font-medium text-ink-soft mt-1.5 leading-relaxed flex-1">
                  {c.desc}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11.5px] font-bold text-ink-soft">
                  <DomainTag id={c.domain} />
                  <span className="inline-flex items-center gap-1">
                    <Icon name="pin" className="w-3.5 h-3.5" sw={2.2} />
                    {c.district}
                  </span>
                  <span className="inline-flex items-center gap-1 text-marigold-700">
                    <Icon name="flag" className="w-3.5 h-3.5" sw={2.2} />
                    {hi ? "प्राथमिकता" : "Priority"} {c.priority}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="bucket" className="w-3.5 h-3.5" sw={2.2} />
                    {c.reports ?? 1} {t("merged_reports")}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => accept(c)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-pine-800 hover:bg-pine-700 text-paper font-extrabold text-[12.5px] py-2.5 rounded-sm shadow-[3px_3px_0_rgba(239,170,43,0.85)] hover:-translate-y-0.5 transition-all"
                  >
                    <Icon name="check" className="w-4 h-4" sw={2.6} />
                    {hi ? "स्वीकारें — टीम बनाएँ" : "Accept & form team"}
                  </button>
                  <button
                    onClick={() => decline(c)}
                    className="inline-flex items-center justify-center gap-1.5 border-2 border-ink/20 hover:border-brick-500 hover:text-brick-600 text-ink-soft font-bold text-[12.5px] px-3.5 py-2.5 rounded-sm transition-colors"
                  >
                    <Icon name="close" className="w-4 h-4" sw={2.4} />
                    {hi ? "लौटाएँ" : "Decline"}
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Active projects */}
      <section>
        <h2 className="font-display font-extrabold text-xl tracking-tight text-ink flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-sm bg-pine-800 text-paper flex items-center justify-center">
            <Icon name="target" className="w-4 h-4" sw={2.2} />
          </span>
          {hi ? "सक्रिय परियोजना कार्यप्रवाह" : "Active project workflows"}
          <span className="tabular text-sm bg-pine-100 text-pine-800 border border-pine-700/25 px-2 py-0.5 rounded-sm">
            {active.length}
          </span>
        </h2>
        <div className="space-y-4">
          {active.map((c, i) => (
            <Reveal key={c.id} delay={Math.min(i * 60, 240)}>
              <div className="bg-card border border-ink/10 rounded-md shadow-[5px_5px_0_rgba(11,44,33,0.07)] overflow-hidden">
                <div
                  className="h-1.5 w-full"
                  style={{ background: stageById(c.stage).color }}
                />
                <div className="p-5 grid lg:grid-cols-5 gap-5">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-[10.5px] font-extrabold tabular text-ink-soft">
                        {c.id}
                      </span>
                      <StagePill stage={c.stage} />
                    </div>
                    <h3 className="font-display font-bold text-[15.5px] leading-snug text-ink">
                      {c.title}
                    </h3>
                    <p className="text-[12px] font-semibold text-ink-soft mt-1.5 flex items-center gap-1.5">
                      <Icon name="pin" className="w-3.5 h-3.5" sw={2.2} />
                      {c.district} · {c.block} ·{" "}
                      <span className="tabular">
                        {c.votes} {t("votes")}
                      </span>
                    </p>
                    {c.milestones.length > 0 && (
                      <div className="mt-3.5">
                        <div className="flex justify-between text-[10.5px] font-extrabold text-ink-soft uppercase tracking-wider mb-1">
                          <span>{t("milestones")}</span>
                          <span className="tabular">
                            {c.milestones.filter((m) => m.done).length}/
                            {c.milestones.length}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-ink/8 overflow-hidden">
                          <div
                            className="h-full rounded-full donut-seg"
                            style={{
                              width: `${(c.milestones.filter((m) => m.done).length / c.milestones.length) * 100}%`,
                              background: stageById(c.stage).color,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-3 space-y-4">
                    {c.updates.some((update) =>
                      update.note.toLowerCase().includes("approved the university solution"),
                    ) && (
                      <div className="rounded-sm border-2 border-moss-500/40 bg-moss-500/15 px-4 py-3 text-moss-800 shadow-[3px_3px_0_rgba(46,125,79,.12)]">
                        <p className="flex items-center gap-2 text-sm font-extrabold">
                          <Icon name="check" className="w-5 h-5" sw={2.8} />
                          {hi
                            ? "State Government ने आपका solution accept कर लिया है"
                            : "State Government accepted your solution"}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold">
                          {hi
                            ? "अब funding और deployment support के लिए अगला workflow शुरू हो गया है।"
                            : "The next workflow for funding and deployment support has started."}
                        </p>
                      </div>
                    )}
                    {/* Team */}
                    <div className="bg-paper border border-ink/12 rounded-sm p-3.5">
                      <p className="text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-ink-soft mb-2 flex items-center gap-1.5">
                        <Icon name="users" className="w-3.5 h-3.5" sw={2.2} />
                        {hi ? "बहुविषयक टीम" : "Multidisciplinary team"}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {(c.team ?? []).map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-ink bg-card border border-ink/15 px-2 py-1 rounded-sm"
                          >
                            <span className="w-5 h-5 rounded-full bg-pine-800 text-paper flex items-center justify-center text-[8.5px] font-extrabold">
                              {m
                                .replace(/[^A-Za-z ]/g, "")
                                .trim()
                                .split(" ")
                                .slice(-1)[0]
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                            {m}
                            <button
                              type="button"
                              onClick={() => removeMember(c, m)}
                              aria-label={`Remove ${m}`}
                              className="text-ink-soft hover:text-brick-600"
                            >
                              <Icon name="close" className="w-3 h-3" sw={2.5} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <input
                          value={teamName[c.id] ?? c.team_name ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setTeamName((names) => ({ ...names, [c.id]: value }));
                          }}
                          placeholder={hi ? "टीम का नाम" : "Team name"}
                          className="basis-full bg-card border border-ink/15 rounded-sm px-2.5 py-2 text-[12px] font-bold text-ink outline-none focus:border-marigold-500 transition-colors"
                        />
                        <input
                          value={mentorName[c.id] ?? c.mentor ?? ""}
                          onChange={(e) =>
                            setMentorName((names) => ({
                              ...names,
                              [c.id]: e.target.value,
                            }))
                          }
                          placeholder={hi ? "फैकल्टी मेंटर का नाम" : "Faculty mentor name"}
                          className="bg-card border border-ink/15 rounded-sm px-2.5 py-2 text-[12px] font-bold text-ink outline-none flex-1 min-w-[190px] focus:border-marigold-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Proposal */}
                    {(c.stage === "team" ||
                      c.stage === "industry_funding" ||
                      c.stage === "government_review") &&
                      (proposed.has(c.id) ? (
                        <p className="bg-pine-100/70 border border-pine-700/25 rounded-sm p-3.5 text-[13px] font-bold text-pine-800 flex items-center gap-2">
                          <Icon name="check" className="w-4 h-4" sw={2.6} />
                          {hi
                            ? "प्रस्ताव समीक्षा समिति के पास भेजा गया"
                            : "Proposal submitted to the review committee"}
                        </p>
                      ) : (
                        <div className="bg-paper border border-ink/12 rounded-sm p-3.5">
                          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-ink-soft mb-2 flex items-center gap-1.5">
                            <Icon name="doc" className="w-3.5 h-3.5" sw={2.2} />
                            {hi ? "समस्या का समाधान" : "Problem solution"}
                          </p>
                          <textarea
                            value={proposal[c.id] ?? c.solution ?? ""}
                            onChange={(e) =>
                              setProposal((p) => ({
                                ...p,
                                [c.id]: e.target.value,
                              }))
                            }
                            rows={2}
                            placeholder={
                              hi
                                ? "प्रस्तावित समाधान, पद्धति, अवधि, बजट…"
                                : "Proposed solution, methodology, timeline, budget…"
                            }
                            className="w-full bg-card border border-ink/15 rounded-sm px-3 py-2 text-[12.5px] font-medium outline-none resize-none focus:border-marigold-500 transition-colors"
                          />
                          <div className="grid sm:grid-cols-2 gap-2 mt-3">
                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                              {hi ? "समाधान PDF" : "Solution PDF"}
                              <input
                                type="file"
                                accept="application/pdf,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = () =>
                                    setSolutionPdf((files) => ({
                                      ...files,
                                      [c.id]: String(reader.result),
                                    }));
                                  reader.readAsDataURL(file);
                                }}
                                className="mt-1 w-full bg-card border border-ink/15 rounded-sm px-2 py-2 text-[11px] font-semibold"
                              />
                            </label>
                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                              {hi ? "ऐप लिंक (यदि हो)" : "App link (if any)"}
                              <input
                                type="url"
                                value={appLink[c.id] ?? ""}
                                onChange={(e) =>
                                  setAppLink((links) => ({ ...links, [c.id]: e.target.value }))
                                }
                                placeholder="https://your-app.example"
                                className="mt-1 w-full bg-card border border-ink/15 rounded-sm px-2 py-2 text-[11px] font-semibold outline-none focus:border-marigold-500"
                              />
                            </label>
                            <label className="sm:col-span-2 text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
                              {hi ? "समाधान वीडियो लिंक" : "Solution video link"}
                              <input
                                type="url"
                                value={solutionVideo[c.id] ?? ""}
                                onChange={(e) =>
                                  setSolutionVideo((links) => ({ ...links, [c.id]: e.target.value }))
                                }
                                placeholder="https://youtube.com/... or video URL"
                                className="mt-1 w-full bg-card border border-ink/15 rounded-sm px-2 py-2 text-[11px] font-semibold outline-none focus:border-marigold-500"
                              />
                            </label>
                          </div>
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => submitProposal(c)}
                              className="inline-flex items-center gap-1.5 bg-marigold-500 hover:bg-marigold-400 text-pine-925 font-extrabold text-[12px] px-3.5 py-2 rounded-sm transition-colors"
                            >
                              <Icon
                                name="send"
                                className="w-3.5 h-3.5"
                                sw={2.2}
                              />
                              {hi ? "राज्य सरकार को भेजें" : "Submit to State Government"}
                            </button>
                          </div>
                        </div>
                      ))}

                    {/* Milestones */}
                    {c.milestones.length > 0 && (
                      <div className="space-y-1.5">
                        {c.milestones.map((m) => (
                          <div
                            key={m.id}
                            className={cx(
                              "flex items-center gap-2.5 border rounded-sm px-3 py-2",
                              m.done
                                ? "border-pine-700/25 bg-pine-100/50"
                                : "border-ink/12 bg-paper",
                            )}
                          >
                            <button
                              onClick={() =>
                                !m.done && completeMilestone(c, m.id)
                              }
                              disabled={m.done}
                              className={cx(
                                "w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0 transition-all",
                                m.done
                                  ? "bg-pine-800 text-paper"
                                  : "border-2 border-ink/30 hover:border-marigold-600 hover:bg-marigold-500/20",
                              )}
                              title={
                                hi ? "पूर्ण चिह्नित करें" : "Mark complete"
                              }
                            >
                              {m.done && (
                                <Icon
                                  name="check"
                                  className="w-3 h-3"
                                  sw={3.2}
                                />
                              )}
                            </button>
                            <span
                              className={cx(
                                "flex-1 text-[12.5px] font-bold",
                                m.done
                                  ? "text-pine-800 line-through decoration-pine-700/40"
                                  : "text-ink",
                              )}
                            >
                              {m.label}
                            </span>
                            <span className="text-[10.5px] font-bold text-ink-soft tabular shrink-0">
                              {m.due}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
          {active.length === 0 && (
            <p className="text-[13.5px] font-semibold text-ink-soft bg-card border border-dashed border-ink/25 rounded-md p-6 text-center">
              {hi
                ? "सक्रिय परियोजनाएँ यहाँ दिखेंगी।"
                : "Active projects will appear here."}
            </p>
          )}
        </div>
      </section>

      {/* Deployed */}
      {deployed.length > 0 && (
        <section className="mt-9">
          <h2 className="font-display font-extrabold text-xl tracking-tight text-ink flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-sm bg-marigold-500 text-pine-925 flex items-center justify-center">
              <Icon name="flag" className="w-4 h-4" sw={2.2} />
            </span>
            {hi ? "तैनात समाधान" : "Deployed solutions"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {deployed.map((c) => (
              <div
                key={c.id}
                className="bg-pine-900 text-paper rounded-md p-5 border border-pine-925 shadow-[5px_5px_0_rgba(11,44,33,0.2)]"
              >
                <p className="text-[10.5px] font-extrabold tabular text-marigold-300">
                  {c.id} · {c.district}
                </p>
                <h3 className="font-display font-bold text-[15.5px] leading-snug mt-1.5">
                  {c.title}
                </h3>
                <p className="text-[12.5px] font-semibold text-moss-400 mt-2 flex items-start gap-1.5">
                  <Icon
                    name="trend"
                    className="w-4 h-4 shrink-0 mt-0.5"
                    sw={2.2}
                  />
                  {c.impact}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pipeline reference */}
      <p className="mt-10 text-center text-[11.5px] font-bold text-ink-soft">
        {hi ? "कार्यप्रवाह:" : "Workflow:"}{" "}
        {STAGES.slice(3)
          .map((s) => (hi ? s.hi : s.en))
          .join(" → ")}
      </p>
    </div>
  );
}

/* ============================================================================
   INDUSTRY DESK — funding, tranches, mentorship
   ==========================================================================*/
const MENTOR_REQS = [
  {
    id: "mr1",
    project: "Arsenic community filter — IIT (ISM) Dhanbad",
    need: "Water-treatment field deployment mentorship",
    when: "2 hrs ago",
  },
  {
    id: "mr2",
    project: "Tussar solar dryer — JUT Ranchi",
    need: "Artisan market & scale-up guidance",
    when: "1 day ago",
  },
];

function IndustryDesk({
  t,
  lang,
  session,
  challenges,
  patch,
  toast,
  notif,
}: {
  t: (k: string) => string;
  lang: Lang;
  session: Session;
  challenges: Challenge[];
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  toast: (m: string) => void;
  notif: (icon: string, text: string) => void;
}) {
  const hi = lang === "hi";
  const partner = partnerById(session.orgId) ?? partnerById("tata-steel")!;
  const supported = challenges.filter(
    (c) =>
      c.partner === partner.id ||
      (c.requires_investment &&
        ["industry_funding", "prototype", "pilot"].includes(c.stage)),
  );
  const [pledge, setPledge] = useState<Record<string, string>>({});
  const [pledged, setPledged] = useState<Set<string>>(new Set());
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fundingNote, setFundingNote] = useState<Record<string, string>>({});

  const doPledge = (id: string, title: string) => {
    const amt = (pledge[id] ?? "").trim();
    if (!amt) {
      toast(hi ? "राशि भरें (जैसे ₹20 L)" : "Enter an amount (e.g. ₹20 L)");
      return;
    }
    setPledged((s) => new Set(s).add(id));
    patch(id, (x) => ({
      ...x,
      partner: partner.id,
      fund: amt,
      stage: "government_execution",
      updates: [
        ...x.updates,
        {
          stage: "industry_funding",
          time: "Today",
          note: `${partner.name} committed ${amt}. Funding approved; problem returned to Government for execution.`,
        },
      ],
    }));
    notif("rupee", `${partner.name} funded “${title}” with ${amt}`);
    toast(
      `Funding recorded — the problem is back with Government for execution`,
    );
  };

  const releaseTranche = (c: Challenge) => {
    const note = (fundingNote[c.id] ?? "").trim();
    if (!note) {
      toast("Write a funding note before sending this project to State Government");
      return;
    }
    patch(c.id, (x) => ({
      ...x,
      fund: pledge[c.id]?.trim() || x.fund,
      funding_note: note,
      requires_government: true,
      requires_investment: true,
      routing_decision: "government_field_university_industry",
      routing_scope: "main_government",
      stage: "government_execution",
      updates: [
        ...x.updates,
        {
          stage: "government_execution",
          time: "Today",
          note: `${partner.name} sent a funding decision to State Government: ${note}`,
        },
      ],
    }));
    notif(
      "rupee",
      `Tranche released for ${c.id} — ${uniById(c.uni)?.short} notified`,
    );
    toast("Funding note sent to State Government");
  };

  const acceptMentor = (id: string, project: string) => {
    setAccepted((s) => new Set(s).add(id));
    notif("users", `${partner.name} accepted mentorship: ${project}`);
    toast("Mentorship accepted — introductory call being scheduled");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 view-in">
      {/* Desk header */}
      <div className="bg-pine-925 text-paper rounded-md border border-pine-900 relative overflow-hidden shadow-[7px_7px_0_rgba(11,44,33,0.18)] mb-7">
        <div className="absolute -right-8 -top-12 w-44 h-44 rounded-full border-[14px] border-marigold-500/10" />
        <div
          className="h-2 w-full"
          style={{
            background:
              "linear-gradient(90deg,#FF9933 0 33.3%,#F2F0E5 33.3% 66.6%,#2E7D4F 66.6% 100%)",
          }}
        />
        <div className="px-6 py-6 flex flex-wrap items-center gap-5">
          <span className="w-14 h-14 rounded-sm bg-marigold-500 text-pine-925 font-display font-extrabold text-sm flex items-center justify-center shadow-[3px_3px_0_rgba(0,0,0,0.3)]">
            {partner.name
              .split(/[\s(]+/)
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          <div className="flex-1 min-w-[240px]">
            <p className="text-[10.5px] font-extrabold tracking-[0.24em] uppercase text-moss-400">
              {t("desk_ind")} · {partner.type} {hi ? "लॉगिन" : "login"}
            </p>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">
              {session.org || partner.name}
            </h1>
            <p className="text-[12.5px] font-semibold text-paper/75 mt-0.5">
              {session.name} · {session.company_location || partner.city} · {hi ? "साझेदार" : "partner"}{" "}
              {partner.since} {hi ? "से" : "onwards"}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-marigold-400 tabular">
                {supported.length}
              </p>
              <p className="text-[9.5px] font-extrabold uppercase tracking-widest text-moss-400">
                {hi ? "समर्थित परियोजनाएँ" : "Supported projects"}
              </p>
            </div>
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-marigold-400">
                0
              </p>
              <p className="text-[9.5px] font-extrabold uppercase tracking-widest text-moss-400">
                {hi ? "लाइव प्रतिबद्ध निधि" : "Live committed"}
              </p>
            </div>
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-marigold-400 tabular">
                0
              </p>
              <p className="text-[9.5px] font-extrabold uppercase tracking-widest text-moss-400">
                {hi ? "लाइव सहायता प्रकार" : "Live support types"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Funded projects */}
        <section className="lg:col-span-2">
          <h2 className="font-display font-extrabold text-xl tracking-tight text-ink flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-sm bg-steel-500 text-paper flex items-center justify-center">
              <Icon name="factory" className="w-4 h-4" sw={2.2} />
            </span>
            {hi ? "आपके द्वारा समर्थित परियोजनाएँ" : "Projects you support"}
            <span className="tabular text-sm bg-steel-500/10 text-steel-500 border border-steel-500/30 px-2 py-0.5 rounded-sm">
              {supported.length}
            </span>
          </h2>
          <div className="space-y-4">
            {supported.map((c, i) => (
              <Reveal key={c.id} delay={Math.min(i * 70, 250)}>
                <div className="bg-card border border-ink/10 rounded-md p-5 shadow-[5px_5px_0_rgba(11,44,33,0.07)]">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="text-[10.5px] font-extrabold tabular text-ink-soft">
                      {c.id}
                    </span>
                    <StagePill stage={c.stage} />
                  </div>
                  <h3 className="font-display font-bold text-[15.5px] leading-snug text-ink">
                    {c.title}
                  </h3>
                  <button type="button" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)} className="mt-2 text-[11px] font-extrabold text-steel-700 hover:underline">
                    {expandedId === c.id ? "Hide full route" : "Open full problem route"}
                  </button>
                  {expandedId === c.id && (
                    <div className="mt-3 space-y-2 rounded-sm border border-steel-500/25 bg-steel-500/5 p-3 text-[11px]">
                      <p><b>Submitted by:</b> {c.by || c.reporter?.name || "Citizen"}</p>
                      <p><b>University:</b> {uniById(c.uni)?.name || c.uni || "Not assigned"}</p>
                      <p><b>Team:</b> {c.team_name || "Not provided"} · <b>Mentor:</b> {c.mentor || "Not provided"}</p>
                      <p><b>Members:</b> {c.team?.join(" · ") || "Not provided"}</p>
                      <p><b>Solution:</b> {c.solution || "Not provided"}</p>
                      <p><b>Location:</b> {c.district} · {c.block} {Number.isFinite(Number(c.lat)) && Number.isFinite(Number(c.lng)) ? `(${c.lat}, ${c.lng})` : ""}</p>
                      <div className="border-t border-steel-500/20 pt-2"><b>Full route</b>{(c.updates ?? []).map((update, index) => <p key={`${update.stage}-${index}`}><span className="font-extrabold">{update.stage}</span> · {update.time} · {update.note}</p>)}</div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11.5px] font-bold text-ink-soft">
                    <span className="inline-flex items-center gap-1 text-pine-800">
                      <Icon name="edu" className="w-3.5 h-3.5" sw={2} />
                      {uniById(c.uni)?.name}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="pin" className="w-3.5 h-3.5" sw={2.2} />
                      {c.district}
                    </span>
                    {c.fund && (
                      <span className="inline-flex items-center gap-1 text-marigold-700">
                        <Icon name="rupee" className="w-3.5 h-3.5" sw={2.2} />
                        {c.fund}
                      </span>
                    )}
                  </div>
                  <div className="mt-3.5">
                    <div className="flex justify-between text-[10.5px] font-extrabold text-ink-soft uppercase tracking-wider mb-1">
                      <span>{hi ? "परियोजना प्रगति" : "Project progress"}</span>
                      <span className="tabular">
                        {c.milestones.length
                          ? Math.round(
                              (c.milestones.filter((m) => m.done).length /
                                c.milestones.length) *
                                100,
                            )
                          : 0}
                        % · {hi ? "चरण" : "stage"}: {stageById(c.stage).en}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-ink/8 overflow-hidden">
                      <div
                        className="h-full rounded-full donut-seg"
                        style={{
                          width: `${c.milestones.length ? (c.milestones.filter((m) => m.done).length / c.milestones.length) * 100 : 8}%`,
                          background: stageById(c.stage).color,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <input value={pledge[c.id] ?? c.fund ?? ""} onChange={(event) => setPledge((values) => ({ ...values, [c.id]: event.target.value }))} placeholder="Funding amount" className="min-w-[140px] flex-1 rounded-sm border border-ink/15 bg-paper px-2.5 py-2 text-[12px] font-bold outline-none focus:border-marigold-500" />
                    <input value={fundingNote[c.id] ?? ""} onChange={(event) => setFundingNote((values) => ({ ...values, [c.id]: event.target.value }))} placeholder="Funding note for State Government" className="min-w-[220px] flex-[2] rounded-sm border border-ink/15 bg-paper px-2.5 py-2 text-[12px] font-bold outline-none focus:border-marigold-500" />
                    {c.stage !== "deployed" && (
                      <button
                        onClick={() => releaseTranche(c)}
                        className="inline-flex items-center gap-1.5 bg-marigold-500 hover:bg-marigold-400 text-pine-925 font-extrabold text-[12px] px-3.5 py-2 rounded-sm shadow-[2px_2px_0_rgba(11,44,33,0.8)] hover:-translate-y-0.5 transition-all"
                      >
                        <Icon name="rupee" className="w-3.5 h-3.5" sw={2.2} />
                        {hi ? "अगली किस्त जारी करें" : "Release next tranche"}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        notif(
                          "users",
                          `Field-visit request logged for ${c.id}`,
                        );
                        toast("Field visit scheduled with the project team");
                      }}
                      className="inline-flex items-center gap-1.5 border-2 border-pine-800 text-pine-800 hover:bg-pine-800 hover:text-paper font-extrabold text-[12px] px-3.5 py-2 rounded-sm transition-all"
                    >
                      <Icon name="pin" className="w-3.5 h-3.5" sw={2.2} />
                      {hi ? "क्षेत्र भ्रमण" : "Field visit"}
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
            {supported.length === 0 && (
              <p className="text-[13.5px] font-semibold text-ink-soft bg-card border border-dashed border-ink/25 rounded-md p-6 text-center">
                {hi
                  ? "अभी कोई परियोजना समर्थित नहीं — नीचे फंडिंग कॉल देखें।"
                  : "No projects supported yet — see funding calls below."}
              </p>
            )}
          </div>

          {/* Mentorship requests */}
          <h2 className="font-display font-extrabold text-xl tracking-tight text-ink flex items-center gap-2 mt-8 mb-4">
            <span className="w-7 h-7 rounded-sm bg-pine-800 text-paper flex items-center justify-center">
              <Icon name="star" className="w-4 h-4" sw={2.2} />
            </span>
            {hi ? "मेंटरशिप अनुरोध" : "Mentorship requests"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {false && MENTOR_REQS.map((m, i) => (
              <div
                key={m.id}
                className="bg-card border border-ink/10 rounded-md p-4 shadow-[4px_4px_0_rgba(11,44,33,0.06)] rise-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p className="text-[13px] font-extrabold text-ink leading-snug">
                  {m.project}
                </p>
                <p className="text-[12px] font-semibold text-ink-soft mt-1">
                  {m.need}
                </p>
                <p className="text-[10.5px] font-bold text-ink-soft tabular mt-1.5">
                  {m.when}
                </p>
                {accepted.has(m.id) ? (
                  <p className="mt-3 text-[12px] font-extrabold text-pine-800 bg-pine-100/70 border border-pine-700/25 rounded-sm px-3 py-2 inline-flex items-center gap-1.5">
                    <Icon name="check" className="w-3.5 h-3.5" sw={2.6} />
                    {hi ? "स्वीकृत" : "Accepted"}
                  </p>
                ) : (
                  <button
                    onClick={() => acceptMentor(m.id, m.project)}
                    className="mt-3 inline-flex items-center gap-1.5 bg-pine-800 hover:bg-pine-700 text-paper font-extrabold text-[12px] px-3.5 py-2 rounded-sm transition-colors"
                  >
                    <Icon name="users" className="w-3.5 h-3.5" sw={2.2} />
                    {hi ? "मेंटरशिप स्वीकारें" : "Accept mentorship"}
                  </button>
                )}
              </div>
            ))}
            <p className="sm:col-span-2 text-[13.5px] font-semibold text-ink-soft bg-card border border-dashed border-ink/25 rounded-md p-6 text-center">
              {hi
                ? "अभी कोई live mentorship request नहीं है।"
                : "No live mentorship requests yet."}
            </p>
          </div>
        </section>

        {/* CSR calls + offers */}
        <section className="space-y-5">
          <div className="bg-card border border-ink/10 rounded-md p-5 shadow-[5px_5px_0_rgba(11,44,33,0.07)]">
            <h2 className="font-display font-extrabold text-lg tracking-tight text-ink flex items-center gap-2 mb-3">
              <Icon
                name="rupee"
                className="w-5 h-5 text-marigold-600"
                sw={2.2}
              />
              {hi ? "खुली फंडिंग कॉल" : "Open funding calls"}
            </h2>
            <div className="space-y-4">
              {false && CSR_CALLS.map((call) => (
                <div
                  key={call.id}
                  className="pb-4 border-b border-dashed border-ink/15 last:border-0 last:pb-0"
                >
                  <p className="text-[13px] font-extrabold text-ink leading-snug">
                    {call.title}
                  </p>
                  <p className="text-[11px] font-bold text-ink-soft mt-0.5">
                    {call.by} · {call.amount} · {hi ? "अंतिम तिथि" : "closes"}{" "}
                    {call.deadline}
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    {call.domains.map((d) => {
                      const dd = domainById(d);
                      return (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-[2px] rounded-sm"
                          style={{
                            background: dd.color + "16",
                            color: dd.color,
                          }}
                        >
                          <Icon name={dd.icon} className="w-3 h-3" sw={2.4} />
                          {dd.en}
                        </span>
                      );
                    })}
                  </div>
                  {pledged.has(call.id) ? (
                    <p className="mt-2.5 text-[12px] font-extrabold text-pine-800 bg-pine-100/70 border border-pine-700/25 rounded-sm px-3 py-2 inline-flex items-center gap-1.5">
                      <Icon name="check" className="w-3.5 h-3.5" sw={2.6} />
                      {hi ? "प्रतिज्ञान दर्ज" : "Pledged"}
                    </p>
                  ) : (
                    <div className="flex gap-2 mt-2.5">
                      <input
                        value={pledge[call.id] ?? ""}
                        onChange={(e) =>
                          setPledge((p) => ({
                            ...p,
                            [call.id]: e.target.value,
                          }))
                        }
                        placeholder="₹20 L"
                        className="bg-paper border border-ink/15 rounded-sm px-2.5 py-2 text-[12px] font-bold w-20 outline-none focus:border-marigold-500 transition-colors tabular"
                      />
                      <button
                        onClick={() => doPledge(call.id, call.title)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-marigold-500 hover:bg-marigold-400 text-pine-925 font-extrabold text-[12px] px-3 py-2 rounded-sm transition-colors"
                      >
                        {hi ? "प्रतिज्ञान करें" : "Pledge funding"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <p className="text-[13px] font-semibold text-ink-soft bg-paper border border-dashed border-ink/20 rounded-sm p-4 text-center">
                {hi
                  ? "अभी कोई live funding call उपलब्ध नहीं है।"
                  : "No live funding calls available yet."}
              </p>
            </div>
          </div>

          <div className="bg-pine-925 text-paper rounded-md p-5 shadow-[5px_5px_0_rgba(11,44,33,0.2)]">
            <h2 className="font-display font-extrabold text-lg tracking-tight flex items-center gap-2 mb-3">
              <Icon
                name="layers"
                className="w-5 h-5 text-marigold-400"
                sw={2.2}
              />
              {hi ? "आप क्या दे सकते हैं" : "What you bring"}
            </h2>
            <div className="space-y-2">
              {partner.offers.map((o) => (
                <p
                  key={o}
                  className="flex items-center gap-2.5 text-[12.5px] font-semibold text-paper/90"
                >
                  <span className="w-6 h-6 rounded-sm bg-marigold-500/15 border border-marigold-500/30 text-marigold-400 flex items-center justify-center shrink-0">
                    <Icon name="check" className="w-3 h-3" sw={2.8} />
                  </span>
                  {o}
                </p>
              ))}
            </div>
            <p
              className={cx(
                "mt-4 pt-3.5 border-t border-paper/15 text-[11.5px] font-semibold text-moss-400 leading-relaxed",
              )}
            >
              {hi
                ? "CSR निधि सीधे सत्यापित, उच्च-प्रभाव सामुदायिक परियोजनाओं से जुड़ती है — प्रत्येक किस्त मील के पत्थर से बंधी।"
                : "CSR funds connect directly to validated, high-impact community projects — every tranche is milestone-linked and publicly tracked."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ============================================================================
   DASHBOARD — government command board
   ==========================================================================*/

/* ============================================================================
   GOVERNMENT PROBLEM MAP — live GPS-backed Jharkhand problem locations
   ==========================================================================*/
function GovernmentProblemMap({
  challenges,
  goto,
}: {
  challenges: Challenge[];
  goto: (view: string, filter?: Record<string, string>) => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || typeof L === "undefined") return;
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
      }).setView([23.65, 85.3], 7);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstance.current);

      layerRef.current = L.layerGroup().addTo(mapInstance.current);
    }

    const layer = layerRef.current;
    layer.clearLayers();

    const located = challenges.filter(
      (c) => Number.isFinite(Number(c.lat)) && Number.isFinite(Number(c.lng)),
    );

    const bounds: any[] = [];
    located.forEach((c) => {
      const lat = Number(c.lat);
      const lng = Number(c.lng);
      bounds.push([lat, lng]);

      const stage = stageById(c.stage);
      const color = stage?.color ?? "#CE4A3B";
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95,
      }).addTo(layer);

      const accuracy =
        c.location_source === "browser_gps" && c.accuracy
          ? `<br/><b>GPS accuracy:</b> ±${Math.round(c.accuracy)} m`
          : "";
      const locationSource =
        c.location_source === "browser_gps"
          ? "Exact browser GPS"
          : c.location_source === "address_geocode"
            ? "Address-geocoded problem location"
            : "Approximate district/block location";
      const popup = `
        <div style="min-width:230px;font-family:Arial,sans-serif">
          <div style="font-size:10px;font-weight:800;letter-spacing:.12em;color:#66736c">${c.id}</div>
          <div style="font-size:14px;font-weight:800;margin:5px 0 7px;color:#173b2d">${String(c.title).replace(/</g, "&lt;")}</div>
          <div style="font-size:11px;line-height:1.5">
            <b>District:</b> ${String(c.district).replace(/</g, "&lt;")}<br/>
            <b>Block:</b> ${String(c.block).replace(/</g, "&lt;")}<br/>
            <b>Coordinates:</b> ${lat.toFixed(6)}, ${lng.toFixed(6)}${accuracy}<br/><b>Location source:</b> ${locationSource}
          </div>
          <div style="margin-top:9px;font-size:10px;font-weight:800;text-transform:uppercase;color:${color}">${stage?.en ?? c.stage}</div>
        </div>`;
      marker.bindPopup(popup);
      marker.on("click", () => {
        // Keep the map open, while allowing the officer to open the full registry record.
      });
    });

    if (bounds.length === 1) {
      mapInstance.current.setView(bounds[0], 14);
    } else if (bounds.length > 1) {
      mapInstance.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 12 });
    } else {
      mapInstance.current.setView([23.65, 85.3], 7);
    }

    setTimeout(() => mapInstance.current?.invalidateSize(), 50);
  }, [challenges]);

  useEffect(
    () => () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    },
    [],
  );

  const located = challenges.filter(
    (c) => Number.isFinite(Number(c.lat)) && Number.isFinite(Number(c.lng)),
  );

  return (
    <Reveal className="mb-10">
      <div className="bg-card border border-ink/10 rounded-md overflow-hidden shadow-[5px_5px_0_rgba(11,44,33,0.08)]">
        <div className="p-5 md:p-6 border-b border-ink/10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-brick-600 flex items-center gap-2">
              <Icon name="pin" className="w-4 h-4" sw={2.2} /> Live GIS
            </p>
            <h2 className="font-display font-extrabold text-2xl tracking-tight text-ink mt-1">
              Every problem on the Jharkhand map
            </h2>
            <p className="text-[12px] font-semibold text-ink-soft mt-1">
              {located.length} problem{located.length === 1 ? "" : "s"} with
              coordinates · click a marker for exact GPS coordinates
            </p>
          </div>
          <button
            onClick={() => goto("registry")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-pine-700 hover:text-brick-600"
          >
            Open full registry{" "}
            <Icon name="arrowR" className="w-4 h-4" sw={2.2} />
          </button>
        </div>
        <div ref={mapRef} className="w-full h-[520px] z-0" />
        <div className="px-5 py-3 bg-pine-100/60 border-t border-ink/10 flex flex-wrap gap-4 text-[11px] font-bold text-ink-soft">
          <span>
            <b className="text-ink">{located.length}</b> mapped
          </span>
          <span>Coordinates are stored with each problem</span>
          <span>
            Citizen GPS is captured with high accuracy when permission is
            granted
          </span>
        </div>
      </div>
    </Reveal>
  );
}

function GovernmentWorkflowPanel({
  challenges,
  patch,
  toast,
  session,
  activeUniversityIds = [],
  activeUniversities = [],
  activeIndustries = [],
}: {
  challenges: Challenge[];
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  toast: (m: string) => void;
  session: Session;
  activeUniversityIds?: string[];
  activeUniversities?: { id: string; name: string; org: string }[];
  activeIndustries?: { id: string; name: string; org: string }[];
}) {
  const review = challenges.filter((c) => c.stage === "government_review");
  const execution = challenges.filter(
    (c) =>
      c.stage === "government_execution" &&
      c.routing_decision !== "city_government",
  );
  const matchedUniversities = (c: Challenge) =>
    matchUnis(
      c.domain,
      `${c.title} ${c.desc}`,
      activeUniversityIds,
      activeUniversities,
      undefined,
      Math.max(3, activeUniversities.length),
    );
  const [selectedUniversityIds, setSelectedUniversityIds] = useState<Record<string, string[]>>({});
  const [selectedSolutionIds, setSelectedSolutionIds] = useState<Record<string, string>>({});
  const [selectedIndustryIds, setSelectedIndustryIds] = useState<Record<string, string>>({});
  const [universityPickerChallengeId, setUniversityPickerChallengeId] = useState<string | null>(null);
  const [industryPickerChallengeId, setIndustryPickerChallengeId] = useState<string | null>(null);
  const industryOptions = activeIndustries.length
    ? activeIndustries.map((account) => ({
        id: account.id,
        name: account.name || account.org,
        type: "Industry login",
        city: account.org || "Jharkhand",
        offers: ["Funding", "Project partnership", "Deployment support"],
      }))
    : PARTNERS;
  const workspaceSelectedUniversities = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("ss_selected_universities") || "[]",
      );
      return Array.isArray(saved)
        ? saved.filter((id): id is string => typeof id === "string")
        : [];
    } catch {
      return [];
    }
  };
  const selectedFor = (c: Challenge) => {
    if (selectedUniversityIds[c.id]?.length) return selectedUniversityIds[c.id];
    if (workspaceSelectedUniversities().length) return workspaceSelectedUniversities();
    if (c.universities?.length) return c.universities;
    if (c.uni) return [c.uni];
    const matches = matchedUniversities(c);
    return matches.length ? [matches[0].uni.id] : [];
  };
  const toggleUniversity = (challengeId: string, universityId: string) => {
    setSelectedUniversityIds((current) => {
      const selected = current[challengeId] ?? [];
      return {
        ...current,
        [challengeId]: selected.includes(universityId)
          ? selected.filter((id) => id !== universityId)
          : [...selected, universityId],
      };
    });
  };
  const openUniversityPicker = (c: Challenge) => {
    setSelectedUniversityIds((current) => ({
      ...current,
      [c.id]: current[c.id]?.length ? current[c.id] : selectedFor(c),
    }));
    setUniversityPickerChallengeId(c.id);
  };
  const sendToMatchedUniversities = (c: Challenge) => {
    const selectedIds = workspaceSelectedUniversities();
    const matches = selectedIds.length
      ? matchedUniversities(c).filter(({ uni }) => selectedIds.includes(uni.id))
      : matchedUniversities(c);
    if (!matches.length) {
      toast("No matching University found for this problem");
      return;
    }
    const now = new Date().toLocaleString("en-IN");
    const universityIds = matches.map(({ uni }) => uni.id);
    patch(c.id, (x) => ({
      ...x,
      stage: "university_solution",
      uni: universityIds[0],
      universities: universityIds,
      requires_university: true,
      routing_decision: "government_field_university",
      requires_government: false,
      updates: [
        ...x.updates,
        {
          stage: "university_solution",
          time: now,
          note: `Government review complete. Problem sent to all matched universities: ${matches.map(({ uni }) => uni.name).join(", ")}.`,
        },
      ],
    }));
    toast(`${c.id} sent to ${universityIds.length} matched universities`);
  };
  const sendToSelectedUniversities = (c: Challenge) => {
    const universityIds = selectedFor(c);
    const universities = universityIds
      .map(
        (id) =>
          matchedUniversities(c).find(({ uni }) => uni.id === id)?.uni ||
          uniById(id),
      )
      .filter((university): university is University => Boolean(university));
    if (!universities.length) {
      toast("Select at least one University first");
      return;
    }
    const now = new Date().toLocaleString("en-IN");
    patch(c.id, (x) => ({
      ...x,
      stage: "university_solution",
      uni: universities[0].id,
      universities: universities.map((university) => university.id),
      requires_university: true,
      routing_decision: "government_field_university",
      requires_government: false,
      updates: [
        ...x.updates,
        {
          stage: "university_solution",
          time: now,
          note: `Government review complete. Problem sent to selected universities: ${universities.map((university) => university.name).join(", ")}.`,
        },
      ],
    }));
    toast(`${c.id} sent to ${universities.length} selected universities`);
  };
  const sendToIndustry = (c: Challenge) => {
    const submissions = c.solution_submissions || [];
    const selectedIndustryId = selectedIndustryIds[c.id];
    const selected = submissions.find(
      (submission) => submission.id === selectedSolutionIds[c.id],
    );
    if (submissions.length > 1 && !selected) {
      toast("Select the best university solution first");
      return;
    }
    if (!selectedIndustryId) {
      toast("Select an Industry / CSR partner first");
      return;
    }
    const now = new Date().toLocaleString("en-IN");
    patch(c.id, (x) => ({
      ...x,
      solution: selected?.solution || x.solution,
      solution_pdf: selected?.solution_pdf || x.solution_pdf,
      app_link: selected?.app_link || x.app_link,
      solution_video: selected?.solution_video || x.solution_video,
      uni: selected?.university_id || x.uni,
      team_name: selected?.team_name || x.team_name,
      mentor: selected?.mentor || x.mentor,
      team: selected?.team || x.team,
      partner: selectedIndustryId,
      stage: "industry_funding",
      requires_government: false,
      requires_investment: true,
      routing_decision: "government_field_university_industry",
      routing_scope: "main_government",
      updates: [
        ...x.updates,
        {
          stage: "industry_funding",
          time: now,
          note: `State Government approved the university solution and sent ${x.team_name || "the university team"} to Industry/CSR for funding and deployment support.`,
        },
      ],
    }));
    toast(`${c.id} sent to Industry / CSR`);
  };
  const complete = (c: Challenge) => {
    const now = new Date().toLocaleString("en-IN");
    patch(c.id, (x) => ({
      ...x,
      stage: "city_admin_review",
      requires_government: false,
      routing_decision: "city_government",
      routing_scope: "local_city",
      assigned_to: {
        ...(x.assigned_to || {}),
        user_id: undefined,
        name: "Local Government Execution Queue",
        desk: "city_admin",
        district: x.district,
        ward: x.block,
        department: x.department || x.city_category || "Municipal Services",
      },
      updates: [
        ...x.updates,
        {
          stage: "city_admin_review",
          time: now,
          note: `Government approved the solution and funding and sent the problem to Local Admin for department assignment. ${x.solution || ""}`,
        },
      ],
    }));
    toast(`${c.id} marked resolved by Government`);
  };
  return (
    <Reveal className="mb-8">
      <div className="bg-card border border-ink/10 rounded-md overflow-hidden shadow-[5px_5px_0_rgba(11,44,33,0.07)]">
        <div className="p-5 border-b border-ink/10">
          <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-brick-600">
            {session.stateRole === "state_nodal_officer"
              ? "State Nodal Officer Monitoring"
              : "Government workflow control"}
          </p>
          <h2 className="font-display font-extrabold text-2xl mt-1">
            {session.stateRole === "state_nodal_officer"
              ? "All Complaints + Escalation + Monitoring"
              : "Main Government Portal: review → verify → solution → execution"}
          </h2>
          <p className="text-[12px] text-ink-soft mt-1">
            {session.stateRole === "state_nodal_officer"
              ? "Monitor all state-level complaints, review escalations, verify progress and forward cases to the correct department."
              : "All non-local-city problems arrive here after AI classification. Government can then review, verify and execute the required solution."}
          </p>
        </div>
        <div className="p-5 grid lg:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-extrabold text-lg">
                Needs Government Review
              </h3>
              <span className="font-display font-extrabold text-xl text-brick-600">
                {review.length}
              </span>
            </div>
            {review.map((c) => (
              <div
                key={c.id}
                className="border border-ink/10 rounded-sm p-4 mb-3 bg-paper"
              >
                <div className="flex justify-between gap-2">
                  <span className="font-mono text-[10px] text-ink-soft">
                    {c.id}
                  </span>
                  <span className="text-[10px] font-extrabold bg-brick-500/10 text-brick-600 px-2 py-1 rounded">
                    Government Review
                  </span>
                </div>
                <h4 className="font-display font-extrabold mt-1">{c.title}</h4>
                <p className="text-[11px] text-ink-soft mt-1">
                  {c.district} · {c.block} · {c.department}
                </p>
                <p className="text-[11px] mt-2 text-ink-soft">
                  {c.routing_reason}
                </p>
                <div className="mt-3 grid sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-sm border border-pine-700/20 bg-pine-100/50 p-2">
                    <p className="font-extrabold uppercase tracking-wider text-pine-800">University</p>
                    <p className="font-bold text-ink mt-1">{uniById(c.uni)?.name || c.uni || "Assigned university"}</p>
                  </div>
                  <div className="rounded-sm border border-pine-700/20 bg-pine-100/50 p-2">
                    <p className="font-extrabold uppercase tracking-wider text-pine-800">Team</p>
                    <p className="font-bold text-ink mt-1">{c.team_name || "Not provided"}</p>
                    <p className="text-ink-soft mt-0.5">Mentor: {c.mentor || "Not provided"}</p>
                  </div>
                  <div className="rounded-sm border border-ink/10 bg-card p-2 sm:col-span-2">
                    <p className="font-extrabold uppercase tracking-wider text-ink-soft">Team members</p>
                    <p className="font-bold text-ink mt-1">{c.team?.length ? c.team.join(" · ") : "No members provided"}</p>
                  </div>
                  <div className="rounded-sm border border-ink/10 bg-card p-2 sm:col-span-2">
                    <p className="font-extrabold uppercase tracking-wider text-ink-soft">Problem solution</p>
                    <p className="font-semibold text-ink mt-1 leading-relaxed">{c.solution || "No solution submitted"}</p>
                  </div>
                  {c.solution_submissions?.length ? (
                    <div className="sm:col-span-2 rounded-sm border-2 border-pine-700/25 bg-pine-100/40 p-3">
                      <p className="font-extrabold uppercase tracking-wider text-pine-800">
                        University solutions received ({c.solution_submissions.length})
                      </p>
                      <div className="mt-2 grid gap-2">
                        {c.solution_submissions.map((submission) => (
                          <label
                            key={submission.id}
                            className={cx(
                              "block rounded-sm border bg-paper p-3 cursor-pointer",
                              selectedSolutionIds[c.id] === submission.id
                                ? "border-marigold-500 ring-2 ring-marigold-500/30"
                                : "border-ink/10",
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="radio"
                                name={`best-solution-${c.id}`}
                                checked={selectedSolutionIds[c.id] === submission.id}
                                onChange={() =>
                                  setSelectedSolutionIds((current) => ({
                                    ...current,
                                    [c.id]: submission.id,
                                  }))
                                }
                                className="mt-1 h-4 w-4 accent-marigold-500"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="font-extrabold text-ink">
                                    {submission.university_name}
                                  </p>
                                  <span className="text-[10px] font-bold text-ink-soft">
                                    {submission.submitted_at}
                                  </span>
                                </div>
                                <p className="text-[10.5px] text-ink-soft mt-1">
                                  Team: {submission.team_name} · Mentor: {submission.mentor}
                                </p>
                                <p className="text-[11px] font-semibold text-ink mt-2 leading-relaxed">
                                  {submission.solution}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-extrabold">
                                  {submission.app_link && (
                                    <a href={submission.app_link} target="_blank" rel="noreferrer" className="text-steel-700 hover:underline" onClick={(event) => event.stopPropagation()}>
                                      App link
                                    </a>
                                  )}
                                  {submission.solution_video && (
                                    <a href={submission.solution_video} target="_blank" rel="noreferrer" className="text-brick-600 hover:underline" onClick={(event) => event.stopPropagation()}>
                                      Solution video
                                    </a>
                                  )}
                                  {submission.solution_pdf && <span className="text-pine-800">Solution PDF attached</span>}
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p className="mt-2 text-[10px] font-bold text-ink-soft">
                        Select the best solution before sending it to Industry / CSR.
                      </p>
                    </div>
                  ) : null}
                  <div className="rounded-sm border border-steel-500/25 bg-steel-500/5 p-2 sm:col-span-2">
                    <p className="font-extrabold uppercase tracking-wider text-steel-700">Problem map</p>
                    <p className="font-semibold text-ink mt-1">{c.district} · {c.block}</p>
                    {Number.isFinite(Number(c.lat)) && Number.isFinite(Number(c.lng)) && (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=16/${c.lat}/${c.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-1 font-extrabold text-steel-700 hover:underline"
                      >
                        Open problem location map <Icon name="arrowR" className="w-3 h-3" sw={2.4} />
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-3 rounded-sm border border-marigold-500/30 bg-marigold-500/10 p-3 text-xs font-bold text-marigold-700">
                  Review complete: matched universities can now review this
                  problem and submit a solution proposal.
                </div>
                <div className="mt-3 rounded-sm border border-steel-500/25 bg-steel-500/5 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-steel-700">
                        University routing
                      </p>
                      <p
                        className={cx(
                          "mt-2 inline-flex items-center rounded-sm border px-2.5 py-1 text-xs font-extrabold",
                          selectedFor(c).length
                            ? "border-marigold-500 bg-marigold-500 text-pine-925 shadow-[2px_2px_0_rgba(11,44,33,0.2)]"
                            : "border-ink/15 bg-card text-ink-soft",
                        )}
                      >
                        {selectedFor(c).length
                          ? `✓ ${selectedFor(c).length} university selected`
                          : "No university selected yet"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openUniversityPicker(c)}
                      className={cx(
                        "inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-extrabold transition-all",
                        selectedFor(c).length
                          ? "border-2 border-marigold-500 bg-marigold-500 text-pine-925 shadow-[2px_2px_0_rgba(11,44,33,0.25)] hover:-translate-y-0.5"
                          : "bg-steel-700 text-paper",
                      )}
                    >
                      {selectedFor(c).length ? "✓ University selected · Change" : "Select university"}
                    </button>
                  </div>
                  {universityPickerChallengeId === c.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-labelledby={`university-picker-${c.id}`}>
                      <div className="w-full max-w-lg rounded-md border border-ink/15 bg-paper p-4 shadow-2xl">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 id={`university-picker-${c.id}`} className="font-display text-lg font-extrabold text-ink">
                              Select universities for this problem
                            </h4>
                            <p className="mt-1 text-xs font-semibold text-ink-soft">
                              Choose one or more logged-in universities, then send the problem.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUniversityPickerChallengeId(null)}
                            className="text-xs font-extrabold text-ink-soft hover:text-ink"
                            aria-label="Close university selection"
                          >
                            Close
                          </button>
                        </div>
                        <div className="mt-4 grid max-h-[55vh] gap-2 overflow-y-auto">
                          {matchedUniversities(c).map(({ uni: university, match }) => (
                            <label
                              key={university.id}
                              className={cx(
                                "flex cursor-pointer items-start gap-3 rounded-sm border bg-card p-3",
                                selectedFor(c).includes(university.id)
                                  ? "border-steel-700 ring-1 ring-steel-700/30"
                                  : "border-ink/10",
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={selectedFor(c).includes(university.id)}
                                onChange={() => toggleUniversity(c.id, university.id)}
                                className="mt-0.5 h-4 w-4 accent-steel-700"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-ink">
                                  {university.name}
                                  <span className="text-[10px] text-steel-700">{match}% match</span>
                                </span>
                                <span className="mt-1 block text-[10px] font-semibold text-ink-soft">
                                  {university.city || "Registered university"}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-ink/10 pt-3">
                          <span className="text-xs font-extrabold text-ink-soft">
                            {selectedFor(c).length} selected
                          </span>
                          <button
                            type="button"
                            onClick={() => setUniversityPickerChallengeId(null)}
                            className="rounded-sm bg-pine-800 px-3 py-2 text-xs font-extrabold text-paper"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {c.solution_submissions?.length ? (
                  <div className="mt-3 rounded-sm border border-pine-700/25 bg-pine-100/50 p-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-pine-800">
                      University solution received
                    </p>
                    <div className="mt-2 grid gap-2">
                      {c.solution_submissions.map((submission) => (
                        <label
                          key={submission.id}
                          className={cx(
                            "block rounded-sm border bg-paper p-3 cursor-pointer",
                            selectedSolutionIds[c.id] === submission.id
                              ? "border-marigold-500 ring-2 ring-marigold-500/30"
                              : "border-ink/10",
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="radio"
                              name={`approved-solution-${c.id}`}
                              checked={selectedSolutionIds[c.id] === submission.id}
                              onChange={() =>
                                setSelectedSolutionIds((current) => ({
                                  ...current,
                                  [c.id]: submission.id,
                                }))
                              }
                              className="mt-1 h-4 w-4 accent-marigold-500"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="font-extrabold text-ink">
                                  {submission.university_name}
                                </p>
                                <span className="text-[10px] font-bold text-ink-soft">
                                  {submission.submitted_at}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-ink-soft mt-1">
                                Team: {submission.team_name} · Mentor: {submission.mentor}
                              </p>
                              <p className="text-[11px] font-semibold text-ink mt-2 leading-relaxed">
                                {submission.solution}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] font-bold text-ink-soft">
                      Select one solution and send it to Industry / CSR.
                    </p>
                  </div>
                ) : null}
                <button
                  onClick={() => sendToSelectedUniversities(c)}
                  disabled={c.stage !== "government_review"}
                  className={cx(
                    "mt-2 w-full rounded-sm px-3 py-2 text-xs font-extrabold transition-all disabled:opacity-50",
                    selectedFor(c).length
                      ? "border-2 border-marigold-500 bg-pine-800 text-paper shadow-[3px_3px_0_rgba(232,168,58,0.8)] hover:-translate-y-0.5"
                      : "bg-steel-700 text-paper",
                  )}
                >
                  {selectedFor(c).length
                    ? `✓ Send problem to selected University (${selectedFor(c).length})`
                    : "Send problem to selected University"}
                </button>
                {c.solution_submissions?.length ? (
                  <div className="mt-3 rounded-sm border border-marigold-500/35 bg-marigold-500/10 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-marigold-700">
                          Industry / CSR execution
                        </p>
                        <p className="mt-1 text-xs font-extrabold text-ink">
                          {selectedIndustryIds[c.id]
                            ? `✓ ${industryOptions.find((partner) => partner.id === selectedIndustryIds[c.id])?.name || "Industry selected"}`
                            : "Select an Industry / CSR partner"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIndustryPickerChallengeId(c.id)}
                        className={cx(
                          "rounded-sm px-3 py-2 text-xs font-extrabold transition-all",
                          selectedIndustryIds[c.id]
                            ? "border-2 border-marigold-500 bg-marigold-500 text-pine-925 shadow-[2px_2px_0_rgba(11,44,33,0.2)]"
                            : "bg-pine-800 text-paper",
                        )}
                      >
                        {selectedIndustryIds[c.id] ? "✓ Industry selected · Change" : "Select Industry / CSR"}
                      </button>
                    </div>
                    {industryPickerChallengeId === c.id && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-labelledby={`industry-picker-${c.id}`}>
                        <div className="w-full max-w-lg rounded-md border border-ink/15 bg-paper p-4 shadow-2xl">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 id={`industry-picker-${c.id}`} className="font-display text-lg font-extrabold text-ink">
                                Select Industry / CSR partner
                              </h4>
                              <p className="mt-1 text-xs font-semibold text-ink-soft">
                                Choose where the approved university solution should be sent.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIndustryPickerChallengeId(null)}
                              className="text-xs font-extrabold text-ink-soft hover:text-ink"
                            >
                              Close
                            </button>
                          </div>
                          <div className="mt-4 grid max-h-[55vh] gap-2 overflow-y-auto">
                            {industryOptions.map((partner) => (
                              <label
                                key={partner.id}
                                className={cx(
                                  "flex cursor-pointer items-start gap-3 rounded-sm border bg-card p-3",
                                  selectedIndustryIds[c.id] === partner.id
                                    ? "border-marigold-500 ring-2 ring-marigold-500/30"
                                    : "border-ink/10",
                                )}
                              >
                                <input
                                  type="radio"
                                  name={`industry-partner-${c.id}`}
                                  checked={selectedIndustryIds[c.id] === partner.id}
                                  onChange={() =>
                                    setSelectedIndustryIds((current) => ({
                                      ...current,
                                      [c.id]: partner.id,
                                    }))
                                  }
                                  className="mt-0.5 h-4 w-4 accent-marigold-500"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-ink">
                                    {partner.name}
                                    <span className="text-[10px] text-marigold-700">{partner.type}</span>
                                  </span>
                                  <span className="mt-1 block text-[10px] font-semibold text-ink-soft">
                                    {partner.city} · {partner.offers.join(" · ")}
                                  </span>
                                </span>
                              </label>
                            ))}
                          </div>
                          <div className="mt-4 flex justify-end border-t border-ink/10 pt-3">
                            <button
                              type="button"
                              onClick={() => setIndustryPickerChallengeId(null)}
                              className="rounded-sm bg-pine-800 px-3 py-2 text-xs font-extrabold text-paper"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => sendToIndustry(c)}
                      disabled={!selectedIndustryIds[c.id] || (c.solution_submissions.length > 1 && !selectedSolutionIds[c.id])}
                      className="mt-3 w-full rounded-sm border-2 border-marigold-500 bg-pine-800 px-3 py-2 text-xs font-extrabold text-paper shadow-[3px_3px_0_rgba(232,168,58,0.8)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Send approved solution to selected Industry / CSR
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            {!review.length && (
              <div className="p-5 text-center border border-dashed border-ink/20 rounded-sm text-sm text-ink-soft">
                No complex problems waiting for initial Government review.
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-extrabold text-lg">
                Ready for Government Execution
              </h3>
              <span className="font-display font-extrabold text-xl text-pine-800">
                {execution.length}
              </span>
            </div>
            {execution.map((c) => (
              <div
                key={c.id}
                className="border border-ink/10 rounded-sm p-4 mb-3 bg-paper"
              >
                <div className="flex justify-between gap-2">
                  <span className="font-mono text-[10px] text-ink-soft">
                    {c.id}
                  </span>
                  <span className="text-[10px] font-extrabold bg-pine-100 text-pine-800 px-2 py-1 rounded">
                    Final Government Check
                  </span>
                </div>
                <h4 className="font-display font-extrabold mt-1">{c.title}</h4>
                <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] font-bold">
                  <span className="bg-card border border-ink/10 rounded p-2">
                    Field: {c.field_verification?.status ?? "pending"}
                  </span>
                  <span className="bg-card border border-ink/10 rounded p-2">
                    University: {c.requires_university ? "Yes" : "No"}
                  </span>
                  <span className="bg-card border border-ink/10 rounded p-2">
                    Funding:{" "}
                    {c.requires_investment
                      ? c.fund || "Pending"
                      : "Not required"}
                  </span>
                </div>
                <div className="mt-3 grid sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-sm border border-pine-700/20 bg-pine-100/50 p-2 sm:col-span-2">
                    <p className="font-extrabold uppercase tracking-wider text-pine-800">Approved solution</p>
                    <p className="font-semibold text-ink mt-1 leading-relaxed">{c.solution || "No solution recorded"}</p>
                  </div>
                  <div className="rounded-sm border border-marigold-500/30 bg-marigold-500/10 p-2">
                    <p className="font-extrabold uppercase tracking-wider text-marigold-700">Approved funding</p>
                    <p className="font-bold text-ink mt-1">{c.fund || "Funding pending"}</p>
                    <p className="text-ink-soft mt-0.5">{c.funding_note || "No funding note"}</p>
                  </div>
                  <div className="rounded-sm border border-ink/10 bg-card p-2">
                    <p className="font-extrabold uppercase tracking-wider text-ink-soft">University team</p>
                    <p className="font-bold text-ink mt-1">{uniById(c.uni)?.name || c.uni || "Not assigned"}</p>
                    <p className="text-ink-soft mt-0.5">{c.team_name || "Team not recorded"} · {c.mentor || "Mentor not recorded"}</p>
                    <p className="text-ink-soft mt-0.5">{c.team?.join(" · ") || "No members"}</p>
                  </div>
                </div>
                <p className="text-[11px] text-ink-soft mt-2">
                  {c.uni
                    ? `University: ${uniById(c.uni)?.short ?? c.uni}`
                    : "No university"}
                  {c.partner
                    ? ` · Industry: ${partnerById(c.partner)?.name ?? c.partner}`
                    : ""}
                </p>
                <button
                  onClick={() => complete(c)}
                  className="mt-3 w-full bg-pine-800 text-paper px-3 py-2 rounded-sm text-xs font-extrabold"
                >
                  ✓ Send solution + funding to Local Admin
                </button>
              </div>
            ))}
            {!execution.length && (
              <div className="p-5 text-center border border-dashed border-ink/20 rounded-sm text-sm text-ink-soft">
                No complex problem is waiting for final execution.
              </div>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function StateNodalOfficerDashboard({
  challenges,
  lang,
}: {
  challenges: Challenge[];
  lang: Lang;
}) {
  const hi = lang === "hi";
  const escalated = challenges.filter(
    (c) => c.stage === "government_review" || c.requires_government,
  );
  const open = challenges.filter((c) => c.stage !== "deployed");
  const resolved = challenges.filter((c) => c.stage === "deployed");
  const verified = challenges.filter(
    (c) =>
      c.field_verification?.status === "verified" ||
      c.verification?.status === "verified",
  );
  const overdue = challenges.filter(
    (c) =>
      c.stage !== "deployed" &&
      c.sla?.due_at &&
      Date.now() > Date.parse(c.sla.due_at),
  );
  const recent = challenges
    .flatMap((c) =>
      (c.updates || []).slice(-1).map((update) => ({ c, update })),
    )
    .slice(0, 8);
  const metricCards: [string, number, string][] = [
    [
      hi ? "कुल शिकायतें" : "All complaints",
      challenges.length,
      "text-pine-800",
    ],
    [hi ? "खुली शिकायतें" : "Open complaints", open.length, "text-steel-700"],
    [
      hi ? "Escalation queue" : "Escalations",
      escalated.length,
      "text-brick-600",
    ],
    [hi ? "सत्यापित" : "Verified", verified.length, "text-moss-700"],
    [hi ? "हल की गई" : "Resolved", resolved.length, "text-pine-800"],
    [hi ? "SLA overdue" : "SLA overdue", overdue.length, "text-brick-600"],
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 view-in">
      <div className="bg-pine-925 text-paper rounded-md overflow-hidden shadow-[6px_6px_0_rgba(11,44,33,.16)]">
        <div className="p-6 md:p-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-marigold-300">
              State Nodal Officer
            </p>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl mt-2">
              All Complaints + Escalation + Monitoring
            </h1>
            <p className="text-paper/70 mt-2 max-w-2xl text-sm">
              {hi
                ? "सभी शिकायतों की निगरानी करें, escalation verify करें और सही department को forward करें।"
                : "Monitor every complaint, verify escalations and keep department action on track."}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-moss-400 font-extrabold">
              {hi ? "Live monitoring" : "Live monitoring"}
            </p>
            <p className="font-display font-extrabold text-3xl">
              {challenges.length}
            </p>
            <p className="text-xs text-paper/60">
              {hi ? "records in state view" : "records in state view"}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mt-5">
        {metricCards.map(([label, value, color]) => (
          <div
            key={String(label)}
            className="bg-card border border-ink/10 rounded-sm px-3 py-4"
          >
            <b className={cx("text-2xl font-display block", color)}>{value}</b>
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-ink-soft">
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1.35fr_.85fr] gap-5 mt-6">
        <section className="bg-card border border-ink/10 rounded-md overflow-hidden">
          <div className="p-5 border-b border-ink/10 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-brick-600">
                Escalation monitoring
              </p>
              <h2 className="font-display font-extrabold text-2xl mt-1">
                {hi ? "Escalated complaints" : "Escalated complaints"}
              </h2>
            </div>
            <span className="font-display font-extrabold text-2xl text-brick-600">
              {escalated.length}
            </span>
          </div>
          <div className="p-4 space-y-3">
            {escalated.slice(0, 12).map((c) => (
              <div
                key={c.id}
                className="border border-brick-500/20 bg-brick-500/5 rounded-sm p-4"
              >
                <div className="flex justify-between gap-3">
                  <span className="font-mono text-[10px] text-ink-soft">
                    {c.id}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-brick-600">
                    {c.stage.replace(/_/g, " ")}
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-lg mt-1">
                  {c.title}
                </h3>
                <p className="text-xs text-ink-soft mt-1">
                  {c.district} · {c.block} · {c.department || c.domain}
                </p>
                <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-bold">
                  <span className="bg-card border border-ink/10 rounded-sm px-2 py-1">
                    Priority {c.priority}
                  </span>
                  <span className="bg-card border border-ink/10 rounded-sm px-2 py-1">
                    Field: {c.field_verification?.status || "pending"}
                  </span>
                  <span className="bg-card border border-ink/10 rounded-sm px-2 py-1">
                    Assigned: {c.assigned_to?.name || "Unassigned"}
                  </span>
                </div>
              </div>
            ))}
            {!escalated.length && (
              <div className="p-8 text-center border border-dashed border-ink/20 rounded-sm text-sm text-ink-soft">
                {hi
                  ? "अभी कोई escalation pending नहीं है।"
                  : "No escalations are pending."}
              </div>
            )}
          </div>
        </section>
        <section className="bg-card border border-ink/10 rounded-md overflow-hidden">
          <div className="p-5 border-b border-ink/10">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-pine-700">
              Department monitoring
            </p>
            <h2 className="font-display font-extrabold text-2xl mt-1">
              {hi ? "Latest activity" : "Latest activity"}
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {recent.map(({ c, update }, index) => (
              <div
                key={`${c.id}-${index}`}
                className="flex gap-3 border-b border-ink/8 pb-3 last:border-0"
              >
                <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-marigold-500 shrink-0" />
                <div>
                  <p className="text-xs font-extrabold">{c.title}</p>
                  <p className="text-[11px] text-ink-soft mt-0.5">
                    {update.note}
                  </p>
                  <p className="text-[10px] text-ink-soft mt-1">
                    {update.time}
                  </p>
                </div>
              </div>
            ))}
            {!recent.length && (
              <p className="p-6 text-center text-sm text-ink-soft">
                No monitoring activity yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Dashboard({
  t,
  challenges,
  goto,
  patch,
  toast,
  session,
  activeUniversityIds = [],
  activeUniversities = [],
  activeIndustries = [],
}: {
  t: (k: string) => string;
  lang: Lang;
  challenges: Challenge[];
  goto: (view: string, filter?: Record<string, string>) => void;
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  toast: (m: string) => void;
  session: Session;
  activeUniversityIds?: string[];
  activeUniversities?: { id: string; name: string; org: string }[];
  activeIndustries?: { id: string; name: string; org: string }[];
}) {
  const stageCounts = STAGES.map((s) => ({
    s,
    n: challenges.filter((c) => c.stage === s.id).length,
  }));
  const total = challenges.length;
  const domainData = DOMAINS.map((d) => ({
    label: d.en,
    value: challenges.filter((c) => c.domain === d.id).length,
    color: d.color,
  }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
  const districtCounts = DISTRICTS.map((d) => ({
    d,
    n: challenges.filter((c) => c.district === d).length,
  })).sort((a, b) => b.n - a.n);
  const maxDistrict = Math.max(...districtCounts.map((x) => x.n), 1);
  const recent = [...challenges].slice(0, 5);
  const validated = challenges.filter((c) => stageIdx(c.stage) >= 2).length;
  const routed = challenges.filter(
    (c) =>
      c.stage === "routed" ||
      c.stage === "university_solution" ||
      c.stage === "industry_funding",
  ).length;
  const engagedUniversities = new Set(
    challenges.flatMap((c) => [c.uni, ...(c.universities ?? [])].filter(Boolean)),
  ).size;
  const industryPartners = new Set(challenges.map((c) => c.partner).filter(Boolean)).size;
  const coveredDistricts = new Set(challenges.map((c) => c.district).filter(Boolean)).size;
  const deployed = challenges.filter((c) => c.stage === "deployed").length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <GovernmentWorkflowPanel
        challenges={challenges}
        patch={patch}
        toast={toast}
        session={session}
        activeUniversityIds={activeUniversityIds}
        activeUniversities={activeUniversities}
        activeIndustries={activeIndustries}
      />
      {/* Board header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-brick-500 pulse-dot text-brick-500" />
            <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-brick-600">
              {t("live")} · FY 2025–26
            </span>
          </div>
          <h1 className="font-display font-extrabold tracking-tight text-3xl md:text-5xl leading-[1.02] text-ink">
            State Innovation
            <br />
            Command Board
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-semibold text-ink-soft uppercase tracking-widest">
            Problem → Solution → Deployment
          </p>
          <p className="font-display font-bold text-lg text-pine-800">
            {coveredDistricts} districts · {domainData.length} active domains
          </p>
          <button
            onClick={() => goto("submit")}
            className="mt-2 inline-flex items-center gap-2 bg-marigold-500 hover:bg-marigold-400 text-pine-925 font-bold text-sm px-4 py-2.5 rounded-sm shadow-[3px_3px_0_rgba(11,44,33,0.9)] hover:shadow-[5px_5px_0_rgba(11,44,33,0.9)] hover:-translate-y-0.5 transition-all"
          >
            <Icon name="plus" className="w-4 h-4" sw={2.4} /> {t("btn_submit")}
          </button>
        </div>
      </div>

      {/* KPI bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3.5 mb-10">
        <Reveal className="col-span-2 lg:col-span-5 lg:row-span-2">
          <div className="h-full bg-pine-900 text-paper rounded-md p-6 relative overflow-hidden border border-pine-925 shadow-[6px_6px_0_rgba(11,44,33,0.18)]">
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full border-[14px] border-marigold-500/15" />
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-moss-400">
              Problems received · live data
            </p>
            <div className="flex items-end gap-3 mt-2">
              <Counter
                to={total}
                className="font-display font-extrabold text-6xl md:text-7xl leading-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-paper/15">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-moss-400 font-bold">
                  Validated
                </p>
                <p className="font-display font-bold text-2xl">{validated}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-moss-400 font-bold">
                  Routed to HEIs
                </p>
                <p className="font-display font-bold text-2xl">{routed}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-moss-400 font-bold">
                  In pipeline now
                </p>
                <p className="font-display font-bold text-2xl text-marigold-400">
                  {total}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={60} className="col-span-1 lg:col-span-3">
          <Tile
            label={t("universities_engaged")}
            icon="edu"
            big={engagedUniversities}
            sub="universities receiving live problems"
            onClick={() => goto("unis")}
          />
        </Reveal>
        <Reveal delay={120} className="col-span-1 lg:col-span-2">
          <Tile
            label={t("industry_partners")}
            icon="factory"
            big={industryPartners}
            sub="partners linked to live problems"
            onClick={() => goto("industry")}
          />
        </Reveal>
        <Reveal delay={180} className="col-span-1 lg:col-span-2">
          <Tile
            label="Districts covered"
            icon="pin"
            big={coveredDistricts}
            sub="districts in live problem data"
            onClick={() => goto("registry")}
          />
        </Reveal>
        <Reveal delay={100} className="col-span-1 lg:col-span-3">
          <div
            onClick={() => goto("industry")}
            className="group h-full bg-marigold-500 text-pine-925 rounded-md p-5 cursor-pointer border border-marigold-600 shadow-[5px_5px_0_rgba(11,44,33,0.16)] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_rgba(11,44,33,0.2)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold tracking-[0.18em] uppercase">
                {t("fund_committed")}
              </p>
              <Icon name="rupee" className="w-5 h-5" sw={2} />
            </div>
            <p className="font-display font-extrabold text-4xl mt-2 leading-none">
              ₹0 <span className="text-xl">Cr</span>
            </p>
            <p className="text-[12px] font-semibold mt-2 opacity-80">
              No live funding data
            </p>
          </div>
        </Reveal>
        <Reveal delay={160} className="col-span-1 lg:col-span-2">
          <Tile
            label={t("deployed")}
            icon="check"
            big={deployed}
            sub="solutions in live data"
            onClick={() => goto("impact")}
          />
        </Reveal>
        <Reveal delay={220} className="col-span-1 lg:col-span-2">
          <Tile
            label="Patents filed"
            icon="patent"
            big={0}
            sub="No live patent data"
            onClick={() => goto("impact")}
          />
        </Reveal>
      </div>

      {/* Live Jharkhand GIS map */}
      <GovernmentProblemMap challenges={challenges} goto={goto} />

      {/* Pipeline */}
      <Reveal className="mb-10">
        <SectionHead
          kicker="End-to-end pipeline"
          title="Where every problem stands"
          right={
            <button
              onClick={() => goto("registry")}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-pine-700 hover:text-brick-600 transition-colors"
            >
              Open registry <Icon name="arrowR" className="w-4 h-4" sw={2.2} />
            </button>
          }
        />
        <div className="bg-card border border-ink/10 rounded-md p-5 shadow-[5px_5px_0_rgba(11,44,33,0.07)]">
          <div className="flex h-14 rounded-sm overflow-hidden border border-ink/10">
            {stageCounts.map(({ s, n }) => (
              <button
                key={s.id}
                onClick={() => goto("registry", { stage: s.id })}
                title={`${s.en}: ${n}`}
                className="group relative flex items-center justify-center text-paper font-extrabold text-sm transition-all hover:brightness-110 hover:-translate-y-[2px]"
                style={{
                  width: `${Math.max(6, (n / total) * 100)}%`,
                  background: s.color,
                }}
              >
                {n > 0 && <span className="tabular">{n}</span>}
                {n > 0 && (
                  <span
                    className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent"
                    style={{ borderBottomColor: s.color }}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
            {stageCounts.map(({ s, n }, i) => (
              <button
                key={s.id}
                onClick={() => goto("registry", { stage: s.id })}
                className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-soft hover:text-ink transition-colors"
              >
                <span
                  className="tabular font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center text-paper"
                  style={{ background: s.color }}
                >
                  {i + 1}
                </span>
                {s.en}{" "}
                <span
                  className="tabular font-extrabold"
                  style={{ color: s.color }}
                >
                  {n}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Domain donut + district matrix */}
      <div className="grid lg:grid-cols-2 gap-5 mb-10">
        <Reveal>
          <div className="h-full bg-card border border-ink/10 rounded-md p-6 shadow-[5px_5px_0_rgba(11,44,33,0.07)]">
            <SectionHead
              kicker="Thematic spread"
              title="Domain-wise problems"
            />
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Donut
                data={domainData}
                size={200}
                center={
                  <>
                    <p className="font-display font-extrabold text-4xl text-ink leading-none">
                      <Counter
                        to={domainData.reduce((s, d) => s + d.value, 0)}
                      />
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mt-1">
                      active
                    </p>
                  </>
                }
              />
              <div className="flex-1 w-full space-y-2">
                {domainData.map((d) => (
                  <button
                    key={d.label}
                    onClick={() =>
                      goto("registry", {
                        domain: DOMAINS.find((x) => x.en === d.label)?.id ?? "",
                      })
                    }
                    className="w-full flex items-center gap-2.5 group text-left"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-[12.5px] font-semibold text-ink flex-1 group-hover:underline decoration-2 underline-offset-2">
                      {d.label}
                    </span>
                    <span className="tabular text-[12px] font-extrabold text-ink-soft">
                      {d.value}
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-ink/8 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(d.value / Math.max(...domainData.map((x) => x.value))) * 100}%`,
                          background: d.color,
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={90}>
          <div className="h-full bg-card border border-ink/10 rounded-md p-6 shadow-[5px_5px_0_rgba(11,44,33,0.07)]">
            <SectionHead
              kicker="Geography"
              title="District heat matrix"
              right={
                <span className="text-[11px] font-bold text-ink-soft">
                  24 districts · {total} active
                </span>
              }
            />
            <div className="grid grid-cols-6 gap-1.5">
              {districtCounts.map(({ d, n }) => (
                <button
                  key={d}
                  onClick={() => goto("registry", { district: d })}
                  title={`${d}: ${n} problems`}
                  className="aspect-square rounded-[3px] flex items-center justify-center text-[9.5px] font-extrabold tabular transition-all hover:scale-110 hover:ring-2 hover:ring-marigold-500 relative group"
                  style={{
                    background:
                      n === 0
                        ? "rgba(23,32,26,0.05)"
                        : `rgba(11,44,33,${0.12 + 0.8 * (n / maxDistrict)})`,
                    color: n / maxDistrict > 0.45 ? "#F2F0E5" : "#17201A",
                  }}
                >
                  {n > 0 && n}
                  <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 bg-pine-925 text-paper text-[10px] font-bold px-2 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {d}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {districtCounts
                .filter((x) => x.n > 0)
                .slice(0, 4)
                .map(({ d, n }) => (
                  <div
                    key={d}
                    className="flex items-center gap-2 text-[12.5px]"
                  >
                    <span className="font-bold text-ink w-36 truncate">
                      {d}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-ink/8 overflow-hidden">
                      <div
                        className="h-full bg-pine-700 rounded-full"
                        style={{ width: `${(n / maxDistrict) * 100}%` }}
                      />
                    </div>
                    <span className="tabular font-extrabold text-pine-800 w-5 text-right">
                      {n}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Trend + recent + activity */}
      <div className="grid lg:grid-cols-3 gap-5 mb-10">
        <Reveal>
          <div className="h-full bg-card border border-ink/10 rounded-md p-6 shadow-[5px_5px_0_rgba(11,44,33,0.07)]">
            <SectionHead kicker="Submissions" title="Live intake" />
            <div className="h-40 flex items-center justify-center border border-dashed border-ink/20 rounded-sm">
              <p className="text-sm font-semibold text-ink-soft text-center px-5">
                Monthly history will appear after live submissions accumulate.
              </p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="h-full bg-card border border-ink/10 rounded-md p-6 shadow-[5px_5px_0_rgba(11,44,33,0.07)]">
            <SectionHead
              kicker="Latest intake"
              title="Recent submissions"
              right={
                <button
                  onClick={() => goto("registry")}
                  className="text-[12px] font-bold text-pine-700 hover:text-brick-600 transition-colors"
                >
                  {t("all")} →
                </button>
              }
            />
            <div className="space-y-3">
              {recent.map((c) => (
                <button
                  key={c.id}
                  onClick={() => goto("registry", { open: c.id })}
                  className="w-full text-left group"
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-dashed border-ink/15 last:border-0 last:pb-0">
                    <div>
                      <p className="text-[13px] font-bold leading-snug text-ink group-hover:text-pine-700 transition-colors line-clamp-2">
                        {c.title}
                      </p>
                      <p className="text-[11px] font-semibold text-ink-soft mt-0.5 flex items-center gap-1">
                        <Icon name="pin" className="w-3 h-3" sw={2.2} />
                        {c.district} · {c.date}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StagePill stage={c.stage} />
                      <DomainTag id={c.domain} withName={false} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={160}>
          <div className="h-full bg-pine-925 text-paper rounded-md p-6 shadow-[5px_5px_0_rgba(11,44,33,0.2)] relative overflow-hidden">
            <div className="absolute right-0 top-0 shimmer h-full w-16 opacity-20" />
            <SectionHead
              dark
              kicker="Pulse"
              title="Live activity"
              right={
                <span className="relative inline-flex w-2 h-2 rounded-full bg-marigold-400 pulse-dot text-marigold-400" />
              }
            />
            <div className="space-y-3.5">
              {recent.slice(0, 7).map((c, i) => (
                <div
                  key={c.id}
                  className="flex gap-3 items-start rise-in"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <span className="shrink-0 tabular text-[10px] font-extrabold bg-paper/10 text-marigold-300 px-1.5 py-0.5 rounded-sm mt-0.5">
                    live
                  </span>
                  <p className="text-[12.5px] leading-snug text-paper/90 font-medium">
                    {c.title} · {stageById(c.stage).en}
                  </p>
                </div>
              ))}
              {!recent.length && (
                <p className="text-sm text-paper/70">No live activity yet.</p>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Outcomes strip */}
      <Reveal>
        <div className="bg-pine-900 text-paper rounded-md border border-pine-925 overflow-hidden relative">
          <div
            className="h-2 w-full"
            style={{
              background:
                "linear-gradient(90deg,#FF9933 0 33.3%,#F2F0E5 33.3% 66.6%,#2E7D4F 66.6% 100%)",
            }}
          />
          <div className="px-6 py-5 flex flex-wrap items-center gap-x-10 gap-y-4">
            <p className="font-display font-extrabold text-lg tracking-tight">
              Innovation outcomes →
            </p>
            <OutcomeItem icon="patent" n={0} label="patents filed" />
            <OutcomeItem icon="rocket" n={0} label="startups incubated" />
            <OutcomeItem icon="users" n={0} label="citizens benefited" />
            <OutcomeItem icon="flask" n={challenges.filter((c) => c.stage === "team").length} label="teams formed" />
            <OutcomeItem
              icon="layers"
              n={0}
              label="districts replicating solutions"
            />
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function Tile({
  label,
  icon,
  big,
  sub,
  onClick,
}: {
  label: string;
  icon: string;
  big: number;
  sub: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cx(
        "h-full bg-card border border-ink/10 rounded-md p-5 shadow-[5px_5px_0_rgba(11,44,33,0.07)] transition-all",
        onClick &&
          "cursor-pointer hover:-translate-y-1 hover:shadow-[7px_7px_0_rgba(11,44,33,0.13)]",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-extrabold tracking-[0.14em] uppercase text-ink-soft">
          {label}
        </p>
        <span className="w-8 h-8 rounded-sm bg-pine-100 text-pine-800 flex items-center justify-center">
          <Icon name={icon} className="w-[18px] h-[18px]" sw={2} />
        </span>
      </div>
      <p className="font-display font-extrabold text-4xl text-ink mt-2.5 leading-none">
        <Counter to={big} />
      </p>
      <p className="text-[11.5px] font-semibold text-ink-soft mt-2">{sub}</p>
    </div>
  );
}

function OutcomeItem({
  icon,
  n,
  label,
}: {
  icon: string;
  n: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-9 h-9 rounded-sm bg-marigold-500/15 text-marigold-400 flex items-center justify-center border border-marigold-500/25">
        <Icon name={icon} className="w-[18px] h-[18px]" sw={2} />
      </span>
      <div>
        <p className="font-display font-extrabold text-xl leading-none text-marigold-300">
          <Counter to={n} />
        </p>
        <p className="text-[10.5px] font-bold uppercase tracking-widest text-moss-400">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ============================================================================
   REGISTRY — problem registry + detail drawer + AI insights
   ==========================================================================*/
interface RegFilter {
  domain?: string;
  district?: string;
  stage?: string;
  uni?: string;
  q?: string;
  open?: string;
}

function Registry({
  t,
  challenges,
  patch,
  toast,
  notif,
  session,
  activeUniversityIds = [],
  initial = {},
}: {
  t: (k: string) => string;
  challenges: Challenge[];
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  toast: (m: string) => void;
  notif: (icon: string, text: string) => void;
  session?: Session | null;
  activeUniversityIds?: string[];
  initial?: RegFilter;
}) {
  const [q, setQ] = useState(initial.q ?? "");
  const [domain, setDomain] = useState(initial.domain ?? "");
  const [district, setDistrict] = useState(initial.district ?? "");
  const [stage, setStage] = useState(initial.stage ?? "");
  const [uni, setUni] = useState(initial.uni ?? "");
  const [sort, setSort] = useState<"priority" | "votes" | "order">("priority");
  const [openId, setOpenId] = useState<string | null>(initial.open ?? null);
  const [tab, setTab] = useState("overview");
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    let list = challenges.filter(
      (c) =>
        (!domain || c.domain === domain) &&
        (!district || c.district === district) &&
        (!stage || c.stage === stage) &&
        (!uni || c.uni === uni || c.universities?.includes(uni)) &&
        (!q ||
          (c.title + " " + c.desc + " " + c.district + " " + c.block)
            .toLowerCase()
            .includes(q.toLowerCase())),
    );
    if (sort === "priority")
      list = [...list].sort((a, b) => b.priority - a.priority);
    if (sort === "votes") list = [...list].sort((a, b) => b.votes - a.votes);
    return list;
  }, [challenges, q, domain, district, stage, uni, sort]);

  const sel = challenges.find((c) => c.id === openId) ?? null;

  const upvote = (c: Challenge) => {
    if (voted.has(c.id)) {
      toast("Already counted your support");
      return;
    }
    setVoted((v) => new Set(v).add(c.id));
    patch(c.id, (x) => ({ ...x, votes: x.votes + 1 }));
    toast("Support recorded — citizen voice strengthens priority");
  };

  const validate = (c: Challenge) => {
    patch(c.id, (x) => ({
      ...x,
      stage: "field_verification",
      updates: [
        ...x.updates,
        {
          stage: "field_verification",
          time: "Today",
          note: "Government reviewed the problem and sent it to Field Verification before any university solution work.",
        },
      ],
    }));
    notif("shield", `${c.title} approved for Field Verification`);
    toast("Government review complete — sent to Field Verification");
  };

  const assign = (c: Challenge, uniId: string) => {
    const u = uniById(uniId);
    patch(c.id, (x) => ({
      ...x,
      stage: "routed",
      uni: uniId,
      universities: [uniId],
      updates: [
        ...x.updates,
        {
          stage: "routed",
          time: "Today",
          note: `${x.uni ? `University changed from ${uniById(x.uni)?.name || x.uni} to ` : "Routed to "}${u?.name} by AI matching + admin approval.`,
        },
      ],
    }));
    notif("edu", `${c.uni ? "University changed to" : "Routed to"} ${u?.short}: ${c.title}`);
    toast(`${c.uni ? "Changed university to" : "Routed to"} ${u?.short} — team formation begins`);
  };

  const postComment = (c: Challenge) => {
    if (!comment.trim()) return;
    patch(c.id, (x) => ({
      ...x,
      comments: [
        ...x.comments,
        {
          who: "You",
          role: "Portal user",
          text: comment.trim(),
          time: "Just now",
        },
      ],
    }));
    setComment("");
    toast("Comment posted to project discussion");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <SectionHead
        kicker="Citizen → AI → Institution"
        title={t("nav_registry")}
        right={
          <div className="flex items-center gap-2 text-[12px] font-bold text-ink-soft">
            <span className="tabular text-pine-800 text-lg font-extrabold">
              {filtered.length}
            </span>{" "}
            / {challenges.length} {t("results")}
          </div>
        }
      />

      {/* Toolbar */}
      <div className="bg-card border border-ink/10 rounded-md p-4 shadow-[5px_5px_0_rgba(11,44,33,0.07)] mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <label className="flex-1 flex items-center gap-2 bg-paper border border-ink/15 rounded-sm px-3 focus-within:border-marigold-500 transition-colors">
            <Icon
              name="search"
              className="w-[18px] h-[18px] text-ink-soft"
              sw={2}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search_ph")}
              className="w-full bg-transparent py-2.5 text-sm font-medium placeholder:text-ink-soft/70 outline-none"
            />
          </label>
          <div className="flex gap-2">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="bg-paper border border-ink/15 rounded-sm px-3 py-2.5 text-sm font-bold text-ink cursor-pointer"
            >
              <option value="">
                {t("domain")}: {t("all")}
              </option>
              {DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.en}
                </option>
              ))}
            </select>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-paper border border-ink/15 rounded-sm px-3 py-2.5 text-sm font-bold text-ink cursor-pointer"
            >
              <option value="">
                {t("district")}: {t("all")}
              </option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as never)}
              className="bg-pine-900 text-paper border border-pine-925 rounded-sm px-3 py-2.5 text-sm font-bold cursor-pointer"
            >
              <option value="priority">{t("priority")}</option>
              <option value="votes">Most supported</option>
              <option value="order">Newest</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            "",
            "submitted",
            "ai_review",
            "validated",
            "routed",
            "team",
            "prototype",
            "pilot",
            "deployed",
          ].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStage(s)}
              className={cx(
                "px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wide border transition-all",
                stage === s
                  ? "bg-pine-900 text-paper border-pine-900 shadow-[2px_2px_0_rgba(239,170,43,0.8)]"
                  : "bg-card text-ink-soft border-ink/15 hover:border-pine-700 hover:text-pine-800",
              )}
            >
              {s === "" ? t("all") : stageById(s).en}
            </button>
          ))}
          {(domain || district || uni || q) && (
            <button
              onClick={() => {
                setDomain("");
                setDistrict("");
                setStage("");
                setUni("");
                setQ("");
              }}
              className="px-2.5 py-1 rounded-sm text-[11px] font-bold text-brick-600 border border-brick-500/40 hover:bg-brick-500/10 transition-colors inline-flex items-center gap-1"
            >
              <Icon name="close" className="w-3 h-3" sw={2.5} /> Clear{" "}
              {uni && `· ${uniById(uni)?.short}`}
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-card border border-dashed border-ink/25 rounded-md p-14 text-center">
            <Icon name="search" className="w-8 h-8 mx-auto text-ink-soft" />
            <p className="font-display font-bold text-lg mt-3 text-ink">
              No problems match these filters
            </p>
            <p className="text-sm text-ink-soft mt-1">
              Try clearing a filter — or be the first to report this issue in
              your area.
            </p>
          </div>
        )}
        {filtered.map((c, i) => (
          <Reveal key={c.id} delay={Math.min(i * 45, 300)}>
            <button
              onClick={() => {
                setOpenId(c.id);
                setTab("overview");
              }}
              className="w-full text-left bg-card border border-ink/10 rounded-md p-4 md:p-5 shadow-[4px_4px_0_rgba(11,44,33,0.06)] hover:shadow-[7px_7px_0_rgba(11,44,33,0.12)] hover:-translate-y-0.5 hover:border-pine-700/40 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="hidden sm:block">
                  <PriorityRing score={c.priority} />
                </div>
                <div
                  className="w-1 self-stretch rounded-full shrink-0 hidden md:block"
                  style={{ background: domainById(c.domain).color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10.5px] font-extrabold tabular text-ink-soft">
                      {c.id}
                    </span>
                    <DomainTag id={c.domain} />
                    {(c.reports ?? 1) > 1 && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-pine-800 bg-pine-100/70 border border-pine-700/25 px-1.5 py-[2px] rounded-sm">
                        <Icon name="bucket" className="w-3 h-3" sw={2.2} />{" "}
                        {c.reports} {t("merged_reports")}
                      </span>
                    )}
                    {c.dupOf && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-brick-600 bg-brick-500/10 border border-brick-500/30 px-1.5 py-[2px] rounded-sm">
                        <Icon name="layers" className="w-3 h-3" sw={2.2} />{" "}
                        possible duplicate
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-[16px] md:text-[17px] leading-snug text-ink group-hover:text-pine-700 transition-colors">
                    {c.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[12px] font-semibold text-ink-soft">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="pin" className="w-3.5 h-3.5" sw={2.2} />
                      {c.district} · {c.block}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="clock" className="w-3.5 h-3.5" sw={2.2} />
                      {c.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="users" className="w-3.5 h-3.5" sw={2.2} />
                      {c.byType}
                    </span>
                    {c.uni && (
                      <span className="inline-flex items-center gap-1 text-pine-800 font-bold">
                        <Icon name="edu" className="w-3.5 h-3.5" sw={2.2} />
                        {uniById(c.uni)?.short}
                      </span>
                    )}
                    {c.partner && (
                      <span className="inline-flex items-center gap-1 text-steel-500 font-bold">
                        <Icon name="factory" className="w-3.5 h-3.5" sw={2.2} />
                        {partnerById(c.partner)?.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StagePill stage={c.stage} />
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      upvote(c);
                    }}
                    className={cx(
                      "inline-flex items-center gap-1 text-[12px] font-extrabold tabular px-2 py-1 rounded-sm border transition-all",
                      voted.has(c.id)
                        ? "bg-marigold-500 border-marigold-600 text-pine-925"
                        : "border-ink/15 text-ink-soft hover:border-marigold-500 hover:text-marigold-700",
                    )}
                  >
                    <Icon name="up" className="w-3.5 h-3.5" sw={2.4} />
                    {c.votes}
                  </span>
                  <span className="text-[11px] font-bold text-pine-700 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                    {t("view_details")}{" "}
                    <Icon name="chevR" className="w-3 h-3" sw={2.5} />
                  </span>
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {/* Drawer */}
      {sel && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-pine-925/55 fade-in"
            onClick={() => setOpenId(null)}
          />
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-paper border-l-4 drawer-in overflow-y-auto"
            style={{ borderColor: domainById(sel.domain).color }}
          >
            <div className="sticky top-0 z-10 bg-pine-925 text-paper px-6 py-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10.5px] font-extrabold tabular text-marigold-300">
                    {sel.id}
                  </span>
                  <StagePill stage={sel.stage} />
                  {sel.stage === "ai_review" && (
                    <span className="text-[10px] font-bold text-marigold-300 shimmer px-1.5 py-0.5 rounded-sm bg-marigold-500/10 border border-marigold-500/30">
                      AI ANALYSING
                    </span>
                  )}
                </div>
                <h2 className="font-display font-extrabold text-xl md:text-2xl leading-tight tracking-tight">
                  {sel.title}
                </h2>
              </div>
              <button
                onClick={() => setOpenId(null)}
                className="shrink-0 w-9 h-9 rounded-sm bg-paper/10 hover:bg-brick-500 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <Icon name="close" className="w-[18px] h-[18px]" sw={2.2} />
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-semibold text-ink-soft pb-4 border-b border-dashed border-ink/20">
                <span className="inline-flex items-center gap-1.5">
                  <Icon
                    name="pin"
                    className="w-4 h-4 text-brick-600"
                    sw={2.2}
                  />
                  {sel.district}, {sel.block}
                </span>
                <span className="inline-flex items-center gap-1.5 tabular">
                  <Icon
                    name="target"
                    className="w-4 h-4 text-steel-500"
                    sw={2}
                  />
                  {sel.lat.toFixed(3)}°N, {sel.lng.toFixed(3)}°E
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="users" className="w-4 h-4 text-pine-700" sw={2} />
                  {sel.by} · {sel.byType}
                </span>
                {sel.reporter?.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon
                      name="phone"
                      className="w-4 h-4 text-pine-700"
                      sw={2}
                    />
                    {sel.reporter.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="clock" className="w-4 h-4 text-ink-soft" sw={2} />
                  {sel.date}
                </span>
                {sel.department && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon
                      name="target"
                      className="w-4 h-4 text-pine-700"
                      sw={2}
                    />
                    <b>Department:</b> {sel.department}
                  </span>
                )}
                <button
                  onClick={() => upvote(sel)}
                  className={cx(
                    "ml-auto inline-flex items-center gap-1.5 font-extrabold tabular px-3 py-1.5 rounded-sm border transition-all",
                    voted.has(sel.id)
                      ? "bg-marigold-500 border-marigold-600 text-pine-925"
                      : "border-ink/20 hover:border-marigold-500 hover:text-marigold-700",
                  )}
                >
                  <Icon name="up" className="w-4 h-4" sw={2.4} /> {sel.votes}{" "}
                  {t("votes")}
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 overflow-x-auto">
                {[
                  ["overview", t("overview"), "eye"],
                  ["ai", t("ai_insights"), "spark"],
                  ["team", t("team_partners"), "users"],
                  ["track", "Lifecycle & " + t("milestones"), "target"],
                  ["discuss", t("discussion"), "send"],
                ].map(([id, label, ic]) => (
                  <button
                    key={id}
                    onClick={() => setTab(id as string)}
                    className={cx(
                      "inline-flex items-center gap-1.5 px-3 py-2 rounded-sm text-[12px] font-bold whitespace-nowrap transition-all border",
                      tab === id
                        ? "bg-pine-900 text-paper border-pine-900"
                        : "border-transparent text-ink-soft hover:text-pine-800 hover:bg-pine-100",
                    )}
                  >
                    <Icon
                      name={ic as string}
                      className="w-3.5 h-3.5"
                      sw={2.2}
                    />
                    {label}
                  </button>
                ))}
              </div>

              <div className="py-5 fade-in" key={tab}>
                {tab === "overview" && (
                  <div className="space-y-5">
                    <p className="text-[14px] leading-relaxed text-ink font-medium">
                      {sel.desc}
                    </p>
                    {sel.qr_image && (
                      <div className="bg-card border border-ink/12 rounded-md p-4 flex flex-col sm:flex-row items-center gap-4">
                        <img
                          src={sel.qr_image}
                          alt="Problem QR code"
                          className="w-32 h-32 bg-white p-2 border border-ink/10"
                        />
                        <div>
                          <p className="font-display font-extrabold text-[15px] text-ink">
                            Scan this problem
                          </p>
                          <p className="text-[12px] text-ink-soft mt-1">
                            Anyone can scan the QR code to open the public
                            problem page. Reporter contact details stay private.
                          </p>
                          <p className="font-mono text-[10px] text-ink-soft mt-2">
                            {sel.id}
                          </p>
                        </div>
                      </div>
                    )}
                    {sel.reporter && (
                      <div className="bg-pine-100 border border-pine-700/20 rounded-md p-4">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-pine-800 mb-2">
                          Citizen / reporter details
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-[12.5px] font-semibold text-ink">
                          <span>
                            <b>Name:</b> {sel.reporter.name}
                          </span>
                          <span>
                            <b>Phone:</b> {sel.reporter.phone || "Not provided"}
                          </span>
                          <span>
                            <b>Type:</b> {sel.reporter.type}
                          </span>
                          <span>
                            <b>User ID:</b> {sel.reporter.user_id}
                          </span>
                        </div>
                      </div>
                    )}
                    {sel.evidence.length > 0 && (
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-soft mb-2 flex items-center gap-1.5">
                          <Icon name="camera" className="w-4 h-4" sw={2} />
                          {t("evidence")} · {sel.evidence.length}
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                          {sel.evidence.map((src, i) => (
                            <figure
                              key={i}
                              className="group relative overflow-hidden rounded-sm border border-ink/15"
                            >
                              <img
                                src={src}
                                alt={`Evidence ${i + 1}`}
                                loading="lazy"
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <figcaption className="absolute bottom-0 inset-x-0 bg-pine-925/80 text-paper text-[10.5px] font-bold px-2 py-1">
                                FIELD PHOTO {i + 1} · GEO-TAGGED
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      </div>
                    )}
                    {sel.docs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {sel.docs.map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-steel-500 bg-steel-500/8 border border-steel-500/25 px-2.5 py-1.5 rounded-sm"
                          >
                            <Icon name="doc" className="w-4 h-4" sw={2} />
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                    {sel.stage === "ai_review" && (
                      <button
                        onClick={() => validate(sel)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-pine-800 hover:bg-pine-700 text-paper font-bold text-sm py-3 rounded-sm shadow-[4px_4px_0_rgba(239,170,43,0.85)] hover:shadow-[6px_6px_0_rgba(239,170,43,0.85)] hover:-translate-y-0.5 transition-all"
                      >
                        <Icon
                          name="shield"
                          className="w-[18px] h-[18px]"
                          sw={2}
                        />{" "}
                        Validate & approve for routing
                      </button>
                    )}
                  </div>
                )}

                {tab === "ai" && (
                  <AITab
                    c={sel}
                    activeUniversityIds={activeUniversityIds}
                    onAssign={(u) => assign(sel, u)}
                  />
                )}

                {tab === "team" && (
                  <div className="space-y-4">
                    {sel.uni ? (
                      <div className="bg-card border border-ink/10 rounded-md p-4 flex items-start gap-4">
                        <span className="w-12 h-12 rounded-sm bg-pine-900 text-marigold-400 font-display font-extrabold text-sm flex items-center justify-center shrink-0">
                          {uniById(sel.uni)
                            ?.short.split(" ")
                            .map((w) => w[0])
                            .slice(0, 3)
                            .join("")}
                        </span>
                        <div className="flex-1">
                          <p className="font-display font-bold text-[15px] text-ink">
                            {uniById(sel.uni)?.name}
                          </p>
                          <p className="text-[12px] font-semibold text-ink-soft">
                            {uniById(sel.uni)?.city} · {uniById(sel.uni)?.kind}
                          </p>
                          {sel.mentor && (
                            <p className="text-[12.5px] font-bold text-pine-700 mt-1.5 flex items-center gap-1.5">
                              <Icon
                                name="star"
                                className="w-3.5 h-3.5"
                                sw={2}
                              />
                              Faculty mentor: {sel.mentor}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-card border border-dashed border-ink/25 rounded-md p-6 text-center">
                        <Icon
                          name="edu"
                          className="w-7 h-7 mx-auto text-ink-soft"
                        />
                        <p className="text-sm font-bold text-ink mt-2">
                          Not yet routed to a university
                        </p>
                        <p className="text-[12.5px] text-ink-soft mt-1">
                          Check the AI Insights tab for recommended
                          institutions.
                        </p>
                      </div>
                    )}
                    {sel.team && sel.team.length > 0 && (
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-soft mb-2">
                          Multidisciplinary team
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sel.team.map((m) => (
                            <span
                              key={m}
                              className="inline-flex items-center gap-2 text-[12px] font-bold text-ink bg-card border border-ink/15 px-2.5 py-1.5 rounded-sm"
                            >
                              <span className="w-6 h-6 rounded-full bg-marigold-500/25 text-marigold-700 flex items-center justify-center text-[10px] font-extrabold">
                                {m
                                  .split(" ")
                                  .slice(-1)[0]
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </span>
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(sel.partner || sel.fund || sel.budget || sel.ip) && (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {sel.partner && (
                          <MetaBox
                            icon="factory"
                            label="Industry partner"
                            value={
                              partnerById(sel.partner)?.name ?? sel.partner
                            }
                          />
                        )}
                        {sel.fund && (
                          <MetaBox
                            icon="rupee"
                            label="Funding"
                            value={sel.fund}
                          />
                        )}
                        {sel.budget && (
                          <MetaBox
                            icon="chart"
                            label="Project budget"
                            value={sel.budget}
                          />
                        )}
                        {sel.ip && (
                          <MetaBox
                            icon="patent"
                            label="Intellectual property"
                            value={sel.ip}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {tab === "track" && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-soft mb-3">
                        Lifecycle timeline
                      </p>
                      <div className="relative pl-5 space-y-4 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-[2px] before:bg-ink/15">
                        {sel.updates.map((u, i) => (
                          <div
                            key={i}
                            className="relative rise-in"
                            style={{ animationDelay: `${i * 70}ms` }}
                          >
                            <span
                              className="absolute -left-5 top-1 w-4 h-4 rounded-full border-[3px] border-paper"
                              style={{ background: stageById(u.stage).color }}
                            />
                            <p
                              className="text-[12px] font-extrabold uppercase tracking-wide"
                              style={{ color: stageById(u.stage).color }}
                            >
                              {stageById(u.stage).en}
                            </p>
                            <p className="text-[13px] font-medium text-ink mt-0.5">
                              {u.note}
                            </p>
                            <p className="text-[11px] font-bold text-ink-soft tabular mt-0.5">
                              {u.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {sel.milestones.length > 0 && (
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-soft mb-3">
                          {t("milestones")} ·{" "}
                          {sel.milestones.filter((m) => m.done).length}/
                          {sel.milestones.length} complete
                        </p>
                        <div className="space-y-2">
                          {sel.milestones.map((m) => (
                            <div
                              key={m.id}
                              className={cx(
                                "flex items-center gap-3 border rounded-sm px-3 py-2.5",
                                m.done
                                  ? "border-pine-700/30 bg-pine-100/50"
                                  : "border-ink/15 bg-card",
                              )}
                            >
                              <span
                                className={cx(
                                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                                  m.done
                                    ? "bg-pine-800 text-paper"
                                    : "border-2 border-ink/25",
                                )}
                              >
                                {m.done && (
                                  <Icon
                                    name="check"
                                    className="w-3 h-3"
                                    sw={3}
                                  />
                                )}
                              </span>
                              <span
                                className={cx(
                                  "flex-1 text-[13px] font-bold",
                                  m.done
                                    ? "text-pine-800 line-through decoration-pine-700/40"
                                    : "text-ink",
                                )}
                              >
                                {m.label}
                              </span>
                              <span className="text-[11px] font-bold text-ink-soft tabular shrink-0">
                                <Icon
                                  name="cal"
                                  className="w-3.5 h-3.5 inline mr-1"
                                  sw={2}
                                />
                                {m.due}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tab === "discuss" && (
                  <div className="space-y-4">
                    {sel.comments.length === 0 && (
                      <div className="bg-card border border-dashed border-ink/25 rounded-md p-6 text-center text-sm font-semibold text-ink-soft">
                        No discussion yet — start the thread.
                      </div>
                    )}
                    {sel.comments.map((cm, i) => (
                      <div
                        key={i}
                        className="bg-card border border-ink/10 rounded-md p-4 rise-in"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[13px] font-extrabold text-ink">
                            {cm.who}{" "}
                            <span className="font-bold text-[11px] text-ink-soft">
                              · {cm.role}
                            </span>
                          </p>
                          <span className="text-[11px] font-bold text-ink-soft tabular">
                            {cm.time}
                          </span>
                        </div>
                        <p className="text-[13.5px] font-medium leading-relaxed text-ink">
                          {cm.text}
                        </p>
                      </div>
                    ))}
                    <div className="bg-card border border-pine-700/30 rounded-md p-3">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                        placeholder="Write to the project team, citizen or partner…"
                        className="w-full bg-transparent text-sm font-medium outline-none resize-none placeholder:text-ink-soft/60"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => postComment(sel)}
                          className="inline-flex items-center gap-1.5 bg-pine-800 hover:bg-pine-700 text-paper text-[12.5px] font-bold px-3.5 py-2 rounded-sm transition-colors"
                        >
                          <Icon name="send" className="w-3.5 h-3.5" sw={2.2} />{" "}
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function MetaBox({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string;
}) {
  return (
    <div className="bg-card border border-ink/10 rounded-md p-3.5">
      <p className="text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-ink-soft flex items-center gap-1.5">
        <Icon name={icon} className="w-3.5 h-3.5" sw={2} />
        {label}
      </p>
      <p className="text-[13.5px] font-bold text-ink mt-1">{value}</p>
    </div>
  );
}

function AITab({
  c,
  onAssign,
  activeUniversityIds,
}: {
  c: Challenge;
  onAssign: (uniId: string) => void;
  activeUniversityIds: string[];
}) {
  const cls = classify(c.title + " " + c.desc);
  const urg = urgency(c.title + " " + c.desc);
  const matches = matchUnis(
    c.domain,
    c.title + " " + c.desc,
    activeUniversityIds,
  );
  const dup = c.dupOf ? { c, sim: 68 } : null;
  const canRoute = stageIdx(c.stage) <= 2;
  const assignedUniversityIds = c.universities ?? (c.uni ? [c.uni] : []);
  return (
    <div className="space-y-5">
      <div className="bg-pine-925 text-paper rounded-md p-4">
        <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-marigold-300 flex items-center gap-1.5">
          <Icon name="spark" className="w-4 h-4" sw={2} />
          Auto-classification · explainable AI
        </p>
        <div className="space-y-3 mt-3">
          {cls.ranked.map((r) => {
            const d = domainById(r.id);
            return (
              <div key={r.id}>
                <div className="flex justify-between text-[12px] font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Icon name={d.icon} className="w-3.5 h-3.5" sw={2} />
                    {d.en}
                  </span>
                  <span className="tabular text-marigold-300">{r.conf}%</span>
                </div>
                <div className="h-2 rounded-full bg-paper/10 overflow-hidden">
                  <div
                    className="h-full rounded-full donut-seg"
                    style={{ width: `${r.conf}%`, background: d.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-card border border-ink/10 rounded-md p-4">
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-ink-soft">
            Urgency model
          </p>
          <p
            className={cx(
              "font-display font-extrabold text-3xl mt-1",
              urg >= 70
                ? "text-brick-600"
                : urg >= 50
                  ? "text-marigold-700"
                  : "text-pine-700",
            )}
          >
            {urg}
            <span className="text-sm text-ink-soft font-bold">/100</span>
          </p>
          <p className="text-[12px] font-semibold text-ink-soft mt-1">
            {urg >= 70
              ? "Critical — flagged for fast-track validation"
              : urg >= 50
                ? "Elevated — scheduled review this week"
                : "Standard queue"}
          </p>
        </div>
        <div className="bg-card border border-ink/10 rounded-md p-4">
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-ink-soft">
            Keyword signals
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {cls.ranked[0].hits.slice(0, 7).map((h) => (
              <span
                key={h}
                className="text-[11px] font-bold bg-marigold-500/15 text-marigold-700 border border-marigold-500/30 px-2 py-0.5 rounded-sm"
              >
                {h}
              </span>
            ))}
            {cls.ranked[0].hits.length === 0 && (
              <span className="text-[12px] text-ink-soft font-semibold">
                No strong signals
              </span>
            )}
          </div>
        </div>
      </div>
      {dup && (
        <div className="bg-brick-500/8 border border-brick-500/35 rounded-md p-4 flex items-start gap-3">
          <Icon
            name="layers"
            className="w-5 h-5 text-brick-600 shrink-0 mt-0.5"
            sw={2}
          />
          <div>
            <p className="text-[13px] font-extrabold text-brick-600">
              Duplicate detector · {dup.sim}% similarity
            </p>
            <p className="text-[12.5px] font-medium text-ink mt-0.5">
              Semantic overlap found with <b>{dup.c.id}</b>. Linked to the same
              case file to avoid parallel work.
            </p>
          </div>
        </div>
      )}
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-soft mb-2.5">
          Recommended university routing
        </p>
        <div className="space-y-2.5">
          {matches.map(({ uni, match }, i) => (
            <div
              key={uni.id}
              className="bg-card border border-ink/10 rounded-md p-3.5 flex items-center gap-3.5 hover:border-pine-700/40 transition-colors"
            >
              <span className="w-10 h-10 rounded-sm bg-pine-900 text-marigold-400 font-display font-extrabold text-[11px] flex items-center justify-center shrink-0">
                {uni.short
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 3)
                  .join("")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-extrabold text-ink truncate">
                  {i === 0 && (
                    <span className="text-[9.5px] bg-marigold-500 text-pine-925 px-1 py-[1px] rounded-sm mr-1.5 align-middle">
                      TOP MATCH
                    </span>
                  )}
                  {uni.name}
                </p>
                <div className="h-1.5 rounded-full bg-ink/8 mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-pine-700 rounded-full donut-seg"
                    style={{ width: `${match}%` }}
                  />
                </div>
              </div>
              <span className="tabular font-extrabold text-pine-800 text-sm shrink-0">
                {match}%
              </span>
              {canRoute && (
                <button
                  onClick={() => onAssign(uni.id)}
                  className="shrink-0 text-[11px] font-extrabold bg-pine-800 hover:bg-marigold-500 hover:text-pine-925 text-paper px-2.5 py-1.5 rounded-sm transition-colors"
                >
                  {assignedUniversityIds.includes(uni.id)
                    ? "Assigned"
                    : c.uni
                      ? "Change →"
                      : "Route →"}
                </button>
              )}
            </div>
          ))}
          {!matches.length && (
            <p className="text-[12px] font-semibold text-ink-soft bg-card border border-dashed border-ink/20 rounded-sm p-3">
              {activeUniversityIds.length
                ? "No registered University matches this problem."
                : "No registered University is available."}
            </p>
          )}
        </div>
        {c.uni && (
          <p className="text-[12px] font-bold text-pine-700 mt-2 flex items-center gap-1.5">
            <Icon name="check" className="w-4 h-4" sw={2.5} />
            Assigned to {assignedUniversityIds
              .map((id) => uniById(id)?.name)
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   UNIVERSITIES VIEW
   ==========================================================================*/
const uniChipCls = (on: boolean) =>
  cx(
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[11.5px] font-bold border transition-all",
    on
      ? "text-paper border-transparent shadow-[2px_2px_0_rgba(11,44,33,0.35)]"
      : "bg-card text-ink-soft border-ink/15 hover:border-pine-700 hover:text-pine-800",
  );

function Universities({
  t,
  lang,
  goto,
  challenges,
  activeUniversityIds,
  activeUniversities,
}: {
  t: (k: string) => string;
  lang: Lang;
  goto: (v: string, f?: Record<string, string>) => void;
  challenges: Challenge[];
  activeUniversityIds: string[];
  activeUniversities: { id: string; name: string; org: string }[];
}) {
  const [dom, setDom] = useState("");
  const [selectedUniversityIds, setSelectedUniversityIds] = useState<string[]>(
    () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("ss_selected_universities") || "[]",
        );
        return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
      } catch {
        return [];
      }
    },
  );
  const list = UNIVERSITIES.filter((u) => !dom || u.domains.includes(dom));
  const registeredUniversities = activeUniversities.map((account) => {
    const catalogUniversity = UNIVERSITIES.find((university) =>
      [university.id, university.name, university.short].some(
        (label) =>
          label.toLowerCase() === account.name.trim().toLowerCase() ||
          label.toLowerCase() === account.org.trim().toLowerCase(),
      ),
    );
    return (
      catalogUniversity ?? {
        id: account.id,
        name: account.name || account.org,
        short: account.name || account.org,
        city: "",
        est: 0,
        kind: "Registered University",
        domains: [],
        labs: [],
      }
    );
  });
  const toggleUniversity = (id: string) => {
    setSelectedUniversityIds((current) => {
      const next = current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id];
      localStorage.setItem("ss_selected_universities", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
      <div className="bg-card border border-dashed border-ink/20 rounded-md p-8 text-center">
        <h1 className="font-display font-extrabold text-2xl text-ink mt-4">
          University workspace
        </h1>
        <p className="text-sm font-semibold text-ink-soft mt-2">
          Select one or more universities for the next problem routing.
        </p>
        {selectedUniversityIds.length > 0 && (
          <div className="mt-4 rounded-sm border border-marigold-500/30 bg-marigold-500/10 px-3 py-2 text-left text-xs font-extrabold text-marigold-700">
            {selectedUniversityIds.length} {selectedUniversityIds.length === 1 ? "university" : "universities"} selected for problem routing
          </div>
        )}
        {registeredUniversities.length ? (
          <div className="grid sm:grid-cols-2 gap-3 mt-6 text-left">
            {registeredUniversities.map((university) => (
              <div
                key={university.id}
                className="bg-paper border border-pine-700/25 rounded-sm p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display font-extrabold text-base text-ink">
                    {university.name}
                  </h2>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest bg-pine-100 text-pine-800 px-2 py-1 rounded-sm">
                    Registered
                  </span>
                </div>
                <p className="text-xs font-semibold text-ink-soft mt-1">
                  {university.city} · {university.kind}
                </p>
                <button
                  type="button"
                  onClick={() => toggleUniversity(university.id)}
                  className={cx(
                    "mt-3 text-xs font-extrabold px-3 py-2 rounded-sm border",
                    selectedUniversityIds.includes(university.id)
                      ? "bg-pine-800 text-paper border-pine-800"
                      : "text-pine-800 border-pine-700/30",
                  )}
                >
                  {selectedUniversityIds.includes(university.id)
                    ? "Selected for problem"
                    : "Select university"}
                </button>
                <button
                  type="button"
                  onClick={() => goto("registry", { uni: university.id })}
                  className="mt-2 ml-2 text-xs font-extrabold text-ink-soft underline underline-offset-2"
                >
                  View problems
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-ink-soft mt-6">
            No registered University is available yet.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <SectionHead
        kicker="University collaboration module"
        title="Higher Education Institutions of Jharkhand"
        right={
          <button
            onClick={() => goto("registry")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-pine-700 hover:text-brick-600 transition-colors"
          >
            Open problem registry{" "}
            <Icon name="arrowR" className="w-4 h-4" sw={2.2} />
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        {[
          ["edu", 10, "empanelled HEIs"],
          ["users", 117600, "students in the ecosystem"],
          ["star", 3390, "faculty & mentors"],
          ["target", 75, "active solution projects"],
        ].map(([ic, n, l], i) => (
          <Reveal key={l as string} delay={i * 60}>
            <div className="bg-card border border-ink/10 rounded-md p-4 shadow-[4px_4px_0_rgba(11,44,33,0.06)] flex items-center gap-3">
              <span className="w-10 h-10 rounded-sm bg-pine-900 text-marigold-400 flex items-center justify-center shrink-0">
                <Icon name={ic as string} className="w-5 h-5" sw={2} />
              </span>
              <div>
                <p className="font-display font-extrabold text-2xl leading-none text-ink">
                  <Counter to={n as number} />
                </p>
                <p className="text-[11px] font-bold text-ink-soft uppercase tracking-wider mt-1">
                  {l}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        <button onClick={() => setDom("")} className={uniChipCls(!dom)}>
          {t("all")}
        </button>
        {DOMAINS.map((d) => (
          <button
            key={d.id}
            onClick={() => setDom(dom === d.id ? "" : d.id)}
            className={uniChipCls(dom === d.id)}
            style={
              dom === d.id ? { background: d.color, borderColor: d.color } : {}
            }
          >
            <Icon name={d.icon} className="w-3.5 h-3.5" sw={2.2} />
            {lang === "hi" ? d.hi : d.en}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {list.map((u, i) => (
          <Reveal
            key={u.id}
            delay={Math.min(i * 60, 300)}
            className={u.featured ? "md:col-span-2" : ""}
          >
            <div
              className={cx(
                "group bg-card border border-ink/10 rounded-md shadow-[5px_5px_0_rgba(11,44,33,0.07)] hover:shadow-[8px_8px_0_rgba(11,44,33,0.13)] hover:-translate-y-1 transition-all overflow-hidden",
                u.featured && "md:flex",
              )}
            >
              {u.featured && (
                <div className="md:w-1.5 self-stretch bg-marigold-500 shrink-0" />
              )}
              <div className="p-5 flex-1">
                <div className="flex items-start gap-4">
                  <span className="w-14 h-14 rounded-sm bg-pine-900 text-marigold-400 font-display font-extrabold text-[13px] flex items-center justify-center shrink-0 group-hover:bg-pine-800 transition-colors">
                    {u.short
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 3)
                      .join("")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-extrabold text-[17px] tracking-tight text-ink group-hover:text-pine-700 transition-colors">
                        {u.name}
                      </h3>
                      {u.featured && (
                        <span className="text-[9.5px] font-extrabold bg-marigold-500 text-pine-925 px-1.5 py-[2px] rounded-sm tracking-wider">
                          ANCHOR INSTITUTION
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] font-bold text-ink-soft mt-0.5">
                      {u.city} · est. {u.est} · {u.kind}
                    </p>
                  </div>
                </div>
                <p className="text-[13px] font-medium text-ink-soft leading-relaxed mt-3">
                  {u.blurb}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {u.domains.map((d) => {
                    const dd = domainById(d);
                    return (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-[3px] rounded-sm"
                        style={{
                          background: dd.color + "16",
                          color: dd.color,
                          border: `1px solid ${dd.color}38`,
                        }}
                      >
                        <Icon name={dd.icon} className="w-3 h-3" sw={2.4} />
                        {dd.en}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-3.5 space-y-1.5">
                  {u.labs.slice(0, u.featured ? 4 : 2).map((l) => (
                    <p
                      key={l}
                      className="text-[12px] font-semibold text-ink flex items-center gap-1.5"
                    >
                      <Icon
                        name="flask"
                        className="w-3.5 h-3.5 text-steel-500 shrink-0"
                        sw={2}
                      />
                      {l}
                    </p>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-dashed border-ink/15">
                  <MiniStat n={u.stats.students} l="students" />
                  <MiniStat n={u.stats.faculty} l="faculty" />
                  <MiniStat n={u.stats.active} l="projects" />
                  <div>
                    <p className="font-display font-extrabold text-lg leading-none text-pine-800 tabular">
                      {u.stats.success}%
                    </p>
                    <p className="text-[9.5px] font-bold uppercase tracking-widest text-ink-soft mt-1">
                      success
                    </p>
                    <div className="h-1 rounded-full bg-ink/10 mt-1 overflow-hidden">
                      <div
                        className="h-full bg-pine-700 rounded-full"
                        style={{ width: `${u.stats.success}%` }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => goto("registry", { uni: u.id })}
                  className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-extrabold text-pine-800 border-2 border-pine-800 hover:bg-pine-800 hover:text-paper px-3.5 py-2 rounded-sm transition-all"
                >
                  View assigned problems{" "}
                  <Icon name="arrowR" className="w-3.5 h-3.5" sw={2.4} />
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function UniversityProfileSetup({
  session,
  toast,
  onComplete,
  onBack,
}: {
  session: Session;
  toast: (message: string) => void;
  onComplete: (profile: Partial<Session>) => void;
  onBack: () => void;
}) {
  const [universityName, setUniversityName] = useState(session.org || "");
  const [universityLocation, setUniversityLocation] = useState(session.university_location || "");
  const [capabilities, setCapabilities] = useState(session.university_capabilities || "");
  const [labsCentres, setLabsCentres] = useState(session.labs_centres || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!universityName.trim() || !universityLocation.trim() || !capabilities.trim() || !labsCentres.trim() || !phone.trim() || !district.trim()) {
      toast("Please complete university, location, capabilities, labs, mobile and district");
      return;
    }
    setBusy(true);
    try {
      await api.updateProfile(session.token || "", {
        university_name: universityName.trim(),
        university_location: universityLocation.trim(),
        university_capabilities: capabilities.trim(),
        labs_centres: labsCentres.trim(),
        phone: phone.trim(),
        address: address.trim(),
        district: district.trim(),
        block: "",
      });
      onComplete({
        org: universityName.trim(),
        orgId:
          universityIdFromAccount(universityName.trim()) ??
          session.orgId ??
          session.id,
        university_location: universityLocation.trim(),
        university_capabilities: capabilities.trim(),
        labs_centres: labsCentres.trim(),
      });
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save University profile");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-pine-925/70 px-4">
      <div className="w-full max-w-xl bg-paper border border-ink/15 rounded-md p-6 shadow-[8px_8px_0_rgba(11,44,33,0.2)]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-extrabold text-pine-800 hover:text-brick-600"
        >
          <Icon name="arrowR" className="w-4 h-4 rotate-180" sw={2.4} />
          Back
        </button>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brick-600">Complete University profile</p>
        <h2 className="font-display font-extrabold text-2xl text-ink mt-1">Tell us who is signing in</h2>
        <p className="text-sm font-semibold text-ink-soft mt-2">{session.name} · Complete these details once before opening your desk.</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          <label className="sm:col-span-2 text-[11px] font-extrabold text-ink-soft">
            University name
            <input value={universityName} onChange={(event) => setUniversityName(event.target.value)} placeholder="e.g. Ranchi University" className="mt-1 w-full rounded-sm border border-ink/15 bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-pine-700" />
          </label>
          <label className="sm:col-span-2 text-[11px] font-extrabold text-ink-soft">
            Where is your university?
            <input value={universityLocation} onChange={(event) => setUniversityLocation(event.target.value)} placeholder="e.g. Ranchi, Jharkhand" className="mt-1 w-full rounded-sm border border-ink/15 bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-pine-700" />
          </label>
          <label className="sm:col-span-2 text-[11px] font-extrabold text-ink-soft">
            University capabilities
            <textarea value={capabilities} onChange={(event) => setCapabilities(event.target.value)} placeholder="e.g. Education, Public Administration, Rural Livelihoods" rows={2} className="mt-1 w-full resize-y rounded-sm border border-ink/15 bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-pine-700" />
          </label>
          <label className="sm:col-span-2 text-[11px] font-extrabold text-ink-soft">
            Labs and centres
            <textarea value={labsCentres} onChange={(event) => setLabsCentres(event.target.value)} placeholder="e.g. Environmental Sciences Dept, Commerce & Policy Lab" rows={2} className="mt-1 w-full resize-y rounded-sm border border-ink/15 bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-pine-700" />
          </label>
          {[
            ["Mobile", phone, setPhone, "+91 98765 43210"],
            ["District", district, setDistrict, "Ranchi / Dhanbad"],
          ].map(([label, value, setter, placeholder]) => (
            <label key={label as string} className="text-[11px] font-extrabold text-ink-soft">
              {label as string}
              <input
                value={value as string}
                onChange={(event) => (setter as (value: string) => void)(event.target.value)}
                placeholder={placeholder as string}
                className="mt-1 w-full rounded-sm border border-ink/15 bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-pine-700"
              />
            </label>
          ))}
          <label className="sm:col-span-2 text-[11px] font-extrabold text-ink-soft">
            Address
            <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="University address" className="mt-1 w-full rounded-sm border border-ink/15 bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-pine-700" />
          </label>
        </div>
        <button disabled={busy} onClick={submit} className="mt-5 w-full bg-pine-800 text-paper px-4 py-3 rounded-sm text-sm font-extrabold disabled:opacity-50">
          {busy ? "Saving profile..." : "Save profile and open University Desk"}
        </button>
      </div>
    </div>
  );
}

function IndustryProfileSetup({
  session,
  toast,
  onBack,
  onComplete,
}: {
  session: Session;
  toast: (message: string) => void;
  onBack: () => void;
  onComplete: (profile: Partial<Session>) => void;
}) {
  const [companyName, setCompanyName] = useState(session.org || "");
  const [location, setLocation] = useState(session.company_location || "");
  const [capabilities, setCapabilities] = useState(session.company_capabilities || "");
  const [supportAreas, setSupportAreas] = useState(session.csr_support_areas || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!companyName.trim() || !location.trim() || !capabilities.trim() || !supportAreas.trim() || !phone.trim() || !district.trim()) {
      toast("Please complete company, location, capabilities, CSR support areas, mobile and district");
      return;
    }
    setBusy(true);
    try {
      await api.updateProfile(session.token || "", {
        company_name: companyName.trim(),
        company_location: location.trim(),
        company_capabilities: capabilities.trim(),
        csr_support_areas: supportAreas.trim(),
        phone: phone.trim(),
        address: address.trim(),
        district: district.trim(),
        block: "",
      });
      onComplete({
        org: companyName.trim(),
        company_location: location.trim(),
        company_capabilities: capabilities.trim(),
        csr_support_areas: supportAreas.trim(),
      });
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save company profile");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-pine-925/70 px-4">
      <div className="w-full max-w-xl bg-paper border border-ink/15 rounded-md p-6 shadow-[8px_8px_0_rgba(11,44,33,0.2)]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-extrabold text-pine-800 hover:text-brick-600"
        >
          <Icon name="arrowR" className="w-4 h-4 rotate-180" sw={2.4} />
          Back
        </button>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brick-600">Complete company profile</p>
        <h2 className="font-display font-extrabold text-2xl text-ink mt-1">Tell us about your company</h2>
        <p className="text-sm font-semibold text-ink-soft mt-2">{session.name} · Complete these details once before opening your Industry Desk.</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          {[
            ["Company name", companyName, setCompanyName, "e.g. Tata Steel CSR"],
            ["Company location", location, setLocation, "e.g. Jamshedpur, Jharkhand"],
            ["Mobile", phone, setPhone, "+91 98765 43210"],
            ["District", district, setDistrict, "East Singhbhum"],
          ].map(([label, value, setter, placeholder]) => (
            <label key={label as string} className="text-[11px] font-extrabold text-ink-soft">
              {label as string}
              <input value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} placeholder={placeholder as string} className="mt-1 w-full rounded-sm border border-ink/15 bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-pine-700" />
            </label>
          ))}
          <label className="sm:col-span-2 text-[11px] font-extrabold text-ink-soft">
            Company capabilities
            <textarea value={capabilities} onChange={(event) => setCapabilities(event.target.value)} placeholder="e.g. Steel, engineering, technology, community development" rows={2} className="mt-1 w-full resize-y rounded-sm border border-ink/15 bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-pine-700" />
          </label>
          <label className="sm:col-span-2 text-[11px] font-extrabold text-ink-soft">
            CSR support areas
            <textarea value={supportAreas} onChange={(event) => setSupportAreas(event.target.value)} placeholder="e.g. Funding, mentoring, prototyping, deployment" rows={2} className="mt-1 w-full resize-y rounded-sm border border-ink/15 bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-pine-700" />
          </label>
          <label className="sm:col-span-2 text-[11px] font-extrabold text-ink-soft">
            Company address
            <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Registered/company address" className="mt-1 w-full rounded-sm border border-ink/15 bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-pine-700" />
          </label>
        </div>
        <button disabled={busy} onClick={submit} className="mt-5 w-full bg-pine-800 text-paper px-4 py-3 rounded-sm text-sm font-extrabold disabled:opacity-50">
          {busy ? "Saving profile..." : "Save profile and open Industry Desk"}
        </button>
      </div>
    </div>
  );
}

function MiniStat({ n, l }: { n: number; l: string }) {
  return (
    <div>
      <p className="font-display font-extrabold text-lg leading-none text-ink tabular">
        {n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k" : n}
      </p>
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-ink-soft mt-1">
        {l}
      </p>
    </div>
  );
}

/* ============================================================================
   INDUSTRY VIEW — partner directory & CSR calls
   ==========================================================================*/
const PTYPES = [
  "All",
  "PSU",
  "CSR",
  "Industry",
  "MSME",
  "Lab",
  "Incubator",
  "Utility",
  "NGO",
];
const TYPE_COLOR: Record<string, string> = {
  PSU: "#41617A",
  CSR: "#DE9B12",
  Industry: "#2E6FB7",
  MSME: "#B4692F",
  Lab: "#7C4A68",
  Incubator: "#2E7D4F",
  Utility: "#1F7FA6",
  NGO: "#6E8F2E",
};

function Industry({
  t,
  toast,
  notif,
  goto,
  activeIndustries,
}: {
  t: (k: string) => string;
  lang: Lang;
  toast: (m: string) => void;
  notif: (icon: string, text: string) => void;
  goto: (v: string, f?: Record<string, string>) => void;
  activeIndustries: { id: string; name: string; org: string }[];
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
      <div className="bg-card border border-dashed border-ink/20 rounded-md p-8 text-center">
        <span className="w-14 h-14 mx-auto rounded-sm bg-pine-900 text-marigold-400 flex items-center justify-center">
          <Icon name="lock" className="w-6 h-6" sw={2.2} />
        </span>
        <h1 className="font-display font-extrabold text-2xl text-ink mt-4">
          Industry workspace
        </h1>
        <p className="text-sm font-semibold text-ink-soft mt-2">
          Registered Industry / CSR partners
        </p>
        <div className="mt-6 grid gap-3 text-left">
          {activeIndustries.length ? (
            activeIndustries.map((industry) => (
              <div key={industry.id} className="flex items-center gap-3 rounded-sm border border-pine-700/20 bg-paper p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-pine-800 font-display text-sm font-extrabold text-marigold-300">
                  {industry.name.split(/\s+/).map((word) => word[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-extrabold text-ink">{industry.name}</p>
                  <p className="text-[11px] font-semibold text-ink-soft">Industry login · Registered partner</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm font-semibold text-ink-soft">No Industry / CSR login is registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  const [type, setType] = useState("All");
  const list = PARTNERS.filter((p) => type === "All" || p.type === type);

  const interest = (name: string) => {
    notif(
      "factory",
      `Partnership interest received — ${name} will be notified by the Innovation Cell`,
    );
    toast("Interest registered with " + name);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <SectionHead
        kicker="Industry partnership module"
        title="Mentorship · Funding · Prototyping · Deployment"
        right={
          <div className="flex items-center gap-2 text-[12px] font-bold text-ink-soft">
            <span className="tabular text-pine-800 font-extrabold text-lg">
              {PARTNERS.length}
            </span>{" "}
            empanelled partners ·{" "}
            <span className="tabular text-marigold-700 font-extrabold text-lg">
              ₹8.4 Cr
            </span>{" "}
            committed
          </div>
        }
      />

      {/* Collaboration flow */}
      <Reveal className="mb-8">
        <div className="bg-pine-925 text-paper rounded-md border border-pine-900 p-5 overflow-x-auto shadow-[6px_6px_0_rgba(11,44,33,0.18)]">
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-marigold-300 mb-4">
            The collaboration pipeline
          </p>
          <div className="flex items-center gap-2 min-w-[720px]">
            {[
              ["users", "Citizen problem", "submitted with evidence"],
              ["spark", "AI triage", "classify · prioritise · dedup"],
              ["edu", "HEI team", "faculty + students + mentor"],
              ["factory", "Industry partner", "funding · prototyping · pilot"],
              ["check", "Deployment", "field-tested & measured"],
            ].map(([ic, a, b], i, arr) => (
              <div key={a} className="flex items-center gap-2 flex-1">
                <div className="flex-1 bg-paper/5 border border-paper/12 rounded-sm p-3.5 hover:bg-paper/10 hover:-translate-y-0.5 transition-all">
                  <Icon
                    name={ic}
                    className="w-5 h-5 text-marigold-400"
                    sw={2}
                  />
                  <p className="font-display font-bold text-[13.5px] mt-2 leading-tight">
                    {a}
                  </p>
                  <p className="text-[10.5px] font-semibold text-moss-400 mt-1">
                    {b}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <Icon
                    name="arrowR"
                    className="w-4 h-4 text-marigold-500 shrink-0"
                    sw={2.4}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {PTYPES.map((tp) => (
          <button
            key={tp}
            onClick={() => setType(tp)}
            className={cx(
              "px-3 py-1.5 rounded-sm text-[11.5px] font-bold border transition-all",
              type === tp
                ? "bg-pine-900 text-paper border-pine-900 shadow-[2px_2px_0_rgba(239,170,43,0.8)]"
                : "bg-card text-ink-soft border-ink/15 hover:border-pine-700 hover:text-pine-800",
            )}
          >
            {tp}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {list.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i * 55, 280)}>
            <div className="group h-full bg-card border border-ink/10 rounded-md p-5 shadow-[5px_5px_0_rgba(11,44,33,0.07)] hover:shadow-[8px_8px_0_rgba(11,44,33,0.13)] hover:-translate-y-1 transition-all flex flex-col">
              <div className="flex items-start justify-between">
                <span
                  className="w-12 h-12 rounded-sm font-display font-extrabold text-[13px] flex items-center justify-center text-paper shrink-0"
                  style={{ background: TYPE_COLOR[p.type] ?? "#41617A" }}
                >
                  {p.name
                    .split(/[\s(]+/)
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <span
                  className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-sm"
                  style={{
                    background: (TYPE_COLOR[p.type] ?? "#41617A") + "18",
                    color: TYPE_COLOR[p.type] ?? "#41617A",
                    border: `1px solid ${TYPE_COLOR[p.type] ?? "#41617A"}40`,
                  }}
                >
                  {p.type}
                </span>
              </div>
              <h3 className="font-display font-extrabold text-[16px] tracking-tight text-ink mt-3 group-hover:text-pine-700 transition-colors">
                {p.name}
              </h3>
              <p className="text-[12px] font-bold text-ink-soft flex items-center gap-1 mt-0.5">
                <Icon name="pin" className="w-3.5 h-3.5" sw={2.2} />
                {p.city} · partner since {p.since}
              </p>
              <div className="mt-3 space-y-1.5 flex-1">
                {p.offers.map((o) => (
                  <p
                    key={o}
                    className="text-[12.5px] font-semibold text-ink flex items-center gap-1.5"
                  >
                    <Icon
                      name="check"
                      className="w-3.5 h-3.5 text-pine-700 shrink-0"
                      sw={2.6}
                    />
                    {o}
                  </p>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-dashed border-ink/15">
                <div>
                  <p className="text-[9.5px] font-extrabold uppercase tracking-widest text-ink-soft">
                    Contribution
                  </p>
                  <p className="text-[13px] font-extrabold text-pine-800">
                    {p.fund}
                  </p>
                </div>
                <span className="text-[11.5px] font-bold text-ink-soft tabular">
                  {p.projects} projects
                </span>
              </div>
              <button
                onClick={() => interest(p.name)}
                className="mt-3.5 w-full inline-flex items-center justify-center gap-2 border-2 border-pine-800 text-pine-800 hover:bg-pine-800 hover:text-paper font-extrabold text-[12.5px] py-2.5 rounded-sm transition-all"
              >
                <Icon name="send" className="w-4 h-4" sw={2.2} /> Express
                interest
              </button>
            </div>
          </Reveal>
        ))}
      </div>

      {/* CSR calls */}
      <Reveal>
        <SectionHead
          kicker="Open calls"
          title="CSR & grant funding windows"
          right={
            <button
              onClick={() => goto("registry")}
              className="text-[12px] font-bold text-pine-700 hover:text-brick-600 transition-colors"
            >
              Browse fundable problems →
            </button>
          }
        />
        <div className="grid md:grid-cols-2 gap-4">
          {CSR_CALLS.map((c, i) => (
            <div
              key={c.id}
              className="bg-card border border-ink/10 rounded-md p-5 shadow-[5px_5px_0_rgba(11,44,33,0.07)] hover:border-marigold-500/60 transition-all group rise-in"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-[16px] tracking-tight text-ink group-hover:text-pine-700 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-[12px] font-bold text-ink-soft mt-0.5">
                    {c.by}
                  </p>
                </div>
                <span
                  className={cx(
                    "text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-sm shrink-0",
                    c.status === "Closing"
                      ? "bg-brick-500/12 text-brick-600 border border-brick-500/35"
                      : "bg-pine-100 text-pine-800 border border-pine-700/25",
                  )}
                >
                  {c.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-[12.5px] font-bold">
                <span className="text-marigold-700 flex items-center gap-1.5">
                  <Icon name="rupee" className="w-4 h-4" sw={2.2} />
                  {c.amount}
                </span>
                <span className="text-ink-soft flex items-center gap-1.5">
                  <Icon name="cal" className="w-4 h-4" sw={2} />
                  Closes {c.deadline}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3.5">
                <div className="flex gap-1.5">
                  {c.domains.map((d) => {
                    const dd = domainById(d);
                    return (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-[3px] rounded-sm"
                        style={{ background: dd.color + "16", color: dd.color }}
                      >
                        <Icon name={dd.icon} className="w-3 h-3" sw={2.4} />
                        {dd.en}
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={() => interest(c.title)}
                  className="text-[12px] font-extrabold bg-marigold-500 hover:bg-marigold-400 text-pine-925 px-3 py-1.5 rounded-sm transition-colors"
                >
                  Apply →
                </button>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/* ============================================================================
   PROJECTS VIEW — lifecycle management
   ==========================================================================*/
function Projects({
  t,
  challenges,
  patch,
  toast,
  notif,
  goto,
}: {
  t: (k: string) => string;
  challenges: Challenge[];
  patch: (id: string, fn: (c: Challenge) => Challenge) => void;
  toast: (m: string) => void;
  notif: (icon: string, text: string) => void;
  goto: (v: string, f?: Record<string, string>) => void;
}) {
  const items = challenges.filter((c) => c.uni && stageIdx(c.stage) >= 4);
  const avg = items.length
    ? Math.round(
        (items.reduce(
          (s, c) =>
            s +
            (c.milestones.length
              ? c.milestones.filter((m) => m.done).length / c.milestones.length
              : 0),
          0,
        ) /
          items.length) *
          100,
      )
    : 0;

  const completeMilestone = (c: Challenge, mid: string) => {
    patch(c.id, (x) => ({
      ...x,
      milestones: x.milestones.map((m) =>
        m.id === mid ? { ...m, done: true } : m,
      ),
    }));
    toast("Milestone signed off — progress updated");
  };

  const advance = (c: Challenge) => {
    const order = ["team", "prototype", "pilot", "deployed"];
    const next = order[order.indexOf(c.stage) + 1];
    if (!next) return;
    patch(c.id, (x) => ({
      ...x,
      stage: next,
      updates: [
        ...x.updates,
        {
          stage: next,
          time: "Today",
          note:
            next === "deployed"
              ? "Stage gate cleared — solution deployed & impact monitoring started."
              : "Stage gate cleared by review committee.",
        },
      ],
    }));
    notif(
      "target",
      `Stage gate cleared: ${c.id} → ${next === "deployed" ? "Deployed" : next}`,
    );
    toast(
      next === "deployed"
        ? "Project deployed — view it under Impact"
        : "Advanced to " + next,
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <SectionHead
        kicker="Project lifecycle management"
        title="Active solution projects"
        right={
          <div className="flex items-center gap-2 text-[12px] font-bold text-ink-soft">
            <span className="tabular text-pine-800 font-extrabold text-lg">
              {items.length}
            </span>{" "}
            live · avg progress{" "}
            <span className="tabular text-marigold-700 font-extrabold text-lg">
              {avg}%
            </span>
          </div>
        }
      />

      <div className="grid gap-5">
        {items.map((c, i) => {
          const done = c.milestones.filter((m) => m.done).length;
          const pct = c.milestones.length
            ? Math.round((done / c.milestones.length) * 100)
            : 0;
          const allDone =
            c.milestones.length > 0 && done === c.milestones.length;
          const nextStage = ["team", "prototype", "pilot"].includes(c.stage)
            ? ["team", "prototype", "pilot", "deployed"][
                ["team", "prototype", "pilot"].indexOf(c.stage) + 1
              ]
            : null;
          return (
            <Reveal key={c.id} delay={Math.min(i * 60, 240)}>
              <div className="bg-card border border-ink/10 rounded-md shadow-[5px_5px_0_rgba(11,44,33,0.07)] overflow-hidden hover:shadow-[8px_8px_0_rgba(11,44,33,0.12)] transition-all">
                <div
                  className="h-1.5 w-full"
                  style={{
                    background: `linear-gradient(90deg, #1B5140 ${pct}%, rgba(23,32,26,0.08) ${pct}%)`,
                  }}
                />
                <div className="p-5 md:p-6 grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-[10.5px] font-extrabold tabular text-ink-soft">
                        {c.id}
                      </span>
                      <StagePill stage={c.stage} />
                    </div>
                    <h3 className="font-display font-extrabold text-[17px] leading-snug tracking-tight text-ink">
                      {c.title}
                    </h3>
                    <p className="text-[12px] font-bold text-ink-soft mt-1.5 flex items-center gap-1.5">
                      <Icon name="pin" className="w-3.5 h-3.5" sw={2.2} />
                      {c.district} · {c.block}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[12px] font-bold">
                      {c.uni && (
                        <span className="inline-flex items-center gap-1.5 text-pine-800">
                          <Icon name="edu" className="w-4 h-4" sw={2} />
                          {uniById(c.uni)?.short}
                        </span>
                      )}
                      {c.partner && (
                        <span className="inline-flex items-center gap-1.5 text-steel-500">
                          <Icon name="factory" className="w-4 h-4" sw={2} />
                          {partnerById(c.partner)?.name}
                        </span>
                      )}
                      {c.budget && (
                        <span className="inline-flex items-center gap-1.5 text-marigold-700">
                          <Icon name="rupee" className="w-4 h-4" sw={2} />
                          {c.budget}
                        </span>
                      )}
                    </div>
                    {c.ip && (
                      <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-extrabold text-[#7C4A68] bg-[#7C4A68]/10 border border-[#7C4A68]/30 px-2.5 py-1.5 rounded-sm">
                        <Icon name="patent" className="w-4 h-4" sw={2} />
                        {c.ip}
                      </p>
                    )}
                    {c.stage === "deployed" && c.impact && (
                      <p className="mt-3 text-[12.5px] font-bold text-pine-800 bg-pine-100/70 border border-pine-700/25 rounded-sm px-3 py-2.5 flex items-start gap-2">
                        <Icon
                          name="check"
                          className="w-4 h-4 shrink-0 mt-0.5"
                          sw={2.6}
                        />
                        {c.impact}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-soft">
                        {t("milestones")} & deliverables
                      </p>
                      <span className="tabular text-[13px] font-extrabold text-pine-800">
                        {pct}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      {c.milestones.map((m) => (
                        <div
                          key={m.id}
                          className={cx(
                            "flex items-center gap-3 border rounded-sm px-3 py-2.5 transition-colors",
                            m.done
                              ? "border-pine-700/25 bg-pine-100/50"
                              : "border-ink/15 bg-paper hover:border-marigold-500/60",
                          )}
                        >
                          <button
                            onClick={() =>
                              !m.done &&
                              c.stage !== "deployed" &&
                              completeMilestone(c, m.id)
                            }
                            disabled={m.done || c.stage === "deployed"}
                            className={cx(
                              "w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-all",
                              m.done
                                ? "bg-pine-800 text-paper"
                                : "border-2 border-ink/30 hover:border-marigold-600 hover:bg-marigold-500/20",
                            )}
                            title={
                              m.done
                                ? "Completed"
                                : "Mark complete (stage gate)"
                            }
                          >
                            {m.done && (
                              <Icon name="check" className="w-3 h-3" sw={3.2} />
                            )}
                          </button>
                          <span
                            className={cx(
                              "flex-1 text-[13px] font-bold",
                              m.done
                                ? "text-pine-800 line-through decoration-pine-700/40"
                                : "text-ink",
                            )}
                          >
                            {m.label}
                          </span>
                          <span className="text-[11px] font-bold text-ink-soft tabular shrink-0 hidden sm:inline-flex items-center gap-1">
                            <Icon name="cal" className="w-3.5 h-3.5" sw={2} />
                            {m.due}
                          </span>
                          {!m.done && c.stage !== "deployed" && (
                            <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-marigold-700 bg-marigold-500/15 border border-marigold-500/35 px-1.5 py-0.5 rounded-sm shrink-0">
                              due
                            </span>
                          )}
                        </div>
                      ))}
                      {c.milestones.length === 0 && (
                        <p className="text-[13px] font-semibold text-ink-soft bg-paper border border-dashed border-ink/20 rounded-sm p-4 text-center">
                          Milestone plan being drafted by the project team.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 mt-4">
                      {allDone && nextStage && c.stage !== "deployed" && (
                        <button
                          onClick={() => advance(c)}
                          className="inline-flex items-center gap-2 bg-marigold-500 hover:bg-marigold-400 text-pine-925 font-extrabold text-[13px] px-4 py-2.5 rounded-sm shadow-[3px_3px_0_rgba(11,44,33,0.85)] hover:-translate-y-0.5 transition-all"
                        >
                          <Icon name="flag" className="w-4 h-4" sw={2.2} />{" "}
                          Clear stage gate →{" "}
                          {nextStage === "deployed"
                            ? "Deploy"
                            : nextStage[0].toUpperCase() + nextStage.slice(1)}
                        </button>
                      )}
                      {c.stage === "deployed" && (
                        <button
                          onClick={() => goto("impact")}
                          className="inline-flex items-center gap-2 bg-pine-800 hover:bg-pine-700 text-paper font-extrabold text-[13px] px-4 py-2.5 rounded-sm transition-colors"
                        >
                          <Icon name="trend" className="w-4 h-4" sw={2.2} />{" "}
                          View impact & replication
                        </button>
                      )}
                      {c.team && (
                        <span className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] font-bold text-ink-soft">
                          <Icon name="users" className="w-4 h-4" sw={2} />
                          {c.team.length} members · mentor {c.mentor ?? "—"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   IMPACT VIEW — outcomes, repository, replication
   ==========================================================================*/
const PATENTS = [
  {
    id: "2025/004123",
    title: "IoT gas-sensor mesh for coal-seam fire early warning",
    holder: "IIT (ISM) Dhanbad + CSIR-CIMFR",
    status: "Filed",
    domain: "Environment",
  },
  {
    id: "2025/003871",
    title: "Low-cost adsorbent cartridge for arsenic removal",
    holder: "IIT (ISM) Dhanbad",
    status: "Examination",
    domain: "Water",
  },
  {
    id: "2025/002954",
    title: "Insulated live-fish transit crate",
    holder: "BAU Ranchi (design regd.)",
    status: "Registered",
    domain: "Livelihoods",
  },
  {
    id: "2024/005102",
    title: "Solar tussar-yarn drying cabinet",
    holder: "JUT Ranchi",
    status: "Filed",
    domain: "Livelihoods",
  },
];
const STARTUPS = [
  {
    name: "JalSetu Technologies",
    from: "BIT Mesra incubatee",
    idea: "Community water-quality kiosks",
    stage: "Pre-seed · ₹25 L",
    district: "Ranchi",
  },
  {
    name: "Adivasi Crafts Co.",
    from: "JUT + Jharcraft",
    idea: "Tussar value-chain platform",
    stage: "Seed · ₹40 L",
    district: "Khunti",
  },
  {
    name: "MineGuard Analytics",
    from: "IIT ISM TIDE",
    idea: "Mine-safety sensor analytics",
    stage: "Seed · ₹60 L",
    district: "Dhanbad",
  },
];
const DISTRICT_IMPACT = [
  { d: "Ranchi", v: 9400 },
  { d: "Chatra", v: 8100 },
  { d: "Dhanbad", v: 6800 },
  { d: "Jamtara", v: 2100 },
  { d: "Simdega", v: 1900 },
  { d: "West Singhbhum", v: 1600 },
];

function Impact({
  challenges,
  toast,
  notif,
}: {
  t: (k: string) => string;
  challenges: Challenge[];
  toast: (m: string) => void;
  notif: (icon: string, text: string) => void;
}) {
  const repo = challenges.filter((c) => c.stage === "deployed");
  const [replica, setReplica] = useState<Record<string, string[]>>({});
  const [pick, setPick] = useState<Record<string, string>>({});
  const deployedDistricts = Array.from(
    new Set(repo.map((c) => c.district).filter(Boolean)),
  );
  const maxD = 1;

  const requestReplica = (c: Challenge) => {
    const d = pick[c.id];
    if (!d) {
      toast("Choose a district to replicate in");
      return;
    }
    setReplica((r) => ({ ...r, [c.id]: [...(r[c.id] ?? []), d] }));
    notif("layers", `Replication requested: "${c.title.slice(0, 40)}…" → ${d}`);
    toast(`Replication plan for ${d} sent to the District Innovation Cell`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <SectionHead
        kicker="Measurable social outcomes"
        title="Impact & solution repository"
        right={
          <span className="text-[12px] font-bold text-ink-soft">
            NEP 2020 · community-engaged research
          </span>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-9">
        {[
          ["check", repo.length, "solutions deployed"],
          ["pin", deployedDistricts.length, "districts with deployments"],
          ["rupee", 0, "live funding data"],
          ["patent", 0, "patents filed"],
          ["rocket", 0, "startups created"],
          ["users", 0, "citizens benefited"],
        ].map(([ic, n, l], i) => (
          <Reveal key={l as string} delay={i * 50}>
            <div
              className={cx(
                "h-full rounded-md p-4 border text-center shadow-[4px_4px_0_rgba(11,44,33,0.08)]",
                i === 0
                  ? "bg-pine-900 text-paper border-pine-925"
                  : "bg-card border-ink/10",
              )}
            >
              <Icon
                name={ic as string}
                className={cx(
                  "w-5 h-5 mx-auto",
                  i === 0 ? "text-marigold-400" : "text-pine-700",
                )}
                sw={2}
              />
              <p
                className={cx(
                  "font-display font-extrabold text-2xl md:text-[27px] mt-1.5 leading-none",
                  i === 0 ? "text-paper" : "text-ink",
                )}
              >
                <Counter
                  to={n as number}
                  dec={l === "Cr invested (₹)" ? 1 : 0}
                />
                {l === "Cr invested (₹)" && (
                  <span className="text-sm"> Cr</span>
                )}
              </p>
              <p
                className={cx(
                  "text-[9.5px] font-extrabold uppercase tracking-widest mt-1.5",
                  i === 0 ? "text-moss-400" : "text-ink-soft",
                )}
              >
                {l}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Repository */}
      <Reveal className="mb-10">
        <SectionHead
          kicker="Replicate what works"
          title="Successful-solution repository"
        />
        <div className="grid md:grid-cols-2 gap-4">
          {repo.map((c, i) => (
            <div
              key={c.id}
              className="bg-card border border-ink/10 rounded-md overflow-hidden shadow-[5px_5px_0_rgba(11,44,33,0.07)] hover:shadow-[8px_8px_0_rgba(11,44,33,0.13)] hover:-translate-y-1 transition-all group rise-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {c.evidence[0] && (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={c.evidence[0]}
                    alt={c.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-pine-900 text-marigold-300 text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-sm flex items-center gap-1.5">
                    <Icon name="check" className="w-3 h-3" sw={3} />
                    Deployed · {c.district}
                  </span>
                </div>
              )}
              <div className="p-5">
                <h3 className="font-display font-extrabold text-[16px] tracking-tight text-ink leading-snug">
                  {c.title}
                </h3>
                <p className="text-[12.5px] font-bold text-pine-800 mt-2 flex items-start gap-1.5">
                  <Icon
                    name="trend"
                    className="w-4 h-4 shrink-0 mt-0.5"
                    sw={2.2}
                  />
                  {c.impact}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-[11.5px] font-bold text-ink-soft">
                  {c.uni && (
                    <span className="inline-flex items-center gap-1">
                      <Icon name="edu" className="w-3.5 h-3.5" sw={2} />
                      {uniById(c.uni)?.short}
                    </span>
                  )}
                  {c.partner && (
                    <span className="inline-flex items-center gap-1">
                      <Icon name="factory" className="w-3.5 h-3.5" sw={2} />
                      {partnerById(c.partner)?.name}
                    </span>
                  )}
                  {c.fund && (
                    <span className="inline-flex items-center gap-1 text-marigold-700">
                      <Icon name="rupee" className="w-3.5 h-3.5" sw={2} />
                      {c.fund}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3.5 border-t border-dashed border-ink/15">
                  <select
                    value={pick[c.id] ?? ""}
                    onChange={(e) =>
                      setPick((p) => ({ ...p, [c.id]: e.target.value }))
                    }
                    className="bg-paper border border-ink/15 rounded-sm px-2.5 py-2 text-[12px] font-bold text-ink cursor-pointer flex-1 min-w-[140px]"
                  >
                    <option value="">Replicate in district…</option>
                    {DISTRICTS.filter((d) => d !== c.district).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => requestReplica(c)}
                    className="inline-flex items-center gap-1.5 bg-pine-800 hover:bg-pine-700 text-paper text-[12px] font-extrabold px-3.5 py-2 rounded-sm transition-colors"
                  >
                    <Icon name="layers" className="w-4 h-4" sw={2.2} />{" "}
                    Replicate
                  </button>
                  {(replica[c.id]?.length ?? 0) > 0 && (
                    <span className="text-[11px] font-extrabold text-marigold-700 bg-marigold-500/15 border border-marigold-500/40 px-2 py-1 rounded-sm inline-flex items-center gap-1">
                      <Icon name="check" className="w-3 h-3" sw={3} />
                      {replica[c.id].length} district
                      {(replica[c.id].length ?? 0) > 1 ? "s" : ""} queued
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {repo.length === 0 && (
            <p className="text-sm font-semibold text-ink-soft">
              Deployed solutions will appear here.
            </p>
          )}
        </div>
      </Reveal>

      <div className="grid lg:grid-cols-2 gap-5 mb-10">
        {/* Patents */}
        <Reveal>
          <div className="h-full bg-card border border-ink/10 rounded-md p-6 shadow-[5px_5px_0_rgba(11,44,33,0.07)]">
            <SectionHead
              kicker="Innovation outcomes"
              title="IP & patent tracker"
            />
            <div className="space-y-3">
              <p className="text-sm font-semibold text-ink-soft">
                No live patent data has been recorded.
              </p>
              {false && PATENTS.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start gap-3 pb-3 border-b border-dashed border-ink/15 last:border-0 last:pb-0"
                >
                  <span className="w-9 h-9 rounded-sm bg-[#7C4A68]/12 text-[#7C4A68] border border-[#7C4A68]/30 flex items-center justify-center shrink-0">
                    <Icon name="patent" className="w-[18px] h-[18px]" sw={2} />
                  </span>
                  <div className="flex-1">
                    <p className="text-[13px] font-extrabold text-ink leading-snug">
                      {p.title}
                    </p>
                    <p className="text-[11.5px] font-bold text-ink-soft mt-0.5">
                      {p.holder} · <span className="tabular">{p.id}</span>
                    </p>
                  </div>
                  <span
                    className={cx(
                      "text-[9.5px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-sm shrink-0",
                      p.status === "Registered"
                        ? "bg-pine-100 text-pine-800 border border-pine-700/30"
                        : "bg-marigold-500/15 text-marigold-700 border border-marigold-500/40",
                    )}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Startups + district bars */}
        <div className="space-y-5">
          <Reveal delay={70}>
            <div className="bg-card border border-ink/10 rounded-md p-6 shadow-[5px_5px_0_rgba(11,44,33,0.07)]">
              <SectionHead
                kicker="Entrepreneurship"
                title="Startups born from problems"
              />
              <div className="space-y-3">
                <p className="text-sm font-semibold text-ink-soft">
                  No live startup data has been recorded.
                </p>
                {false && STARTUPS.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-3 pb-3 border-b border-dashed border-ink/15 last:border-0 last:pb-0"
                  >
                    <span className="w-9 h-9 rounded-sm bg-brick-500/10 text-brick-600 border border-brick-500/30 flex items-center justify-center shrink-0">
                      <Icon
                        name="rocket"
                        className="w-[18px] h-[18px]"
                        sw={2}
                      />
                    </span>
                    <div className="flex-1">
                      <p className="text-[13px] font-extrabold text-ink">
                        {s.name}{" "}
                        <span className="text-[10.5px] font-bold text-ink-soft">
                          · {s.district}
                        </span>
                      </p>
                      <p className="text-[11.5px] font-semibold text-ink-soft">
                        {s.idea} — {s.from}
                      </p>
                    </div>
                    <span className="text-[10.5px] font-extrabold text-pine-800 bg-pine-100 border border-pine-700/25 px-2 py-1 rounded-sm shrink-0 tabular">
                      {s.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={130}>
            <div className="bg-pine-925 text-paper rounded-md p-6 shadow-[5px_5px_0_rgba(11,44,33,0.2)]">
              <SectionHead
                dark
                kicker="Community benefit"
                title="Citizens benefited · by district"
              />
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-paper/70">
                  Citizen benefit measurements will appear after live impact
                  data is recorded.
                </p>
                {false && DISTRICT_IMPACT.map((x) => (
                  <div key={x.d} className="flex items-center gap-3">
                    <span className="text-[12px] font-bold w-32 truncate text-paper/85">
                      {x.d}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-paper/10 overflow-hidden">
                      <div
                        className="h-full rounded-full donut-seg"
                        style={{
                          width: `${(x.v / maxD) * 100}%`,
                          background: "linear-gradient(90deg,#1B5140,#EFAA2B)",
                        }}
                      />
                    </div>
                    <span className="tabular text-[12px] font-extrabold text-marigold-300 w-14 text-right">
                      {x.v.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   LEDGER — hash-chained audit trail (blockchain) + cryptography info
   ==========================================================================*/
function short(hex: string, n = 10): string {
  return hex.length <= n * 2 ? hex : `${hex.slice(0, n)}…${hex.slice(-n)}`;
}

function Ledger({
  lang,
  toast,
  session,
}: {
  lang: Lang;
  toast: (m: string) => void;
  session: Session;
}) {
  const hi = lang === "hi";
  const [chain, setChain] = useState<ChainBlock[]>([]);
  const [publicKey, setPublicKey] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [verification, setVerification] = useState<ChainVerification | null>(
    null,
  );
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getChain(session.token)
      .then((r) => {
        if (cancelled) return;
        setChain([...r.chain].reverse());
        setPublicKey(r.publicKey);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [session.token]);

  const runVerify = () => {
    setVerifying(true);
    api
      .verifyChain()
      .then((r) => {
        setVerification(r);
        toast(
          r.valid
            ? hi
              ? "लेजर अखंड है — कोई छेड़छाड़ नहीं मिली"
              : "Ledger intact — no tampering detected"
            : hi
              ? "लेजर में गड़बड़ी मिली"
              : "Ledger integrity issue found",
        );
      })
      .catch(() => toast(hi ? "सत्यापन विफल" : "Verification failed"))
      .finally(() => setVerifying(false));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 view-in">
      <SectionHead
        kicker={hi ? "पारदर्शिता व अखंडता" : "Transparency & integrity"}
        title={
          hi
            ? "ब्लॉकचेन लेजर व क्रिप्टोग्राफ़ी"
            : "Blockchain Ledger & Cryptography"
        }
        right={
          <button
            onClick={runVerify}
            disabled={verifying}
            className="inline-flex items-center gap-1.5 bg-pine-900 hover:bg-pine-800 disabled:opacity-60 text-paper font-extrabold text-[12.5px] px-3.5 py-2 rounded-sm shadow-[3px_3px_0_rgba(11,44,33,0.25)] transition-all"
          >
            <Icon name="shield" className="w-4 h-4" sw={2.2} />
            {verifying
              ? hi
                ? "जांच हो रही है…"
                : "Verifying…"
              : hi
                ? "लेजर की अखंडता जांचें"
                : "Verify ledger integrity"}
          </button>
        }
      />

      {verification && (
        <div
          className={cx(
            "mb-6 rounded-sm border px-4 py-3 flex items-start gap-2.5",
            verification.valid
              ? "bg-moss-500/10 border-moss-500/40 text-moss-700"
              : "bg-brick-500/10 border-brick-500/40 text-brick-700",
          )}
        >
          <Icon
            name={verification.valid ? "check" : "close"}
            className="w-4 h-4 mt-0.5 shrink-0"
            sw={2.4}
          />
          <span className="text-[13px] font-bold">
            {verification.valid
              ? hi
                ? `सत्यापित: सभी ${verification.length ?? chain.length} ब्लॉक अखंड और सही ढंग से हस्ताक्षरित हैं।`
                : `Verified: all ${verification.length ?? chain.length} blocks are intact and correctly signed.`
              : hi
                ? `समस्या मिली ब्लॉक #${verification.brokenAt} पर — ${verification.reason}`
                : `Problem found at block #${verification.brokenAt} — ${verification.reason}`}
          </span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
        {CRYPTO_CARDS.map((c) => (
          <div
            key={c.en}
            className="bg-card border border-ink/12 rounded-sm p-4"
          >
            <span className="w-9 h-9 rounded-sm bg-pine-900 text-marigold-400 flex items-center justify-center mb-3">
              <Icon name={c.icon} className="w-[18px] h-[18px]" sw={2.2} />
            </span>
            <p className="font-display font-extrabold text-[14px] text-ink mb-1.5">
              {hi ? c.hi : c.en}
            </p>
            <p className="text-[12.5px] text-ink-soft leading-relaxed">
              {hi ? c.body_hi : c.body_en}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-ink/12 rounded-sm p-4 mb-8">
        <p className="text-[10.5px] font-extrabold uppercase tracking-widest text-ink-soft mb-1.5">
          {hi
            ? "सर्वर सार्वजनिक कुंजी (Ed25519)"
            : "Server public key (Ed25519)"}
        </p>
        <p className="font-mono text-[12px] text-ink break-all">
          {publicKey || "…"}
        </p>
      </div>

      {status === "error" && (
        <div className="bg-brick-500/10 border border-brick-500/40 text-brick-700 rounded-sm px-4 py-3 text-[13px] font-bold">
          {hi
            ? "लेजर लोड नहीं हो सका — बैकएंड चालू है या नहीं जांचें।"
            : "Couldn't load the ledger — check that the backend is running."}
        </div>
      )}

      {status === "ready" && (
        <div className="bg-card border border-ink/12 rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-ink/10 flex items-center justify-between">
            <p className="font-display font-extrabold text-[14px] text-ink">
              {hi ? `ब्लॉक (${chain.length})` : `Blocks (${chain.length})`}
            </p>
            <p className="text-[11px] font-bold text-ink-soft">
              {hi ? "नवीनतम पहले" : "Newest first"}
            </p>
          </div>
          <div className="divide-y divide-ink/8 max-h-[560px] overflow-y-auto">
            {chain.map((b) => (
              <div
                key={b.index}
                className="px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]"
              >
                <span className="tabular font-extrabold text-ink-soft w-10 shrink-0">
                  #{b.index}
                </span>
                <span className="font-bold text-pine-800 shrink-0">
                  {b.event}
                </span>
                {b.refId && (
                  <span className="font-mono text-ink-soft shrink-0">
                    {b.refId}
                  </span>
                )}
                <span className="text-ink-soft shrink-0">
                  {new Date(b.timestamp * 1000).toLocaleString(
                    hi ? "hi-IN" : "en-IN",
                  )}
                </span>
                <span
                  className="font-mono text-ink-soft/80 shrink-0"
                  title={b.hash}
                >
                  hash {short(b.hash)}
                </span>
                <span
                  className="font-mono text-ink-soft/60 shrink-0"
                  title={b.prevHash}
                >
                  prev {short(b.prevHash)}
                </span>
                <span className="inline-flex items-center gap-1 text-moss-600 font-bold shrink-0 ml-auto">
                  <Icon name="check" className="w-3 h-3" sw={3} />
                  {hi ? "हस्ताक्षरित" : "signed"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CitizenProfile({
  session,
  lang,
  toast,
  challenges,
}: {
  session: Session;
  lang: Lang;
  toast: (message: string) => void;
  challenges: Challenge[];
}) {
  const hi = lang === "hi";
  const [profile, setProfile] = useState({
    phone: "",
    address: "",
    district: "",
    block: "",
  });
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draftProfile, setDraftProfile] = useState({ phone: "", address: "", district: "", block: "" });
  const [largeText, setLargeText] = useState(
    () => localStorage.getItem("ss_a11y_large") === "1",
  );
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem("ss_a11y_contrast") === "1",
  );
  const [seniorMode, setSeniorMode] = useState(
    () => localStorage.getItem("ss_a11y_senior") === "1",
  );
  const [slowInternet, setSlowInternet] = useState(
    () => localStorage.getItem("ss_a11y_slow") === "1",
  );
  useEffect(() => {
    api
      .getProfile(session.token || "")
      .then((data) => {
        setProfile({
          phone: data.phone || "",
          address: data.address || "",
          district: data.district || "",
          block: data.block || "",
        });
        setVerified(Boolean(data.verified));
      })
      .catch(() => undefined);
  }, [session.token]);
  useEffect(() => {
    document.documentElement.classList.toggle("a11y-large", largeText);
    document.documentElement.classList.toggle(
      "a11y-high-contrast",
      highContrast,
    );
    document.documentElement.classList.toggle("a11y-senior", seniorMode);
    document.documentElement.classList.toggle("a11y-slow", slowInternet);
    localStorage.setItem("ss_a11y_large", largeText ? "1" : "0");
    localStorage.setItem("ss_a11y_contrast", highContrast ? "1" : "0");
    localStorage.setItem("ss_a11y_senior", seniorMode ? "1" : "0");
    localStorage.setItem("ss_a11y_slow", slowInternet ? "1" : "0");
  }, [largeText, highContrast, seniorMode, slowInternet]);
  const openEdit = () => {
    setDraftProfile(profile);
    setEditOpen(true);
  };
  const save = async () => {
    try {
      setBusy(true);
      const data = await api.updateProfile(session.token || "", draftProfile);
      setProfile({ phone: data.phone || "", address: data.address || "", district: data.district || "", block: data.block || "" });
      setVerified(Boolean(data.verified));
      toast(hi ? "प्रोफाइल सेव हो गई" : "Profile saved successfully");
      setEditOpen(false);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 view-in">
      <div className="bg-card border border-ink/10 rounded-md shadow-[5px_5px_0_rgba(11,44,33,.07)] overflow-hidden">
        <div className="p-6 border-b border-ink/10 bg-pine-100/50 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-pine-700">
              {hi ? "मेरा प्रोफाइल" : "My profile"}
            </p>
            <h1 className="font-display font-extrabold text-3xl mt-1">
              {session.name}
            </h1>
            <p className="text-[11px] text-ink-soft mt-1">
              {session.org || (hi ? "नागरिक खाता" : "Citizen account")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={openEdit} className="inline-flex items-center gap-1.5 rounded-sm border border-pine-700/25 bg-card px-3 py-2 text-xs font-extrabold text-pine-800 hover:bg-pine-100"><span aria-hidden="true">✎</span>{hi ? "संपादित करें" : "Edit"}</button>
          <span
            className={cx(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-sm text-[10px] font-extrabold",
              verified
                ? "bg-pine-100 text-pine-800"
                : "bg-marigold-500/10 text-marigold-700",
            )}
          >
            {verified
              ? "✓ " + (hi ? "सत्यापित प्रोफाइल" : "Verified profile")
              : hi
                ? "प्रोफाइल पूरा करें"
                : "Complete profile"}
              </span>
              </div>
              </div>
            <div className="p-6 grid sm:grid-cols-2 gap-4">
          {[
            [hi ? "मोबाइल" : "Mobile", profile.phone, "+91 98765 43210"],
            [hi ? "पता" : "Address", profile.address, hi ? "पता दर्ज नहीं है" : "Not provided"],
            [hi ? "जिला" : "District", profile.district, hi ? "जिला दर्ज नहीं है" : "Not provided"],
            [hi ? "ब्लॉक / वार्ड" : "Block / Ward", profile.block, hi ? "ब्लॉक या वार्ड दर्ज नहीं है" : "Not provided"],
          ].map(([label, value, empty]) => <div key={label} className="rounded-sm border border-ink/10 bg-paper p-3"><p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">{label}</p><p className={cx("mt-1 text-sm font-bold", value ? "text-ink" : "text-ink-soft/60")}>{value || empty}</p></div>)}
        </div>
        <div className="px-6 pb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10.5px] text-ink-soft">
            {hi
              ? "मोबाइल, पता और जिला भरने पर verification badge सक्रिय होगा।"
              : "Add mobile, address and district to activate your verification badge."}
          </p>
        </div>
      </div>
      {editOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-pine-925/55 px-4" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
          <div className="w-full max-w-xl rounded-md border border-ink/10 bg-card p-5 shadow-[8px_8px_0_rgba(11,44,33,.18)]">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[10px] font-extrabold uppercase tracking-widest text-pine-700">{hi ? "प्रोफाइल सुधारें" : "Edit profile"}</p><h2 id="profile-edit-title" className="font-display font-extrabold text-2xl mt-1">{hi ? "अपनी जानकारी अपडेट करें" : "Update your information"}</h2></div>
              <button type="button" onClick={() => setEditOpen(false)} aria-label="Close edit profile" className="text-xl leading-none text-ink-soft">×</button>
            </div>
            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              <label className="text-[11px] font-extrabold text-ink-soft">{hi ? "मोबाइल" : "Mobile"}<input value={draftProfile.phone} onChange={(event) => setDraftProfile({ ...draftProfile, phone: event.target.value })} placeholder="+91 98765 43210" className="mt-1 w-full rounded-sm border border-ink/15 bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine-700" /></label>
              <label className="text-[11px] font-extrabold text-ink-soft">{hi ? "पता" : "Address"}<input value={draftProfile.address} onChange={(event) => setDraftProfile({ ...draftProfile, address: event.target.value })} placeholder={hi ? "अपना पता लिखें" : "Enter your address"} className="mt-1 w-full rounded-sm border border-ink/15 bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine-700" /></label>
              <label className="text-[11px] font-extrabold text-ink-soft">{hi ? "जिला" : "District"}<input value={draftProfile.district} onChange={(event) => setDraftProfile({ ...draftProfile, district: event.target.value })} placeholder="Ranchi" className="mt-1 w-full rounded-sm border border-ink/15 bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine-700" /></label>
              <label className="text-[11px] font-extrabold text-ink-soft">{hi ? "ब्लॉक / वार्ड" : "Block / Ward"}<input value={draftProfile.block} onChange={(event) => setDraftProfile({ ...draftProfile, block: event.target.value })} placeholder={hi ? "ब्लॉक या वार्ड" : "Block or ward"} className="mt-1 w-full rounded-sm border border-ink/15 bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine-700" /></label>
            </div>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEditOpen(false)} className="rounded-sm border border-ink/15 px-4 py-2 text-xs font-extrabold text-ink-soft">{hi ? "रद्द करें" : "Cancel"}</button><button type="button" disabled={busy} onClick={save} className="rounded-sm bg-pine-800 px-4 py-2 text-xs font-extrabold text-paper disabled:opacity-60">{busy ? (hi ? "सेव हो रहा है..." : "Saving...") : (hi ? "सेव करें" : "Save changes")}</button></div>
          </div>
        </div>
      )}
      <div className="mt-5 bg-card border border-ink/10 rounded-md p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-pine-700">
          {hi ? "Accessibility" : "Accessibility"}
        </p>
        <h2 className="font-display font-extrabold text-xl mt-1">
          {hi
            ? "अपना viewing experience चुनें"
            : "Tune your viewing experience"}
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-bold">
            <input
              type="checkbox"
              checked={largeText}
              onChange={(e) => setLargeText(e.target.checked)}
            />{" "}
            {hi ? "बड़ा टेक्स्ट" : "Larger text"}
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-bold">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
            />{" "}
            {hi ? "High contrast" : "High contrast"}
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-bold">
            <input
              type="checkbox"
              checked={seniorMode}
              onChange={(e) => setSeniorMode(e.target.checked)}
            />{" "}
            {hi ? "Senior citizen mode" : "Senior citizen mode"}
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-bold">
            <input
              type="checkbox"
              checked={slowInternet}
              onChange={(e) => setSlowInternet(e.target.checked)}
            />{" "}
            {hi ? "Slow internet mode" : "Slow internet mode"}
          </label>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
  APP SHELL — sessions, RBAC nav, notifications, ticker, toasts
  ==========================================================================*/
const ROLE_LABEL: Record<Role, { en: string; hi: string; icon: string }> = {
  citizen: { en: "Citizen", hi: "नागरिक", icon: "user" },
  university: { en: "University", hi: "विश्वविद्यालय", icon: "edu" },
  industry: { en: "Industry & CSR", hi: "उद्योग व CSR", icon: "factory" },
  govt: {
    en: "State Government Officer",
    hi: "राज्य सरकारी अधिकारी",
    icon: "gov",
  },
  local_worker: { en: "Local Government", hi: "स्थानीय सरकार", icon: "gov" },
  field_verifier: { en: "Field Verifier", hi: "फील्ड सत्यापक", icon: "eye" },
  state_admin: { en: "State Admin", hi: "स्टेट एडमिन", icon: "gov" },
  state_nodal_officer: {
    en: "State Nodal Officer",
    hi: "स्टेट नोडल अधिकारी",
    icon: "shield",
  },
  department_head: {
    en: "Department Head",
    hi: "विभाग प्रमुख",
    icon: "layers",
  },
  district_officer: { en: "District Officer", hi: "जिला अधिकारी", icon: "pin" },
  resolution_officer: {
    en: "Resolution Officer",
    hi: "रिज़ॉल्यूशन अधिकारी",
    icon: "target",
  },
  field_officer: { en: "Field Officer", hi: "फील्ड अधिकारी", icon: "eye" },
  auditor: {
    en: "Auditor / Monitoring Officer",
    hi: "ऑडिटर / मॉनिटरिंग अधिकारी",
    icon: "lock",
  },
};

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const t = makeT(lang);
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const raw = localStorage.getItem("ss_session");
      if (!raw) return null;
      const saved = JSON.parse(raw) as Session;
      return {
        ...saved,
        orgId:
          saved.role === "university"
            ? universityIdFromAccount(saved.org) ?? saved.orgId ?? saved.id
            : saved.orgId,
        cityDesk: normalizeCityDesk(
          saved.cityDesk || saved.city_desk,
          "city_admin",
        ),
      };
    } catch {
      return null;
    }
  });
  const [view, setView] = useState("dashboard");
  const [viewHistory, setViewHistory] = useState<string[]>([]);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [regFilter, setRegFilter] = useState<Record<string, string>>({});
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [publicChallenges, setPublicChallenges] = useState<Challenge[]>([]);
  const [activeUniversityIds, setActiveUniversityIds] = useState<string[]>([]);
  const [activeUniversities, setActiveUniversities] = useState<
    { id: string; name: string; org: string }[]
  >([]);
  const [activeIndustries, setActiveIndustries] = useState<
    { id: string; name: string; org: string }[]
  >([]);
  const [notifs, setNotifs] = useState<
    { id: string; icon: string; text: string; time: string; read: boolean }[]
  >([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<
    { id: string; icon: string; text: string; time: string; read: boolean } | null
  >(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const toastId = useRef(0);

  const toast = (msg: string) => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts, { id, msg }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4200);
  };
  const notif = (icon: string, text: string) =>
    setNotifs((ns) => [
      { id: `n${Date.now()}`, icon, text, time: "Just now", read: false },
      ...ns,
    ]);
  const patch = (id: string, fn: (c: Challenge) => Challenge) => {
    setChallenges((cs) =>
      cs.map((c) => {
        if (c.id !== id) return c;
        const next = fn(c);
        api.updateChallenge(next, session?.token).catch(() => {
          api.createChallenge(next, session?.token).catch((error) => {
            toast(
              `Could not save update: ${error instanceof Error ? error.message : "backend returned an error."}`,
            );
          });
        });
        return next;
      }),
    );
  };
  const addChallenge = (c: Challenge): Promise<Challenge> => {
    setChallenges((cs) => [c, ...cs]);
    const myKey = `ss_my_reports_${session?.token || session?.id || "anon"}`;
    try {
      const raw = localStorage.getItem(myKey);
      const existing = Array.isArray(raw ? JSON.parse(raw) : [])
        ? (JSON.parse(raw || "[]") as unknown[])
        : [];
      const nextIds = new Set(
        existing.filter((value): value is string => typeof value === "string"),
      );
      nextIds.add(c.id);
      localStorage.setItem(myKey, JSON.stringify([...nextIds]));
    } catch {
      // storage unavailable; continue with the in-memory flow
    }
    return api
      .createChallenge(c, session?.token)
      .then((saved) => {
        setChallenges((cs) => cs.map((x) => (x.id === c.id ? saved : x)));
        try {
          const raw = localStorage.getItem(myKey);
          const existing = Array.isArray(raw ? JSON.parse(raw) : [])
            ? (JSON.parse(raw || "[]") as unknown[])
            : [];
          const nextIds = new Set(
            existing.filter(
              (value): value is string => typeof value === "string",
            ),
          );
          nextIds.add(saved.id);
          localStorage.setItem(myKey, JSON.stringify([...nextIds]));
        } catch {
          // storage unavailable; continue with the in-memory flow
        }
        return saved;
      })
      .catch((err) => {
        setChallenges((cs) => cs.filter((x) => x.id !== c.id));
        toast(
          `Could not save: ${err instanceof Error ? err.message : "backend returned an error."}`,
        );
        throw err;
      });
  };
  const goto = (v: string, filter?: Record<string, string>) => {
    if (v !== view) setViewHistory((history) => [...history, view].slice(-20));
    setView(v);
    setRegFilter(filter ?? {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    setViewHistory((history) => {
      const previous = history[history.length - 1] || "dashboard";
      setView(previous);
      setRegFilter({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      return history.slice(0, -1);
    });
  };
  const login = (s: Session) => {
    const nextSession = {
      ...s,
      orgId:
        s.orgId ||
        (s.role === "university" ? universityIdFromAccount(s.org) : undefined),
    };
    setSession(nextSession);
    try {
      localStorage.setItem("ss_session", JSON.stringify(nextSession));
    } catch {
      /* storage unavailable — session stays in-memory only */
    }
    try {
      localStorage.setItem(
        `ss_last_${nextSession.role}`,
        JSON.stringify({ name: nextSession.name, org: nextSession.org }),
      );
    } catch {
      /* ignore */
    }
    const defaultView =
      isStateAdminRole(nextSession.role) && nextSession.govtDesk
        ? GOVT_DESKS.find((desk) => desk.id === nextSession.govtDesk)?.view || "dashboard"
        : "dashboard";
    setView(defaultView);
    window.scrollTo({ top: 0 });
    toast(
      `${lang === "hi" ? "स्वागत है" : "Welcome"}, ${nextSession.name.split(" ")[0]} — ${ROLE_LABEL[nextSession.role][lang]} portal unlocked`,
    );
  };
  const logout = () => {
    if (session?.token) api.logout(session.token).catch(() => undefined);
    setSession(null);
    setViewHistory([]);
    setBellOpen(false);
    try {
      localStorage.removeItem("ss_session");
    } catch {
      /* ignore */
    }
    toast(lang === "hi" ? "साइन-आउट हो गए" : "Signed out");
  };

  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .listChallenges()
      .then((items) => setPublicChallenges(items))
      .catch(() => setPublicChallenges([]));
  }, []);

  useEffect(() => {
    if (!session?.token) {
      setChallenges([]);
      setActiveUniversityIds([]);
      setActiveUniversities([]);
      return;
    }
    let cancelled = false;
    const load = () =>
      api
        .listChallenges(session.token!)
        .then((items) => {
          if (!cancelled) setChallenges(items);
        })
        .catch((e) => {
          if (!cancelled && e instanceof Error && e.message.includes("HTTP 401")) {
            setSession(null);
            setChallenges([]);
            setActiveUniversityIds([]);
            setActiveUniversities([]);
            setView("dashboard");
            try {
              localStorage.removeItem("ss_session");
              localStorage.removeItem("ss_selected_universities");
            } catch {
              /* ignore storage cleanup failures */
            }
          } else if (!cancelled && challenges.length === 0) {
            toast(
              e instanceof Error
                ? e.message
                : "Backend is offline. Start the Python backend to load real data.",
            );
          }
        });
    load();
    const id = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [session?.token]);

  useEffect(() => {
    if (!session?.token) {
      setActiveUniversityIds([]);
      setActiveIndustries([]);
      return;
    }
    let cancelled = false;
    const loadActiveUniversities = () =>
      api
        .listActiveUniversities(session.token!)
        .then((accounts) => {
          if (!cancelled) {
            setActiveUniversities(accounts);
            setActiveUniversityIds(
              accounts
                .map((account) => universityIdFromAccount(account.org) || account.id)
                .filter((id): id is string => Boolean(id)),
            );
          }
        })
        .catch(() => {
          if (!cancelled) {
            setActiveUniversityIds([]);
            setActiveUniversities([]);
          }
        });
    loadActiveUniversities();
    const id = setInterval(loadActiveUniversities, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [session?.token]);

  useEffect(() => {
    if (!session?.token) return;
    let cancelled = false;
    const loadActiveIndustries = () =>
      api
        .listActiveIndustries(session.token!)
        .then((accounts) => {
          if (!cancelled) setActiveIndustries(accounts);
        })
        .catch(() => {
          if (!cancelled) setActiveIndustries([]);
        });
    loadActiveIndustries();
    const id = setInterval(loadActiveIndustries, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [session?.token]);

  useEffect(() => {
    let cancelled = false;
    let failedChecks = 0;
    const check = () =>
      api.health().then((ok) => {
        if (cancelled) return;
        if (ok) {
          failedChecks = 0;
          setBackendOnline(true);
        } else {
          failedChecks += 1;
          if (failedChecks >= 2) setBackendOnline(false);
        }
      });
    check();
    const id = setInterval(check, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setBellOpen(false);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const unread = notifs.filter((n) => !n.read).length;
  const hi = lang === "hi";
  const isGovt = isStateAdminRole(session?.role);
  const isLocalWorker = isCityAdminRole(session?.role);
  const isFieldVerifier =
    session?.role === "field_verifier" ||
    session?.role === "field_officer" ||
    (isCityAdminRole(session?.role) &&
      (session.cityDesk || session.city_desk) === "field_verification_officer");

  return (
    <div className="min-h-screen">
      {session?.role === "university" &&
        (!session.university_location ||
          !session.university_capabilities ||
          !session.labs_centres) && (
          <UniversityProfileSetup
            session={session}
            toast={toast}
            onBack={logout}
            onComplete={(profile) => {
              const nextSession = { ...session, ...profile };
              setSession(nextSession);
              localStorage.setItem("ss_session", JSON.stringify(nextSession));
            }}
          />
        )}
      {session?.role === "industry" &&
        (!session.company_location ||
          !session.company_capabilities ||
          !session.csr_support_areas) && (
          <IndustryProfileSetup
            session={session}
            toast={toast}
            onBack={logout}
            onComplete={(profile) => {
              const nextSession = { ...session, ...profile };
              setSession(nextSession);
              localStorage.setItem("ss_session", JSON.stringify(nextSession));
            }}
          />
        )}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 bg-pine-900 text-paper px-3 py-2 rounded-sm text-sm font-bold"
      >
        Skip to content
      </a>

      {/* ---------- Signed out: gate ---------- */}
      {!session && (
        <>
          <div className="sticky top-0 z-[60] bg-paper/95 backdrop-blur border-b border-ink/10">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
              <span className="flex items-center gap-2.5 font-display font-extrabold text-lg tracking-tight text-ink">
                <span className="w-8 h-8 rounded-sm bg-pine-900 text-marigold-400 flex items-center justify-center">
                  <Icon name="bridge" className="w-5 h-5" sw={2} />
                </span>
                Samadhan Setu
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold tracking-widest uppercase text-ink-soft"
                  title={
                      backendOnline === true
                      ? hi
                        ? "Python बैकएंड से जुड़ा है"
                        : "Connected to Python backend"
                        : backendOnline === false
                          ? hi
                        ? "बैकएंड ऑफ़लाइन है"
                        : "Backend offline"
                          : hi
                            ? "बैकएंड जांचा जा रहा है"
                            : "Checking backend"
                  }
                >
                  <span
                    className={cx(
                      "relative inline-flex w-2 h-2 rounded-full pulse-dot",
                      backendOnline === true
                        ? "bg-moss-500 text-moss-500"
                        : backendOnline === false
                          ? "bg-brick-500 text-brick-500"
                          : "bg-marigold-400 text-marigold-400",
                    )}
                  />
                  {backendOnline === true
                    ? hi
                      ? "पोर्टल चालू है"
                      : "Portal online"
                    : backendOnline === false
                      ? hi
                        ? "ऑफ़लाइन"
                        : "Offline"
                      : hi
                        ? "जांच जारी है"
                        : "Checking"}
                </span>
                <div
                  className="language-toggle language-toggle-light"
                  role="group"
                  aria-label={hi ? "भाषा चुनें" : "Choose language"}
                >
                  {(["en", "hi"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      aria-pressed={lang === l}
                      className={cx(
                        "language-option language-option-light",
                        lang === l && "language-option-light-active",
                      )}
                    >
                      {l === "en" ? "EN" : "हिं"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Gate
            lang={lang}
            onLogin={login}
            publicChallenges={publicChallenges}
          />
          <footer className="mt-4 bg-pine-925 text-paper/75">
            <FooterLine hi={hi} />
          </footer>
        </>
      )}

      {/* ---------- Signed in ---------- */}
      {session && (
        <>
          {/* Masthead */}
          <header className="relative masthead-gradient text-paper overflow-hidden">
            <img
              src={IMG.mural}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-pine-925/50 via-pine-925/75 to-pine-925" />
            <div
              className="h-2 w-full relative"
              style={{
                background:
                  "linear-gradient(90deg,#FF9933 0 33.3%,#F2F0E5 33.3% 66.6%,#2E7D4F 66.6% 100%)",
              }}
            />
            <div className="relative max-w-7xl mx-auto px-4 md:px-6 flex flex-wrap items-center gap-x-6 gap-y-3 py-3.5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-sm bg-marigold-500 text-pine-925 flex items-center justify-center shadow-[3px_3px_0_rgba(0,0,0,0.35)]">
                  <Icon name="bridge" className="w-6 h-6" sw={2} />
                </span>
                <div>
                  <p className="font-display font-extrabold text-lg leading-none tracking-tight">
                    Samadhan Setu
                  </p>
                  <p className="text-[9.5px] font-bold tracking-[0.26em] uppercase text-marigold-300 mt-0.5">
                    समाधान सेतु · Govt. of Jharkhand
                  </p>
                </div>
              </div>
              {isGovt && (
                <p className="hidden md:block text-[12.5px] font-semibold text-paper/85 border-l border-paper/20 pl-5 max-w-md">
                  {hi
                    ? "समस्या पहचान → मूल्यांकन → विश्वविद्यालय आवंटन → समाधान → परीक्षण → तैनाती → प्रभाव"
                    : "Problem identification → evaluation → university assignment → solution → testing → deployment → impact"}
                </p>
              )}
              <div className="ml-auto flex items-center gap-2">
                <span
                  className="hidden sm:inline-flex items-center gap-1.5 text-[10.5px] font-extrabold tracking-widest uppercase text-ink-soft"
                  title={
                    backendOnline === true
                      ? hi
                        ? "Python बैकएंड से जुड़ा है"
                        : "Connected to Python backend"
                      : backendOnline === false
                        ? hi
                          ? "बैकएंड ऑफ़लाइन है"
                          : "Backend offline"
                        : hi
                          ? "बैकएंड जांचा जा रहा है"
                          : "Checking backend"
                  }
                >
                  <span
                    className={cx(
                      "relative inline-flex w-2 h-2 rounded-full pulse-dot",
                      backendOnline === true
                        ? "bg-marigold-400 text-marigold-400"
                        : backendOnline === false
                          ? "bg-brick-500 text-brick-500"
                          : "bg-marigold-400 text-marigold-400",
                    )}
                  />
                  {backendOnline === true
                    ? t("live")
                    : backendOnline === false
                      ? hi
                        ? "ऑफ़लाइन"
                        : "Offline"
                      : hi
                        ? "जांच जारी है"
                        : "Checking"}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setBellOpen((o) => !o)}
                    aria-label="Notifications"
                    className="relative w-9 h-9 rounded-sm bg-paper/10 hover:bg-paper/20 flex items-center justify-center transition-colors"
                  >
                    <Icon name="bell" className="w-[18px] h-[18px]" sw={2} />
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-0.5 rounded-full bg-brick-500 text-paper text-[9.5px] font-extrabold flex items-center justify-center tabular">
                        {unread}
                      </span>
                    )}
                  </button>
                  {bellOpen && (
                    <div className="absolute right-0 top-11 w-[340px] max-w-[92vw] bg-card text-ink border border-ink/10 rounded-md shadow-[8px_8px_0_rgba(11,44,33,0.15)] z-[70] rise-in overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink/10 bg-pine-100/60">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-pine-800">
                          {hi ? "सूचनाएँ" : "Notifications"}
                        </p>
                        <button
                          onClick={() =>
                            setNotifs((ns) =>
                              ns.map((n) => ({ ...n, read: true })),
                            )
                          }
                          className="text-[11px] font-bold text-brick-600 hover:underline"
                        >
                          {hi ? "सभी पढ़ी हुई करें" : "Mark all read"}
                        </button>
                      </div>
                      <div className="max-h-[380px] overflow-y-auto">
                        {notifs.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setNotifs((ns) =>
                                ns.map((item) =>
                                  item.id === n.id
                                    ? { ...item, read: true }
                                    : item,
                                ),
                              );
                              setActiveNotification(n);
                            }}
                            className={cx(
                              "w-full text-left flex gap-3 px-4 py-3 border-b border-ink/8 last:border-0 hover:bg-pine-100/50 transition-colors",
                              !n.read && "bg-marigold-500/8",
                            )}
                          >
                            <span
                              className={cx(
                                "w-8 h-8 rounded-sm flex items-center justify-center shrink-0 mt-0.5",
                                n.read
                                  ? "bg-ink/6 text-ink-soft"
                                  : "bg-pine-900 text-marigold-400",
                              )}
                            >
                              <Icon name={n.icon} className="w-4 h-4" sw={2} />
                            </span>
                            <div>
                              <p className="text-[12.5px] font-semibold leading-snug">
                                {n.text}
                              </p>
                              <p className="text-[10.5px] font-bold text-ink-soft tabular mt-0.5">
                                {n.time}
                              </p>
                            </div>
                            {!n.read && (
                              <span className="ml-auto w-2 h-2 rounded-full bg-brick-500 shrink-0 mt-1.5" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="language-toggle language-toggle-dark"
                  role="group"
                  aria-label={hi ? "भाषा चुनें" : "Choose language"}
                >
                  {(["en", "hi"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      aria-pressed={lang === l}
                      className={cx(
                        "language-option",
                        lang === l && "language-option-active",
                      )}
                    >
                      {l === "en" ? "EN" : "हिं"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {isGovt && <Ticker />}
          </header>

          {/* Nav / role bar */}
          {isGovt ? (
            <nav className="sticky top-0 z-[60] bg-paper/95 backdrop-blur border-b-2 border-pine-900/15">
              <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-1 overflow-x-auto">
                {(session?.stateRole === "state_nodal_officer"
                  ? [
                      [
                        "dashboard",
                        "All Complaints + Escalation + Monitoring",
                        "chart",
                      ],
                    ]
                  : [
                      ["dashboard", t("nav_dashboard"), "chart"],
                      ["registry", t("nav_registry"), "doc"],
                      ["unis", t("nav_unis"), "edu"],
                      ["industry", t("nav_industry"), "factory"],
                      ["projects", t("nav_projects"), "target"],
                      ["impact", t("nav_impact"), "trend"],
                      [
                        "ledger",
                        hi ? "लेजर व सुरक्षा" : "Ledger & Trust",
                        "lock",
                      ],
                    ]
                ).map(([v, label, ic]) => (
                  <button
                    key={v}
                    onClick={() => goto(v as string)}
                    className={cx(
                      "relative shrink-0 inline-flex items-center gap-1.5 px-3.5 py-3 text-[13px] font-bold transition-colors",
                      view === v
                        ? "text-pine-900"
                        : "text-ink-soft hover:text-pine-800",
                    )}
                  >
                    <Icon name={ic as string} className="w-4 h-4" sw={2.2} />
                    {label}
                    <span
                      className={cx(
                        "absolute left-2 right-2 -bottom-[2px] h-[3px] rounded-t-sm transition-all",
                        view === v ? "bg-marigold-500" : "bg-transparent",
                      )}
                    />
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2 py-1.5 pl-3">
                  <button
                    onClick={goBack}
                    disabled={!viewHistory.length}
                    aria-label={hi ? "पिछले पेज पर जाएँ" : "Go back"}
                    className="inline-flex items-center gap-1.5 border border-ink/15 text-ink-soft hover:text-pine-800 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-sm text-[11px] font-extrabold"
                  >
                    <Icon
                      name="arrowR"
                      className="w-3.5 h-3.5 rotate-180"
                      sw={2.2}
                    />
                    {hi ? "वापस" : "Back"}
                  </button>
                  <RoleBadge session={session} lang={lang} />
                  {session?.stateRole !== "state_nodal_officer" && (
                    <button
                      onClick={() => goto("submit")}
                      className="inline-flex items-center gap-1.5 bg-marigold-500 hover:bg-marigold-400 text-pine-925 font-extrabold text-[12.5px] px-3.5 py-2 rounded-sm shadow-[3px_3px_0_rgba(11,44,33,0.85)] hover:-translate-y-0.5 transition-all"
                    >
                      <Icon name="plus" className="w-4 h-4" sw={2.5} />
                      {t("btn_submit")}
                    </button>
                  )}
                  <button
                    onClick={logout}
                    aria-label="Sign out"
                    className="w-9 h-9 rounded-sm border border-ink/15 text-ink-soft hover:text-brick-600 hover:border-brick-500/50 flex items-center justify-center transition-colors"
                  >
                    <Icon name="logout" className="w-4 h-4" sw={2} />
                  </button>
                </div>
              </div>
            </nav>
          ) : session.role === "citizen" ? (
            <nav className="sticky top-0 z-[60] bg-paper/95 backdrop-blur border-b-2 border-pine-900/15">
              <div className="max-w-7xl mx-auto px-4 md:px-6 h-[54px] flex items-center gap-1 overflow-x-auto">
                {[
                  ["dashboard", hi ? "डैशबोर्ड" : "Dashboard", "chart"],
                  [
                    "citizen_review",
                    hi ? "समस्या समीक्षा" : "Problem review",
                    "eye",
                  ],
                  ["submit", hi ? "Report" : "Report a problem", "plus"],
                  ["profile", hi ? "प्रोफाइल" : "Profile", "user"],
                ].map(([v, label, ic]) => (
                  <button
                    key={v}
                    onClick={() => goto(v)}
                    className={cx(
                      "relative shrink-0 inline-flex items-center gap-1.5 px-3.5 py-3 text-[13px] font-bold",
                      view === v
                        ? "text-pine-900"
                        : "text-ink-soft hover:text-pine-800",
                    )}
                  >
                    <Icon name={ic} className="w-4 h-4" sw={2.2} />
                    {label}
                    <span
                      className={cx(
                        "absolute left-2 right-2 -bottom-[2px] h-[3px] rounded-t-sm",
                        view === v ? "bg-marigold-500" : "bg-transparent",
                      )}
                    />
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2 py-1.5 pl-3">
                  <button
                    onClick={goBack}
                    disabled={!viewHistory.length}
                    aria-label={hi ? "पिछले पेज पर जाएँ" : "Go back"}
                    className="inline-flex items-center gap-1.5 border border-ink/15 text-ink-soft hover:text-pine-800 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-sm text-[11px] font-extrabold"
                  >
                    <Icon
                      name="arrowR"
                      className="w-3.5 h-3.5 rotate-180"
                      sw={2.2}
                    />
                    {hi ? "वापस" : "Back"}
                  </button>
                  <RoleBadge session={session} lang={lang} />
                  <button
                    onClick={logout}
                    className="w-9 h-9 rounded-sm border border-ink/15 text-ink-soft hover:text-brick-600 flex items-center justify-center"
                  >
                    <Icon name="logout" className="w-4 h-4" sw={2} />
                  </button>
                </div>
              </div>
            </nav>
          ) : (
            <div className="sticky top-0 z-[60] bg-paper/95 backdrop-blur border-b-2 border-pine-900/15">
              <div className="max-w-7xl mx-auto px-4 md:px-6 h-[54px] flex items-center gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-soft hidden sm:block">
                  {hi ? "भूमिका-आधारित पहुँच" : "Role-based access"} ·
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-extrabold text-pine-800">
                  <Icon
                    name={ROLE_LABEL[session.role].icon}
                    className="w-4 h-4"
                    sw={2.2}
                  />
                  {session.role === "university"
                    ? t("desk_uni")
                    : session.role === "industry"
                      ? t("desk_ind")
                      : session.role === "local_worker"
                        ? `${CITY_PORTAL_PROFILES[session.cityDesk || session.city_desk || "city_admin"].title}`
                        : session.role === "field_verifier"
                          ? "Field Verification Dashboard"
                          : "Government Portal"}
                  <span className="text-[10px] font-extrabold text-ink-soft">
                    {hi ? "केवल" : "only"}
                  </span>
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {(isFieldVerifier ||
                    session.cityDesk === "department_officer" ||
                    session.city_desk === "department_officer") && (
                    <button
                      onClick={() => goto("report_center")}
                      className={cx(
                        "inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-sm text-[11px] font-extrabold",
                        view === "report_center"
                          ? "border-pine-800 bg-pine-100 text-pine-900"
                          : "border-ink/15 text-ink-soft hover:text-pine-800",
                      )}
                    >
                      <Icon name="doc" className="w-3.5 h-3.5" sw={2.2} />
                      {hi ? "रिपोर्ट सेंटर" : "Report Center"}
                    </button>
                  )}
                  <button
                    onClick={goBack}
                    disabled={!viewHistory.length}
                    aria-label={hi ? "पिछले पेज पर जाएँ" : "Go back"}
                    className="inline-flex items-center gap-1.5 border border-ink/15 text-ink-soft hover:text-pine-800 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-sm text-[11px] font-extrabold"
                  >
                    <Icon
                      name="arrowR"
                      className="w-3.5 h-3.5 rotate-180"
                      sw={2.2}
                    />
                    {hi ? "वापस" : "Back"}
                  </button>
                  <RoleBadge session={session} lang={lang} />
                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ink-soft hover:text-brick-600 border border-ink/15 hover:border-brick-500/50 px-3 py-1.5 rounded-sm transition-colors"
                  >
                    <Icon name="logout" className="w-3.5 h-3.5" sw={2.2} />
                    {hi ? "साइन-आउट" : "Sign out"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <main id="main">
            {session.role === "citizen" && view === "dashboard" && (
              <CitizenDashboard
                challenges={challenges}
                session={session}
                lang={lang}
                toast={toast}
                patch={patch}
                onSubmit={() => goto("submit")}
                onReview={() => goto("citizen_review")}
                onComplaint={() => {
                  setComplaintOpen(true);
                  goto("citizen_review");
                }}
              />
            )}
            {session.role === "citizen" && view === "citizen_review" && (
              <CitizenDesk
                t={t}
                lang={lang}
                session={session}
                challenges={challenges}
                patch={patch}
                addChallenge={addChallenge}
                toast={toast}
                notif={notif}
                openComplaint={complaintOpen}
              />
            )}
            {session.role === "citizen" && view === "profile" && (
              <CitizenProfile session={session} lang={lang} toast={toast} challenges={challenges} />
            )}
            {session.role === "citizen" && view === "submit" && (
              <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <SubmitChallenge
                  t={t}
                  lang={lang}
                  challenges={challenges}
                  patch={patch}
                  addChallenge={addChallenge}
                  toast={toast}
                  notif={notif}
                  voiceBy={session.name}
                  sessionToken={session.token}
                />
              </div>
            )}
            {session.role === "university" && (
              <UniversityDesk
                t={t}
                lang={lang}
                session={session}
                challenges={challenges}
                patch={patch}
                toast={toast}
                notif={notif}
              />
            )}
            {session.role === "industry" && (
              <IndustryDesk
                t={t}
                lang={lang}
                session={session}
                challenges={challenges}
                patch={patch}
                toast={toast}
                notif={notif}
              />
            )}
            {isGovt && (
              <>
                {session.stateRole === "state_nodal_officer" && (
                  <StateNodalOfficerDashboard
                    challenges={challenges}
                    lang={lang}
                  />
                )}
                {session.stateRole !== "state_nodal_officer" &&
                  view === "dashboard" && (
                    <Dashboard
                      t={t}
                      lang={lang}
                      challenges={challenges}
                      goto={goto}
                      patch={patch}
                      toast={toast}
                      session={session}
                      activeUniversityIds={activeUniversityIds}
                      activeUniversities={activeUniversities}
                      activeIndustries={activeIndustries}
                    />
                  )}
                {session.stateRole !== "state_nodal_officer" &&
                  view === "registry" && (
                    <Registry
                      key={JSON.stringify(regFilter)}
                      t={t}
                      challenges={challenges}
                      patch={patch}
                      toast={toast}
                      notif={notif}
                      session={session}
                      activeUniversityIds={activeUniversityIds}
                      initial={regFilter}
                    />
                  )}
                {session.stateRole !== "state_nodal_officer" &&
                  view === "unis" && (
                    <Universities
                      t={t}
                      lang={lang}
                      goto={goto}
                      challenges={challenges}
                      activeUniversityIds={activeUniversityIds}
                      activeUniversities={activeUniversities}
                    />
                  )}
                {session.stateRole !== "state_nodal_officer" &&
                  view === "industry" && (
                    <Industry
                      t={t}
                      lang={lang}
                      toast={toast}
                      notif={notif}
                      goto={goto}
                      activeIndustries={activeIndustries}
                    />
                  )}
                {session.stateRole !== "state_nodal_officer" &&
                  view === "projects" && (
                    <Projects
                      t={t}
                      challenges={challenges}
                      patch={patch}
                      toast={toast}
                      notif={notif}
                      goto={goto}
                    />
                  )}
                {session.stateRole !== "state_nodal_officer" &&
                  view === "impact" && (
                    <Impact
                      t={t}
                      challenges={challenges}
                      toast={toast}
                      notif={notif}
                    />
                  )}
                {session.stateRole !== "state_nodal_officer" &&
                  view === "ledger" && (
                    <Ledger lang={lang} toast={toast} session={session} />
                  )}
                {session.stateRole !== "state_nodal_officer" &&
                  view === "submit" && (
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 view-in">
                      <div className="rise-in">
                        <SubmitChallenge
                          t={t}
                          lang={lang}
                          challenges={challenges}
                          patch={patch}
                          addChallenge={addChallenge}
                          toast={toast}
                          notif={notif}
                          onSuccess={() => setView("submit")}
                          onReset={() => setView("submit")}
                        />
                      </div>
                    </div>
                  )}
              </>
            )}
            {isLocalWorker && !isFieldVerifier && view !== "report_center" && (
              <CityGovernmentDashboard
                challenges={challenges}
                session={session}
                patch={patch}
                toast={toast}
                hi={hi}
              />
            )}
            {isFieldVerifier && view !== "report_center" && (
              <FieldVerificationDesk
                challenges={challenges}
                session={session}
                patch={patch}
                toast={toast}
                hi={hi}
              />
            )}
            {(isFieldVerifier ||
              session.cityDesk === "department_officer" ||
              session.city_desk === "department_officer") &&
              view === "report_center" && (
                <ReportCenter
                  challenges={challenges}
                  session={session}
                  patch={patch}
                  toast={toast}
                  hi={hi}
                />
              )}
          </main>

          {activeNotification && (
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-pine-925/55 backdrop-blur-[3px] p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="notification-title"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setActiveNotification(null);
              }}
            >
              <div className="w-full max-w-md bg-card text-ink border border-ink/10 rounded-md shadow-[8px_8px_0_rgba(11,44,33,.18)] overflow-hidden rise-in">
                <div className="flex items-start justify-between gap-3 p-5 border-b border-ink/10 bg-pine-100/60">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-sm bg-pine-900 text-marigold-400 flex items-center justify-center">
                      <Icon
                        name={activeNotification.icon}
                        className="w-5 h-5"
                        sw={2.2}
                      />
                    </span>
                    <div>
                      <p
                        id="notification-title"
                        className="font-display font-extrabold text-lg"
                      >
                        {hi ? "सूचना विवरण" : "Notification detail"}
                      </p>
                      <p className="text-[10px] font-bold text-ink-soft">
                        {activeNotification.time}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveNotification(null)}
                    aria-label={hi ? "बंद करें" : "Close notification"}
                    className="w-8 h-8 rounded-sm border border-ink/15 text-ink-soft hover:text-brick-600 flex items-center justify-center"
                  >
                    <Icon name="x" className="w-4 h-4" sw={2.2} />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold leading-relaxed">
                    {activeNotification.text}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-pine-700">
                      <span className="w-2 h-2 rounded-full bg-moss-500" />
                      {hi ? "Citizen portal update" : "Citizen portal update"}
                    </span>
                    <button
                      onClick={() => setActiveNotification(null)}
                      className="bg-pine-800 text-paper px-4 py-2 rounded-sm text-xs font-extrabold"
                    >
                      {hi ? "ठीक है" : "Got it"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setHelpOpen(true)}
            aria-label={hi ? "मदद खोलें" : "Open help"}
            className="fixed right-5 bottom-5 z-[90] inline-flex items-center gap-2 bg-brick-600 hover:bg-brick-500 text-paper px-4 py-3 rounded-full shadow-[4px_4px_0_rgba(11,44,33,.2)] text-xs font-extrabold"
          >
            <Icon name="help" className="w-4 h-4" sw={2.3} />
            {hi ? "मदद" : "Help"}
          </button>
          {helpOpen && (
            <div
              className="fixed inset-0 z-[190] flex items-end sm:items-center justify-center bg-pine-925/45 backdrop-blur-[2px] p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-title"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setHelpOpen(false);
              }}
            >
              <div className="w-full max-w-lg bg-card text-ink border border-ink/10 rounded-md shadow-[8px_8px_0_rgba(11,44,33,.18)] overflow-hidden rise-in">
                <div className="p-5 bg-pine-100/70 border-b border-ink/10 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-pine-700">
                      {hi ? "नागरिक सहायता" : "Citizen help"}
                    </p>
                    <h2
                      id="help-title"
                      className="font-display font-extrabold text-2xl mt-1"
                    >
                      {hi ? "हम आपकी मदद के लिए हैं" : "We are here to help"}
                    </h2>
                  </div>
                  <button
                    onClick={() => setHelpOpen(false)}
                    aria-label={hi ? "बंद करें" : "Close help"}
                    className="w-8 h-8 rounded-sm border border-ink/15 text-ink-soft flex items-center justify-center"
                  >
                    <Icon name="x" className="w-4 h-4" sw={2.2} />
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  <a
                    href="tel:18003450420"
                    className="flex items-center justify-between gap-3 bg-brick-600 text-paper rounded-sm px-4 py-3 font-extrabold"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon name="phone" className="w-4 h-4" sw={2.2} />
                      {hi ? "Toll-free सहायता" : "Toll-free support"}
                    </span>
                    <span>1800-345-0420</span>
                  </a>
                  <div className="grid sm:grid-cols-2 gap-2 text-[11px] font-bold">
                    <div className="bg-paper border border-ink/10 rounded-sm p-3">
                      <b>{hi ? "शिकायत कैसे करें" : "How to complain"}</b>
                      <p className="text-ink-soft mt-1">
                        {hi
                          ? "समस्या दर्ज करें → फोटो/स्थान जोड़ें → Submit दबाएँ → ID संभालकर रखें।"
                          : "Submit problem → add photo/location → press Submit → keep your complaint ID."}
                      </p>
                    </div>
                    <div className="bg-paper border border-ink/10 rounded-sm p-3">
                      <b>FAQ</b>
                      <p className="text-ink-soft mt-1">
                        {hi
                          ? "ID से status देखें और कार्रवाई न होने पर शिकायत दर्ज करें।"
                          : "Track with your ID and file a follow-up complaint if no action is taken."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const text = hi
                        ? "समस्या दर्ज करें, अपनी शिकायत आईडी सुरक्षित रखें और स्थिति देखने के लिए Problem Review खोलें।"
                        : "Submit your problem, keep the complaint ID safe, and open Problem Review to track its status.";
                      window.speechSynthesis?.cancel();
                      window.speechSynthesis?.speak(
                        new SpeechSynthesisUtterance(text),
                      );
                    }}
                    className="inline-flex items-center gap-2 text-[11px] font-extrabold text-pine-800 border border-pine-700/25 px-3 py-2 rounded-sm"
                  >
                    <Icon name="volume" className="w-4 h-4" sw={2.2} />
                    {hi ? "यह सहायता पढ़कर सुनाएँ" : "Read this help aloud"}
                  </button>
                  <p className="text-[10px] text-ink-soft">
                    {hi
                      ? "Human support: State Innovation Mission, Ranchi"
                      : "Human support: State Innovation Mission, Ranchi"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <footer className="mt-14 bg-pine-925 text-paper/75">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid md:grid-cols-3 gap-6 text-[12.5px] font-medium leading-relaxed">
              <div>
                <p className="font-display font-extrabold text-paper text-base tracking-tight mb-2">
                  Samadhan Setu · समाधान सेतु
                </p>
                <p>
                  {hi
                    ? "झारखंड का नागरिक-विश्वविद्यालय-उद्योग-सरकार नवाचार सेतु। NEP 2020 के अनुभवात्मक शिक्षा और सामुदायिक जुड़ाव के लक्ष्यों के अनुरूप।"
                    : "Jharkhand's citizen–university–industry–government innovation bridge. Aligned with NEP 2020's experiential learning and community engagement goals."}
                </p>
              </div>
              <div>
                <p className="font-bold text-paper mb-2 uppercase tracking-widest text-[10.5px]">
                  {hi ? "पाइपलाइन" : "Pipeline"}
                </p>
                <p>
                  {hi
                    ? "समस्या पहचान → एआई मूल्यांकन → HEI आवंटन → समाधान विकास → उद्योग सहयोग → परीक्षण → तैनाती → प्रभाव मापन"
                    : "Problem identification → AI evaluation → HEI assignment → solution development → industry collaboration → testing → deployment → impact measurement"}
                </p>
              </div>
              <div>
                <p className="font-bold text-paper mb-2 uppercase tracking-widest text-[10.5px]">
                  {hi ? "संपर्क" : "Contact"}
                </p>
                <p>
                  State Innovation Mission, Ranchi
                  <br />
                  Toll-free: 1800-345-0420 ·{" "}
                  {hi
                    ? "वेब व मोबाइल दोनों पर उपलब्ध"
                    : "Available on web & mobile"}
                  <br />
                  {hi
                    ? "24 ज़िले · 10 विषय · 10 HEI · 9 उद्योग साझेदार"
                    : "24 districts · 10 domains · 10 HEIs · 9 industry partners"}
                </p>
              </div>
            </div>
            <div
              className="h-1.5 w-full"
              style={{
                background:
                  "linear-gradient(90deg,#FF9933 0 33.3%,#F2F0E5 33.3% 66.6%,#2E7D4F 66.6% 100%)",
              }}
            />
          </footer>
        </>
      )}

      {/* Toasts */}
      <div className="fixed bottom-5 left-5 z-[95] space-y-2 max-w-[92vw]">
        {toasts.map((x) => (
          <div
            key={x.id}
            className="bg-pine-925 text-paper border-l-4 border-marigold-500 px-4 py-3 rounded-sm shadow-[6px_6px_0_rgba(11,44,33,0.25)] text-[13px] font-bold flex items-center gap-2.5 rise-in"
          >
            <Icon
              name="check"
              className="w-4 h-4 text-marigold-400 shrink-0"
              sw={2.6}
            />
            {x.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleBadge({ session, lang }: { session: Session; lang: Lang }) {
  const r = ROLE_LABEL[session.role];
  const colors: Record<Role, string> = {
    citizen: "#2E7D4F",
    university: "#2E6FB7",
    industry: "#DE9B12",
    govt: "#CE4A3B",
    local_worker: "#B4692F",
    field_verifier: "#557085",
    state_admin: "#CE4A3B",
    state_nodal_officer: "#A23B4B",
    department_head: "#2E6FB7",
    district_officer: "#B4692F",
    resolution_officer: "#2E7D4F",
    field_officer: "#557085",
    auditor: "#4E5D6B",
  };
  return (
    <span
      className="inline-flex items-center gap-2 bg-card border border-ink/15 rounded-sm pl-1.5 pr-2.5 py-1"
      title={session.org}
    >
      <span
        className="w-6 h-6 rounded-sm text-paper flex items-center justify-center"
        style={{ background: colors[session.role] }}
      >
        <Icon name={r.icon} className="w-3.5 h-3.5" sw={2.2} />
      </span>
      <span className="text-left leading-tight hidden sm:block">
        <span className="block text-[11.5px] font-extrabold text-ink">
          {session.name}
        </span>
        <span className="block text-[9px] font-extrabold uppercase tracking-widest text-ink-soft">
          {r[lang]} · {session.sub ?? session.org.split(",")[0]}
        </span>
      </span>
    </span>
  );
}

function Ticker() {
  const items: { text: string }[] = [];
  const Half = ({ aria }: { aria?: boolean }) => (
    <div className="flex items-center gap-8 pr-8 shrink-0" aria-hidden={aria}>
      {items.map((a, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-2 text-[11.5px] font-semibold text-paper/85 whitespace-nowrap"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-marigold-400 shrink-0" />
          {a.text}
        </span>
      ))}
      <span className="inline-flex items-center gap-2 text-[11.5px] font-extrabold text-marigold-300 whitespace-nowrap tracking-widest uppercase">
        Live civic problem network
      </span>
    </div>
  );
  return (
    <div className="relative bg-pine-800 border-t border-paper/10 overflow-hidden ticker">
      <div className="ticker-track flex w-max py-2 pl-4">
        <Half />
        <Half aria />
      </div>
    </div>
  );
}

function FooterLine({ hi }: { hi: boolean }) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 text-[12px] font-medium flex flex-wrap gap-3 justify-between">
      <span>
        Samadhan Setu ·{" "}
        {hi
          ? "झारखंड सरकार की नवाचार पहल"
          : "Innovation initiative of the Government of Jharkhand"}
      </span>
      <span>
        {hi ? "हेल्पलाइन 1800-345-0420" : "Toll-free helpline 1800-345-0420"}
      </span>
    </div>
  );
}
