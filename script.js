/* =========================================
   Bem Viver Imóveis - Full Stack (Final com Plantas)
   ========================================= */

const API_URL = "http://127.0.0.1:8000/api/properties";
let PROPERTIES = []; 

const fmtBRL = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// --- 1. FETCH API (Busca dados do Python) ---
async function fetchProperties() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ao conectar com a API');
    PROPERTIES = await response.json(); 
    return PROPERTIES;
  } catch (error) {
    console.error("Erro:", error);
    const grid = document.getElementById('propertiesGrid');
    if(grid) grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:red;">
      <i class="fas fa-server fa-2x"></i><br><br>
      Erro ao conectar com o servidor Python.<br>Verifique se o terminal está rodando.
    </div>`;
    return [];
  }
}

// --- 2. RENDERIZAÇÃO DA HOME (Cards) ---
function createCard(p) {
  const imgCover = p.images && p.images.length > 0 ? p.images[0] : 'placeholder.jpg';
  
  return `
    <article class="property-card" data-id="${p.id}">
      <div class="thumb">
        <img src="${imgCover}" alt="${p.title}" loading="lazy">
        ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
      </div>
      <div class="property-info">
        <h3>${p.title}</h3>
        <div class="price">${fmtBRL(p.price)}</div>
        <div class="property-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${p.location.split(',')[0]}</span>
          <span><i class="fas fa-bed"></i> ${p.bedrooms}</span>
          <span><i class="fas fa-ruler-combined"></i> ${p.area}m²</span>
        </div>
        <div class="property-actions">
          <a href="detalhes.html?id=${p.id}" class="btn btn-secondary">Detalhes</a>
          <button class="btn btn-primary" onclick="openSchedule('${p.id}')">Visitar</button>
        </div>
      </div>
    </article>
  `;
}

function renderGrid(list, elementId = 'propertiesGrid') {
  const grid = document.getElementById(elementId);
  if (!grid) return;
  
  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">Nenhum imóvel encontrado.</div>`;
    if(document.getElementById('resultsCount')) document.getElementById('resultsCount').textContent = '';
    return;
  }
  
  grid.innerHTML = list.map(createCard).join('');
  
  if(document.getElementById('resultsCount')) {
    document.getElementById('resultsCount').textContent = `Exibindo ${list.length} imóvel(is)`;
  }
}

