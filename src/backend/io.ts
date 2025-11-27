import { promises as fs } from 'fs';
import { ARQ, CAB, DIR } from './paths';

export async function preparaAmbiente(): Promise<void> {
  await fs.mkdir(DIR.data, { recursive: true });
  await criaSeNaoExiste(ARQ.produtos, CAB.produtos);
  await criaSeNaoExiste(ARQ.clientes, CAB.clientes);
  await criaSeNaoExiste(ARQ.pedidos, CAB.pedidos);
}

async function criaSeNaoExiste(caminho: string, conteudo: string): Promise<void> {
  try {
    await fs.access(caminho);
  } catch {
    await fs.writeFile(caminho, conteudo, 'utf8');
  }
}

export async function lerCSV(caminho: string): Promise<string[]> {
  const data = await fs.readFile(caminho, 'utf-8');
  return data.trim().split('\n').slice(1).filter(linha => linha.trim() !== '');
}

export async function escreverCSV(caminho: string, cabecalho: string, linhas: string[]): Promise<void> {
  await fs.writeFile(caminho, cabecalho + linhas.join('\n') + (linhas.length ? '\n' : ''), 'utf-8');
}

export async function adicionarLinha(caminho: string, linha: string): Promise<void> {
  await fs.appendFile(caminho, linha + '\n', 'utf8');
}
