
const token = localStorage.getItem('admin_token');
if (!token) {
    window.location.href = '/admin-login.html';
}

async function fetchJson(url, opts) {

  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function carregarProdutosAdmin() {
  const container = document.getElementById('lista-produtos-admin');
  container.innerHTML = '';
  const produtos = await fetchJson('/api/produtos');
  produtos.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-thumb small';
    card.innerHTML = `
      <div style="flex:1">
        <strong>#${p.id} - ${p.nome}</strong>
        <div class="small">${p.tipo} • R$${p.valor.toFixed(2)}</div>
      </div>
        ${p.imagem ? `<img src="${p.imagem}" alt="${p.nome}" />` : ''}`;
      
      const btns = document.createElement('div');
      btns.style.display = 'flex';
      btns.style.gap = '8px';
      const edit = document.createElement('button');
      edit.className = 'btn btn-small';
      edit.textContent = 'Editar';
      edit.addEventListener('click', async () => {
        const novoNome = prompt('Nome:', p.nome);
        if (novoNome === null) return;
        const novoTipo = prompt('Tipo:', p.tipo) || p.tipo;
        const novoValor = prompt('Valor:', p.valor.toFixed(2));
        if (novoNome.trim() === '' || isNaN(Number(novoValor))) return showToast('Dados inválidos', 'error');
        const token = localStorage.getItem('admin_token');
        await fetchJson(`/api/admin/produtos/${p.id}`, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'x-admin-token': token } : {}), body: JSON.stringify({ tipo: novoTipo, nome: novoNome, valor: Number(novoValor), imagem: p.imagem }) });
        showToast('Produto atualizado', 'success');
        carregarProdutosAdmin();
      });
      const del = document.createElement('button');
      del.className = 'btn btn-small btn-danger';
      del.textContent = 'Excluir';
      del.addEventListener('click', async () => {
        if (!confirm('Excluir produto?')) return;
        const token = localStorage.getItem('admin_token');
        await fetchJson(`/api/admin/produtos/${p.id}`, { method: 'DELETE', headers: token ? { 'x-admin-token': token } : {} });
        showToast('Produto excluído', 'info');
        carregarProdutosAdmin();
      });
      btns.appendChild(edit);
      btns.appendChild(del);
      card.appendChild(btns);
    container.appendChild(card);
  });
}

document.getElementById('form-produto-admin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const file = f.image.files[0];
  
  if (!f.nome.value.trim()) return alert('Nome necessário');
  if (!f.valor.value || parseFloat(f.valor.value) <= 0) return alert('Valor inválido');
  let imagemPath = '';
  if (file) {
    const fd = new FormData();
    fd.append('image', file);
    const token = localStorage.getItem('admin_token');
    const up = await fetchJson('/api/upload', { method: 'POST', body: fd, headers: token ? { 'x-admin-token': token } : {} });
    imagemPath = up.path;
  }

  const data = { tipo: f.tipo.value, nome: f.nome.value, valor: parseFloat(f.valor.value), imagem: imagemPath };
  const token = localStorage.getItem('admin_token');
  await fetchJson('/api/produtos', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'x-admin-token': token } : {}), body: JSON.stringify(data) });
  f.reset();
  document.getElementById('image-preview').innerHTML = '';
  carregarProdutosAdmin();
  showToast('Produto cadastrado com sucesso', 'success');
});

document.getElementById('prod-image').addEventListener('change', (ev) => {
  const file = ev.target.files[0];
  const out = document.getElementById('image-preview');
  out.innerHTML = '';
  if (!file) return;
  const img = document.createElement('img');
  img.style.height = '96px';
  img.style.objectFit = 'cover';
  img.src = URL.createObjectURL(file);
  out.appendChild(img);
});

async function carregarClientesAdmin() {
  const ul = document.getElementById('lista-clientes-admin');
  ul.innerHTML = '';
  const clientes = await fetchJson('/api/clientes');
  clientes.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `#${c.id} - ${c.nome} - ${c.telefone} - ${c.endereco}`;
    ul.appendChild(li);
  });
}

async function carregarPedidosAdmin() {
  const ul = document.getElementById('lista-pedidos-admin');
  if (!ul) return;
  ul.innerHTML = '';
  try {
    const token = localStorage.getItem('admin_token');
    const pedidos = await fetchJson('/api/admin/pedidos', { headers: token ? { 'x-admin-token': token } : {} });
    pedidos.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `#${p.index} - Cliente:${p.idcliente} • Produto:${p.idproduto} • R$${Number(p.custototal).toFixed(2)} • ${p.formapagamento} • <strong>${p.status}</strong>`;
      const actions = document.createElement('div');
      actions.style.display = 'inline-block';
      actions.style.marginLeft = '12px';
      const atender = document.createElement('button');
      atender.className = 'btn btn-small';
      atender.textContent = 'Marcar atendido';
      atender.addEventListener('click', async () => {
        const token = localStorage.getItem('admin_token');
        await fetchJson(`/api/admin/pedidos/${p.index}`, { method: 'PATCH', headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'x-admin-token': token } : {}), body: JSON.stringify({ status: 'done' }) });
        showToast('Pedido marcado', 'success');
        carregarPedidosAdmin();
      });
      const cancelar = document.createElement('button');
      cancelar.className = 'btn btn-small btn-danger';
      cancelar.textContent = 'Cancelar';
      cancelar.addEventListener('click', async () => {
        if (!confirm('Cancelar pedido?')) return;
        const token = localStorage.getItem('admin_token');
        await fetchJson(`/api/admin/pedidos/${p.index}`, { method: 'PATCH', headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'x-admin-token': token } : {}), body: JSON.stringify({ status: 'cancelled' }) });
        showToast('Pedido cancelado', 'info');
        carregarPedidosAdmin();
      });
      actions.appendChild(atender);
      actions.appendChild(cancelar);
      li.appendChild(actions);
      ul.appendChild(li);
    });
  } catch (err) {
    showToast('Erro carregando pedidos', 'error');
  }
}

document.getElementById('form-cliente-admin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const telefone = f.telefone.value.trim();
  if (!/^\d{11}$/.test(telefone)) return showToast('Telefone inválido (11 dígitos)', 'error');
  const data = { nome: f.nome.value.trim(), telefone, endereco: f.endereco.value.trim() };
  await fetchJson('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  f.reset();
  carregarClientesAdmin();
  showToast('Cliente cadastrado', 'success');
});

carregarProdutosAdmin();
carregarClientesAdmin();
carregarPedidosAdmin();