// --- 3. PÁGINA DE DETALHES (Com Plantas, Transporte e Recomendações) ---
async function renderDetailsPage() {
  const container = document.getElementById('details-container');
  if (!container) return; 

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Imóvel não encontrado');
      
      const p = await response.json();
      document.title = `${p.title} | Bem Viver Imóveis`;

      // --- Mosaico de Imagens ---
      let displayImages = [...p.images];
      while (displayImages.length < 5) displayImages.push(displayImages[displayImages.length - 1] || 'placeholder.jpg');
      displayImages = displayImages.slice(0, 5);

      const galleryHTML = `
        <div class="gallery-mosaic">
          ${displayImages.map((img, index) => `
            <div class="gallery-item" onclick="openPhotoModal('${img}')">
              <img src="${img}" alt="Foto ${index + 1}">
            </div>
          `).join('')}
        </div>
      `;

      // --- Features ---
      const getIcon = (text) => {
        const t = text.toLowerCase();
        if (t.includes('piscina')) return 'fa-water';
        if (t.includes('academia')) return 'fa-dumbbell';
        if (t.includes('churrasqueira')) return 'fa-fire';
        if (t.includes('festa')) return 'fa-glass-cheers';
        if (t.includes('varanda')) return 'fa-umbrella-beach';
        if (t.includes('portaria')) return 'fa-user-shield';
        if (t.includes('solar')) return 'fa-solar-panel';
        return 'fa-check';
      };
      const featuresHTML = p.features.map(f => `
        <div class="feature-pill"><i class="fas ${getIcon(f)}"></i><span>${f}</span></div>
      `).join('');

      // --- Plantas ---
      const plans = p.plans && p.plans.length > 0 ? p.plans : [];
      let plansHTML = '';
      if (plans.length > 0) {
        plansHTML = `
          <div class="info-block">
            <h3>Plantas e Distribuição</h3>
            <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">Clique na planta para ampliar.</p>
            <div class="plans-grid">
              ${plans.map((planUrl, idx) => `
                <div class="plan-card" onclick="openPhotoModal('${planUrl}')">
                  <img src="${planUrl}" alt="Planta ${idx + 1}">
                  <div class="plan-overlay"><i class="fas fa-search-plus"></i></div>
                  <div class="plan-label">Opção ${idx + 1}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // --- Transporte ---
      const busLines = p.bus_lines && p.bus_lines.length > 0 ? p.bus_lines : [];
      let transportHTML = '';
      if (busLines.length > 0) {
        transportHTML = `
          <div class="transport-section">
            <div class="transport-header"><i class="fas fa-bus-alt"></i><h3>Transporte Público</h3></div>
            <p style="margin-bottom:15px; font-size:0.9rem; color:#666;">Linhas num raio de 500m:</p>
            <div class="bus-lines-grid">
              ${busLines.map(line => `<div class="bus-tag"><i class="fas fa-bus"></i> ${line}</div>`).join('')}
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(p.address)}&travelmode=transit" target="_blank" class="btn-maps-route">
              <i class="fas fa-map-marked-alt"></i> Ver rotas
            </a>
          </div>`;
      }

      // --- Recomendações ---
      let related = PROPERTIES.filter(item => item.id !== p.id && item.type === p.type);
      if (related.length === 0) related = PROPERTIES.filter(item => item.id !== p.id);
      related = related.slice(0, 3);
      const relatedHTML = related.map(r => `
        <a href="detalhes.html?id=${r.id}" class="mini-card">
          <img src="${r.images[0]}" alt="${r.title}">
          <div class="mini-card-info"><h4>${r.title}</h4><span>${fmtBRL(r.price)}</span><small>${r.location.split(',')[0]}</small></div>
        </a>`).join('');

      container.innerHTML = `
        <div class="container">
          <div class="details-header">
            <span class="detail-tag">${p.type}</span>
            <h1 style="margin-top:10px;">${p.title}</h1>
            <p class="detail-location"><i class="fas fa-map-marker-alt"></i> ${p.address}</p>
          </div>

          ${galleryHTML}

          <div class="details-content-wrapper">
            <div class="details-left">
              <div class="info-block">
                <h3>Sobre o imóvel</h3>
                <p style="color:#555; line-height:1.8;">${p.description}</p>
              </div>
              
              ${plansHTML}

              <div class="info-block">
                <h3>O que este lugar oferece</h3>
                <div class="features-modern-grid">${featuresHTML}</div>
              </div>

              ${transportHTML}
            </div>

            <aside class="details-sidebar">
              <div class="price-card">
                <span class="label">Valor de Venda</span>
                <div class="price-val">${fmtBRL(p.price)}</div>
                <div class="specs-row">
                  <div><i class="fas fa-bed"></i> ${p.bedrooms}</div>
                  <div><i class="fas fa-bath"></i> ${p.bathrooms}</div>
                  <div><i class="fas fa-ruler"></i> ${p.area}m²</div>
                  <div><i class="fas fa-car"></i> ${p.parking}</div>
                </div>
                <button class="btn btn-primary btn-full" onclick="openSchedule('${p.id}')">
                  <i class="fab fa-whatsapp"></i> Entre em Contato
                </button>
                <a href="simulacao.html" class="btn btn-secondary btn-full" style="margin-top:10px;">Simular Financiamento</a>
              </div>
              ${related.length > 0 ? `<div class="widget-related"><h3>Talvez você goste de:</h3><div class="mini-cards-list">${relatedHTML}</div></div>` : ''}
            </aside>
          </div>
        </div>
        
        <div id="photoModal" class="modal" onclick="this.classList.remove('show')">
          <div class="modal-content" style="background:transparent; box-shadow:none; text-align:center; display:flex; justify-content:center;">
             <img id="modalImgFull" src="" style="max-height:90vh; max-width:100%; border-radius:10px;">
          </div>
        </div>
      `;

  } catch (e) {
      console.error(e);
      container.innerHTML = `<div class="container" style="padding:100px; text-align:center;"><h2>Erro ao carregar</h2><a href="index.html" class="btn btn-primary">Voltar</a></div>`;
  }
}

