
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
const currentUser = JSON.parse(localStorage.getItem('user_data') || 'null');

async function fetchJson(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.backgroundColor = type === 'error' ? '#d32f2f' : '#2e7d32';
  setTimeout(() => t.style.opacity = '0', 3000);
}

function addToCart(id, nome, valor) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qtd++;
  } else {
    cart.push({ id, nome, valor, qtd: 1 });
  }
  updateCartUI();
  try { localStorage.setItem('cart', JSON.stringify(cart)); } catch(e){}
  showToast(`${nome} adicionado!`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
  try { localStorage.setItem('cart', JSON.stringify(cart)); } catch(e){}
}

function updateCartUI() {
  const badge = document.getElementById('cart-count');
  const itemsContainer = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total-value');
  
  const totalQtd = cart.reduce((acc, i) => acc + i.qtd, 0);
  const totalVal = cart.reduce((acc, i) => acc + (i.valor * i.qtd), 0);
  
  if (badge) {
    badge.textContent = totalQtd;
    badge.style.display = totalQtd > 0 ? 'flex' : 'none';
  }
  
  if (itemsContainer) itemsContainer.innerHTML = '';
  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="text-center" style="margin-top: 40px; color: var(--text-muted);">
        Seu carrinho está vazio :(
      </div>
    `;
  } else {
    cart.forEach(i => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div>
          <strong>${i.nome}</strong><br>
          <small>${i.qtd}x R$${i.valor.toFixed(2)}</small>
        </div>
        <button class="btn btn-small btn-danger" onclick="removeFromCart(${i.id})">
          <i class="fas fa-trash"></i>
        </button>
      `;
      if (itemsContainer) itemsContainer.appendChild(div);
    });
  }
  
  if (totalEl) totalEl.textContent = `R$ ${totalVal.toFixed(2)}`;
}

function toggleCart() {
  try {
    const modal = document.getElementById('cart-modal');
    console.log('toggleCart called, modal=', modal);
    if (!modal) return console.warn('toggleCart: #cart-modal not found');
    modal.classList.toggle('open');
    console.log('toggleCart result, has open=', modal.classList.contains('open'));
  } catch (e) {
    console.error('toggleCart error', e);
  }
}

function showCheckoutForm() {
  if (cart.length === 0) return showToast('Carrinho vazio', 'error');
  document.getElementById('checkout-modal').style.display = 'flex';
  
  if (currentUser) {
    const form = document.getElementById('checkout-form');
    if(form.nome) form.nome.value = currentUser.nome || '';
    if(form.telefone) form.telefone.value = currentUser.telefone || '';
    if(form.endereco) form.endereco.value = currentUser.endereco || '';
  }
}

function closeCheckout() {
  document.getElementById('checkout-modal').style.display = 'none';
}

