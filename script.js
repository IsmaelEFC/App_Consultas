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
  const isTool = item.type === 'tool';
  const href = isTool ? '#' : item.url;
  const extraAttrs = isTool
    ? `data-tool="${item.toolId || ''}" role="button"`
    : 'target="_blank" rel="noopener noreferrer"';
  const ariaLabel = isTool ? item.title : `${item.title} - abre en nueva ventana`;
  const footerLabel = isTool ? 'Abrir herramienta' : 'Visitar sitio';
  const footerIcon = isTool ? 'fa-solid fa-arrow-right' : 'fa-solid fa-arrow-up-right-from-square';

  return `
    <div class="card" role="listitem">
      <a href="${href}" ${extraAttrs} aria-label="${ariaLabel}">
        <div class="card-content">
          <div class="icon-container" aria-hidden="true">
            <i class="${item.icon}"></i>
          </div>
          <h2 class="card-title">${item.title}</h2>
          ${item.credentials ? `<p class="credentials" aria-label="Credenciales: ${item.credentials}">${item.credentials}</p>` : ''}
          <div class="card-footer">
            <span class="visit-link">${footerLabel} <i class="${footerIcon}" aria-hidden="true"></i></span>
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

function formatRutNumber(rutDigits) {
  const cleaned = String(rutDigits || '').replace(/\D/g, '');
  if (!cleaned) return '';
  const reversed = cleaned.split('').reverse();
  const parts = [];
  for (let i = 0; i < reversed.length; i += 3) {
    parts.push(reversed.slice(i, i + 3).reverse().join(''));
  }
  return parts.reverse().join('.');
}

function computeRutDv(rutDigits) {
  const cleaned = String(rutDigits || '').replace(/\D/g, '');
  if (!cleaned) return null;

  let sum = 0;
  let factor = 2;
  for (let i = cleaned.length - 1; i >= 0; i -= 1) {
    sum += Number(cleaned[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const mod = 11 - (sum % 11);
  if (mod === 11) return '0';
  if (mod === 10) return 'K';
  return String(mod);
}

function openRutDvModal() {
  const modal = document.getElementById('rut-dv-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  const input = document.getElementById('rut-dv-input');
  const result = document.getElementById('rut-dv-result');
  if (result) {
    result.classList.add('hidden');
    result.innerHTML = '';
  }
  if (input) {
    input.value = '';
    input.focus();
  }
}

function closeRutDvModal() {
  const modal = document.getElementById('rut-dv-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function renderRutDvResult(rutDigits) {
  const result = document.getElementById('rut-dv-result');
  if (!result) return;

  const dv = computeRutDv(rutDigits);
  if (!dv) {
    result.classList.add('hidden');
    result.innerHTML = '';
    return;
  }

  const formattedRut = formatRutNumber(rutDigits);
  const fullRut = `${formattedRut}-${dv}`;
  result.classList.remove('hidden');
  result.innerHTML = `
    <div class="result-text">
      <div>${fullRut}</div>
      <div class="result-meta">DV: ${dv}</div>
    </div>
    <button class="secondary-button" type="button" data-copy="${fullRut}">Copiar</button>
  `;
}

function initRutDvTool() {
  document.addEventListener('click', (e) => {
    const toolLink = e.target.closest('[data-tool]');
    if (toolLink) {
      const toolId = toolLink.getAttribute('data-tool');
      if (toolId === 'rut_dv') {
        e.preventDefault();
        openRutDvModal();
      }
      return;
    }

    const closeBtn = e.target.closest('[data-modal-close]');
    if (closeBtn) {
      e.preventDefault();
      closeRutDvModal();
      return;
    }

    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      e.preventDefault();
      const text = copyBtn.getAttribute('data-copy') || '';
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const modal = document.getElementById('rut-dv-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    closeRutDvModal();
  });

  const input = document.getElementById('rut-dv-input');
  const calcBtn = document.getElementById('rut-dv-calc');
  const clearBtn = document.getElementById('rut-dv-clear');

  if (input) {
    input.addEventListener('input', () => {
      renderRutDvResult(input.value);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        renderRutDvResult(input.value);
      }
    });
  }

  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      if (!input) return;
      renderRutDvResult(input.value);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!input) return;
      input.value = '';
      renderRutDvResult('');
      input.focus();
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
  initRutDvTool();

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
