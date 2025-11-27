"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarTelefone = validarTelefone;
exports.validarValor = validarValor;
function validarTelefone(telefone) {
    return /^\d{11}$/.test(telefone);
}
function validarValor(valor) {
    const num = parseFloat(valor);
    return !isNaN(num) && num > 0;
}
