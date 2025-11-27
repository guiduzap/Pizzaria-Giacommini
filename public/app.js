async function fetchJson(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function carregarClientes() {
  const lista = document.getElementById('lista-clientes');
  const selectCliente = document.getElementById('select-cliente');
  lista.innerHTML = '';
  selectCliente.innerHTML = '';
  const clientes = await fetchJson('/api/clientes');
  clientes.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `#${c.id} - ${c.nome} - ${c.telefone} - ${c.endereco}`;
    lista.appendChild(li);

    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `#${c.id} ${c.nome}`;
    selectCliente.appendChild(opt);
  });
}

document.getElementById('form-cliente').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const data = { nome: f.nome.value, telefone: f.telefone.value, endereco: f.endereco.value };
  await fetchJson('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  f.reset();
  carregarClientes();
});

async function carregarProdutos() {
  const lista = document.getElementById('lista-produtos');
  const selectProduto = document.getElementById('select-produto');
  lista.innerHTML = '';
  selectProduto.innerHTML = '';
  const produtos = await fetchJson('/api/produtos');
  produtos.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `#${p.id} - ${p.tipo} - ${p.nome} - R$${p.valor.toFixed(2)}`;
    lista.appendChild(li);

    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `#${p.id} ${p.nome} (R$${p.valor.toFixed(2)})`;
    selectProduto.appendChild(opt);
  });
}

document.getElementById('form-produto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const data = { tipo: f.tipo.value, nome: f.nome.value, valor: parseFloat(f.valor.value) };
  await fetchJson('/api/produtos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  f.reset();
  carregarProdutos();
});

async function carregarPedidos() {
  const lista = document.getElementById('lista-pedidos');
  lista.innerHTML = '';
  const pedidos = await fetchJson('/api/pedidos');
  pedidos.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `Data: ${p.data} | Cliente #${p.idcliente} | Produto #${p.idproduto} | Total: R$${p.custototal.toFixed(2)} | Pagamento: ${p.formapagamento}`;
    lista.appendChild(li);
  });
}

document.getElementById('form-pedido').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const data = { idcliente: parseInt(f.idcliente.value), idproduto: parseInt(f.idproduto.value), formapagamento: f.formapagamento.value };
  await fetchJson('/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  carregarPedidos();
});

document.getElementById('btn-relatorio').addEventListener('click', async () => {
  const rel = await fetchJson('/api/relatorios/vendas-por-produto');
  document.getElementById('relatorio-area').textContent = JSON.stringify(rel, null, 2);
});

async function init() {
  await carregarClientes();
  await carregarProdutos();
  await carregarPedidos();
}

init().catch(err => console.error(err));

