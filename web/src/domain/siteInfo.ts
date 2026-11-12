/** Datos de marca, créditos y manual de uso. */
export const siteInfo = {
  brand: {
    name: 'ACTIVA-MENTE: OCUPACIONES PARA LA VIDA',
    shortName: 'ACTIVA-MENTE',
    subtitle:
      'Guía de estrategias ocupacionales según los niveles de funcionamiento cognitivo.',
    logoSrc: '/brand/logo-activa-mente.png',
    logoAlt: 'Logo de ACTIVA-MENTE: ocupaciones para la vida',
  },
  researchers: {
    title: 'Investigación y desarrollo de contenidos',
    names: ['Sara Isabela Ovalles Riveros', 'Darlyn Marcela Max Meneses'],
    note:
      'Diseño de los niveles, áreas y actividades de esta cartilla a partir de su investigación académica.',
  },
  company: {
    name: 'Ebenezer Technologies (EBZ TEC)',
    shortName: 'EBZ TEC',
    email: 'ebztech2@gmail.com',
  },
  developer: {
    name: 'Michael Andrés Lozada Blanco',
    role: 'Desarrollo de aplicativo web',
    phone: '',
    phoneHref: '',
    note:
      'El contenido de esta cartilla corresponde a una investigación académica. El trabajo realizado aquí es el desarrollo digital de la versión virtual.',
  },
  usageManual: {
    title: 'Manual de uso',
    storageKey: 'activa-mente-manual-seen-v1',
    steps: [
      {
        title: '1. Elija el nivel cognitivo',
        body: 'En la pantalla de inicio toque el nivel que mejor describe a la persona mayor: Normal, Leve, Moderado o Severo.',
      },
      {
        title: '2. Elija un área',
        body: 'Dentro del nivel verá áreas como vida diaria, salud, descanso, trabajo, ocio o participación social. Toque el área que necesita.',
      },
      {
        title: '3. Abra una actividad',
        body: 'Cada área tiene actividades concretas (baño, vestirse, medicamentos, etc.). Toque una para ver los consejos.',
      },
      {
        title: '4. Lea o escuche los consejos',
        body: 'En cada actividad encontrará estrategias claras. Use el botón Escuchar para que la cartilla lea la página en voz alta.',
      },
      {
        title: '5. Ajuste el tamaño de letra',
        body: 'En la parte superior puede cambiar el tamaño del texto (A− / A / A+) para leer con más comodidad.',
      },
      {
        title: '6. Descargue el PDF del nivel',
        body: 'En la página de cada nivel puede descargar un PDF con todas las áreas y consejos de ese nivel.',
      },
      {
        title: '7. Use el botón Volver',
        body: 'La flecha Volver en la parte superior le ayuda a regresar sin perderse.',
      },
    ],
  },
}

export function getUsageManualSpeechText(): string {
  const { usageManual, brand } = siteInfo
  return [
    `${brand.name}.`,
    brand.subtitle,
    `${usageManual.title}.`,
    ...usageManual.steps.map((step) => `${step.title}. ${step.body}`),
    'Cuando termine, toque Entendido para empezar.',
  ].join(' ')
}
