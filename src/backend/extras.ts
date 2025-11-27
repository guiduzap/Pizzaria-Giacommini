export function validarTelefone(telefone: string): boolean {
  return /^\d{11}$/.test(telefone);
}

export function validarValor(valor: string): boolean {
  const num = parseFloat(valor);
  return !isNaN(num) && num > 0;
}
