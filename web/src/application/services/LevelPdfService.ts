import { jsPDF } from 'jspdf'
import { getActivityImage } from '../../data/activityImages'
import { getLevelTheme } from '../../domain/colorThemes'
import { siteInfo } from '../../domain/siteInfo'
import type { CognitiveLevel } from '../../domain/types'

const PAGE = {
  width: 210,
  height: 297,
  marginX: 16,
  marginTop: 20,
  marginBottom: 18,
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const value = Number.parseInt(full, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

async function loadImageDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function wrapText(doc: jsPDF, text: string, maxWidth: number, fontSize: number): string[] {
  doc.setFontSize(fontSize)
  return doc.splitTextToSize(text, maxWidth) as string[]
}

function lighten(rgb: [number, number, number], amount: number): [number, number, number] {
  return rgb.map((channel) => Math.min(255, Math.round(channel + (255 - channel) * amount))) as [
    number,
    number,
    number,
  ]
}

/** Encaja la imagen en un recuadro sin estirarla (mantiene proporción). */
function fitImageBox(
  naturalW: number,
  naturalH: number,
  maxW: number,
  maxH: number,
): { width: number; height: number } {
  if (!naturalW || !naturalH) return { width: maxW, height: maxH }
  const ratio = naturalW / naturalH
  let width = maxW
  let height = width / ratio
  if (height > maxH) {
    height = maxH
    width = height * ratio
  }
  return { width, height }
}

type PdfTheme = {
  rgb: [number, number, number]
  soft: [number, number, number]
  softMid: [number, number, number]
  accent: [number, number, number]
  mosaicDataUrl: string | null
}

type PdfSession = {
  doc: jsPDF
  contentWidth: number
  page: number
  brandLogo: string | null
  udesLogo: string | null
  theme: PdfTheme
  onProgress?: (message: string) => void
}

const mosaicCacheGlobal = new Map<string, string>()

function rgba(rgb: [number, number, number], alpha: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
}

/** Textura tipo mosaico web (puntos + cruces) para el fondo del PDF. */
function buildMosaicDataUrl(
  primary: [number, number, number],
  soft: [number, number, number],
  accent: [number, number, number],
): string {
  const key = `${primary.join('-')}|${soft.join('-')}|${accent.join('-')}`
  const cached = mosaicCacheGlobal.get(key)
  if (cached) return cached

  const width = 840
  const height = 1188
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    mosaicCacheGlobal.set(key, '')
    return ''
  }

  ctx.fillStyle = `rgb(${soft[0]}, ${soft[1]}, ${soft[2]})`
  ctx.fillRect(0, 0, width, height)

  const drawDot = (
    x: number,
    y: number,
    radius: number,
    color: [number, number, number],
    alpha: number,
  ) => {
    ctx.beginPath()
    ctx.fillStyle = rgba(color, alpha)
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  // Capa densa (equivalente a mosaic-layer--a)
  const stepA = 54
  for (let y = -stepA; y < height + stepA; y += stepA) {
    for (let x = -stepA; x < width + stepA; x += stepA) {
      drawDot(x + stepA * 0.3, y + stepA * 0.35, 7, primary, 0.2)
      drawDot(x + stepA * 0.7 + 27, y + stepA * 0.65 + 29, 5, accent, 0.22)
      drawDot(x + stepA * 0.5 + 12, y + stepA * 0.2 + 40, 4, primary, 0.14)
    }
  }

  // Capa fina (mosaic-layer--b)
  const stepB = 36
  for (let y = -stepB; y < height + stepB; y += stepB) {
    for (let x = -stepB; x < width + stepB; x += stepB) {
      drawDot(x, y, 3, primary, 0.16)
      drawDot(x + 18, y + 20, 2.5, accent, 0.18)
    }
  }

  // Motivos tipo cruz/diamante (mosaic-layer--c)
  const stepC = 48
  ctx.lineWidth = 1.4
  for (let y = 10; y < height; y += stepC) {
    for (let x = 8; x < width; x += stepC) {
      ctx.strokeStyle = rgba(primary, 0.14)
      ctx.beginPath()
      ctx.moveTo(x - 5, y)
      ctx.lineTo(x + 5, y)
      ctx.moveTo(x, y - 5)
      ctx.lineTo(x, y + 5)
      ctx.stroke()

      ctx.strokeStyle = rgba(accent, 0.12)
      ctx.beginPath()
      ctx.moveTo(x + 24 - 4, y + 4)
      ctx.lineTo(x + 24 + 4, y - 4)
      ctx.moveTo(x + 24 - 4, y - 4)
      ctx.lineTo(x + 24 + 4, y + 4)
      ctx.stroke()
    }
  }

  // Velo suave para que no compita con el texto
  ctx.fillStyle = rgba(soft, 0.35)
  ctx.fillRect(0, 0, width, height)

  const dataUrl = canvas.toDataURL('image/jpeg', 0.86)
  mosaicCacheGlobal.set(key, dataUrl)
  return dataUrl
}

function themeFromColor(hex: string, accentHex = '#F2C94C'): PdfTheme {
  const rgb = hexToRgb(hex || '#1F8A70')
  const soft = lighten(rgb, 0.88)
  const accent = hexToRgb(accentHex)
  const mosaicDataUrl = buildMosaicDataUrl(rgb, soft, accent)
  return {
    rgb,
    soft,
    softMid: lighten(rgb, 0.72),
    accent,
    mosaicDataUrl: mosaicDataUrl || null,
  }
}

function setSessionTheme(session: PdfSession, hex: string, accentHex?: string) {
  session.theme = themeFromColor(hex, accentHex)
}

function paintPageChrome(session: PdfSession) {
  const { doc, theme } = session
  const [cr, cg, cb] = theme.rgb

  if (theme.mosaicDataUrl) {
    try {
      doc.addImage(theme.mosaicDataUrl, 'JPEG', 0, 0, PAGE.width, PAGE.height, undefined, 'FAST')
    } catch {
      doc.setFillColor(theme.soft[0], theme.soft[1], theme.soft[2])
      doc.rect(0, 0, PAGE.width, PAGE.height, 'F')
    }
  } else {
    doc.setFillColor(theme.soft[0], theme.soft[1], theme.soft[2])
    doc.rect(0, 0, PAGE.width, PAGE.height, 'F')
  }

  doc.setFillColor(cr, cg, cb)
  doc.rect(0, 0, 7, PAGE.height, 'F')
  doc.setFillColor(theme.accent[0], theme.accent[1], theme.accent[2])
  doc.rect(7, 0, 2.2, PAGE.height, 'F')
}

function addFooter(session: PdfSession) {
  const { doc, contentWidth, udesLogo, theme, page } = session
  const [cr, cg, cb] = theme.rgb
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(PAGE.marginX, PAGE.height - 14, contentWidth, 8, 2, 2, 'F')
  if (udesLogo) {
    try {
      doc.addImage(udesLogo, 'PNG', PAGE.marginX + 2.5, PAGE.height - 13.2, 6.5, 6.5)
    } catch {
      // ignore
    }
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(70, 90, 110)
  doc.text(
    'ACTIVA-MENTE · Cartilla de estrategias ocupacionales',
    PAGE.marginX + 11,
    PAGE.height - 9,
  )
  doc.setTextColor(cr, cg, cb)
  doc.setFont('helvetica', 'bold')
  doc.text(`${page}`, PAGE.width - PAGE.marginX - 3, PAGE.height - 9, { align: 'right' })
}

function ensureSpace(session: PdfSession, needed: number, y: number): number {
  if (y + needed <= PAGE.height - PAGE.marginBottom) return y
  addFooter(session)
  session.doc.addPage()
  session.page += 1
  paintPageChrome(session)
  return PAGE.marginTop
}

function addNewPage(session: PdfSession) {
  addFooter(session)
  session.doc.addPage()
  session.page += 1
  paintPageChrome(session)
}

function drawCreditsBlock(session: PdfSession, y: number): number {
  const { doc, contentWidth, udesLogo } = session
  const { university, researchers } = siteInfo
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(PAGE.marginX, y, contentWidth, 32, 5, 5, 'F')
  if (udesLogo) {
    try {
      doc.addImage(udesLogo, 'PNG', PAGE.marginX + 5, y + 4, 24, 24)
    } catch {
      // ignore
    }
  }
  doc.setTextColor(18, 35, 63)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Investigación académica', PAGE.marginX + 34, y + 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(58, 77, 107)
  doc.text(researchers.names.join(' · '), PAGE.marginX + 34, y + 17)
  doc.text(university.name, PAGE.marginX + 34, y + 24)
  return y + 36
}

function drawClosing(session: PdfSession) {
  const { doc, contentWidth, udesLogo, theme } = session
  const [cr, cg, cb] = theme.rgb
  const { university, researchers } = siteInfo

  addNewPage(session)
  let y = 40
  doc.setFillColor(cr, cg, cb)
  doc.roundedRect(PAGE.marginX, y, contentWidth, 70, 7, 7, 'F')
  doc.setFillColor(242, 201, 76)
  doc.circle(PAGE.width / 2, y + 18, 7, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.text('Fin de esta cartilla', PAGE.width / 2, y + 38, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const closing = wrapText(
    doc,
    'Estas estrategias orientan el acompañamiento cotidiano. Adáptelas a cada persona y consulte siempre a profesionales de salud cuando sea necesario.',
    contentWidth - 20,
    11,
  )
  doc.text(closing, PAGE.width / 2, y + 50, { align: 'center' })

  y = 130
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(PAGE.marginX, y, contentWidth, 40, 5, 5, 'F')
  if (udesLogo) {
    try {
      doc.addImage(udesLogo, 'PNG', PAGE.marginX + 8, y + 8, 24, 24)
    } catch {
      // ignore
    }
  }
  doc.setTextColor(18, 35, 63)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(university.name, PAGE.marginX + 38, y + 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(70, 90, 110)
  doc.text(researchers.names.join(' · '), PAGE.marginX + 38, y + 24)
  doc.text('ACTIVA-MENTE · EBZ TEC', PAGE.marginX + 38, y + 31)
  addFooter(session)
}

async function createSession(
  levelId: string | undefined,
  onProgress?: (message: string) => void,
): Promise<PdfSession> {
  const { brand, university } = siteInfo
  const levelTheme = getLevelTheme(levelId)
  const [brandLogo, udesLogo] = await Promise.all([
    loadImageDataUrl(brand.logoSrc),
    loadImageDataUrl(university.logoSrc),
  ])

  return {
    doc: new jsPDF({ unit: 'mm', format: 'a4' }),
    contentWidth: PAGE.width - PAGE.marginX * 2,
    page: 1,
    brandLogo,
    udesLogo,
    theme: themeFromColor(levelTheme.primary, levelTheme.accent),
    onProgress,
  }
}

function drawMasterCover(session: PdfSession, levels: CognitiveLevel[]) {
  const { doc, contentWidth, brandLogo, theme } = session
  const [cr, cg, cb] = theme.rgb
  const { brand } = siteInfo

  session.onProgress?.('Creando portada general…')
  paintPageChrome(session)
  doc.setFillColor(cr, cg, cb)
  doc.roundedRect(PAGE.marginX, 18, contentWidth, 78, 6, 6, 'F')
  doc.setFillColor(255, 255, 255)
  doc.circle(PAGE.marginX + 28, 48, 18, 'F')

  if (brandLogo) {
    try {
      doc.addImage(brandLogo, 'PNG', PAGE.marginX + 12, 32, 32, 32)
    } catch {
      // ignore
    }
  }

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('CARTILLA COMPLETA', PAGE.marginX + 52, 38)
  doc.setFontSize(18)
  const coverTitle = wrapText(doc, brand.shortName.toUpperCase(), contentWidth - 60, 18)
  doc.text(coverTitle, PAGE.marginX + 52, 52)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('OCUPACIONES PARA LA VIDA', PAGE.marginX + 52, 72)
  doc.text('Los 4 niveles en un solo documento', PAGE.marginX + 52, 80)

  let y = 110
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(theme.softMid[0], theme.softMid[1], theme.softMid[2])
  doc.setLineWidth(0.6)
  doc.roundedRect(PAGE.marginX, y, contentWidth, 18 + levels.length * 12, 5, 5, 'FD')
  doc.setTextColor(18, 35, 63)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Niveles incluidos', PAGE.marginX + 6, y + 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(58, 77, 107)
  levels.forEach((level, index) => {
    doc.text(
      `${index + 1}. Nivel ${level.order}: ${level.shortTitle}`,
      PAGE.marginX + 6,
      y + 20 + index * 12,
    )
  })
  y += 26 + levels.length * 12

  y = ensureSpace(session, 36, y)
  drawCreditsBlock(session, y)
  addFooter(session)
}

async function renderLevelContent(
  session: PdfSession,
  level: CognitiveLevel,
  options: { showCredits: boolean; addPageBefore: boolean },
) {
  const { doc, contentWidth, brandLogo } = session
  const levelTheme = getLevelTheme(level.id)
  setSessionTheme(session, level.color || levelTheme.primary, levelTheme.accent)
  const [cr, cg, cb] = session.theme.rgb
  const softMid = session.theme.softMid

  if (options.addPageBefore) {
    addNewPage(session)
  } else {
    paintPageChrome(session)
  }

  session.onProgress?.(`Nivel ${level.order}: portada…`)
  doc.setFillColor(cr, cg, cb)
  doc.roundedRect(PAGE.marginX, 18, contentWidth, 78, 6, 6, 'F')
  doc.setFillColor(255, 255, 255)
  doc.circle(PAGE.marginX + 28, 48, 18, 'F')

  if (brandLogo) {
    try {
      doc.addImage(brandLogo, 'PNG', PAGE.marginX + 12, 32, 32, 32)
    } catch {
      // ignore
    }
  }

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`NIVEL ${level.order} DE 4`, PAGE.marginX + 52, 38)
  doc.setFontSize(22)
  const coverTitle = wrapText(doc, level.shortTitle.toUpperCase(), contentWidth - 60, 22)
  doc.text(coverTitle, PAGE.marginX + 52, 52)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('ACTIVA-MENTE: OCUPACIONES PARA LA VIDA', PAGE.marginX + 52, 72)
  doc.text('Cartilla de estrategias para cuidadores', PAGE.marginX + 52, 80)

  let y = 110
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(softMid[0], softMid[1], softMid[2])
  doc.setLineWidth(0.6)
  doc.roundedRect(PAGE.marginX, y, contentWidth, 48, 5, 5, 'FD')
  doc.setTextColor(18, 35, 63)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(level.title, PAGE.marginX + 6, y + 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(58, 77, 107)
  const intro = wrapText(doc, level.description || '', contentWidth - 12, 10)
  doc.text(intro.slice(0, 6), PAGE.marginX + 6, y + 18)
  y += 58

  if (level.whyCaregiver) {
    y = ensureSpace(session, 42, y)
    doc.setFillColor(softMid[0], softMid[1], softMid[2])
    doc.roundedRect(PAGE.marginX, y, contentWidth, 40, 5, 5, 'F')
    doc.setTextColor(cr, cg, cb)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    const whyTitle = wrapText(
      doc,
      level.whyCaregiverTitle || 'Orientación para el cuidador',
      contentWidth - 12,
      11,
    )
    doc.text(whyTitle, PAGE.marginX + 6, y + 9)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(40, 55, 80)
    const whyBody = wrapText(doc, level.whyCaregiver, contentWidth - 12, 9.5)
    doc.text(whyBody.slice(0, 5), PAGE.marginX + 6, y + 18)
    y += 48
  }

  if (options.showCredits) {
    y = ensureSpace(session, 36, y)
    drawCreditsBlock(session, y)
  }
  addFooter(session)

  addNewPage(session)
  session.onProgress?.(`Nivel ${level.order}: índice…`)
  y = PAGE.marginTop
  doc.setFillColor(cr, cg, cb)
  doc.roundedRect(PAGE.marginX, y, contentWidth, 16, 4, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Índice de áreas', PAGE.marginX + 6, y + 10)
  y += 24

  level.occupations.forEach((occupation, index) => {
    y = ensureSpace(session, 16, y)
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(softMid[0], softMid[1], softMid[2])
    doc.roundedRect(PAGE.marginX, y - 5, contentWidth, 13, 3, 3, 'FD')
    doc.setFillColor(cr, cg, cb)
    doc.circle(PAGE.marginX + 7, y + 1.5, 4, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(String(index + 1), PAGE.marginX + 7, y + 2.8, { align: 'center' })
    doc.setTextColor(18, 35, 63)
    doc.setFontSize(11)
    doc.text(occupation.title, PAGE.marginX + 15, y + 2.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(90, 107, 130)
    doc.text(
      `${occupation.activities.length} actividades`,
      PAGE.width - PAGE.marginX - 4,
      y + 2.5,
      { align: 'right' },
    )
    y += 16
  })
  addFooter(session)

  for (const [occIndex, occupation] of level.occupations.entries()) {
    session.onProgress?.(
      `Nivel ${level.order}: área ${occIndex + 1}/${level.occupations.length} (${occupation.shortTitle})`,
    )
    addNewPage(session)
    y = PAGE.marginTop

    doc.setFillColor(cr, cg, cb)
    doc.roundedRect(PAGE.marginX, y, contentWidth, 24, 5, 5, 'F')
    doc.setFillColor(242, 201, 76)
    doc.roundedRect(PAGE.marginX, y, 5, 24, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`ÁREA ${occIndex + 1}`, PAGE.marginX + 10, y + 9)
    doc.setFontSize(15)
    const areaTitle = wrapText(doc, occupation.title, contentWidth - 14, 15)
    doc.text(areaTitle, PAGE.marginX + 10, y + 18)
    y += 32

    for (const [actIndex, activity] of occupation.activities.entries()) {
      session.onProgress?.(
        `Nivel ${level.order} · ${occupation.shortTitle}: ${actIndex + 1}/${occupation.activities.length}`,
      )

      const imageUrl = getActivityImage(activity.id, level.id, occupation.id)
      const imageData = await loadImageDataUrl(imageUrl)
      const maxImageW = contentWidth - 16
      const maxImageH = 58
      let drawW = 0
      let drawH = 0
      if (imageData) {
        try {
          const props = doc.getImageProperties(imageData)
          const fitted = fitImageBox(props.width, props.height, maxImageW, maxImageH)
          drawW = fitted.width
          drawH = fitted.height
        } catch {
          drawW = maxImageW
          drawH = 42
        }
      }
      const frameH = drawH > 0 ? drawH + 8 : 0
      const titleLines = wrapText(
        doc,
        `${actIndex + 1}. ${activity.title}`,
        contentWidth - 10,
        13,
      )
      const blockStartNeed = 12 + titleLines.length * 6 + frameH + 8
      y = ensureSpace(session, Math.min(blockStartNeed, 95), y)

      doc.setFillColor(255, 255, 255)
      doc.roundedRect(PAGE.marginX, y - 4, contentWidth, 10 + titleLines.length * 5.5, 3, 3, 'F')
      doc.setFillColor(cr, cg, cb)
      doc.circle(PAGE.marginX + 6, y + 2, 3.2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(String(actIndex + 1), PAGE.marginX + 6, y + 3.2, { align: 'center' })
      doc.setTextColor(18, 35, 63)
      doc.setFontSize(13)
      doc.text(titleLines, PAGE.marginX + 12, y + 3)
      y += titleLines.length * 5.8 + 8

      if (imageData && drawW > 0 && drawH > 0) {
        y = ensureSpace(session, frameH + 4, y)
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(softMid[0], softMid[1], softMid[2])
        doc.setLineWidth(0.45)
        doc.roundedRect(PAGE.marginX, y - 2, contentWidth, frameH, 4, 4, 'FD')
        const format = imageData.startsWith('data:image/png') ? 'PNG' : 'JPEG'
        const imgX = PAGE.marginX + (contentWidth - drawW) / 2
        const imgY = y + (frameH - drawH) / 2 - 2
        try {
          doc.addImage(imageData, format, imgX, imgY, drawW, drawH, undefined, 'FAST')
        } catch {
          // omit
        }
        y += frameH + 6
      }

      activity.strategies.forEach((strategy, strategyIndex) => {
        const label = `Estrategia ${strategyIndex + 1}. ${strategy}`
        const lines = wrapText(doc, label, contentWidth - 16, 10.5)
        const boxHeight = lines.length * 5.2 + 8
        y = ensureSpace(session, boxHeight + 4, y)

        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(softMid[0], softMid[1], softMid[2])
        doc.setLineWidth(0.5)
        doc.roundedRect(PAGE.marginX, y - 3, contentWidth, boxHeight, 3.5, 3.5, 'FD')
        doc.setFillColor(cr, cg, cb)
        doc.roundedRect(PAGE.marginX, y - 3, 3.2, boxHeight, 1.5, 1.5, 'F')
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10.5)
        doc.setTextColor(35, 50, 75)
        doc.text(lines, PAGE.marginX + 7, y + 3)
        y += boxHeight + 4
      })

      y += 5
    }
    addFooter(session)
  }
}

export async function downloadLevelPdf(
  level: CognitiveLevel,
  onProgress?: (message: string) => void,
): Promise<void> {
  const session = await createSession(level.id, onProgress)
  await renderLevelContent(session, level, { showCredits: true, addPageBefore: false })
  drawClosing(session)
  onProgress?.('Descargando PDF…')
  const fileName = `cartilla-${level.id}-${level.shortTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`
  session.doc.save(fileName)
}

export async function downloadAllLevelsPdf(
  levels: CognitiveLevel[],
  onProgress?: (message: string) => void,
): Promise<void> {
  if (!levels.length) throw new Error('No hay niveles para descargar')

  const session = await createSession(levels[0]?.id, onProgress)
  drawMasterCover(session, levels)

  for (const [index, level] of levels.entries()) {
    await renderLevelContent(session, level, {
      showCredits: false,
      addPageBefore: true,
    })
    onProgress?.(`Nivel ${index + 1} de ${levels.length} listo…`)
  }

  drawClosing(session)
  onProgress?.('Descargando PDF completo…')
  session.doc.save('cartilla-activa-mente-todos-los-niveles.pdf')
}
