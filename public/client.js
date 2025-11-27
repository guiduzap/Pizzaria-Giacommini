
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
  
  itemsContainer.innerHTML = '';
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
      <button class="btn btn-small btn-danger" onclick="removeFromCart(${i.id})" aria-label="Remover ${i.nome}" title="Remover ${i.nome}">
        <i class="fas fa-trash" aria-hidden="true"></i>
      </button>
    `;
    itemsContainer.appendChild(div);
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

async function checkout() {
  console.log('checkout() called', { cart, currentUser });
  if (cart.length === 0) return showToast('Carrinho vazio', 'error');
  
  const form = document.getElementById('checkout-form');
  let cliente = null;
  if (currentUser) {
    cliente = currentUser;
  } else if (form) {
    const nome = form.nome && form.nome.value && form.nome.value.trim();
    const telefone = form.telefone && form.telefone.value && form.telefone.value.trim();
    const endereco = form.endereco && form.endereco.value && form.endereco.value.trim();
    if (!nome || !telefone || !endereco) {
      return showToast('Preencha nome, telefone e endereço', 'error');
    }
    
    if (!/^\d{10,11}$/.test(telefone)) return showToast('Telefone inválido (somente números)', 'error');
    cliente = { nome, telefone, endereco };
  } else {
    return showToast('Dados do cliente não encontrados', 'error');
  }

  const btn = (form && form.querySelector('button[type="submit"]')) || document.querySelector('#cart-modal .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

  try {
    const itens = cart.map(i => ({ idproduto: i.id, quantidade: i.qtd }));
    const payload = {
      cliente, 
      itens,
      formapagamento: (form && form.pagamento && form.pagamento.value) ? form.pagamento.value : 'dinheiro'
    };

    console.log('checkout payload', payload);

    const r = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    let result = null;
    try { result = text ? JSON.parse(text) : null; } catch (e) { result = { raw: text }; }

    if (!r.ok) {
      const errMsg = (result && result.error) ? result.error : (result && result.mensagem) ? result.mensagem : (result && result.raw) ? result.raw : 'Erro ao enviar pedido';
      throw new Error(errMsg);
    }

    showToast('Pedido realizado com sucesso!');
    
    try {
      if (result.protocolo) localStorage.setItem('last_order_protocolo', result.protocolo);
      if (result.total) localStorage.setItem('last_order_total', result.total);
      localStorage.setItem('last_order_items', JSON.stringify(cart));
    } catch (e) {  }

    closeCheckout();
    cart = [];
    updateCartUI();
    
    const cartModal = document.getElementById('cart-modal');
    if (cartModal && cartModal.classList.contains('open')) toggleCart();
    
    if (window.location) window.location.href = '/success.html';
  } catch (err) {
    const msg = (err && err.message) ? err.message : 'Erro ao enviar pedido';
    showToast(msg, 'error');
    console.error('checkout error:', err);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Finalizar Pedido'; }
  }
}

function showCheckoutForm() {
  console.log('showCheckoutForm() called', { cart });
  if (cart.length === 0) return showToast('Carrinho vazio', 'error');
  const modal = document.getElementById('checkout-modal');
  if (!modal) return showToast('Checkout indisponível', 'error');
  modal.classList.add('open');

  if (currentUser) {
    const form = document.getElementById('checkout-form');
    if (form) {
      if (form.nome) form.nome.value = currentUser.nome || '';
      if (form.telefone) form.telefone.value = currentUser.telefone || '';
      if (form.endereco) form.endereco.value = currentUser.endereco || '';
    }
  }
}

function closeCheckout() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('open');
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
              <i class="fas fa-plus"></i> Add
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
      await checkout();
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
    loginLink.textContent = `Olá, ${currentUser.nome.split(' ')[0]}`;
    loginLink.href = '#';
    loginLink.onclick = (e) => {
      e.preventDefault();
      if(confirm('Sair?')) {
        localStorage.removeItem('user_data');
        window.location.reload();
      }
    };
  }
});

