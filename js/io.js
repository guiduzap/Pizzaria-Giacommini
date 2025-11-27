"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preparaAmbiente = preparaAmbiente;
exports.lerCSV = lerCSV;
exports.escreverCSV = escreverCSV;
exports.adicionarLinha = adicionarLinha;
const fs_1 = require("fs");
const paths_1 = require("./paths");
async function preparaAmbiente() {
    await fs_1.promises.mkdir(paths_1.DIR.data, { recursive: true });
    await criaSeNaoExiste(paths_1.ARQ.produtos, paths_1.CAB.produtos);
    await criaSeNaoExiste(paths_1.ARQ.clientes, paths_1.CAB.clientes);
    await criaSeNaoExiste(paths_1.ARQ.pedidos, paths_1.CAB.pedidos);
}
async function criaSeNaoExiste(caminho, conteudo) {
    try {
        await fs_1.promises.access(caminho);
    }
    catch {
        await fs_1.promises.writeFile(caminho, conteudo, 'utf8');
    }
}
async function lerCSV(caminho) {
    const data = await fs_1.promises.readFile(caminho, 'utf-8');
    return data.trim().split('\n').slice(1).filter(linha => linha.trim() !== '');
}
async function escreverCSV(caminho, cabecalho, linhas) {
    await fs_1.promises.writeFile(caminho, cabecalho + linhas.join('\n') + (linhas.length ? '\n' : ''), 'utf-8');
}
async function adicionarLinha(caminho, linha) {
    await fs_1.promises.appendFile(caminho, linha + '\n', 'utf8');
}
