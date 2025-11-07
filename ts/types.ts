// ts/types.ts
export type ProdutoTipo = 'pizza' | 'bebida' | 'sobremesa';

export type Produto = {
  id: number;
  tipo: ProdutoTipo;
  nome: string;
  valor: number;
};

export type Cliente = {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
};

export type Pedido = {
  data: string;
  idcliente: number;
  idproduto: number;
  custototal: number;
  formapagamento?: 'dinheiro' | 'cartao' | 'pix';
};
