/**
 * script.js - Lógica principal de SIOC OSINT
 */

let consultaData = {};
let deferredPrompt;

// --- GESTIÓN DE TEMAS (AUTOMÁTICO) ---

/**
 * Aplica el tema basado en la preferencia del sistema
 */
function applySystemTheme() {
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (isDarkMode) {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
  }
}

// Escuchar cambios en el tema del sistema
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    applySystemTheme();
  });
}

// --- COMPONENTES UI ---

/**
 * Crea una tarjeta de consulta con estructura semántica
 * @param {Object} item - Objeto con los datos de la consulta
 * @returns {string} HTML de la tarjeta
 */
function createCard(item) {
  return `
    <div class="card" role="listitem">
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="${item.title} - abre en nueva ventana">
        <div class="card-content">
          <div class="icon-container" aria-hidden="true">
            <i class="${item.icon}"></i>
          </div>
          <h2 class="card-title">${item.title}</h2>
          ${item.credentials ? `<p class="credentials" aria-label="Credenciales: ${item.credentials}">${item.credentials}</p>` : ''}
          <div class="card-footer">
            <span class="visit-link">Visitar sitio <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
          </div>
        </div>
      </a>
    </div>
  `;
}

// --- GESTIÓN DE CONTENIDO ---

/**
 * Carga el contenido de una sección específica con filtrado opcional
 * @param {string} sectionId - ID de la sección a cargar
 * @param {string} searchTerm - Término para filtrar (opcional)
 */
function loadSection(sectionId, searchTerm = '') {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const cardsGrid = section.querySelector('.cards-grid');
  if (!cardsGrid) return;

  let items = consultaData[sectionId] || [];
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    items = items.filter(item => 
      item.title.toLowerCase().includes(term) || 
      (item.credentials && item.credentials.toLowerCase().includes(term))
    );
  }

  if (items.length === 0) {
    cardsGrid.innerHTML = `
      <div class="no-results">
        <i class="fa-solid fa-magnifying-glass"></i>
        <p>No se encontraron resultados para "${searchTerm}"</p>
      </div>
    `;
    return;
  }

  cardsGrid.innerHTML = items.map(createCard).join('');

  // Animación escalonada
  const cards = cardsGrid.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 50}ms`;
  });
}

/**
 * Cambia a una pestaña específica
 */
function switchTab(sectionId) {
  const navButtons = document.querySelectorAll('.nav-button');
  const sections = document.querySelectorAll('.section');
  const searchInput = document.getElementById('search-input');

  navButtons.forEach(btn => {
    const isActive = btn.dataset.section === sectionId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  sections.forEach(section => {
    section.classList.toggle('active', section.id === sectionId);
  });

  // Recargar la sección actual con el filtro de búsqueda si existe
  loadSection(sectionId, searchInput ? searchInput.value : '');

  const sectionNames = { vehiculos: 'Vehículos', personas: 'Personas', otros: 'Otros' };
  document.title = `${sectionNames[sectionId]} | SIOC OSINT`;
}

// --- BÚSQUEDA ---

function initSearch() {
  const searchInput = document.getElementById('search-input');
  const clearSearch = document.getElementById('clear-search');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value;
    const activeSection = document.querySelector('.section.active').id;
    
    if (clearSearch) {
      clearSearch.classList.toggle('hidden', term === '');
    }
    
    loadSection(activeSection, term);
  });

  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      searchInput.value = '';
      clearSearch.classList.add('hidden');
      const activeSection = document.querySelector('.section.active').id;
      loadSection(activeSection);
      searchInput.focus();
    });
  }
}

// --- PWA & SERVICE WORKER ---

function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('SW registrado'))
        .catch(err => console.error('Error SW:', err));
    });
  }

  const installBtn = document.getElementById('install-button');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
  });

  if (installBtn) {
    installBtn.addEventListener('click', () => {
      if (!deferredPrompt) return;
      installBtn.classList.add('hidden');
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choice => {
        if (choice.outcome === 'accepted') console.log('Instalación aceptada');
        deferredPrompt = null;
      });
    });
  }

  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.classList.add('hidden');
    deferredPrompt = null;
  });
}

// --- INICIALIZACIÓN ---

document.addEventListener('DOMContentLoaded', async () => {
  applySystemTheme();
  initPWA();
  initSearch();

  const navButtons = document.querySelectorAll('.nav-button');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.section));
  });

  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Error cargando datos');
    consultaData = await response.json();

    const activeBtn = document.querySelector('.nav-button.active');
    if (activeBtn) switchTab(activeBtn.dataset.section);
  } catch (error) {
    console.error(error);
    const main = document.querySelector('main');
    if (main) main.innerHTML = '<div class="error-msg">Error al cargar los datos.</div>';
  }
});
