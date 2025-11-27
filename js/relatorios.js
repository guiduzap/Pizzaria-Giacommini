"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relatorioVendasPorProduto = relatorioVendasPorProduto;
const io_1 = require("./io");
const paths_1 = require("./paths");
async function relatorioVendasPorProduto() {
    const pedidos = await (0, io_1.lerCSV)(paths_1.ARQ.pedidos);
    if (pedidos.length === 0)
        return console.log('Sem pedidos.');
    const vendas = {};
    for (const p of pedidos) {
        const idProduto = p.split(',')[2];
        const valor = parseFloat(p.split(',')[3]);
        vendas[idProduto] = (vendas[idProduto] || 0) + valor;
    }
    console.log('\n--- Vendas por Produto ---');
    for (const [id, total] of Object.entries(vendas)) {
        console.log(`Produto #${id} -> R$${total.toFixed(2)}`);
    }
}
