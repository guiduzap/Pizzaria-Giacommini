import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');

export const DIR = {
  ts: path.join(ROOT, 'ts'),
  js: path.join(ROOT, 'js'),
  data: path.join(ROOT, 'data'),
};

export const ARQ = {
  produtos: path.join(DIR.data, 'produtos.csv'),
  clientes: path.join(DIR.data, 'clientes.csv'),
  pedidos: path.join(DIR.data, 'pedidos.csv'),
};

export const CAB = {
  produtos: 'id,tipo,nome,valor\n',
  clientes: 'id,nome,telefone,endereco\n',
  pedidos: 'data,idcliente,idproduto,custototal,formapagamento\n',
};
