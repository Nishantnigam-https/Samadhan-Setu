"""
Open-source AI engine for Samadhan Setu.

This talks to a locally-running Ollama server (https://ollama.com) so the
"AI" in problem classification and the voice assistant is a real open-source
LLM (Llama 3, Mistral, Gemma, etc.) running entirely on your own machine —
no API key, no per-request cost, no data leaving the server.

Design goals:
- Zero setup required to run the app. If Ollama isn't installed or isn't
  running, every function here falls back to the original fast, deterministic
  keyword-based logic automatically. Nothing breaks either way.
- Never trust the model blindly. Every LLM response is parsed defensively
  and validated against the same domain/priority rules the rest of the app
  expects, so a malformed or hallucinated reply can't corrupt app state.
- No new external dependency beyond `requests`, which is already extremely
  common and lightweight.

Configuration (backend/.env):
  AI_ENGINE=ollama            # "ollama" to try the local LLM first, "keyword" to force the fallback only
  OLLAMA_BASE_URL=http://127.0.0.1:11434
  OLLAMA_MODEL=llama3.1       # any model you've pulled with `ollama pull <model>`
  AI_TIMEOUT_SECONDS=12
  OLLAMA_API_KEY=             # optional — sent as "Authorization: Bearer <key>" when
                              # OLLAMA_BASE_URL points at a remote server sitting behind
                              # a reverse proxy that checks this header (Ollama itself has
                              # no built-in auth, so a remote/public Ollama should never be
                              # exposed without one — see SETUP.md).
"""
import json
import logging
import os
import re
from typing import Any, Dict, List, Optional

import requests

logger = logging.getLogger("samadhan_setu.ai")

AI_ENGINE = os.getenv("AI_ENGINE", "ollama").strip().lower()  # "ollama" or "keyword"
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b").strip()
AI_TIMEOUT_SECONDS = float(os.getenv("AI_TIMEOUT_SECONDS", "12"))
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "").strip()

DOMAINS: Dict[str, List[str]] = {
    "education": ["school","teacher","classroom","student","education","dropout","anganwadi","library","exam","literacy"],
    "healthcare": ["hospital","doctor","medicine","health","clinic","phc","ambulance","vaccination","malnutrition","disease","treatment","nurse"],
    "agriculture": ["farmer","crop","irrigation","fertilizer","seed","soil","mandi","drought","pest","kisan","kheti","yield","tank","canal"],
    "water": ["water","drinking","tap","handpump","borewell","river","dam","groundwater","arsenic","pond","well","contaminated","jal"],
    "environment": ["forest","tree","pollution","air","garbage","waste","mining","deforestation","wildlife","coal","fire","smoke","fumes"],
    "energy": ["electricity","power","solar","transformer","streetlight","outage","bijli","grid","renewable","biogas","voltage","cuts"],
    "urban": ["drain","sewage","traffic","street","parking","slum","municipality","footpath","pothole","waterlogging","underpass","drainage","sewer","city"],
    "accessibility": ["road","bridge","transport","bus","rail","connectivity","wheelchair","disabled","ramp","highway","travel"],
    "administration": ["panchayat","certificate","pension","scheme","ration","aadhaar","service","office","portal","grievance","delay","documents"],
    "livelihoods": ["skill","employment","shg","handicraft","handloom","weaving","weavers","mushroom","lac","tussar","silk","fisheries","poultry","income","wage","mgnrega","storage"],
}
URGENCY_WORDS = ["urgent","emergency","danger","death","critical","arsenic","fire","contaminated","outage","no doctor"]
VALID_DOMAINS = set(DOMAINS.keys())
VALID_ACTIONS = {"open_submit_problem", "open_my_problems", "help", "clarify"}

