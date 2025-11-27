"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inicializaIdClientes = inicializaIdClientes;
exports.cadastrarCliente = cadastrarCliente;
exports.listarClientes = listarClientes;
exports.buscarClientePorId = buscarClientePorId;
exports.atualizarCliente = atualizarCliente;
exports.excluirCliente = excluirCliente;
const paths_1 = require("./paths");
const io_1 = require("./io");
const extras_1 = require("./extras");
let iCliente = 1;

async function inicializaIdClientes() {
    try {
        const linhas = await (0, io_1.lerCSV)(paths_1.ARQ.clientes);
        const ids = linhas.map(l => parseInt(l.split(',')[0])).filter(Number.isFinite);
        iCliente = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }
    catch {
        iCliente = 1;
    }
}

async function cadastrarCliente(rl, voltar) {
    await inicializaIdClientes();
    rl.question('Nome do cliente: ', (nome) => {
        if (!nome.trim()) {
            console.log('Nome inválido.');
            return voltar();
        }
        rl.question('Telefone (11 dígitos): ', (telefone) => {
            if (!(0, extras_1.validarTelefone)(telefone)) {
                console.log('Telefone inválido. Deve conter 11 dígitos.');
                return voltar();
            }
            rl.question('Endereço: ', async (endereco) => {
                if (!endereco.trim()) {
                    console.log('Endereço inválido.');
                    return voltar();
                }
                const novo = { id: iCliente++, nome, telefone, endereco };
                await (0, io_1.adicionarLinha)(paths_1.ARQ.clientes, `${novo.id},${novo.nome},${novo.telefone},${novo.endereco}`);
                console.log('\nCliente cadastrado com sucesso!');
                voltar();
            });
        });
    });
}

async function listarClientes() {
    const linhas = await (0, io_1.lerCSV)(paths_1.ARQ.clientes);
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

async function buscarClientePorId(id) {
    const linhas = await (0, io_1.lerCSV)(paths_1.ARQ.clientes);
    for (const linha of linhas) {
        const [idStr, nome, telefone, endereco] = linha.split(',');
        if (parseInt(idStr) === id) {
            return { id, nome, telefone, endereco };
        }
    }
    return null;
}

async function atualizarCliente(rl, voltar) {
    const linhas = await (0, io_1.lerCSV)(paths_1.ARQ.clientes);
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
                    if (!(0, extras_1.validarTelefone)(telefone)) {
                        console.log('Telefone inválido.');
                        return voltar();
                    }
                    linhas[index] = `${id},${nome},${telefone},${endereco}`;
                    await (0, io_1.escreverCSV)(paths_1.ARQ.clientes, paths_1.CAB.clientes, linhas);
                    console.log('\nCliente atualizado com sucesso!');
                    voltar();
                });
            });
        });
    });
}

async function excluirCliente(rl, voltar) {
    const linhas = await (0, io_1.lerCSV)(paths_1.ARQ.clientes);
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
        await (0, io_1.escreverCSV)(paths_1.ARQ.clientes, paths_1.CAB.clientes, linhas);
        console.log('\nCliente excluído com sucesso!');
        voltar();
    });
}
