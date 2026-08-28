export interface  ProdutoDTO {
  id_produto?: number;
  id_categoria?: number;
  nome: string;
  codigo: number;
  descricao: string;
  preco_unitario: number;
  quantidade_disponivel: number;
  quantidade_minima: number;
  ativo: boolean;
  status: string;
  data_cadastro?: string | Date;
}

