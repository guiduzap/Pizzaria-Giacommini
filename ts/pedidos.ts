import * as readline from "readline";
import { ARQ } from "./paths";
import { Pedido } from "./types";
import { lerCSV, adicionarLinha } from "./io";

export async function cadastrarPedido(rl: readline.Interface, voltar: () => void) {
  const clientes = await lerCSV(ARQ.clientes);
  const produtos = await lerCSV(ARQ.produtos);

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
        const forma = fp.toLowerCase() as 'dinheiro' | 'cartao' | 'pix';
        if (!['dinheiro', 'cartao', 'pix'].includes(forma)) {
          console.log('Forma de pagamento inválida.');
          return voltar();
        }

        const novo: Pedido = {
          data: new Date().toLocaleString(),
          idcliente: idCliente,
          idproduto: idProduto,
          custototal: valor,
          formapagamento: forma
        };

        await adicionarLinha(ARQ.pedidos, `${novo.data},${novo.idcliente},${novo.idproduto},${novo.custototal.toFixed(2)},${novo.formapagamento}`);
        console.log('\nPedido registrado com sucesso!');
        voltar();
      });
    });
  });
}

export async function listarPedidos() {
  const linhas = await lerCSV(ARQ.pedidos);
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
