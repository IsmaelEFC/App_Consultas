let data = {};

function calcularDV(rut) {
  const limpio = String(rut).replace(/[^0-9]/g, '');
  if (!limpio || limpio.length === 0) return null;
  let suma = 0;
  let factor = 2;
  for (let i = limpio.length - 1; i >= 0; i--) {
    suma += parseInt(limpio[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const dv = 11 - (suma % 11);
  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return String(dv);
}

function formatearRUT(rut) {
  const s = String(rut).replace(/[^0-9]/g, '');
  if (!s) return '';
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function createDVWidget() {
  const div = document.createElement('div');
  div.className = 'dv-widget';
  div.innerHTML = `
    <div class="dv-input-group">
      <input type="text" class="dv-input" inputmode="numeric" placeholder="12345678" autocomplete="off" />
      <div class="dv-display">
        <span class="dv-display-value">?</span>
      </div>
    </div>
  `;

  const input = div.querySelector('.dv-input');
  const dvDisplay = div.querySelector('.dv-display-value');

  input.addEventListener('input', () => {
    const raw = input.value.replace(/[^0-9]/g, '');
    input.value = raw;
    const dv = calcularDV(raw);
    if (dv && raw.length > 0) {
      dvDisplay.textContent = dv;
      dvDisplay.className = 'dv-display-value dv-ok';
    } else {
      dvDisplay.textContent = '?';
      dvDisplay.className = 'dv-display-value';
    }
  });

  return div;
}

function createCard(item, index) {
  if (item.type === 'tool' && item.tool === 'rut-dv') {
    return {
      html: `
        <div class="card card-tool" data-tool="rut-dv" style="animation-delay:${index * 60}ms">
          <div class="card-accent"></div>
          <h3 class="card-title" style="display:none">${item.title}</h3>
          <div class="dv-header">
            <i class="${item.icon}"></i>
            <span>${item.title}</span>
          </div>
          <div class="card-content"></div>
        </div>
      `,
      isTool: true,
      toolType: 'rut-dv'
    };
  }

  return {
    html: `
      <div class="card" style="animation-delay:${index * 60}ms">
        <div class="card-accent"></div>
        <a href="${item.url}" target="_blank" rel="noopener noreferrer">
          <div class="card-content">
            <div class="card-icon">
              <i class="${item.icon}"></i>
            </div>
            <h3 class="card-title">${item.title}</h3>
            ${item.credentials ? `<p class="card-credentials">${item.credentials}</p>` : ''}
          </div>
        </a>
      </div>
    `,
    isTool: false
  };
}

function initToolWidgets(sectionId) {
  const section = document.getElementById(sectionId);
  section.querySelectorAll('.card-tool[data-tool="rut-dv"]').forEach(card => {
    if (card.querySelector('.dv-widget')) return;
    const content = card.querySelector('.card-content');
    content.appendChild(createDVWidget());
  });
}

function loadSection(id) {
  const section = document.getElementById(id);
  const grid = section.querySelector('.cards-grid');
  const items = data[id];

  grid.innerHTML = items.map((item, i) => createCard(item, i).html).join('');
  document.getElementById(`count-${id}`).textContent = items.length;

  initToolWidgets(id);
}

function moveIndicator(btn) {
  const nav = document.querySelector('.tabs-nav');
  const indicator = document.getElementById('tab-indicator');
  const navRect = nav.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();

  indicator.style.width = `${btnRect.width}px`;
  indicator.style.left = `${btnRect.left - navRect.left}px`;
}

function switchTab(id) {
  const section = document.getElementById(id);
  if (!section.dataset.loaded) {
    loadSection(id);
    section.dataset.loaded = 'true';
  }

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  const btn = document.querySelector(`.tab-btn[data-section="${id}"]`);
  btn.classList.add('active');
  section.classList.add('active');
  moveIndicator(btn);

  document.title = `${btn.querySelector('span').textContent} - Consulta OSINT`;

  const input = document.getElementById('search-input');
  input.value = '';
  filterCards('');
  updateClearButton();
}

function filterCards(term) {
  const q = term.toLowerCase().trim();
  const active = document.querySelector('.section.active');
  if (!active) return;

  let visible = 0;
  active.querySelectorAll('.card').forEach(card => {
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const match = !q || title.includes(q);
    card.classList.toggle('hidden', !match);
    if (match) visible++;
  });

  const empty = active.querySelector('.empty-state');
  empty.classList.toggle('visible', visible === 0);
}

function updateClearButton() {
  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-clear');
  btn.classList.toggle('visible', input.value.length > 0);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('data.json');
    data = await res.json();

    const first = document.querySelector('.tab-btn.active') || document.querySelector('.tab-btn');
    switchTab(first.dataset.section);

    window.addEventListener('resize', () => {
      const active = document.querySelector('.tab-btn.active');
      if (active) moveIndicator(active);
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.section));
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', e => {
      filterCards(e.target.value);
      updateClearButton();
    });

    document.getElementById('search-clear').addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      filterCards('');
      updateClearButton();
    });
  } catch (err) {
    console.error('Error al cargar datos:', err);
  }
});
