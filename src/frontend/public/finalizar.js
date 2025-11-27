
let orderCart = JSON.parse(localStorage.getItem('cart') || '[]');

function formatMoney(v) { return `R$ ${Number(v).toFixed(2)}`; }

function renderOrderItems() {
  const container = document.getElementById('order-items');
  container.innerHTML = '';
  if (orderCart.length === 0) {
    container.innerHTML = '<div class="text-center" style="color:var(--text-muted)">Nenhum item no carrinho.</div>';
    updateSummary();
    return;
  }

  orderCart.forEach((it, idx) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.style.marginBottom = '8px';
    div.innerHTML = `
      <div style="display:flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${it.nome}</strong><br>
          <small>${it.qtd} x ${formatMoney(it.valor)}</small>
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn btn-small" onclick="decreaseQty(${idx})">-</button>
          <span>${it.qtd}</span>
          <button class="btn btn-small" onclick="increaseQty(${idx})">+</button>
          <button class="btn btn-small btn-danger" onclick="removeItem(${idx})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
  updateSummary();
}

function increaseQty(i) { orderCart[i].qtd++; saveAndRender(); }
function decreaseQty(i) { if (orderCart[i].qtd>1) orderCart[i].qtd--; else orderCart.splice(i,1); saveAndRender(); }
function removeItem(i) { orderCart.splice(i,1); saveAndRender(); }

function saveAndRender(){
  localStorage.setItem('cart', JSON.stringify(orderCart));
  renderOrderItems();
}

function updateSummary(){
  const subtotal = orderCart.reduce((s,it)=> s + (it.valor * it.qtd), 0);
  const taxa = 0.00; 
  const total = subtotal + taxa;
  document.getElementById('subtotal').textContent = formatMoney(subtotal);
  document.getElementById('taxa').textContent = formatMoney(taxa);
  document.getElementById('total').textContent = formatMoney(total);
}

async function fetchBebidas(){
  try {
    const r = await fetch('/api/produtos');
    const produtos = await r.json();
    const bebidas = produtos.filter(p => p.tipo === 'bebida');
    const container = document.getElementById('bebidas-list');
    container.innerHTML = '';
    bebidas.forEach(b => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div style="font-weight:600">${b.nome}</div>
          <div style="color:var(--text-muted)">${formatMoney(b.valor)}</div>
          <div>
            <button class="btn btn-small btn-primary" onclick='addBebida(${b.id}, "${b.nome.replace(/'/g,"\\'")}", ${b.valor})'>Adicionar</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Erro ao carregar bebidas', err);
  }
}

function addBebida(id, nome, valor){
  const existing = orderCart.find(i=>i.id===id);
  if (existing) existing.qtd++;
  else orderCart.push({ id, nome, valor, qtd: 1 });
  saveAndRender();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  
  const user = JSON.parse(localStorage.getItem('user_data') || 'null');
  if (user) {
    const f = document.getElementById('finalize-form');
    if (f.nome) f.nome.value = user.nome || '';
    if (f.telefone) f.telefone.value = user.telefone || '';
    if (f.endereco) f.endereco.value = user.endereco || '';
  }

  renderOrderItems();
  fetchBebidas();

  const form = document.getElementById('finalize-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (orderCart.length === 0) return alert('Seu carrinho está vazio');

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true; btn.textContent = 'Enviando...';

    try {
      const cliente = {
        nome: form.nome.value,
        telefone: form.telefone.value,
        endereco: form.endereco.value
      };
      const itens = orderCart.map(i => ({ idproduto: i.id, quantidade: i.qtd }));
      const payload = { cliente, itens, formapagamento: form.pagamento.value };

      const resp = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = await resp.text();
      let result = null;
      try{ result = text ? JSON.parse(text) : null; } catch(e){ result = { raw: text }; }

      if (resp.ok) {
        if (result.protocolo) localStorage.setItem('last_order_protocolo', result.protocolo);
        if (result.total) localStorage.setItem('last_order_total', result.total);
        localStorage.setItem('last_order_items', JSON.stringify(orderCart));

        orderCart = [];
        localStorage.setItem('cart', JSON.stringify(orderCart));

        window.location.href = '/success.html';
      } else {
        const errMsg = (result && result.error) ? result.error : (result && result.raw) ? result.raw : 'Erro ao enviar pedido';
        alert(errMsg);
      }

    } catch (err) {
      console.error('Erro enviar pedido', err);
      alert('Erro de conexão');
    } finally {
      btn.disabled = false; btn.textContent = original;
    }
  });
});