# --------------------------------------------------------------------------
# Step 2 of classification: once a broad DOMAIN is picked (above), route to
# one specific government department/authority within that domain. This is
# the detailed department directory (municipal corporation, PWD, panchayati
# raj, water resources, etc.) mapped onto the 10 existing broad domains so
# none of the domain-driven UI (colors, filters, analytics) has to change.
# The first entry in each domain's list is that domain's default/catch-all
# department, used when no specific keyword match is found.
# --------------------------------------------------------------------------
DEPARTMENTS_BY_DOMAIN: Dict[str, List[Any]] = {
    "urban": [
        ("Municipal Corporation / Municipality / Nagar Parishad", ["municipal road","garbage","drain","overflowing drain","public bench","dirty public","illegal dumping","pothole","street cleanliness","municipal","nagar parishad"]),
        ("Urban Development & Housing Department", ["urban drainage","street infrastructure","municipal service","public space","housing","slum","urban development"]),
        ("Traffic Police", ["traffic signal","illegal parking","traffic obstruction","dangerous driving","traffic jam","signal malfunction"]),
        ("Art, Culture & Sports Department", ["sports ground","playground","stadium","cultural facility","community hall"]),
    ],
    "accessibility": [
        ("PWD / Road Construction Department", ["pwd road","bridge","damaged bridge","road crack","culvert","road maintenance","state highway"]),
        ("Rural Development Department", ["rural road","village drainage","rural infrastructure","kutcha road"]),
        ("Transport Department", ["bus permit","bus service","vehicle permit","transport service","auto rickshaw"]),
    ],
    "water": [
        ("Water Resources Department", ["canal","embankment","irrigation channel","water flow","dam","barrage"]),
        ("Drinking Water & Sanitation Department", ["public tap","leaking pipeline","water supply","contaminated water","irregular supply","handpump","borewell"]),
        ("Public Health Engineering / Water Supply Authority", ["drinking water infrastructure","pipeline leakage","water supply failure","phe"]),
    ],
    "energy": [
        ("Electricity Distribution Company / Energy Department", ["electric pole","damaged wire","transformer","streetlight","power outage","voltage","bijli"]),
    ],
    "healthcare": [
        ("Health Department", ["health centre","phc","government hospital","medicine availability","hospital sanitation","asha worker","nurse","doctor absent"]),
    ],
    "education": [
        ("Education Department", ["classroom","school toilet","school water","school furniture","school electricity","midday meal","teacher"]),
        ("Higher Education Department", ["government college","college infrastructure","university facility","higher education"]),
    ],
    "agriculture": [
        ("Agriculture Department", ["seed distribution","fertilizer","agricultural service","irrigation scheme","crop insurance","kisan"]),
        ("Animal Husbandry Department", ["veterinary","vaccination camp","livestock service","cattle","animal husbandry"]),
    ],
    "environment": [
        ("Forest Department", ["illegal tree cutting","forest encroachment","forest fire","forest infrastructure","deforestation"]),
        ("Environment Department / Pollution Control Board", ["pollution","industrial discharge","excessive smoke","noise pollution","illegal dumping","air quality"]),
    ],
    "livelihoods": [
        ("Skill Development Department", ["skill training centre","vocational course","skill development"]),
        ("Labour Department", ["labour law","wage payment","workplace","unpaid wages","labour dispute"]),
        ("Fisheries Department", ["fisheries","government pond","fish farming scheme","beneficiary fisheries"]),
        ("Tourism Department", ["tourism facility","tourist signage","tourist infrastructure"]),
    ],
    "administration": [
        ("District Administration / DC Office", ["inter-departmental","unresolved departmental","coordination problem","dc office"]),
        ("Panchayati Raj Department / Gram Panchayat", ["panchayat","village sanitation","community asset","gram sabha"]),
        ("Police Department", ["theft","crime","public safety","missing person","illegal activity","assault"]),
        ("Fire & Emergency Services", ["fire safety","blocked emergency access","fire hazard","fire brigade"]),
        ("Revenue / Land & Land Reforms Department", ["land record","mutation","land boundary","land encroachment","revenue office"]),
        ("Food & Civil Supplies Department", ["ration shop","ration distribution","pds","food supply"]),
        ("Social Welfare Department", ["welfare scheme","anganwadi service","pension scheme","disability benefit"]),
        ("Women & Child Development / ICDS", ["anganwadi infrastructure","nutrition service","child development","icds"]),
        ("Disaster Management Department", ["flood response","disaster relief","emergency coordination","cyclone","drought relief"]),
        ("Block Development Office (BDO)", ["block level","bdo office","block development"]),
        ("Sub-Divisional Administration (SDO)", ["sub-divisional","sdo office","multiple local departments"]),
    ],
}


