"""Extrae ilustraciones del Word y las asocia a cada actividad de la cartilla."""
from __future__ import annotations

import json
import re
import shutil
import zipfile
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn

DOC = Path(r"c:\Users\micha\Downloads\ESTRATEGIAS_CARTILLA_ILUSTRACIONES_CLARAS.docx")
ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "web" / "public" / "illustrations"
MAP_PATH = ROOT / "web" / "src" / "data" / "illustrationMap.json"
CONTENT = ROOT / "web" / "src" / "data" / "content" / "cartilla.json"

LEVEL_KEYS = [
    ("funcionamiento cognitivo normal", "normal"),
    ("deterioro cognitivo leve", "leve"),
    ("deterioro cognitivo moderado", "moderado"),
    ("deterioro cognitivo severo", "severo"),
]

OCC_KEYS = [
    ("actividades instrumentales", "aivd"),
    ("actividades de la vida diaria", "avd"),
    ("gestion de la salud", "salud"),
    ("descanso y sueno", "descanso"),
    ("trabajo", "trabajo"),
    ("ocio", "ocio"),
    ("participacion social", "social"),
]


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    for _ in range(4):
        nxt = re.sub(r"(.{6,}?)\1+", r"\1", text)
        if nxt == text:
            break
        text = nxt
    return text.strip(" :")


def norm(text: str) -> str:
    t = clean_text(text).lower()
    return t.translate(str.maketrans("áéíóúüñ", "aeiouun"))


def image_files(el, part) -> list[str]:
    out: list[str] = []
    for blip in el.xpath(".//a:blip"):
        rid = blip.get(qn("r:embed"))
        if not rid:
            continue
        try:
            out.append(Path(part.rels[rid].target_ref).name)
        except Exception:
            pass
    return out


def detect_level(text: str) -> str | None:
    n = norm(text)
    if "ocupacion" in n:
        return None
    for key, lid in LEVEL_KEYS:
        if key in n:
            return lid
    return None


def detect_occupation(text: str) -> str | None:
    n = norm(text)
    if "ocupacion" not in n and not any(k in n for k, _ in OCC_KEYS):
        return None
    for key, oid in OCC_KEYS:
        if key in n:
            return oid
    return None


def match_activity(occupation: dict, title: str):
    ntitle = norm(title)
    # Exact / contains
    for act in occupation["activities"]:
        nat = norm(act["title"])
        if ntitle == nat or ntitle in nat or nat in ntitle:
            return act
    # Token overlap
    best = None
    best_score = 0.0
    ta = set(ntitle.split())
    for act in occupation["activities"]:
        tb = set(norm(act["title"]).split())
        if not ta or not tb:
            continue
        score = len(ta & tb) / len(ta | tb)
        if score > best_score:
            best_score = score
            best = act
    return best if best_score >= 0.45 else None


def main() -> None:
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    raw_dir = OUT_DIR / "raw"
    raw_dir.mkdir(parents=True)

    with zipfile.ZipFile(DOC, "r") as z:
        for name in z.namelist():
            if name.startswith("word/media/"):
                (raw_dir / Path(name).name).write_bytes(z.read(name))

    doc = Document(str(DOC))
    cartilla = json.loads(CONTENT.read_text(encoding="utf-8"))
    levels = {lv["id"]: lv for lv in cartilla["levels"]}

    current_level: str | None = None
    current_occ: str | None = None
    activities: dict[str, str] = {}
    records: list[dict] = []

    for child in doc.element.body.iterchildren():
        tag = child.tag.split("}")[-1]
        if tag == "p":
            text = clean_text("".join(child.itertext()))
            if not text:
                continue
            lvl = detect_level(text)
            if lvl:
                current_level = lvl
                current_occ = None
                print(f"LEVEL {lvl}")
                continue
            occ = detect_occupation(text)
            if occ:
                current_occ = occ
                print(f"  OCC {occ}")
            continue

        if tag != "tbl" or not current_level or not current_occ:
            continue

        level = levels[current_level]
        occupation = next((o for o in level["occupations"] if o["id"] == current_occ), None)
        if not occupation:
            print(f"  ! occupation missing {current_occ}")
            continue

        for tr in child.xpath("./w:tr"):
            cells = tr.xpath("./w:tc")
            if len(cells) < 2:
                continue
            left = clean_text("".join(cells[0].itertext()))
            left_l = left.lower()
            if left_l in {"ocupación", "ocupacion", "categoría", "categoria"}:
                continue
            imgs = image_files(cells[0], doc.part)
            if not imgs:
                continue

            act = match_activity(occupation, left)
            img = imgs[0]
            if not act:
                dest_name = f"unmatched/{current_level}_{current_occ}_{img}"
                dest = OUT_DIR / dest_name
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(raw_dir / img, dest)
                records.append(
                    {
                        "matched": False,
                        "level": current_level,
                        "occupation": current_occ,
                        "title": left,
                        "image": dest_name,
                    }
                )
                continue

            key = f"{current_level}/{current_occ}/{act['id']}"
            dest_name = f"activities/{current_level}/{current_occ}/{act['id']}.png"
            dest = OUT_DIR / dest_name
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(raw_dir / img, dest)
            activities[key] = f"/illustrations/{dest_name}"
            records.append(
                {
                    "matched": True,
                    "key": key,
                    "titleDoc": left,
                    "titleApp": act["title"],
                    "image": dest_name,
                }
            )

    # Keep a couple of character references for generated steps
    refs = OUT_DIR / "characters"
    refs.mkdir(parents=True, exist_ok=True)
    for name in ("image1.png", "image68.png"):
        src = raw_dir / name
        if src.exists():
            shutil.copy2(src, refs / name)

    payload = {"activities": activities, "records": records}
    MAP_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    matched = sum(1 for r in records if r["matched"])
    unmatched = sum(1 for r in records if not r["matched"])
    print(f"Matched {matched}, unmatched {unmatched}, keys {len(activities)}")
    print(f"Map -> {MAP_PATH}")


if __name__ == "__main__":
    main()
