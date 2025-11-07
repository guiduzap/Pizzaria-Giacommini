import * as readline from "readline";
import { ARQ } from "./paths.js";
import { Produto } from "./types.js";
import { lerCSV, adicionarLinha } from "./io.js";
import { validarValor } from "./extras.js";

let iProduto = 1;

export async function inicializaIdProdutos() {
  try {
    const linhas = await lerCSV(ARQ.produtos);
    const ids = linhas.map(l => parseInt(l.split(',')[0])).filter(Number.isFinite);
    iProduto = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  } catch {
    iProduto = 1;
  }
}

export async function cadastrarProduto(rl: readline.Interface, voltar: () => void) {
  await inicializaIdProdutos();

  rl.question('Tipo (pizza/bebida/sobremesa): ', (tipo) => {
    const tipoLimpo = tipo.trim().toLowerCase();
    if (!['pizza', 'bebida', 'sobremesa'].includes(tipoLimpo)) {
      console.log('Tipo inválido.');
      return voltar();
    }

    rl.question('Nome do produto: ', (nome) => {
      rl.question('Valor: ', async (valorStr) => {
        if (!validarValor(valorStr)) {
          console.log('Valor inválido.');
          return voltar();
        }

        const produto: Produto = {
          id: iProduto++,
          tipo: tipoLimpo as 'pizza' | 'bebida' | 'sobremesa',
          nome,
          valor: parseFloat(valorStr)
        };

        await adicionarLinha(ARQ.produtos, `${produto.id},${produto.tipo},${produto.nome},${produto.valor.toFixed(2)}`);
        console.log('\nProduto cadastrado com sucesso!');
        voltar();
      });
    });
  });
}

export async function listarProdutos() {
  const linhas = await lerCSV(ARQ.produtos);
  if (linhas.length === 0) {
    console.log('\nNenhum produto cadastrado.');
    return;
  }

  console.log('\n--- PRODUTOS CADASTRADOS ---');
  for (const linha of linhas) {
    const [id, tipo, nome, valor] = linha.split(',');
    console.log(`ID: ${id} | Tipo: ${tipo} | Nome: ${nome} | Valor: R$${parseFloat(valor).toFixed(2)}`);
  }
}
