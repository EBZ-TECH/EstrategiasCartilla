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
  university: {
    name: 'Universidad de Santander',
    shortName: 'UDES',
    logoSrc: '/brand/logo-udes.png',
    logoAlt: 'Logo de la Universidad de Santander (UDES)',
    note: 'Vigilada MinEducación | SNIES 2832',
  },
  researchers: {
    title: 'Investigación y desarrollo de contenidos',
    names: ['Sara Isabela Ovalles Riveros', 'Darlyn Marcela Max Meneses'],
    note:
      'Diseño de los niveles, áreas y actividades de esta cartilla a partir de su investigación académica en la Universidad de Santander (UDES).',
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
        body: 'Cada área tiene actividades concretas (baño, vestirse, medicamentos, etc.). Toque una para ver las estrategias.',
      },
      {
        title: '4. Lea o escuche las estrategias',
        body: 'En cada actividad encontrará estrategias claras. Use el botón Escuchar para que la cartilla lea la página en voz alta.',
      },
      {
        title: '5. Ajuste el tamaño de letra',
        body: 'En la parte superior puede cambiar el tamaño del texto (A− / A / A+) para leer con más comodidad.',
      },
      {
        title: '6. Descargue el PDF',
        body: 'En el inicio puede descargar la cartilla completa con los 4 niveles. También, dentro de cada nivel, puede descargar solo ese nivel en PDF.',
      },
      {
        title: '7. Use el botón Volver',
        body: 'La flecha Volver en la parte superior le ayuda a regresar sin perderse.',
      },
    ],
  },
  references: {
    title: 'Referencias bibliográficas',
    lead:
      'Fuentes académicas y científicas que sustentan el contenido de esta cartilla y del aplicativo web ACTIVA-MENTE.',
    items: [
      {
        id: 'mayo-clinic-dcl',
        text: 'Mayo Clinic [Internet]. 2026 [citado el 17 de noviembre de 2026]. Deterioro cognitivo leve - Síntomas y causas.',
        url: 'https://www.mayoclinic.org/es/diseases-conditions/mild-cognitive-impairment/symptoms-causes/syc-20354578',
      },
      {
        id: 'oms-demencia',
        text: 'Organización Mundial de la Salud. Demencia [Internet]. Ginebra: Organización Mundial de la Salud; [citado 2026 nov 17].',
        url: 'https://www.who.int/es/news-room/fact-sheets/detail/dementia',
      },
      {
        id: 'alzint-2023',
        text: "Alzheimer's Disease International. Informe mundial sobre el Alzheimer 2023 [Internet]. Londres: Alzheimer's Disease International; 2023.",
        url: 'https://www.alzint.org/u/World-Alzheimer-Report-2023_Spanish.pdf',
      },
      {
        id: 'pico-monllor-2022',
        text: 'Picó-Monllor JA. La ocupación laboral como factor de protección en el deterioro cognitivo leve. Med Segur Trab [Internet]. 2022;68(267):83-89. doi:10.4321/s0465-546x2022000200001.',
      },
      {
        id: 'sotomayor-2022',
        text: 'Sotomayor Preciado AM, Zhunio Bermeo FI, Ajila Saraguro AB, Pelaez Dias PA. Funcionamiento cognitivo de la vejez y la dependencia del adulto mayor. Dominio Cienc [Internet]. 2022;8(3):722-734. doi:10.23857/dc.v8i3.2953.',
      },
      {
        id: 'aota-2020',
        text: 'American Occupational Therapy Association (AOTA). Occupational therapy practice framework: domain and process. 4th ed. Am J Occup Ther. 2020;74(Suppl 2):7412410010p1-7412410010p87. doi:10.5014/ajot.2020.74S2001.',
      },
      {
        id: 'papalia-2009',
        text: 'Papalia DE, Wendkos Olds S, Duskin Feldman R. Desarrollo humano. 11.ª ed. México: McGraw-Hill; 2009.',
      },
      {
        id: 'ocampo-2021',
        text: 'Ocampo-Chaparro JM, Reyes-Ortiz CA. Efecto conjunto de deterioro cognitivo y condición sociofamiliar sobre el estado funcional en adultos mayores hospitalizados. Rev Latinoam Psicol [Internet]. 2021 [citado el 17 de noviembre de 2026];53:20–9.',
        url: 'https://revistalatinoamericanadepsicologia.konradlorenz.edu.co/uploads/pdf/ccfc57dd-546c-4082-aa21-26b5ae72317e.pdf',
      },
      {
        id: 'garcia-cabrera-2022',
        text: 'García-Cabrera L, Mateos-Nozal J, Rexach Cano L. Protocolo diagnóstico y terapéutico de la demencia avanzada en las personas mayores. Medicine. 2022;13(62):3695-3699. doi:10.1016/j.med.2022.08.016.',
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
    'Cuando termine, toque Empezar ahora.',
  ].join(' ')
}
