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
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
async function mostrarMenu() {
    await (0, io_1.preparaAmbiente)();
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
                (0, clientes_1.cadastrarCliente)(rl, () => mostrarMenuCad());
                break;
            case "2":
                (0, clientes_1.listarClientes)();
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

