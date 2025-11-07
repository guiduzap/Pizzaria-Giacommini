import { lerCSV } from "./io.js";
import { ARQ } from "./paths.js";

export async function relatorioVendasPorProduto() {
  const pedidos = await lerCSV(ARQ.pedidos);
  if (pedidos.length === 0) return console.log('Sem pedidos.');

  const vendas: Record<string, number> = {};
  for (const p of pedidos) {
    const idProduto = p.split(',')[2];
    const valor = parseFloat(p.split(',')[3]);
    vendas[idProduto] = (vendas[idProduto] || 0) + valor;
  }

  console.log('\n--- Vendas por Produto ---');
  for (const [id, total] of Object.entries(vendas)) {
    console.log(`Produto #${id} -> R$${total.toFixed(2)}`);
  }
}
