import * as readline from "readline";
import { preparaAmbiente } from "./io.js";
import { cadastrarCliente, listarClientes } from "./clientes.js";
import { cadastrarProduto, listarProdutos } from "./produtos.js";
import { cadastrarPedido, listarPedidos } from "./pedidos.js";
import { relatorioVendasPorProduto } from "./relatorios.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function menu() {
  console.log(`
=== PIZZARIA GIACOMMINI ===
1 - Cadastrar Cliente
2 - Listar Clientes
3 - Cadastrar Produto
4 - Listar Produtos
5 - Registrar Pedido
6 - Listar Pedidos
7 - Relatório de Vendas
0 - Sair
  `);

  rl.question('Escolha: ', async (opcao) => {
    switch (opcao) {
      case '1': await cadastrarCliente(rl, menu); break;
      case '2': await listarClientes(); return menu();
      case '3': await cadastrarProduto(rl, menu); break;
      case '4': await listarProdutos(); return menu();
      case '5': await cadastrarPedido(rl, menu); break;
      case '6': await listarPedidos(); return menu();
      case '7': await relatorioVendasPorProduto(); return menu();
      case '0': console.log('Saindo...'); rl.close(); break;
      default: console.log('Opção inválida.'); return menu();
    }
  });
}

async function main() {
  await preparaAmbiente();
  menu();
}

main();
