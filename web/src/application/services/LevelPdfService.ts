import { jsPDF } from 'jspdf'
import { getActivityImage } from '../../data/activityImages'
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

export async function downloadLevelPdf(
  level: CognitiveLevel,
  onProgress?: (message: string) => void,
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const contentWidth = PAGE.width - PAGE.marginX * 2
  const [cr, cg, cb] = hexToRgb(level.color || '#1F8A70')
  const soft = lighten([cr, cg, cb], 0.88)
  const softMid = lighten([cr, cg, cb], 0.72)
  const { brand, university, researchers } = siteInfo
  let page = 1

  const brandLogo = await loadImageDataUrl(brand.logoSrc)
  const udesLogo = await loadImageDataUrl(university.logoSrc)

  const paintPageChrome = () => {
    doc.setFillColor(soft[0], soft[1], soft[2])
    doc.rect(0, 0, PAGE.width, PAGE.height, 'F')
    doc.setFillColor(cr, cg, cb)
    doc.rect(0, 0, 7, PAGE.height, 'F')
    doc.setFillColor(242, 201, 76)
    doc.rect(7, 0, 2.2, PAGE.height, 'F')
  }

  const ensureSpace = (needed: number, y: number): number => {
    if (y + needed <= PAGE.height - PAGE.marginBottom) return y
    addFooter()
    doc.addPage()
    page += 1
    paintPageChrome()
    return PAGE.marginTop
  }

  const addFooter = () => {
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

  // Portada tipo cartilla
  onProgress?.('Creando portada…')
  paintPageChrome()
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
    y = ensureSpace(42, y)
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

  // Créditos universidad
  y = ensureSpace(36, y)
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
  addFooter()

  // Índice
  doc.addPage()
  page += 1
  paintPageChrome()
  onProgress?.('Armando el índice…')
  y = PAGE.marginTop
  doc.setFillColor(cr, cg, cb)
  doc.roundedRect(PAGE.marginX, y, contentWidth, 16, 4, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Índice de áreas', PAGE.marginX + 6, y + 10)
  y += 24

  level.occupations.forEach((occupation, index) => {
    y = ensureSpace(16, y)
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
  addFooter()

  // Contenido
  for (const [occIndex, occupation] of level.occupations.entries()) {
    onProgress?.(`Área ${occIndex + 1} de ${level.occupations.length}: ${occupation.shortTitle}`)
    doc.addPage()
    page += 1
    paintPageChrome()
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
      onProgress?.(
        `Preparando ${occupation.shortTitle}: ${actIndex + 1}/${occupation.activities.length}`,
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
      y = ensureSpace(Math.min(blockStartNeed, 95), y)

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
        y = ensureSpace(frameH + 4, y)
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
        y = ensureSpace(boxHeight + 4, y)

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
    addFooter()
  }

  // Cierre
  doc.addPage()
  page += 1
  paintPageChrome()
  y = 40
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
  addFooter()

  onProgress?.('Descargando PDF…')
  const fileName = `cartilla-${level.id}-${level.shortTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`
  doc.save(fileName)
}