def specific_department_for(domain: str, title: str, description: str) -> str:
    """Step 2 of classification: pick the single most relevant government
    department/authority within an already-classified broad domain, using
    keyword matching against the department directory above. Falls back to
    that domain's default (first-listed) department when nothing matches,
    so the result is never empty."""
    text = f"{title} {description}".lower()
    entries = DEPARTMENTS_BY_DOMAIN.get(domain) or DEPARTMENTS_BY_DOMAIN["administration"]
    best_name, best_score = entries[0][0], 0
    for name, kws in entries:
        score = sum(1 for kw in kws if kw in text)
        if score > best_score:
            best_score, best_name = score, name
    return best_name


# --------------------------------------------------------------------------
# City Government portal categories: when a report is routed straight to
# the City Government Worker (routing_decision == "city_government" — a
# normal municipal problem that needs no university research or outside
# investment), it is additionally sorted into one of these 10 everyday
# city-service categories so the portal can show a clear icon + label
# instead of a bare "City Government" tag. Deterministic keyword matching,
# same pattern as DEPARTMENTS_BY_DOMAIN above; "other_municipal" is the
# catch-all when nothing scores.
# --------------------------------------------------------------------------
CITY_CATEGORIES: List[Any] = [
    ("road_transport", "Road & Transport", ["road","pothole","footpath","pavement","bridge","traffic","parking","bus stop","bus","auto","rickshaw","highway","flyover","speed breaker","zebra crossing"]),
    ("water_drainage", "Water & Drainage", ["water","drain","drainage","sewage","sewer","pipeline","leak","leaking","waterlogging","drinking water","tap","manhole","gutter","borewell"]),
    ("waste_management", "Waste Management", ["garbage","waste","trash","dump","dumping","dustbin","litter","sanitation worker","sweeping","compost","landfill"]),
    ("street_lighting", "Street Lighting", ["streetlight","street light","street lamp","lamp post","bulb","dark street","lighting","pole light","no light"]),
    ("environment_public_spaces", "Environment & Public Spaces", ["park","garden","tree","pollution","public space","playground","green belt","bench","smoke","air quality","noise"]),
    ("public_utilities", "Public Utilities", ["electricity","power cut","power outage","gas","utility","meter","connection","wire","transformer","voltage"]),
    ("public_infrastructure", "Public Infrastructure", ["building","construction","infrastructure","boundary wall","structure","public building","market","community hall","footover bridge"]),
    ("public_safety", "Public Safety", ["safety","unsafe","accident","fire hazard","emergency","danger","hazard","stray dog","open wire","collapse risk"]),
    ("public_health_sanitation", "Public Health & Sanitation", ["health","sanitation","toilet","hygiene","disease","mosquito","dengue","malaria","unclean","public toilet"]),
    ("other_municipal", "Other Municipal Services", []),
]


def city_category_for(title: str, description: str) -> Dict[str, str]:
    """Pick the single best-matching city-portal category for a normal
    municipal problem. Falls back to 'Other Municipal Services' when no
    keyword matches, so the result is never empty."""
    text = f"{title} {description}".lower()
    best_id, best_name, best_score = CITY_CATEGORIES[-1][0], CITY_CATEGORIES[-1][1], 0
    for cat_id, name, kws in CITY_CATEGORIES:
        score = sum(1 for kw in kws if kw in text)
        if score > best_score:
            best_score, best_id, best_name = score, cat_id, name
    return {"id": best_id, "name": best_name}


