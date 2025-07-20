let consultaData = {};

function createCard(item) {
  return `
      <div class="card">
          <a href="${item.url}" target="_blank" rel="noopener noreferrer">
              <div class="card-content">
                  <div class="icon-container">
                      <i class="${item.icon}"></i>
                  </div>
                  <h2 class="card-title">${item.title}</h2>
                  ${item.credentials ? `<p class="credentials">${item.credentials}</p>` : ''}
              </div>
          </a>
      </div>
  `;
}

function loadSection(sectionId) {
  if (!consultaData[sectionId]) {
    console.error(`No data found for section: ${sectionId}`);
    return;
  }
  const section = document.getElementById(sectionId);
  const cardsGrid = section.querySelector('.cards-grid');
  cardsGrid.innerHTML = consultaData[sectionId].map(createCard).join('');

  // Aplicar animación escalonada a las tarjetas
  const cards = cardsGrid.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 50}ms`; // 50ms de retraso entre cada tarjeta
  });
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

  // Actualizar el título de la página dinámicamente
  const sectionName = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
  document.title = `${sectionName} - Plataforma de Consultas`;

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

  let visibleCount = 0;
  const cards = activeSection.querySelectorAll('.card');
  cards.forEach(card => {
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const shouldShow = title.includes(term);
    card.style.display = shouldShow ? 'block' : 'none';
    if (shouldShow) {
      visibleCount++;
    }
  });

  // Mostrar u ocultar el mensaje de "no resultados"
  const noResultsMessage = activeSection.querySelector('.no-results');
  if (noResultsMessage) {
    noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
  }
}

searchInput.addEventListener('input', (e) => {
  filterCards(e.target.value);
});

// Carga inicial: Cargar solo la primera pestaña activa
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('data.json');
    consultaData = await response.json();

    // Selecciona el botón activo, o el primer botón si ninguno está activo.
    const initialActiveButton = document.querySelector('.nav-button.active') || document.querySelector('.nav-button');
    if (initialActiveButton) {
      switchTab(initialActiveButton.dataset.section);
    }
  } catch (error) {
    console.error('Failed to load consultation data:', error);
    // Aquí podrías mostrar un mensaje de error al usuario en la UI.
  }
});