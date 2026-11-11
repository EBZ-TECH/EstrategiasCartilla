import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / "web/src/data/content/cartilla.json").read_text(encoding="utf-8"))

expected_occupations = {
    "normal": ["avd", "aivd", "salud", "descanso", "trabajo", "ocio", "social"],
    "leve": ["avd", "aivd", "salud", "descanso", "trabajo", "ocio", "social"],
    "moderado": ["avd", "aivd", "salud", "descanso", "trabajo", "ocio", "social"],
    # In the Word doc, severe section does not include full AIVD, health, or work content
    "severo": ["avd", "descanso", "ocio", "social"],
}

print("INTRO paragraphs:", len(data["introduction"]["paragraphs"]))
print()

for level in data["levels"]:
    print("=" * 72)
    print(f"LEVEL: {level['title']} ({level['id']})")
    print(f"  description: {'yes' if level.get('description') else 'NO'}")
    print(f"  why caregiver: {'yes' if level.get('whyCaregiver') else 'NO'}")

    ids = [o["id"] for o in sorted(level["occupations"], key=lambda x: x["order"])]
    exp = expected_occupations[level["id"]]
    missing = [x for x in exp if x not in ids]
    extra = [x for x in ids if x not in exp]
    print(f"  occupations: {ids}")
    print(f"  missing vs doc expectation: {missing or 'none'}")
    print(f"  extra: {extra or 'none'}")

    for occ in sorted(level["occupations"], key=lambda x: x["order"]):
        print(f"  - {occ['title']} ({len(occ['activities'])} activities)")
        for act in occ["activities"]:
            n = len(act["strategies"])
            flag = "" if n == 5 else f"  << {n} strategies"
            print(f"      * {act['title']} [{n}]{flag}")

print()
print("SUMMARY")
total_occ = sum(len(l["occupations"]) for l in data["levels"])
total_act = sum(len(o["activities"]) for l in data["levels"] for o in l["occupations"])
total_str = sum(
    len(a["strategies"])
    for l in data["levels"]
    for o in l["occupations"]
    for a in o["activities"]
)
print(f"levels={len(data['levels'])} occupations={total_occ} activities={total_act} strategies={total_str}")
print()
print("NOTE: In DETERIORO COGNITIVO SEVERO the Word document itself does not provide")
print("complete sections for AIVD, Gestion de la salud, Trabajo, nor Actividad sexual.")