# --------------------------------------------------------------------------
# Deterministic keyword fallback (the original logic) — always available,
# instant, and needs no external service.
# --------------------------------------------------------------------------
def keyword_classify(title: str, description: str) -> Dict[str, Any]:
    text = f"{title} {description}".lower()
    scores = {domain: sum(1 for kw in kws if kw in text) for domain, kws in DOMAINS.items()}
    domain = max(scores, key=scores.get) if any(scores.values()) else "administration"
    hits = [kw for kw in DOMAINS[domain] if kw in text]
    urgency_hits = [w for w in URGENCY_WORDS if w in text]
    priority = min(100, 40 + len(hits) * 8 + len(urgency_hits) * 12)
    return {
        "domain": domain,
        "confidence": round(min(0.98, 0.45 + len(hits) * 0.08), 2),
        "priority": priority,
        "matched_keywords": hits,
        "urgency_keywords": urgency_hits,
        "explanation": f"Classified as {domain} using matched problem keywords.",
        "engine": "keyword_fallback",
    }


def keyword_voice_reply(transcript: str) -> Dict[str, str]:
    text = transcript.lower().strip()
    if any(x in text for x in ["submit", "problem", "issue", "report", "समस्या", "शिकायत"]):
        return {"reply": "I can help you report a societal problem. Please describe what happened, where it happened, and who is affected.", "action": "open_submit_problem"}
    if any(x in text for x in ["status", "track", "स्थिति", "स्टेटस"]):
        return {"reply": "Open My Problems to check the current stage and latest updates of your submitted challenge.", "action": "open_my_problems"}
    if any(x in text for x in ["help", "hello", "hi", "namaste", "नमस्ते", "मदद"]):
        return {"reply": "Namaskar! I am Samadhan Setu voice assistant. You can ask me to report a problem, check status, or explain the portal.", "action": "help"}
    return {"reply": "I understood your message. Please describe the problem with location and impact, and I will guide you to the correct next step.", "action": "clarify"}


# --------------------------------------------------------------------------
# Ollama (open-source local LLM) integration
# --------------------------------------------------------------------------
def _ollama_generate(prompt: str) -> Optional[str]:
    """Call the local Ollama server. Returns the raw text response, or None
    if Ollama is unreachable, times out, or errors — callers must fall back."""
    try:
        r = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "format": "json",
                "stream": False,
                "options": {"temperature": 0.2},
            },
            headers={"Authorization": f"Bearer {OLLAMA_API_KEY}"} if OLLAMA_API_KEY else {},
            timeout=AI_TIMEOUT_SECONDS,
        )
        r.raise_for_status()
        return r.json().get("response")
    except requests.exceptions.RequestException as exc:
        logger.info("Ollama unavailable (%s) — using keyword fallback.", exc.__class__.__name__)
        return None
    except (ValueError, KeyError) as exc:
        logger.warning("Ollama returned an unexpected response shape: %s", exc)
        return None


def _extract_json(text: str) -> Optional[dict]:
    """Ollama's format=json usually returns clean JSON, but some models still
    wrap it in prose or code fences. Try straight parsing, then recover the
    first {...} block as a best effort."""
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return None
    return None


def ollama_available() -> bool:
    try:
        r = requests.get(
            f"{OLLAMA_BASE_URL}/api/tags",
            headers={"Authorization": f"Bearer {OLLAMA_API_KEY}"} if OLLAMA_API_KEY else {},
            timeout=2,
        )
        return r.ok
    except requests.exceptions.RequestException:
        return False


