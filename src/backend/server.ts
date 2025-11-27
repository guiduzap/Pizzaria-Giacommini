
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { lerCSV, adicionarLinha, escreverCSV } from './io';
import fs from 'fs';
import multer from 'multer';
import { ARQ, CAB } from './paths';
import { nextIdFromCsv } from './utils';
import { validarTelefone, validarValor } from './extras';

const app = express();
app.use(cors());
app.use(express.json());

const publicDir = path.join(__dirname, '..', '..', 'src', 'frontend', 'public');
app.use(express.static(publicDir));

const adminDir = path.join(__dirname, '..', '..', 'src', 'frontend', 'admin');

app.use('/admin', (req, res, next) => {
  const p = req.path || '';
  if (p === '' || p === '/' || p === '/index.html') {
    return res.redirect('/admin/login.html');
  }
  return next();
});

app.use('/admin', express.static(adminDir));

const uploadsDir = path.join(publicDir, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`)
});
const upload = multer({ storage });

function linhasParaProdutos(linhas: string[]) {
  return linhas.map(l => {
    const parts = l.split(',');
    const id = parseInt(parts[0]);
    const tipo = parts[1];
    const nome = parts[2];
    const valor = parseFloat(parts[3]);
    const imagem = parts[4] || '';
    return { id, tipo, nome, valor, imagem };
  });
}

function linhasParaPedidos(linhas: string[]) {
  return linhas.map(l => {
    const parts = l.split(',');
    const data = parts[0];
    const idcliente = parseInt(parts[1]);
    const idproduto = parseInt(parts[2]);
    const custototal = parseFloat(parts[3]);
    const formapagamento = parts[4];
    const status = parts[5] || 'pending';
    return { data, idcliente, idproduto, custototal, formapagamento, status };
  });
}

const ADMIN_USER = process.env.ADMIN_USER || 'giacommni-adm';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admintoken';

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  if (String(username) === ADMIN_USER && String(password) === ADMIN_PASSWORD) {
    return res.json({ token: ADMIN_TOKEN });
  }
  return res.status(401).json({ error: 'Credenciais inválidas' });
});

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-admin-token'] || req.headers['authorization'];
  const t = typeof token === 'string' ? token.replace(/^Bearer\s+/i, '') : token;
  if (t === ADMIN_TOKEN) return next();
  return res.status(403).json({ error: 'Acesso negado: admin' });
}

app.get('/api/produtos', async (_req, res) => {
  try {
    const linhas = await lerCSV(ARQ.produtos);
    res.json(linhasParaProdutos(linhas));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const { nome, telefone, email, endereco, senha } = req.body as {
      nome: string;
      telefone: string;
      email?: string;
      endereco?: string;
      senha?: string;
    };

    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    const clientes = await lerCSV(ARQ.clientes);
    const telLimpo = telefone.replace(/\D/g, '');
    const clienteExistente = clientes.find(l => {
      const parts = l.split(',');
      return parts[2].replace(/\D/g, '') === telLimpo;
    });

    if (clienteExistente) {
      return res.status(409).json({ error: 'Telefone já cadastrado' });
    }

    const id = await nextIdFromCsv(ARQ.clientes);
    
    const linha = `${id},${nome},${telefone},${email || ''},${endereco || ''},${senha || ''}`;
    await adicionarLinha(ARQ.clientes, linha);

    res.status(201).json({
      id,
      nome,
      telefone,
      email: email || '',
      endereco: endereco || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/clientes/login', async (req, res) => {
  try {
    const { login, senha } = req.body as { login: string; senha: string };

    if (!login || !senha) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios' });
    }

    const clientes = await lerCSV(ARQ.clientes);
    const loginLimpo = login.replace(/\D/g, ''); 

    const clienteEncontrado = clientes.find(l => {
      const parts = l.split(',');
      const telefone = parts[2].replace(/\D/g, '');
      const email = parts[3];
      const senhaArmazenada = parts[5];

      const matchLogin = telefone === loginLimpo || email === login;
      const matchSenha = senhaArmazenada === senha;

      return matchLogin && matchSenha;
    });

    if (!clienteEncontrado) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const parts = clienteEncontrado.split(',');
    res.json({
      id: parseInt(parts[0]),
      nome: parts[1],
      telefone: parts[2],
      email: parts[3],
      endereco: parts[4]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/pedidos', async (req, res) => {
  console.log('POST /api/pedidos body:', JSON.stringify(req.body));
  try {
    const { cliente, itens, formapagamento } = req.body as { 
      cliente: { nome: string, telefone: string, endereco: string }, 
      itens: { idproduto: number, quantidade: number }[], 
      formapagamento: string 
    };

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'itens vazio ou inválido' });
    }
    if (!cliente || !cliente.telefone) {
      return res.status(400).json({ error: 'Dados do cliente inválidos' });
    }

    const clientes = await lerCSV(ARQ.clientes);
    let idClienteFinal = 0;
    
    const telLimpo = cliente.telefone.replace(/\D/g, '');
    
    const clienteExistente = clientes.find(l => {
        const parts = l.split(',');
        return parts[2].replace(/\D/g, '') === telLimpo;
    });
    
    if (clienteExistente) {
      idClienteFinal = parseInt(clienteExistente.split(',')[0]);
    } else {
      idClienteFinal = await nextIdFromCsv(ARQ.clientes);
      
      const novaLinhaCliente = `${idClienteFinal},${cliente.nome},${cliente.telefone},,${cliente.endereco},`;
      await adicionarLinha(ARQ.clientes, novaLinhaCliente);
    }

    const produtos = await lerCSV(ARQ.produtos);
    let valorTotalPedido = 0;
    const data = new Date().toLocaleString();
    const status = 'pending'; 

    for (const item of itens) {
      const prodLinha = produtos.find(l => parseInt(l.split(',')[0]) === item.idproduto);
      if (prodLinha) {
        const valorUnitario = parseFloat(prodLinha.split(',')[3]);
        const valorItem = valorUnitario * item.quantidade;
        valorTotalPedido += valorItem;
        
        const linhaPedido = `${data},${idClienteFinal},${item.idproduto},${valorItem.toFixed(2)},${formapagamento},${status}`;
        await adicionarLinha(ARQ.pedidos, linhaPedido);
      }
    }

    res.status(201).json({ 
      ok: true, 
      mensagem: 'Pedido realizado com sucesso!', 
      protocolo: Date.now(),
      total: valorTotalPedido 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  const relPath = `/uploads/${req.file.filename}`;
  res.json({ path: relPath, filename: req.file.filename });
});

app.post('/api/admin/produtos', requireAdmin, async (req, res) => {
  try {
    const { tipo, nome, valor, imagem } = req.body as { tipo: string; nome: string; valor: number, imagem?: string };
    const tipoLimpo = String(tipo).trim().toLowerCase();
    if (!['pizza', 'bebida', 'sobremesa'].includes(tipoLimpo)) {
      return res.status(400).json({ error: 'Tipo de produto inválido' });
    }
    if (!validarValor(String(valor))) {
      return res.status(400).json({ error: 'Valor inválido' });
    }
    const id = await nextIdFromCsv(ARQ.produtos);
    const linha = `${id},${tipo},${nome},${Number(valor).toFixed(2)},${imagem || ''}`;
    await adicionarLinha(ARQ.produtos, linha);
    res.status(201).json({ id, tipo, nome, valor });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/admin/produtos/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const linhas = await lerCSV(ARQ.produtos);
    const index = linhas.findIndex(l => parseInt(l.split(',')[0]) === id);
    if (index === -1) return res.status(404).json({ error: 'Produto não encontrado' });
    linhas.splice(index, 1);
    await escreverCSV(ARQ.produtos, CAB.produtos, linhas);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/admin/produtos/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { tipo, nome, valor, imagem } = req.body as { tipo: string; nome: string; valor: number; imagem?: string };
    const linhas = await lerCSV(ARQ.produtos);
    const index = linhas.findIndex(l => parseInt(l.split(',')[0]) === id);
    if (index === -1) return res.status(404).json({ error: 'Produto não encontrado' });
    linhas[index] = `${id},${tipo},${nome},${Number(valor).toFixed(2)},${imagem || ''}`;
    await escreverCSV(ARQ.produtos, CAB.produtos, linhas);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/admin/pedidos', requireAdmin, async (_req, res) => {
  try {
    const linhas = await lerCSV(ARQ.pedidos);
    const pedidos = linhas.map((l, idx) => ({ index: idx, ...linhasParaPedidos([l])[0] }));
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.patch('/api/admin/pedidos/:index', requireAdmin, async (req, res) => {
  try {
    const idx = parseInt(req.params.index);
    const { status } = req.body as { status: string };
    const linhas = await lerCSV(ARQ.pedidos);
    if (isNaN(idx) || idx < 0 || idx >= linhas.length) return res.status(404).json({ error: 'Pedido não encontrado' });
    const parts = linhas[idx].split(',');
    parts[5] = status;
    linhas[idx] = parts.join(',');
    await escreverCSV(ARQ.pedidos, CAB.pedidos, linhas);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/relatorios/dashboard', async (_req, res) => {
  try {
    const pedidos = await lerCSV(ARQ.pedidos);
    const produtos = await lerCSV(ARQ.produtos);
    
    let totalVendas = 0;
    let totalPedidos = pedidos.length;
    const contagemProd: Record<string, number> = {};
    
    for (const p of pedidos) {
      const parts = p.split(',');
      const idProd = parts[2];
      const valor = parseFloat(parts[3]);
      totalVendas += valor;
      
      const nomeProd = produtos.find(l => l.startsWith(idProd + ','))?.split(',')[2] || 'Desc. ('+idProd+')';
      contagemProd[nomeProd] = (contagemProd[nomeProd] || 0) + 1;
    }

    const topProdutos = Object.entries(contagemProd)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome, qtd]) => ({ nome, qtd }));

    res.json({ totalVendas, totalPedidos, topProdutos });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/admin/clientes', requireAdmin, async (_req, res) => {
    try {
      const linhas = await lerCSV(ARQ.clientes);
      const clientes = linhas.map(l => {
        const [id, nome, telefone, email, endereco] = l.split(',');
        return { id: parseInt(id), nome, telefone, email, endereco };
      });
      res.json(clientes);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
});

app.post('/api/admin/clientes', requireAdmin, async (req, res) => {
    try {
        const { nome, telefone, email, endereco } = req.body;
        if (!nome || !telefone) return res.status(400).json({ error: 'Dados incompletos' });
        
        const id = await nextIdFromCsv(ARQ.clientes);
        
        const linha = `${id},${nome},${telefone},${email || ''},${endereco || ''},`;
        await adicionarLinha(ARQ.clientes, linha);
        res.status(201).json({ ok: true, id });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

app.delete('/api/admin/clientes/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const linhas = await lerCSV(ARQ.clientes);
        const index = linhas.findIndex(l => parseInt(l.split(',')[0]) === id);
        if (index === -1) return res.status(404).json({ error: 'Cliente não encontrado' });
        linhas.splice(index, 1);
        await escreverCSV(ARQ.clientes, CAB.clientes, linhas);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

app.put('/api/admin/clientes/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, telefone, email, endereco } = req.body;
        const linhas = await lerCSV(ARQ.clientes);
        const index = linhas.findIndex(l => parseInt(l.split(',')[0]) === id);
        if (index === -1) return res.status(404).json({ error: 'Cliente não encontrado' });
        
        const parts = linhas[index].split(',');
        const senhaAntiga = parts[5] || '';
        
        linhas[index] = `${id},${nome},${telefone},${email || ''},${endereco || ''},${senhaAntiga}`;
        await escreverCSV(ARQ.clientes, CAB.clientes, linhas);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

const PORT = process.env.PORT || 3000;
export { app };

if (require.main === module) {
  app.listen(PORT, () => console.log(`Servidor rodando em http:
}