// --- Helpers Globais ---
window.openPhotoModal = (src) => {
  const modal = document.getElementById('photoModal');
  const img = document.getElementById('modalImgFull');
  if(modal && img) { img.src = src; modal.classList.add('show'); }
}

function applySearchFilters() {
  const loc = (document.getElementById('filterLocation')?.value || '').toLowerCase();
  const type = document.getElementById('filterType')?.value || 'all';
  const bed = parseInt(document.getElementById('filterBedrooms')?.value || '0');
  const price = parseInt(document.getElementById('filterPrice')?.value || '0');
  
  const filtered = PROPERTIES.filter(p => {
    const mLoc = p.location.toLowerCase().includes(loc) || p.title.toLowerCase().includes(loc);
    const mType = type === 'all' || p.type === type;
    const mBed = bed === 0 || p.bedrooms >= bed;
    const mPrice = price === 0 || p.price <= price;
    return mLoc && mType && mBed && mPrice;
  });
  renderGrid(filtered);
}

window.openSchedule = async (id) => {
  let p = PROPERTIES.find(x => x.id === id);
  if (!p) { try { const res = await fetch(`${API_URL}/${id}`); p = await res.json(); } catch(e) { return; } }
  if (p) {
      document.getElementById('schedulePropertyTitle').textContent = p.title;
      document.getElementById('scheduleModal').classList.add('show');
  }
};

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', async () => {
  await fetchProperties();

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if(hamburger) hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));

  if (document.getElementById('details-container')) {
    renderDetailsPage(); 
  } else if (document.getElementById('propertiesGrid')) {
    if(window.location.pathname.includes('imoveis.html')) {
       const params = new URLSearchParams(window.location.search);
       if(document.getElementById('filterLocation')) document.getElementById('filterLocation').value = params.get('loc') || '';
       if(document.getElementById('filterType')) document.getElementById('filterType').value = params.get('type') || 'all';
       ['filterLocation', 'filterType', 'filterBedrooms', 'filterPrice'].forEach(id => document.getElementById(id)?.addEventListener('input', applySearchFilters));
       applySearchFilters();
    } else {
      renderGrid(PROPERTIES.slice(0, 3));
      const btnSearch = document.getElementById('btnSearch');
      if (btnSearch) {
        btnSearch.addEventListener('click', () => {
          const loc = document.getElementById('searchLocation').value;
          const type = document.getElementById('searchType').value;
          window.location.href = `imoveis.html?loc=${encodeURIComponent(loc)}&type=${type}`;
        });
      }
    }
  }

  document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', closeAllModals));
  window.onclick = (e) => { if(e.target.classList.contains('modal')) closeAllModals(); };

  const schedForm = document.getElementById('scheduleForm');
  if(schedForm) {
    schedForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('schedName').value;
      const date = document.getElementById('schedDate').value;
      const time = document.getElementById('schedTime').value;
      const propTitle = document.getElementById('schedulePropertyTitle').textContent;
      const text = `Olá! Me chamo *${name}*. Gostaria de agendar visita no imóvel: *${propTitle}* para o dia ${date} às ${time}.`;
      window.open(`https://wa.me/558499998888?text=${encodeURIComponent(text)}`, '_blank');
      closeAllModals();
    });
  }

  const contactForm = document.getElementById('contactForm');
  if(contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const msg = document.getElementById('message').value;
      const text = `Olá! Me chamo *${name}* (${email}). Gostaria de falar sobre: ${msg}`;
      window.open(`https://wa.me/558499998888?text=${encodeURIComponent(text)}`, '_blank');
    });
  }

  const statsSection = document.getElementById('statsRow');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = document.querySelectorAll('.counter');
          counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; 
            const increment = target / (duration / 16); 
            
            let current = 0;
            const updateCounter = () => {
              current += increment;
              if (current < target) {
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
              } else {
                counter.textContent = target; 
              }
            };
            updateCounter();
          });
          observer.unobserve(statsSection);
        }
      });
    }, { threshold: 0.5 }); 
    observer.observe(statsSection);
  }
});