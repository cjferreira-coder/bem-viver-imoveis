/* =========================================
   Bem Viver Imóveis - Integração Python (Full Stack)
   ========================================= */

// Aponta para o seu servidor Python que está rodando na janela preta
const API_URL = "http://127.0.0.1:8000/api/properties";

// A lista agora começa vazia. O Python vai preenchê-la.
let PROPERTIES = []; 

const fmtBRL = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// --- 1. FUNÇÃO PARA BUSCAR TODOS OS IMÓVEIS (GET) ---
async function fetchProperties() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ao conectar com a API');
    
    // Transforma o JSON bruto do Python em objetos JavaScript
    PROPERTIES = await response.json(); 
    return PROPERTIES;
  } catch (error) {
    console.error("Erro de conexão:", error);
    // Mostra erro na tela se o servidor Python estiver desligado
    const grid = document.getElementById('propertiesGrid');
    if(grid) grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:red;">
      <i class="fas fa-server fa-2x"></i><br><br>
      Erro ao conectar com o servidor.<br>Verifique se o terminal do Python está aberto.
    </div>`;
    return [];
  }
}

// --- RENDERIZAÇÃO DE CARDS (Visualização na Home/Busca) ---
function createCard(p) {
  // Garante que pegamos a primeira imagem ou uma padrão se estiver vazio
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

// --- FILTROS DE BUSCA (Front-end Filtering) ---
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

// --- 2. PÁGINA DE DETALHES (Busca Individual por ID) ---
async function renderDetailsPage() {
  const container = document.getElementById('details-container');
  if (!container) return; 

  // Pega o ID da URL (ex: detalhes.html?id=bv-001)
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  try {
      // Vai no Python buscar SÓ esse imóvel
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Imóvel não encontrado');
      
      const p = await response.json();

      document.title = `${p.title} | Bem Viver Imóveis`;

      // Monta HTML da Galeria
      const galleryHTML = `
        <div class="gallery-grid">
          <div class="gallery-main">
            <img src="${p.images[0]}" alt="Foto Principal" id="mainImg">
          </div>
          <div class="gallery-thumbs">
            ${p.images.slice(1, 5).map(img => `<img src="${img}" alt="Foto detalhe" onclick="changeMainImage(this.src)">`).join('')}
          </div>
        </div>
      `;

      // Monta HTML das Características
      const featuresHTML = p.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('');

      // Injeta tudo na página
      container.innerHTML = `
        <div class="container">
          <div class="details-header">
            <span class="detail-tag">${p.type}</span>
            <h1>${p.title}</h1>
            <p class="detail-location"><i class="fas fa-map-marker-alt"></i> ${p.address}</p>
          </div>

          ${galleryHTML}

          <div class="details-content-wrapper">
            <div class="details-left">
              <div class="info-block">
                <h3>Descrição</h3>
                <p>${p.description}</p>
              </div>
              <div class="info-block">
                <h3>Características</h3>
                <ul class="features-grid-list">${featuresHTML}</ul>
              </div>
              <div class="info-block">
                <h3>Localização</h3>
                <div class="fake-map">
                  <i class="fas fa-map-marked-alt"></i>
                  <p>Visualização do mapa em: ${p.address}</p>
                </div>
              </div>
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
                  <i class="fab fa-whatsapp"></i> Agendar Visita
                </button>
                <a href="simulacao.html" class="btn btn-secondary btn-full" style="margin-top:10px;">Simular Financiamento</a>
              </div>
            </aside>
          </div>
        </div>
      `;
  } catch (e) {
      console.error(e);
      container.innerHTML = `<div class="container" style="padding:100px; text-align:center;">
        <h2>Imóvel não encontrado ou Erro na API</h2>
        <p>Verifique se o ID está correto ou se o backend está rodando.</p>
        <a href="index.html" class="btn btn-primary">Voltar</a>
      </div>`;
  }
}

window.changeMainImage = (src) => { document.getElementById('mainImg').src = src; };

// --- MODAIS & WHATSAPP ---
window.openSchedule = async (id) => {
  // Se o usuário clicar em "Visitar", precisamos garantir que temos os dados
  // Se estivermos na home, já temos o array PROPERTIES. Se for detalhes, buscamos de novo se necessário.
  let p = PROPERTIES.find(x => x.id === id);
  
  if (!p) {
      // Fallback: Busca rapidinho na API caso não esteja em memória
      try {
          const res = await fetch(`${API_URL}/${id}`);
          p = await res.json();
      } catch(e) { return; }
  }
  
  if (p) {
      document.getElementById('schedulePropertyTitle').textContent = p.title;
      document.getElementById('scheduleModal').classList.add('show');
  }
};

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
}

// --- INICIALIZAÇÃO (Onde tudo começa) ---
document.addEventListener('DOMContentLoaded', async () => {
  
  // 1. O site carrega e IMEDIATAMENTE vai buscar dados no Python
  // O 'await' aqui garante que a gente espera os dados chegarem antes de desenhar
  await fetchProperties();

  // 2. Configurações de Menu (Mobile)
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if(hamburger) hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));

  // 3. Verifica em qual página estamos para desenhar o conteúdo certo
  if (document.getElementById('details-container')) {
    // Estamos na página de Detalhes
    renderDetailsPage(); 
  } else if (document.getElementById('propertiesGrid')) {
    // Estamos na Home ou Busca
    if(window.location.pathname.includes('imoveis.html')) {
       // Configura filtros da página de busca
       const params = new URLSearchParams(window.location.search);
       if(document.getElementById('filterLocation')) document.getElementById('filterLocation').value = params.get('loc') || '';
       if(document.getElementById('filterType')) document.getElementById('filterType').value = params.get('type') || 'all';
       
       ['filterLocation', 'filterType', 'filterBedrooms', 'filterPrice'].forEach(id => {
         document.getElementById(id)?.addEventListener('input', applySearchFilters);
       });
       document.querySelector('.btn-clear')?.addEventListener('click', () => {
          document.getElementById('filterLocation').value = '';
          document.getElementById('filterType').value = 'all';
          applySearchFilters();
       });
       applySearchFilters(); // Aplica filtros iniciais
    } else {
      // Home: Mostra apenas os 3 primeiros (Destaques)
      renderGrid(PROPERTIES.slice(0, 3));
      
      // Configura botão de busca da Home
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

  // 4. Listeners para fechar Modais
  document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', closeAllModals));
  window.onclick = (e) => { if(e.target.classList.contains('modal')) closeAllModals(); };

  // 5. Formulário de Agendamento (WhatsApp)
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

  // 6. Formulário de Contato Geral
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
});