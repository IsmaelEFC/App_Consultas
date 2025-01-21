const consultaData = {
  vehiculos: [
      {
          title: 'Consulta encargos',
          icon: '🚗',
          url: 'https://www.autoseguro.gob.cl/'
      },
      {
          title: 'Consulta propietario',
          icon: '🔍',
          url: 'https://www.volanteomaleta.com/'
      },
      {
          title: 'Consulta antecedentes',
          icon: '⚠️',
          url: 'https://www.patentechile.com/'
      },
      {
          title: 'Consulta transporte público',
          icon: '🚌',
          url: 'https://apps.mtt.cl/consultaweb/'
      }
  ],
  personas: [
      {
          title: 'Consulta RUN o nombre',
          icon: '📝',
          url: 'https://www.nombrerutyfirma.com'
      },
      {
          title: 'Consulta situación migratoria',
          icon: '🌎',
          url: 'https://apps-publicas.interior.gob.cl/situacion-migratoria-web/login_inicio',
          credentials: 'Email: GENE_CARABI | Contraseña: GEn17CAR2'
      },
      {
          title: 'Consulta prestadores de salud',
          icon: '⚕️',
          url: 'https://rnpi.superdesalud.gob.cl/#'
      },
      {
          title: 'Búsqueda de abogados',
          icon: '⚖️',
          url: 'https://www.pjud.cl/transparencia/busqueda-de-abogados'
      }
  ],
  otros: [
      {
          title: 'Consulta compañía telefónica',
          icon: '📱',
          url: 'https://www.numerosportados.cl/PublicWebsite/'
      },
      {
          title: 'Consulta multas Santiago',
          icon: '🚫',
          url: 'https://pagos.munistgo.cl/pagopci/multas.aspx'
      },
      {
          title: 'Consulta infracciones fiscalización',
          icon: '📋',
          url: 'http://rrvv.fiscalizacion.cl/MTTVias2019/'
      }
  ]
};

function createCard(item) {
  return `
      <div class="card">
          <a href="${item.url}" target="_blank" rel="noopener noreferrer">
              <div class="card-content">
                  <div class="icon-container">
                      <span style="font-size: 1.5rem;">${item.icon}</span>
                  </div>
                  <h3 class="card-title">${item.title}</h3>
                  ${item.credentials ? `<p class="credentials">${item.credentials}</p>` : ''}
              </div>
          </a>
      </div>
  `;
}

function loadSection(sectionId) {
  const section = document.getElementById(sectionId);
  const cardsGrid = section.querySelector('.cards-grid');
  cardsGrid.innerHTML = consultaData[sectionId].map(createCard).join('');
}

// Initial load
Object.keys(consultaData).forEach(loadSection);

// Navigation handling
const navButtons = document.querySelectorAll('.nav-button');
const sections = document.querySelectorAll('.section');

navButtons.forEach(button => {
  button.addEventListener('click', () => {
      const sectionId = button.dataset.section;
      
      // Update active states
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      sections.forEach(section => {
          section.classList.remove('active');
          if (section.id === sectionId) {
              section.classList.add('active');
          }
      });
  });
});