# Cartilla virtual de estrategias de cuidado

Aplicación web para consultar la cartilla de acompañamiento a personas mayores según su funcionamiento cognitivo (normal, leve, moderado y severo).

## Stack y arquitectura

- **Vite + React + TypeScript**
- **React Router** para navegación por capas de contenido
- Arquitectura **modular por capas**:
  - `domain/` — tipos del negocio
  - `data/` — JSON de la cartilla y repositorio
  - `application/` — servicios de consulta y búsqueda
  - `presentation/` — pantallas, componentes y estilos accesibles

## Accesibilidad para adultos mayores

- Tipografía legible (Atkinson Hyperlegible)
- Controles de tamaño de letra (A / A+ / A++)
- Botones y tarjetas grandes
- Contraste alto y navegación simple: Nivel → Área → Actividad → Consejos
- Búsqueda por palabras cotidianas

## Desarrollo

```bash
cd web
npm install
npm run dev
```

## Contenido

El contenido se genera desde el documento Word:

```bash
python scripts/parse_cartilla.py
```

Salida: `web/src/data/content/cartilla.json` y un archivo por nivel.
