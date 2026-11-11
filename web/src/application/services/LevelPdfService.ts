import { jsPDF } from 'jspdf'
import { getActivityImage } from '../../data/activityImages'
import type { CognitiveLevel } from '../../domain/types'

const PAGE = {
  width: 210,
  height: 297,
  marginX: 16,
  marginTop: 18,
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

export async function downloadLevelPdf(
  level: CognitiveLevel,
  onProgress?: (message: string) => void,
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const contentWidth = PAGE.width - PAGE.marginX * 2
  const [cr, cg, cb] = hexToRgb(level.color || '#1C5AA6')
  let page = 1

  const ensureSpace = (needed: number, y: number): number => {
    if (y + needed <= PAGE.height - PAGE.marginBottom) return y
    addFooter()
    doc.addPage()
    page += 1
    return PAGE.marginTop
  }

  const addFooter = () => {
    doc.setDrawColor(200, 210, 225)
    doc.setLineWidth(0.3)
    doc.line(PAGE.marginX, PAGE.height - 12, PAGE.width - PAGE.marginX, PAGE.height - 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(90, 107, 130)
    doc.text('Cartilla de cuidado · EBZ TEC', PAGE.marginX, PAGE.height - 7)
    doc.text(`Página ${page}`, PAGE.width - PAGE.marginX, PAGE.height - 7, { align: 'right' })
  }

  // Portada
  onProgress?.('Creando portada…')
  doc.setFillColor(cr, cg, cb)
  doc.rect(0, 0, PAGE.width, 92, 'F')
  doc.setFillColor(242, 245, 250)
  doc.rect(0, 92, PAGE.width, PAGE.height - 92, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`NIVEL ${level.order} DE 4`, PAGE.marginX, 28)
  doc.setFontSize(28)
  const titleLines = wrapText(doc, level.title, contentWidth, 28)
  doc.text(titleLines, PAGE.marginX, 48)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text('Cartilla virtual de estrategias de cuidado', PAGE.marginX, 78)

  doc.setTextColor(18, 35, 63)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Presentación', PAGE.marginX, 112)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const intro = wrapText(doc, level.description || '', contentWidth, 11)
  doc.text(intro, PAGE.marginX, 122)

  let y = 122 + intro.length * 5.4 + 10
  if (level.whyCaregiver) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(cr, cg, cb)
    const whyTitle = wrapText(
      doc,
      level.whyCaregiverTitle || 'Orientación para el cuidador',
      contentWidth,
      12,
    )
    doc.text(whyTitle, PAGE.marginX, y)
    y += whyTitle.length * 6 + 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(58, 77, 107)
    const whyBody = wrapText(doc, level.whyCaregiver, contentWidth, 10)
    doc.text(whyBody, PAGE.marginX, y)
  }

  // Índice
  addFooter()
  doc.addPage()
  page += 1
  onProgress?.('Armando el índice…')
  y = PAGE.marginTop
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(18, 35, 63)
  doc.text('Índice de áreas', PAGE.marginX, y)
  y += 12

  level.occupations.forEach((occupation, index) => {
    y = ensureSpace(14, y)
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(210, 220, 235)
    doc.roundedRect(PAGE.marginX, y - 5, contentWidth, 11, 2, 2, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(cr, cg, cb)
    doc.text(`${index + 1}.`, PAGE.marginX + 3, y + 2)
    doc.setTextColor(18, 35, 63)
    doc.text(occupation.title, PAGE.marginX + 12, y + 2)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(90, 107, 130)
    doc.text(
      `${occupation.activities.length} actividades`,
      PAGE.width - PAGE.marginX - 3,
      y + 2,
      { align: 'right' },
    )
    y += 14
  })

  // Contenido por área y actividad
  for (const [occIndex, occupation] of level.occupations.entries()) {
    onProgress?.(`Área ${occIndex + 1} de ${level.occupations.length}: ${occupation.shortTitle}`)
    addFooter()
    doc.addPage()
    page += 1
    y = PAGE.marginTop

    doc.setFillColor(cr, cg, cb)
    doc.roundedRect(PAGE.marginX, y, contentWidth, 22, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`ÁREA ${occIndex + 1}`, PAGE.marginX + 4, y + 8)
    doc.setFontSize(14)
    const areaTitle = wrapText(doc, occupation.title, contentWidth - 8, 14)
    doc.text(areaTitle, PAGE.marginX + 4, y + 16)
    y += 30

    for (const [actIndex, activity] of occupation.activities.entries()) {
      onProgress?.(
        `Preparando ${occupation.shortTitle}: ${actIndex + 1}/${occupation.activities.length}`,
      )

      const imageUrl = getActivityImage(activity.id).replace(/w=\d+/, 'w=700')
      const imageData = await loadImageDataUrl(imageUrl)
      const imageHeight = imageData ? 42 : 0
      const titleLines = wrapText(
        doc,
        `${actIndex + 1}. ${activity.title}`,
        contentWidth - 4,
        13,
      )
      const blockStartNeed = 10 + titleLines.length * 6 + imageHeight + 8
      y = ensureSpace(Math.min(blockStartNeed, 80), y)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(18, 35, 63)
      doc.text(titleLines, PAGE.marginX, y)
      y += titleLines.length * 6 + 3

      if (imageData) {
        y = ensureSpace(imageHeight + 4, y)
        try {
          doc.addImage(imageData, 'JPEG', PAGE.marginX, y, contentWidth, imageHeight, undefined, 'FAST')
        } catch {
          // Si el formato no es JPEG válido, se omite la imagen
        }
        y += imageHeight + 5
      }

      activity.strategies.forEach((strategy, strategyIndex) => {
        const label = `${strategyIndex + 1}. ${strategy}`
        const lines = wrapText(doc, label, contentWidth - 8, 10)
        const boxHeight = lines.length * 4.8 + 6
        y = ensureSpace(boxHeight + 3, y)

        doc.setFillColor(247, 250, 253)
        doc.setDrawColor(230, 236, 245)
        doc.roundedRect(PAGE.marginX, y - 3.5, contentWidth, boxHeight, 2, 2, 'FD')
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(40, 55, 80)
        doc.text(lines, PAGE.marginX + 3, y + 2)
        y += boxHeight + 3
      })

      y += 6
    }
  }

  // Cierre
  addFooter()
  doc.addPage()
  page += 1
  y = PAGE.marginTop + 20
  doc.setFillColor(cr, cg, cb)
  doc.roundedRect(PAGE.marginX, y, contentWidth, 60, 4, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Fin de la cartilla de este nivel', PAGE.marginX + 8, y + 22)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const closing = wrapText(
    doc,
    'Estas estrategias orientan el acompañamiento cotidiano. Adáptelas a cada persona y consulte siempre a profesionales de salud cuando sea necesario.',
    contentWidth - 16,
    11,
  )
  doc.text(closing, PAGE.marginX + 8, y + 34)
  addFooter()

  onProgress?.('Descargando PDF…')
  const fileName = `cartilla-${level.id}-${level.shortTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`
  doc.save(fileName)
}
