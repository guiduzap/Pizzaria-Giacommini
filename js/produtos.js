"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inicializaIdProdutos = inicializaIdProdutos;
exports.cadastrarProduto = cadastrarProduto;
exports.listarProdutos = listarProdutos;
const paths_1 = require("./paths");
const io_1 = require("./io");
const extras_1 = require("./extras");
let iProduto = 1;
async function inicializaIdProdutos() {
    try {
        const linhas = await (0, io_1.lerCSV)(paths_1.ARQ.produtos);
        const ids = linhas.map(l => parseInt(l.split(',')[0])).filter(Number.isFinite);
        iProduto = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }
    catch {
        iProduto = 1;
    }
}
async function cadastrarProduto(rl, voltar) {
    await inicializaIdProdutos();
    rl.question('Tipo (pizza/bebida/sobremesa): ', (tipo) => {
        const tipoLimpo = tipo.trim().toLowerCase();
        if (!['pizza', 'bebida', 'sobremesa'].includes(tipoLimpo)) {
            console.log('Tipo inválido.');
            return voltar();
        }
        rl.question('Nome do produto: ', (nome) => {
            rl.question('Valor: ', async (valorStr) => {
                if (!(0, extras_1.validarValor)(valorStr)) {
                    console.log('Valor inválido.');
                    return voltar();
                }
                const produto = {
                    id: iProduto++,
                    tipo: tipoLimpo,
                    nome,
                    valor: parseFloat(valorStr)
                };
                await (0, io_1.adicionarLinha)(paths_1.ARQ.produtos, `${produto.id},${produto.tipo},${produto.nome},${produto.valor.toFixed(2)},`);
                console.log('\nProduto cadastrado com sucesso!');
                voltar();
            });
        });
    });
}
async function listarProdutos() {
    const linhas = await (0, io_1.lerCSV)(paths_1.ARQ.produtos);
    if (linhas.length === 0) {
        console.log('\nNenhum produto cadastrado.');
        return;
    }
    console.log('\n--- PRODUTOS CADASTRADOS ---');
    for (const linha of linhas) {
        const [id, tipo, nome, valor] = linha.split(',');
        console.log(`ID: ${id} | Tipo: ${tipo} | Nome: ${nome} | Valor: R$${parseFloat(valor).toFixed(2)}`);
    }
}
