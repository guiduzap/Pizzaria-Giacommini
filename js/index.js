"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const io_1 = require("./io");
const clientes_1 = require("./clientes");
const produtos_1 = require("./produtos");
const pedidos_1 = require("./pedidos");
const relatorios_1 = require("./relatorios");
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
            case '1':
                await (0, clientes_1.cadastrarCliente)(rl, menu);
                break;
            case '2':
                await (0, clientes_1.listarClientes)();
                return menu();
            case '3':
                await (0, produtos_1.cadastrarProduto)(rl, menu);
                break;
            case '4':
                await (0, produtos_1.listarProdutos)();
                return menu();
            case '5':
                await (0, pedidos_1.cadastrarPedido)(rl, menu);
                break;
            case '6':
                await (0, pedidos_1.listarPedidos)();
                return menu();
            case '7':
                await (0, relatorios_1.relatorioVendasPorProduto)();
                return menu();
            case '0':
                console.log('Saindo...');
                rl.close();
                break;
            default:
                console.log('Opção inválida.');
                return menu();
        }
    });
}
async function main() {
    await (0, io_1.preparaAmbiente)();
    menu();
}
main();