async function carregarProdutos() {
  const sliderSalgadas = document.getElementById('slider-salgadas');
  const sliderDoces = document.getElementById('slider-doces');
  const gridSobremesas = document.getElementById('grid-sobremesas');
  
  if(!sliderSalgadas) return; 

  sliderSalgadas.innerHTML = '';
  sliderDoces.innerHTML = '';
  gridSobremesas.innerHTML = '';

  try {
    const produtos = await fetchJson('/api/produtos');
    
    produtos.forEach(p => {
      const safeNome = String(p.nome).replace(/'/g, "\\'");
      const card = document.createElement('div');
      card.className = 'card slider-item';
      
      const imgUrl = p.imagem || '/img/placeholder.png';
      
      card.innerHTML = `
        <div style="height: 200px; overflow: hidden;">
          <img src="${imgUrl}" alt="${p.nome}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
          <h3 style="margin-bottom: 10px;">${p.nome}</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">Deliciosa e feita na hora.</p>
          <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; font-size: 1.2rem; color: var(--primary);">R$ ${p.valor.toFixed(2)}</span>
            <button class="btn btn-primary btn-small" onclick="addToCart(${p.id}, '${safeNome}', ${p.valor})">
              <i class="fas fa-cart-plus"></i> Adicionar
            </button>
          </div>
        </div>
      `;

      const isDoce = p.nome.toLowerCase().includes('chocolate') || p.nome.toLowerCase().includes('banana') || p.nome.toLowerCase().includes('romeu') || p.nome.toLowerCase().includes('doce');
      
      if (p.tipo === 'pizza') {
        if (isDoce) {
          sliderDoces.appendChild(card);
        } else {
          sliderSalgadas.appendChild(card);
        }
      } else if (p.tipo === 'sobremesa') {
        card.classList.remove('slider-item');
        gridSobremesas.appendChild(card);
      }
    });

  } catch (err) {
    console.error(err);
    showToast('Erro ao carregar cardápio', 'error');
  }
}

function scrollSlider(id, amount) {
  const slider = document.getElementById(id);
  slider.scrollBy({ left: amount, behavior: 'smooth' });
}

function filterMenu(type) {
  const secSalgadas = document.getElementById('section-salgadas');
  const secDoces = document.getElementById('section-doces');
  const secSobremesas = document.getElementById('section-sobremesas');
  
  secSalgadas.style.display = 'block';
  secDoces.style.display = 'block';
  secSobremesas.style.display = 'block';

  if (type === 'pizza') {
    secSobremesas.style.display = 'none';
  } else if (type === 'sobremesa') {
    secSalgadas.style.display = 'none';
    secDoces.style.display = 'none';
  }
  
  document.querySelectorAll('.btn-outline').forEach(b => b.classList.remove('active'));
  if(event) event.target.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
  updateCartUI();
  
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const f = e.target;
      const btn = f.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      
      btn.disabled = true;
      btn.textContent = 'Processando...';

      try {
        const cliente = {
          nome: f.nome.value,
          telefone: f.telefone.value,
          endereco: f.endereco.value
        };

        const itens = cart.map(i => ({ idproduto: i.id, quantidade: i.qtd }));
        
        const payload = {
          cliente,
          itens,
          formapagamento: f.pagamento.value
        };

        console.log('checkout payload', payload);

        const response = await fetch('/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const text = await response.text();
        let result = null;
        try { result = text ? JSON.parse(text) : null; } catch(e) { result = { raw: text }; }

        if (response.ok) {
          
          try {
            if (result.protocolo) localStorage.setItem('last_order_protocolo', result.protocolo);
            if (result.total) localStorage.setItem('last_order_total', result.total);
            localStorage.setItem('last_order_items', JSON.stringify(cart));
          } catch(e){}

          closeCheckout();
          cart = [];
          try { localStorage.setItem('cart', JSON.stringify(cart)); } catch(e){}
          updateCartUI();
          toggleCart(); 
          
          window.location.href = '/success.html';
        } else {
          const errMsg = (result && result.error) ? result.error : (result && result.mensagem) ? result.mensagem : (result && result.raw) ? result.raw : 'Erro ao realizar pedido';
          showToast(errMsg, 'error');
        }

      } catch (err) {
        console.error('checkout submit error:', err);
        showToast((err && err.message) ? err.message : 'Erro de conexão', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }
  
  try {
    const fab = document.querySelector('.cart-fab');
    if (fab && !fab._attachedToggle && !fab.hasAttribute('onclick')) {
      fab.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); });
      fab._attachedToggle = true;
      console.log('cart-fab listener attached');
    } else if (fab && fab.hasAttribute('onclick')) {
      console.log('cart-fab has inline onclick; skipping programmatic attach');
    }
    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout && !btnCheckout._attached && !btnCheckout.hasAttribute('onclick')) {
      btnCheckout.addEventListener('click', (e) => { e.preventDefault(); showCheckoutForm(); });
      btnCheckout._attached = true;
      console.log('btn-checkout listener attached');
    } else if (btnCheckout && btnCheckout.hasAttribute('onclick')) {
      console.log('btn-checkout has inline onclick; skipping programmatic attach');
    }
  } catch (e) { console.warn('listener attach error', e); }
  
  const loginLink = document.querySelector('a[href="/login.html"]');
  if (currentUser && loginLink) {
    
    const navLinks = loginLink.parentElement;
    loginLink.remove();
    
    const profileLink = document.createElement('a');
    profileLink.href = '/profile.html';
    profileLink.className = 'nav-link';
    profileLink.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.nome.split(' ')[0]}`;
    navLinks.appendChild(profileLink);
    
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-outline';
    logoutBtn.style.cssText = 'padding: 8px 16px; font-size: 0.9rem;';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
    logoutBtn.onclick = () => {
      if(confirm('Deseja realmente sair?')) {
        localStorage.removeItem('user_data');
        window.location.reload();
      }
    };
    navLinks.appendChild(logoutBtn);
  }
});

