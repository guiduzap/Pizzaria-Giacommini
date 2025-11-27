"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextIdFromCsv = nextIdFromCsv;
exports.validaTelefone = validaTelefone;
exports.isPositiveNumber = isPositiveNumber;

const io_1 = require("./io");
async function nextIdFromCsv(caminho) {
    try {
        const linhas = await (0, io_1.lerCSV)(caminho);
        const ids = linhas.map((l) => parseInt(l.split(',')[0])).filter(Number.isFinite);
        return ids.length ? Math.max(...ids) + 1 : 1;
    }
    catch {
        return 1;
    }
}
function validaTelefone(tel) {
    return /^\d{11}$/.test(tel);
}
function isPositiveNumber(value) {
    const n = parseFloat(value);
    return !isNaN(n) && n > 0;
}

