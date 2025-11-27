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
exports.CAB = exports.ARQ = exports.DIR = void 0;
const path = __importStar(require("path"));
const ROOT = path.resolve(__dirname, '..');
exports.DIR = {
    ts: path.join(ROOT, 'ts'),
    js: path.join(ROOT, 'js'),
    data: path.join(ROOT, 'data'),
};
exports.ARQ = {
    produtos: path.join(exports.DIR.data, 'produtos.csv'),
    clientes: path.join(exports.DIR.data, 'clientes.csv'),
    pedidos: path.join(exports.DIR.data, 'pedidos.csv'),
};
exports.CAB = {
    produtos: 'id,tipo,nome,valor,imagem\n',
    clientes: 'id,nome,telefone,endereco\n',
    pedidos: 'data,idcliente,idproduto,custototal,formapagamento\n',
};