def _department_for(domain: str) -> str:
    mapping = {
        "water": "Department of Drinking Water & Sanitation / Water Resources",
        "urban": "Urban Development & Housing / Municipal Authority",
        "healthcare": "Department of Health, Medical Education & Family Welfare",
        "education": "School Education & Literacy Department",
        "agriculture": "Department of Agriculture, Animal Husbandry & Cooperative",
        "environment": "Forest, Environment & Climate Change Department",
        "energy": "Energy Department / Electricity Distribution Authority",
        "accessibility": "Road Construction / Rural Works / Transport Department",
        "livelihoods": "Rural Development / Labour & Employment / Industry Support",
        "administration": "District Administration / Relevant Public Service Department",
    }
    return mapping.get(domain, mapping["administration"])


def _genuine_fallback(title: str, description: str) -> Dict[str, Any]:
    text = f"{title} {description}".strip()
    words = re.findall(r"[\w'-]+", text)
    score = 35
    reasons = []
    if len(title.strip()) >= 8: score += 10
    else: reasons.append("title is too short")
    if len(description.strip()) >= 60: score += 20
    else: reasons.append("description lacks detail")
    if re.search(r"\b\d+\b", text): score += 8
    if any(w in text.lower() for w in ["road", "ward", "village", "block", "district", "near", "km", "school", "hospital"]): score += 8
    suspicious_terms = ["asdf", "test test", "fake", "random", "xxxxx", "hello world"]
    if any(x in text.lower() for x in suspicious_terms):
        score -= 35; reasons.append("contains test-like or suspicious text")
    score = max(0, min(100, score))
    return {"score": score, "label": "likely_genuine" if score >= 65 else "needs_review" if score >= 40 else "suspicious", "reasons": reasons[:3]}


def _suggest_description(title: str, description: str, domain: str) -> str:
    text = description.strip()
    missing = []
    low = text.lower()
    if not any(x in low for x in ["district", "block", "ward", "village", "near "]): missing.append("exact location")
    if not re.search(r"\b\d+\b", text): missing.append("number of people/area affected or frequency")
    if len(text) < 80: missing.append("what happens, since when, and its impact")
    if missing:
        return f"{title.strip()}: Please add {', '.join(missing)} so authorities can verify and act faster."
    return f"{title.strip()}: {text[:500]}"


