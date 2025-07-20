const consultaData = {
  vehiculos: [
      {
          title: 'Consulta encargos',
          icon: 'fa-solid fa-car',
          url: 'https://www.autoseguro.gob.cl/'
      },
      {
          title: 'Consulta propietario',
          icon: 'fa-solid fa-magnifying-glass',
          url: 'https://www.volanteomaleta.com/'
      },
      {
          title: 'Consulta antecedentes',
          icon: 'fa-solid fa-triangle-exclamation',
          url: 'https://www.patentechile.com/'
      },
      {
          title: 'Consulta transporte público',
          icon: 'fa-solid fa-bus',
          url: 'https://apps.mtt.cl/consultaweb/'
      }
  ],
  personas: [
      {
          title: 'Consulta RUN o nombre',
          icon: 'fa-solid fa-address-card',
          url: 'https://www.nombrerutyfirma.com'
      },
      {
          title: 'Rutificador',
          icon: 'fa-solid fa-id-badge',
          url: 'https://rutificador.histomed.cl/index.php'
      },
      {
          title: 'Consulta situación migratoria',
          icon: 'fa-solid fa-globe',
          url: 'https://apps-publicas.interior.gob.cl/situacion-migratoria-web/login_inicio'
          // credentials: 'Email: GENE_CARABI | Contraseña: GEn17CAR2' // Descomentado para demostración
      },
      {
          title: 'Consulta prestadores de salud',
          icon: 'fa-solid fa-staff-snake',
          url: 'https://rnpi.superdesalud.gob.cl/#'
      },
      {
          title: 'Búsqueda de abogados',
          icon: 'fa-solid fa-scale-balanced',
          url: 'https://www.pjud.cl/transparencia/busqueda-de-abogados'
      }
  ],
  otros: [
      {
          title: 'Consulta compañía telefónica',
          icon: 'fa-solid fa-mobile-screen-button',
          url: 'https://www.numerosportados.cl/PublicWebsite/'
      },
      {
          title: 'Consulta multas Santiago',
          icon: 'fa-solid fa-ban',
          url: 'https://pagos.munistgo.cl/pagopci/multas.aspx'
      },
      {
          title: 'Consulta infracciones fiscalización',
          icon: 'fa-solid fa-clipboard-list',
          url: 'http://rrvv.fiscalizacion.cl/MTTVias2019/'
      },
      {
          title: 'Consulta de Dirección',
          icon: 'fa-solid fa-map-location-dot',
          url: 'https://www.correos.cl/web/guest/codigo-postal'
      },
      {
          title: 'Propietario por Dirección (Agua)',
          icon: 'fa-solid fa-house-user',
          url: 'https://m.aguasandinas.cl/web/aguasandinas/pagar-mi-cuenta'
      },
      {
          title: 'Consulta por Mapa (SII)',
          icon: 'fa-solid fa-map',
          url: 'https://www4.sii.cl/mapasui/internet/#/contenido/index.html'
      },
      {
          title: 'Consulta Diario Oficial',
          icon: 'fa-solid fa-newspaper',
          url: 'https://www.diariooficial.interior.gob.cl/'
      }
  ]
};

function createCard(item) {
  return `
      <div class="card">
          <a href="${item.url}" target="_blank" rel="noopener noreferrer">
              <div class="card-content">
                  <div class="icon-container">
                      <i class="${item.icon}"></i>
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

// Navigation handling
const navButtons = document.querySelectorAll('.nav-button');
const sections = document.querySelectorAll('.section');
const searchInput = document.getElementById('search-input');

function switchTab(sectionId) {
  // Cargar el contenido de la sección solo si no ha sido cargado antes
  const sectionElement = document.getElementById(sectionId);
  if (sectionElement.dataset.loaded !== 'true') {
    loadSection(sectionId);
    sectionElement.dataset.loaded = 'true';
  }

  // Actualizar estados activos de botones y secciones
  navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionId);
  });

  sections.forEach(section => {
    section.classList.toggle('active', section.id === sectionId);
  });

  // Limpiar la búsqueda al cambiar de pestaña
  searchInput.value = '';
  filterCards('');
}

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    const sectionId = button.dataset.section;
    switchTab(sectionId);
  });
});

// Lógica de búsqueda
function filterCards(searchTerm) {
  const term = searchTerm.toLowerCase();
  const activeSection = document.querySelector('.section.active');
  if (!activeSection) return;

  const cards = activeSection.querySelectorAll('.card');
  cards.forEach(card => {
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const shouldShow = title.includes(term);
    card.style.display = shouldShow ? 'block' : 'none';
  });
}

searchInput.addEventListener('input', (e) => {
  filterCards(e.target.value);
});

// Carga inicial: Cargar solo la primera pestaña activa
document.addEventListener('DOMContentLoaded', () => {
  // Selecciona el botón activo, o el primer botón si ninguno está activo.
  const initialActiveButton = document.querySelector('.nav-button.active') || document.querySelector('.nav-button');
  if (initialActiveButton) {
    switchTab(initialActiveButton.dataset.section);
  }
});