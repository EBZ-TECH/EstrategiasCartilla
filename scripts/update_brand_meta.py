from pathlib import Path

p = Path(__file__).resolve().parents[1] / "web" / "src" / "data" / "content" / "cartilla.json"
text = p.read_text(encoding="utf-8")
replacements = [
    (
        '"title": "Cartilla de estrategias de cuidado"',
        '"title": "ACTIVA-MENTE: OCUPACIONES PARA LA VIDA"',
    ),
    (
        '"subtitle": "Acompañamiento a personas mayores según su funcionamiento cognitivo"',
        '"subtitle": "Guía de estrategias ocupacionales según los niveles de funcionamiento cognitivo."',
    ),
    ('"color": "#1F6B4A"', '"color": "#1F8A70"'),
    ('"color": "#2F6FAE"', '"color": "#2F6FE0"'),
    ('"color": "#C47A12"', '"color": "#D9920B"'),
    ('"color": "#A63D3D"', '"color": "#D64545"'),
]
for old, new in replacements:
    text = text.replace(old, new)
p.write_text(text, encoding="utf-8")
print("ok")
