import * as readline from "readline";
import { ARQ, CAB } from "./paths.js";
import { Cliente } from "./types.js";
import { lerCSV, escreverCSV, adicionarLinha } from "./io.js";
import { validarTelefone } from "./extras.js";

let iCliente = 1;

/**
 * Atualiza o contador de ID do cliente com base nos registros do CSV.
 */
export async function inicializaIdClientes() {
  try {
    const linhas = await lerCSV(ARQ.clientes);
    const ids = linhas.map(l => parseInt(l.split(',')[0])).filter(Number.isFinite);
    iCliente = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  } catch {
    iCliente = 1;
  }
}

/**
 * Cadastra um novo cliente via terminal.
 */
export async function cadastrarCliente(rl: readline.Interface, voltar: () => void) {
  await inicializaIdClientes();

  rl.question('Nome do cliente: ', (nome) => {
    if (!nome.trim()) {
      console.log('Nome inválido.');
      return voltar();
    }

    rl.question('Telefone (11 dígitos): ', (telefone) => {
      if (!validarTelefone(telefone)) {
        console.log('Telefone inválido. Deve conter 11 dígitos.');
        return voltar();
      }

      rl.question('Endereço: ', async (endereco) => {
        if (!endereco.trim()) {
          console.log('Endereço inválido.');
          return voltar();
        }

        const novo: Cliente = { id: iCliente++, nome, telefone, endereco };
        await adicionarLinha(ARQ.clientes, `${novo.id},${novo.nome},${novo.telefone},${novo.endereco}`);
        console.log('\nCliente cadastrado com sucesso!');
        voltar();
      });
    });
  });
}

/**
 * Lista todos os clientes do arquivo.
 */
export async function listarClientes() {
  const linhas = await lerCSV(ARQ.clientes);
  if (linhas.length === 0) {
    console.log('\nNenhum cliente cadastrado.');
    return;
  }

  console.log('\n--- CLIENTES CADASTRADOS ---');
  for (const linha of linhas) {
    const [id, nome, telefone, endereco] = linha.split(',');
    console.log(`ID: ${id} | Nome: ${nome} | Tel: +55${telefone} | Endereço: ${endereco}`);
  }
}

/**
 * Busca um cliente pelo ID.
 */
export async function buscarClientePorId(id: number): Promise<Cliente | null> {
  const linhas = await lerCSV(ARQ.clientes);
  for (const linha of linhas) {
    const [idStr, nome, telefone, endereco] = linha.split(',');
    if (parseInt(idStr) === id) {
      return { id, nome, telefone, endereco };
    }
  }
  return null;
}

/**
 * Atualiza dados de um cliente já existente.
 */
export async function atualizarCliente(rl: readline.Interface, voltar: () => void) {
  const linhas = await lerCSV(ARQ.clientes);
  if (linhas.length === 0) {
    console.log('\nNenhum cliente para atualizar.');
    return voltar();
  }

  rl.question('Digite o ID do cliente que deseja atualizar: ', async (idStr) => {
    const id = parseInt(idStr);
    const index = linhas.findIndex(l => parseInt(l.split(',')[0]) === id);
    if (index === -1) {
      console.log('Cliente não encontrado.');
      return voltar();
    }

    const [_, nomeAtual, telAtual, endAtual] = linhas[index].split(',');

    rl.question(`Novo nome (${nomeAtual}): `, (novoNome) => {
      rl.question(`Novo telefone (${telAtual}): `, (novoTel) => {
        rl.question(`Novo endereço (${endAtual}): `, async (novoEnd) => {
          const nome = novoNome.trim() || nomeAtual;
          const telefone = novoTel.trim() || telAtual;
          const endereco = novoEnd.trim() || endAtual;

          if (!validarTelefone(telefone)) {
            console.log('Telefone inválido.');
            return voltar();
          }

          linhas[index] = `${id},${nome},${telefone},${endereco}`;
          await escreverCSV(ARQ.clientes, CAB.clientes, linhas);
          console.log('\nCliente atualizado com sucesso!');
          voltar();
        });
      });
    });
  });
}

/**
 * Exclui um cliente existente pelo ID.
 */
export async function excluirCliente(rl: readline.Interface, voltar: () => void) {
  const linhas = await lerCSV(ARQ.clientes);
  if (linhas.length === 0) {
    console.log('\nNenhum cliente para excluir.');
    return voltar();
  }

  rl.question('Digite o ID do cliente que deseja excluir: ', async (idStr) => {
    const id = parseInt(idStr);
    const index = linhas.findIndex(l => parseInt(l.split(',')[0]) === id);

    if (index === -1) {
      console.log('Cliente não encontrado.');
      return voltar();
    }

    linhas.splice(index, 1);
    await escreverCSV(ARQ.clientes, CAB.clientes, linhas);
    console.log('\nCliente excluído com sucesso!');
    voltar();
  });
}