def enhance_analysis(title: str, description: str, candidates: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    base = classify_problem(title, description)
    genuine = _genuine_fallback(title, description)
    domain = base["domain"]
    suggestion = _suggest_description(title, description, domain)
    duplicates = []
    if candidates:
        query = set(re.findall(r"\w+", f"{title} {description}".lower()))
        for c in candidates:
            ctext = f"{c.get('title','')} {c.get('desc', c.get('description',''))}".lower()
            tokens = set(re.findall(r"\w+", ctext))
            if query and tokens:
                sim = int(round(100 * len(query & tokens) / max(1, len(query | tokens))))
                if sim >= 15:
                    duplicates.append({"id": c.get("id"), "title": c.get("title"), "similarity": sim})
        duplicates.sort(key=lambda x: x["similarity"], reverse=True)
    result = dict(base)
    result.update({
        "category": domain,
        "urgency_score": base["priority"],
        "genuineness": genuine,
        "suggested_description": suggestion,
        "suggested_department": base.get("specific_department") or _department_for(domain),
        "suggested_broad_department": _department_for(domain),
        "duplicate_candidates": duplicates[:3],
        "duplicate_status": "possible_duplicate" if duplicates and duplicates[0]["similarity"] >= 35 else "no_strong_duplicate",
    })
    return result


def chat_reply(message: str, lang: str = "en", context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    language_name = "Hindi/Hinglish" if lang == "hi" else "English"
    fallback = "Describe the location, impact, duration and people affected. I can help classify the issue, estimate urgency and suggest the right department."
    if AI_ENGINE == "ollama":
        prompt = ("You are Samadhan Mitra, an AI assistant for the Samadhan Setu citizen problem-solving portal in India. "
                  f"Reply in {language_name}, clearly and practically. Do not invent official facts or emergency guarantees. "
                  "For waterlogging or civic issues, suggest safe immediate steps and realistic long-term solutions. Keep the answer under 180 words.\n\n"
                  f"User: {message}\nContext: {json.dumps(context or {}, ensure_ascii=False)[:2500]}\n"
                  'Respond ONLY as JSON: {"reply":"...","follow_up":"..."}')
        parsed = _extract_json(_ollama_generate(prompt) or "")
        if parsed and parsed.get("reply"):
            return {"reply": str(parsed["reply"])[:1200], "follow_up": str(parsed.get("follow_up", ""))[:300], "engine": f"ollama:{OLLAMA_MODEL}"}
    return {"reply": fallback, "follow_up": "You can also paste your problem description for a full AI analysis.", "engine": "keyword_fallback"}




def _workflow_routing(title: str, description: str, domain: str, priority: int) -> Dict[str, Any]:
    """Choose the first destination after server-side AI classification.

    Required two-portal workflow:
      Citizen submits -> AI categorizes ->
      normal local city-service problem with no university/industry funding need
      -> City Government portal
      otherwise -> Main Government portal

    Research/funding flags are retained for the downstream Main Government
    workflow, but when they are absent the issue should stay in the normal
    city-government worker flow instead of escalating unnecessarily.
    """
    cat = city_category_for(title, description)
    is_local_city_problem = cat["id"] != "other_municipal"

    text = f"{title} {description}".lower()
    funding_terms = [
        "fund", "funding", "budget", "investment", "crore", "lakh", "costly",
        "expensive", "infrastructure project", "prototype", "pilot",
        "equipment", "large scale", "capital",
    ]
    research_terms = [
        "research", "technology", "innovation", "model", "sensor", "algorithm",
        "technical solution", "treatment technology", "study", "experiment",
        "feasibility", "engineering design", "prototype", "pilot",
    ]
    requires_investment = any(x in text for x in funding_terms)
    requires_university = any(x in text for x in research_terms) or (
        domain in {"education", "healthcare", "agriculture", "environment"}
        and priority >= 85
    )
    normal_city_problem = is_local_city_problem and not requires_university and not requires_investment

    if normal_city_problem:
        route = "city_government"
        requires_government = False
        reason = (
            "AI categorized this as a normal city-service problem with no "
            "university solution or outside funding need; sent directly to the "
            "City Government portal."
        )
    else:
        route = "main_government"
        requires_government = True
        reason = (
            "AI categorized this as a non-local-city or higher-complexity problem; "
            "sent to the Main Government portal for review."
        )

    return {
        "requires_government": requires_government,
        "requires_university": requires_university,
        "requires_investment": requires_investment,
        "routing_decision": route,
        "routing_reason": reason,
        "routing_scope": "local_city" if normal_city_problem else "main_government",
        "city_category": cat["id"],
        "city_category_label": cat["name"],
    }

def classify_problem(title: str, description: str) -> Dict[str, Any]:
    """Classify a citizen problem report in two steps: first a broad domain
    (education, water, urban, ...), then — within that domain — the one
    specific government department/authority it should be routed to. Tries
    the local open-source LLM first for the domain step (if AI_ENGINE=ollama),
    otherwise/on-failure uses the keyword engine. The department step is
    always deterministic keyword matching against DEPARTMENTS_BY_DOMAIN."""
    result = _classify_domain(title, description)
    result["specific_department"] = specific_department_for(result["domain"], title, description)
    result.update(_workflow_routing(title, description, result["domain"], int(result.get("priority", 0))))
    return result


def _classify_domain(title: str, description: str) -> Dict[str, Any]:
    """Step 1: classify into one of the 10 broad domains. (Kept separate from
    classify_problem so the department step above always runs afterwards.)"""
    fallback = keyword_classify(title, description)
    if AI_ENGINE != "ollama":
        return fallback

    prompt = (
        "You are a strict JSON-only classifier for a Jharkhand (India) citizen "
        "grievance portal called Samadhan Setu. Classify the problem report "
        "below into exactly one domain from this list: "
        f"{', '.join(sorted(VALID_DOMAINS))}.\n\n"
        f"Title: {title}\n"
        f"Description: {description}\n\n"
        "Respond with ONLY a JSON object, no prose, in this exact shape:\n"
        '{"domain": "<one of the listed domains>", "confidence": <0.0-1.0>, '
        '"priority": <integer 0-100, higher = more urgent/severe>, '
        '"urgency_keywords": [<short list of words/phrases from the text that signal urgency>], '
        '"explanation": "<one short sentence explaining the classification>"}'
    )
    raw = _ollama_generate(prompt)
    parsed = _extract_json(raw) if raw else None
    if not parsed:
        return fallback

    domain = str(parsed.get("domain", "")).strip().lower()
    if domain not in VALID_DOMAINS:
        # Model hallucinated a domain outside our taxonomy — don't trust the
        # rest of the payload either, use the deterministic fallback.
        logger.info("Ollama returned an invalid domain %r — using keyword fallback.", domain)
        return fallback

    try:
        confidence = float(parsed.get("confidence", fallback["confidence"]))
    except (TypeError, ValueError):
        confidence = fallback["confidence"]
    confidence = max(0.0, min(1.0, confidence))

    try:
        priority = int(round(float(parsed.get("priority", fallback["priority"]))))
    except (TypeError, ValueError):
        priority = fallback["priority"]
    priority = max(0, min(100, priority))

    urgency_keywords = parsed.get("urgency_keywords")
    if not isinstance(urgency_keywords, list):
        urgency_keywords = fallback["urgency_keywords"]
    urgency_keywords = [str(x)[:40] for x in urgency_keywords][:10]

    explanation = str(parsed.get("explanation") or fallback["explanation"])[:300]

    return {
        "domain": domain,
        "confidence": round(confidence, 2),
        "priority": priority,
        "matched_keywords": fallback["matched_keywords"],  # kept for API/UI backward-compatibility
        "urgency_keywords": urgency_keywords,
        "explanation": explanation,
        "engine": f"ollama:{OLLAMA_MODEL}",
    }


def voice_reply(transcript: str, lang: str = "en") -> Dict[str, str]:
    """Understand a citizen's spoken request and decide what the portal
    should do next. Tries the local open-source LLM first, otherwise/on
    failure uses the keyword engine."""
    fallback = keyword_voice_reply(transcript)
    if AI_ENGINE != "ollama":
        return {"transcript": transcript, **fallback}

    language_name = "Hindi" if lang == "hi" else "English"
    prompt = (
        "You are the voice assistant for Samadhan Setu, a citizen grievance "
        f"portal for Jharkhand, India. Reply in {language_name} in one short, "
        "warm sentence, and decide the single best next action.\n\n"
        f"What the citizen said: \"{transcript}\"\n\n"
        "Respond with ONLY a JSON object, no prose, in this exact shape:\n"
        '{"reply": "<one short spoken-style sentence in ' + language_name + '>", '
        '"action": "<one of: open_submit_problem, open_my_problems, help, clarify>"}'
    )
    raw = _ollama_generate(prompt)
    parsed = _extract_json(raw) if raw else None
    if not parsed:
        return {"transcript": transcript, **fallback}

    action = str(parsed.get("action", "")).strip()
    if action not in VALID_ACTIONS:
        action = fallback["action"]
    reply = str(parsed.get("reply") or fallback["reply"])[:500]
    return {"transcript": transcript, "reply": reply, "action": action}


def status() -> Dict[str, Any]:
    """Report which AI engine is actually active, for a health/status badge."""
    if AI_ENGINE != "ollama":
        return {"configured_engine": "keyword", "active_engine": "keyword", "reachable": False, "model": None}
    reachable = ollama_available()
    return {
        "configured_engine": "ollama",
        "active_engine": f"ollama:{OLLAMA_MODEL}" if reachable else "keyword_fallback",
        "reachable": reachable,
        "model": OLLAMA_MODEL if reachable else None,
        "base_url": OLLAMA_BASE_URL,
    }
