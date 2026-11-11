"""Parse the cartilla Word document into modular JSON content."""

from __future__ import annotations

import json
import re
import unicodedata
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "docs" / "ESTRATEGIAS CARTILLA ENTREGA 02-11-26.docx"
OUT = ROOT / "web" / "src" / "data" / "content"


def norm(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", text).strip().upper()


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return text or "item"


def extract_paragraphs(path: Path) -> list[str]:
    with zipfile.ZipFile(path) as zf:
        root = ET.fromstring(zf.read("word/document.xml"))
    paras: list[str] = []
    for p in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
        texts = [
            t.text
            for t in p.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t")
            if t.text
        ]
        if texts:
            paras.append("".join(texts).strip())
    return paras


LEVEL_MARKERS = {
    "FUNCIONAMIENTO COGNITIVO NORMAL": {
        "id": "normal",
        "title": "Funcionamiento cognitivo normal",
        "shortTitle": "Normal",
        "order": 1,
        "color": "#1F6B4A",
    },
    "DETERIORO COGNITIVO LEVE": {
        "id": "leve",
        "title": "Deterioro cognitivo leve",
        "shortTitle": "Leve",
        "order": 2,
        "color": "#2F6FAE",
    },
    "DETERIORO COGNITIVO MODERADO": {
        "id": "moderado",
        "title": "Deterioro cognitivo moderado",
        "shortTitle": "Moderado",
        "order": 3,
        "color": "#C47A12",
    },
    "DETERIORO COGNITIVO SEVERO": {
        "id": "severo",
        "title": "Deterioro cognitivo severo",
        "shortTitle": "Severo",
        "order": 4,
        "color": "#A63D3D",
    },
}

OCCUPATION_ALIASES = {
    "ACTIVIDADES DE LA VIDA DIARIA": {
        "id": "avd",
        "title": "Actividades de la vida diaria",
        "shortTitle": "Vida diaria",
        "icon": "home",
        "order": 1,
    },
    "ACTIVIDADES INSTRUMENTALES DE LA VIDA DIARIA": {
        "id": "aivd",
        "title": "Actividades instrumentales de la vida diaria",
        "shortTitle": "Instrumentales",
        "icon": "list",
        "order": 2,
    },
    "GESTION DE LA SALUD": {
        "id": "salud",
        "title": "Gestión de la salud",
        "shortTitle": "Salud",
        "icon": "heart",
        "order": 3,
    },
    "DESCANSO Y SUENO": {
        "id": "descanso",
        "title": "Descanso y sueño",
        "shortTitle": "Descanso",
        "icon": "moon",
        "order": 4,
    },
    "TRABAJO": {
        "id": "trabajo",
        "title": "Trabajo",
        "shortTitle": "Trabajo",
        "icon": "briefcase",
        "order": 5,
    },
    "OCIO": {
        "id": "ocio",
        "title": "Ocio",
        "shortTitle": "Ocio",
        "icon": "sparkles",
        "order": 6,
    },
    "PARTICIPACION SOCIAL": {
        "id": "social",
        "title": "Participación social",
        "shortTitle": "Social",
        "icon": "users",
        "order": 7,
    },
}

SKIP = {
    "OCUPACION",
    "ESTRATEGIAS DE MANTENIMIENTO PARA EL CUIDADOR",
    "ESTRATEGIAS DE MANTENIMIENTO",
    "CATEGORIA",
}


def match_level(text: str) -> dict | None:
    return LEVEL_MARKERS.get(norm(text))


def match_occupation(text: str) -> dict | None:
    key = norm(text)
    key = re.sub(r"^OCUPACION:\s*", "", key).strip()
    return OCCUPATION_ALIASES.get(key)


def strip_number(text: str) -> str:
    return re.sub(r"^\d+\.\s*", "", text.strip()).strip()


def is_strategy_line(text: str) -> bool:
    """Single strategy item like '1. Mantener...' (may include more packed)."""
    return bool(re.match(r"^\d+\.\s+\S", text.strip()))


def is_activity_heading(text: str, nxt: str | None) -> bool:
    """Activity title: plain or '1. Title' followed by strategies."""
    raw = text.strip()
    if not raw or len(raw) > 100:
        return False
    n = norm(raw)
    if n in SKIP or match_level(raw) or match_occupation(raw):
        return False
    if raw.startswith("¿") or raw.lower().startswith("las personas"):
        return False

    title = strip_number(raw) if re.match(r"^\d+\.\s+", raw) else raw

    # Heading should not itself contain multiple numbered strategies
    if re.search(r"\d+\.\s+", title):
        return False

    # Followed by a strategy starting at 1. (or another numbered strategy line)
    if nxt and is_strategy_line(nxt):
        # Prefer titles before a fresh '1.' block; also accept before '2.' only if current was numbered title
        if re.match(r"^1\.\s+", nxt.strip()):
            return True
        if re.match(r"^\d+\.\s+", raw) and re.match(r"^[2-9]\.\s+", nxt.strip()):
            # rare
            return False
    # Plain title with packed strategies in next is handled above
    # Also: plain title when next is packed multi-strategy paragraph starting with 1.
    return False


def split_strategies(text: str) -> list[str]:
    parts = re.split(r"(?=(?:^|\s)\d+\.\s+)", text.strip())
    out: list[str] = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        part = re.sub(r"^\d+\.\s*", "", part).strip()
        if part:
            out.append(part)
    return out


def build_structure(paras: list[str]) -> dict:
    intro: list[str] = []
    levels: list[dict] = []
    level: dict | None = None
    occupation: dict | None = None
    activity: dict | None = None
    phase = "intro"  # intro | level_body

    def start_level(meta: dict) -> None:
        nonlocal level, occupation, activity, phase
        level = {
            **meta,
            "description": "",
            "whyCaregiverTitle": "",
            "whyCaregiver": "",
            "occupations": [],
        }
        levels.append(level)
        occupation = None
        activity = None
        phase = "level_body"

    def start_occupation(meta: dict) -> None:
        nonlocal occupation, activity
        assert level is not None
        occupation = {**meta, "activities": []}
        level["occupations"].append(occupation)
        activity = None

    def start_activity(title: str) -> None:
        nonlocal activity
        assert occupation is not None
        clean = strip_number(title)
        activity = {"id": slugify(clean), "title": clean, "strategies": []}
        occupation["activities"].append(activity)

    i = 0
    while i < len(paras):
        text = paras[i].strip()
        nxt = paras[i + 1].strip() if i + 1 < len(paras) else None

        if not text:
            i += 1
            continue

        if norm(text) == "INTRODUCCION":
            phase = "intro"
            i += 1
            continue

        lvl = match_level(text)
        if lvl:
            start_level(lvl)
            i += 1
            continue

        occ = match_occupation(text)
        if occ and level is not None:
            start_occupation(occ)
            i += 1
            continue

        if phase == "intro":
            if norm(text) not in SKIP:
                intro.append(text)
            i += 1
            continue

        # level_body
        assert level is not None

        if norm(text) in SKIP:
            i += 1
            continue

        # Description / why caregiver before first occupation
        if occupation is None:
            if text.startswith("¿Por qué"):
                level["whyCaregiverTitle"] = text
                i += 1
                if i < len(paras) and not match_occupation(paras[i]) and not match_level(paras[i]):
                    level["whyCaregiver"] = paras[i].strip()
                    i += 1
                continue
            if not level["description"]:
                level["description"] = text
            else:
                level["description"] += " " + text
            i += 1
            continue

        # Inside an occupation
        if is_activity_heading(text, nxt):
            start_activity(text)
            i += 1
            continue

        if is_strategy_line(text):
            # Could be a numbered activity title: "2. Higiene..." when next is "1. ..."
            if is_activity_heading(text, nxt):
                start_activity(text)
                i += 1
                continue
            if activity is None:
                start_activity("Estrategias")
            activity["strategies"].extend(split_strategies(text))
            i += 1
            continue

        # Plain continuation text under current activity (rare)
        if activity is not None and text:
            # If it looks like a new plain activity title without detecting heading
            if nxt and re.match(r"^1\.\s+", nxt) and len(text) < 90 and not text.startswith("¿"):
                start_activity(text)
            else:
                activity["strategies"].append(text)
            i += 1
            continue

        i += 1

    # Cleanup
    for lv in levels:
        kept = []
        for occ in lv["occupations"]:
            acts = [a for a in occ["activities"] if a["title"] and a["strategies"]]
            seen: dict[str, int] = {}
            for a in acts:
                base = a["id"]
                if base in seen:
                    seen[base] += 1
                    a["id"] = f"{base}-{seen[base]}"
                else:
                    seen[base] = 1
            occ["activities"] = acts
            if acts:
                kept.append(occ)
        lv["occupations"] = kept

    return {
        "meta": {
            "title": "Cartilla de estrategias de cuidado",
            "subtitle": "Acompañamiento a personas mayores según su funcionamiento cognitivo",
            "audience": "Cuidadores y adultos mayores",
            "version": "1.0.0",
            "source": "ESTRATEGIAS CARTILLA ENTREGA 02-11-26",
        },
        "introduction": {"title": "Introducción", "paragraphs": intro},
        "levels": levels,
    }


def main() -> None:
    paras = extract_paragraphs(DOCX)
    Path("scripts/raw_paras.json").write_text(
        json.dumps(paras, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    data = build_structure(paras)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "cartilla.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    for level in data["levels"]:
        (OUT / f"nivel-{level['id']}.json").write_text(
            json.dumps(level, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    print(f"levels={len(data['levels'])}")
    for level in data["levels"]:
        acts = sum(len(o["activities"]) for o in level["occupations"])
        strats = sum(len(a["strategies"]) for o in level["occupations"] for a in o["activities"])
        print(
            f"  {level['id']}: ocupaciones={len(level['occupations'])} "
            f"actividades={acts} estrategias={strats}"
        )
        for o in level["occupations"]:
            print(f"    - {o['id']}: {len(o['activities'])} actividades")


if __name__ == "__main__":
    main()
