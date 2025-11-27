
import * as readline from 'readline';
import { preparaAmbiente } from './io';
import { cadastrarCliente, listarClientes } from './clientes';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function mostrarMenu() {
  await preparaAmbiente();
  console.log("\n--------------- PIZZARIA GIACOMMINI ---------------");
  console.log("1 - Cadastros");
  console.log("2 - Pedidos");
  console.log("3 - Sair");
  console.log("---------------------------------------------------");
  rl.question("\nEscolha uma opção: ", (opcao) => {
    switch (opcao) {
      case "1":
        mostrarMenuCad();
        break;
      case "2":
        console.log('Menu de Pedidos (ainda precisa ser conectado).');
        mostrarMenu();
        break;
      case "3":
        console.log("Encerrando o Sistema.");
        rl.close();
        break;
      default:
        console.log("Opção Inválida.");
        mostrarMenu();
    }
  });
}

function mostrarMenuCad() {
  console.log("\n--------------- PIZZARIA GIACOMMINI ---------------");
  console.log("1 - Cadastrar Cliente");
  console.log("2 - Listar Clientes");
  console.log("3 - Voltar ao Menu Principal");
  console.log("---------------------------------------------------\n");
  rl.question("Escolha uma opção: ", (opcao) => {
    switch (opcao) {
      case "1":
        cadastrarCliente(rl, () => mostrarMenuCad());
        break;
      case "2":
        listarClientes();
        break;
      case "3":
        mostrarMenu();
        break;
      default:
        console.log("Opção Inválida.");
        mostrarMenuCad();
    }
  });
}

mostrarMenu();

