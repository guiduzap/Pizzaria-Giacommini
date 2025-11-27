"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cadastrarPedido = cadastrarPedido;
exports.listarPedidos = listarPedidos;
const paths_1 = require("./paths");
const io_1 = require("./io");
async function cadastrarPedido(rl, voltar) {
    const clientes = await (0, io_1.lerCSV)(paths_1.ARQ.clientes);
    const produtos = await (0, io_1.lerCSV)(paths_1.ARQ.produtos);
    if (clientes.length === 0 || produtos.length === 0) {
        console.log('\nCadastre ao menos um cliente e um produto antes.');
        return voltar();
    }
    rl.question('ID do cliente: ', (idClienteStr) => {
        const idCliente = parseInt(idClienteStr);
        const clienteExiste = clientes.some(l => parseInt(l.split(',')[0]) === idCliente);
        if (!clienteExiste) {
            console.log('Cliente não encontrado.');
            return voltar();
        }
        rl.question('ID do produto: ', async (idProdutoStr) => {
            const idProduto = parseInt(idProdutoStr);
            const produto = produtos.find(l => parseInt(l.split(',')[0]) === idProduto);
            if (!produto) {
                console.log('Produto não encontrado.');
                return voltar();
            }
            const valor = parseFloat(produto.split(',')[3]);
            rl.question('Forma de pagamento (dinheiro/cartao/pix): ', async (fp) => {
                const forma = fp.toLowerCase();
                if (!['dinheiro', 'cartao', 'pix'].includes(forma)) {
                    console.log('Forma de pagamento inválida.');
                    return voltar();
                }
                const novo = {
                    data: new Date().toLocaleString(),
                    idcliente: idCliente,
                    idproduto: idProduto,
                    custototal: valor,
                    formapagamento: forma
                };
                await (0, io_1.adicionarLinha)(paths_1.ARQ.pedidos, `${novo.data},${novo.idcliente},${novo.idproduto},${novo.custototal.toFixed(2)},${novo.formapagamento}`);
                console.log('\nPedido registrado com sucesso!');
                voltar();
            });
        });
    });
}
async function listarPedidos() {
    const linhas = await (0, io_1.lerCSV)(paths_1.ARQ.pedidos);
    if (linhas.length === 0) {
        console.log('\nNenhum pedido registrado.');
        return;
    }
    console.log('\n--- PEDIDOS ---');
    for (const linha of linhas) {
        const [data, idcliente, idproduto, total, fp] = linha.split(',');
        console.log(`Data: ${data} | Cliente #${idcliente} | Produto #${idproduto} | Total: R$${total} | Pagamento: ${fp}`);
    }
}
