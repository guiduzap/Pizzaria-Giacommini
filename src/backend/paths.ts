import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');

export const DIR = {
  ts: path.join(ROOT, 'src', 'backend'),
  js: path.join(ROOT, 'dist'),
  data: path.join(ROOT, 'csv'),
};

export const ARQ = {
  produtos: path.join(DIR.data, 'produtos.csv'),
  clientes: path.join(DIR.data, 'clientes.csv'),
  pedidos: path.join(DIR.data, 'pedidos.csv'),
};

export const CAB = {
  produtos: 'id,tipo,nome,valor,imagem\n',
  clientes: 'id,nome,telefone,email,endereco,senha\n',
  pedidos: 'data,idcliente,idproduto,custototal,formapagamento,status\n',
};
