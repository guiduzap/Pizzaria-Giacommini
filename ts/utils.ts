// ts/utils.ts
import { lerCSV } from './io';

export async function nextIdFromCsv(caminho: string) {
  try {
    const linhas = await lerCSV(caminho);
    const ids = linhas.map((l: string) => parseInt(l.split(',')[0])).filter(Number.isFinite);
    return ids.length ? Math.max(...ids) + 1 : 1;
  } catch {
    return 1;
  }
}

export function validaTelefone(tel: string) {
  return /^\d{11}$/.test(tel);
}

export function isPositiveNumber(value: string) {
  const n = parseFloat(value);
  return !isNaN(n) && n > 0;
}
