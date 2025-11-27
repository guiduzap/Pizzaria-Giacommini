"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const io_1 = require("./io");
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const paths_1 = require("./paths");
const utils_1 = require("./utils");
const extras_1 = require("./extras");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(express_1.default.json());

const publicDir = path_1.default.join(__dirname, '..', 'public');
app.use(express_1.default.static(publicDir));

const uploadsDir = path_1.default.join(publicDir, 'uploads');
if (!fs_1.default.existsSync(uploadsDir))
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });

const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});
const upload = (0, multer_1.default)({ storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    const relPath = `/uploads/${req.file.filename}`;
    res.json({ path: relPath, filename: req.file.filename });
});
function linhasParaProdutos(linhas) {
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
function linhasParaClientes(linhas) {
    return linhas.map(l => {
        const [id, nome, telefone, endereco] = l.split(',');
        return { id: parseInt(id), nome, telefone, endereco };
    });
}
function linhasParaPedidos(linhas) {
    return linhas.map(l => {
        const [data, idcliente, idproduto, custototal, formapagamento] = l.split(',');
        return { data, idcliente: parseInt(idcliente), idproduto: parseInt(idproduto), custototal: parseFloat(custototal), formapagamento };
    });
}

app.get('/api/produtos', async (_req, res) => {
    try {
        const linhas = await (0, io_1.lerCSV)(paths_1.ARQ.produtos);
        res.json(linhasParaProdutos(linhas));
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
app.post('/api/produtos', async (req, res) => {
    try {
        const { tipo, nome, valor, imagem } = req.body;
        const tipoLimpo = String(tipo).trim().toLowerCase();
        if (!['pizza', 'bebida', 'sobremesa'].includes(tipoLimpo)) {
            return res.status(400).json({ error: 'Tipo de produto inválido' });
        }
        if (!(0, extras_1.validarValor)(String(valor))) {
            return res.status(400).json({ error: 'Valor inválido' });
        }
        const id = await (0, utils_1.nextIdFromCsv)(paths_1.ARQ.produtos);
        const linha = `${id},${tipo},${nome},${Number(valor).toFixed(2)},${imagem || ''}`;
        await (0, io_1.adicionarLinha)(paths_1.ARQ.produtos, linha);
        res.status(201).json({ id, tipo, nome, valor });
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
app.get('/api/clientes', async (_req, res) => {
    try {
        const linhas = await (0, io_1.lerCSV)(paths_1.ARQ.clientes);
        res.json(linhasParaClientes(linhas));
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
app.post('/api/clientes', async (req, res) => {
    try {
        const { nome, telefone, endereco } = req.body;
        if (!nome || !String(nome).trim())
            return res.status(400).json({ error: 'Nome é obrigatório' });
        if (!telefone || !(0, extras_1.validarTelefone)(String(telefone)))
            return res.status(400).json({ error: 'Telefone inválido (11 dígitos)' });
        if (!endereco || !String(endereco).trim())
            return res.status(400).json({ error: 'Endereço é obrigatório' });
        const id = await (0, utils_1.nextIdFromCsv)(paths_1.ARQ.clientes);
        const linha = `${id},${nome},${telefone},${endereco}`;
        await (0, io_1.adicionarLinha)(paths_1.ARQ.clientes, linha);
        res.status(201).json({ id, nome, telefone, endereco });
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
app.get('/api/pedidos', async (_req, res) => {
    try {
        const linhas = await (0, io_1.lerCSV)(paths_1.ARQ.pedidos);
        res.json(linhasParaPedidos(linhas));
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
app.post('/api/pedidos', async (req, res) => {
    try {
        const { idcliente, idproduto, formapagamento } = req.body;
        
        const produtos = await (0, io_1.lerCSV)(paths_1.ARQ.produtos);
        const produtoLinha = produtos.find(l => parseInt(l.split(',')[0]) === idproduto);
        if (!produtoLinha)
            return res.status(400).json({ error: 'Produto não encontrado' });
        const valor = parseFloat(produtoLinha.split(',')[3]);
        
        const clientes = await (0, io_1.lerCSV)(paths_1.ARQ.clientes);
        const clienteExiste = clientes.some(l => parseInt(l.split(',')[0]) === idcliente);
        if (!clienteExiste)
            return res.status(400).json({ error: 'Cliente não encontrado' });
        const forma = String(formapagamento).toLowerCase();
        if (!['dinheiro', 'cartao', 'pix'].includes(forma))
            return res.status(400).json({ error: 'Forma de pagamento inválida' });
        const data = new Date().toLocaleString();
        const linha = `${data},${idcliente},${idproduto},${valor.toFixed(2)},${formapagamento}`;
        await (0, io_1.adicionarLinha)(paths_1.ARQ.pedidos, linha);
        res.status(201).json({ data, idcliente, idproduto, custototal: valor, formapagamento });
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
app.get('/api/relatorios/vendas-por-produto', async (_req, res) => {
    try {
        const pedidos = await (0, io_1.lerCSV)(paths_1.ARQ.pedidos);
        const vendas = {};
        for (const p of pedidos) {
            const idProduto = parseInt(p.split(',')[2]);
            const valor = parseFloat(p.split(',')[3]);
            vendas[idProduto] = (vendas[idProduto] || 0) + valor;
        }
        res.json(vendas);
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Servidor rodando em http:
}

