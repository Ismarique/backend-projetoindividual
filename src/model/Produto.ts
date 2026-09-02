// src/model/Produto.ts
import type { ProdutoDTO } from "../interface/ProdutoDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Produto {
    private idProduto: number = 0;
    private idCategoria: number;
    private nome: string;
    private codigo: string;
    private descricao: string;
    private precoUnitario: number;
    private quantidadeDisponivel: number;
    private quantidadeMinima: number;
    private ativo: boolean;  // NOVO ATRIBUTO
    private dataCadastro: Date;

    constructor(
        _idCategoria: number,
        _nome: string,
        _codigo: string,
        _descricao: string,
        _precoUnitario: number,
        _quantidadeDisponivel: number,
        _quantidadeMinima: number,
        _ativo: boolean = true,  // NOVO PARÂMETRO COM VALOR PADRÃO
        _dataCadastro: Date = new Date()
    ) {
        this.idCategoria = _idCategoria;
        this.nome = _nome;
        this.codigo = _codigo;
        this.descricao = _descricao;
        this.precoUnitario = _precoUnitario;
        this.quantidadeDisponivel = _quantidadeDisponivel;
        this.quantidadeMinima = _quantidadeMinima;
        this.ativo = _ativo;  // NOVO ATRIBUTO
        this.dataCadastro = _dataCadastro;
    }

    // Getters e Setters existentes...
    public setIdProduto(_idProduto: number): void {
        this.idProduto = _idProduto;
    }

    public getIdProduto(): number {
        return this.idProduto;
    }

    public setIdCategoria(_idCategoria: number): void {
        this.idCategoria = _idCategoria;
    }

    public getIdCategoria(): number {
        return this.idCategoria;
    }

    public setNomeProduto(_nome: string): void {
        this.nome = _nome;
    }

    public getNomeProduto(): string {
        return this.nome;
    }

    public setCodigoProduto(_codigo: string): void {
        this.codigo = _codigo;
    }

    public getCodigoProduto(): string {
        return this.codigo;
    }

    public setDescricao(_descricao: string): void {
        this.descricao = _descricao;
    }

    public getDescricao(): string {
        return this.descricao;
    }

    public setPrecoUnitario(_precoUnitario: number): void {
        this.precoUnitario = _precoUnitario;
    }

    public getPrecoUnitario(): number {
        return this.precoUnitario;
    }

    public setQuantidadeDisponivel(_quantidadeDisponivel: number): void {
        this.quantidadeDisponivel = _quantidadeDisponivel;
    }

    public getQuantidadeDisponivel(): number {
        return this.quantidadeDisponivel;
    }

    public setQuantidadeMinima(_quantidadeMinima: number): void {
        this.quantidadeMinima = _quantidadeMinima;
    }

    public getQuantidadeMinima(): number {
        return this.quantidadeMinima;
    }


    // NOVO GETTER E SETTER PARA 'ATIVO'
    public setAtivo(_ativo: boolean): void {
        this.ativo = _ativo;
    }

    public getAtivo(): boolean {
        return this.ativo;
    }

    public getDataCadastro(): Date {
        return this.dataCadastro;
    }

    /**
     * Retorna os Produtos cadastrados no banco de dados
     * @returns Lista com Produtos cadastrados
     * @returns valor nulo em caso de erro na consulta
     */
    static async listarProdutos(): Promise<Array<Produto> | null> {
        try {
            let listaDeProdutos: Array<Produto> = [];

            // MODIFICADO: Adicionado filtro para trazer apenas produtos ativos
            const querySelectProdutos = `SELECT * FROM produto WHERE ativo = true ORDER BY id_produto;`;

            const respostaBD = await database.query(querySelectProdutos);

            respostaBD.rows.forEach((produtoBD: any) => {
                const novoProduto: Produto = new Produto(
                    produtoBD.id_categoria,
                    produtoBD.nome,
                    produtoBD.codigo,
                    produtoBD.descricao,
                    produtoBD.preco_unitario,
                    produtoBD.quantidade_disponivel,
                    produtoBD.quantidade_minima,
                    produtoBD.ativo ?? (produtoBD.ativo ? "ATIVO" : "INATIVO"),
                    produtoBD.data_cadastro
                );

                novoProduto.setIdProduto(produtoBD.id_produto);
                listaDeProdutos.push(novoProduto);
            });

            return listaDeProdutos;
        } catch (error) {
            console.error(`Erro na consulta ao banco de dados. ${error}`);
            return null;
        }
    }

    /**
     * Lista todos os produtos inclusive os inativos (para administração)
     * @returns Lista com todos os produtos
     */
    static async listarTodosProdutos(): Promise<Array<Produto> | null> {
        try {
            let listaDeProdutos: Array<Produto> = [];

            // NOVO MÉTODO: Lista todos os produtos sem filtro de ativo
            const querySelectProdutos = `SELECT * FROM produto ORDER BY id_produto;`;

            const respostaBD = await database.query(querySelectProdutos);

            respostaBD.rows.forEach((produtoBD: any) => {
                const novoProduto: Produto = new Produto(
                    produtoBD.id_categoria,
                    produtoBD.nome,
                    produtoBD.codigo,
                    produtoBD.descricao,
                    produtoBD.preco_unitario,
                    produtoBD.quantidade_disponivel,
                    produtoBD.quantidade_minima, 
                    produtoBD.ativo ?? (produtoBD.ativo ? "ATIVO" : "INATIVO"),
                    produtoBD.data_cadastro
                );

                novoProduto.setIdProduto(produtoBD.id_produto);
                listaDeProdutos.push(novoProduto);
            });

            return listaDeProdutos;
        } catch (error) {
            console.error(`Erro na consulta ao banco de dados. ${error}`);
            return null;
        }
    }

    static async cadastrarProduto(produto: ProdutoDTO): Promise<boolean> {
        try {
            const queryInsertProduto: string = `INSERT INTO produto 
                (id_categoria, nome, codigo, descricao, preco_unitario, 
                 quantidade_disponivel, quantidade_minima, ativo, data_cadastro)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
                RETURNING id_produto;`;

            const respostaBD = await database.query(queryInsertProduto, [
                produto.id_categoria,
                produto.nome.toUpperCase(),
                produto.codigo.toUpperCase(),
                produto.descricao.toUpperCase(),
                produto.preco_unitario,
                produto.quantidade_disponivel,
                produto.quantidade_minima,
                produto.ativo !== undefined ? produto.ativo : true,
                // produto.data_cadastro
            ]);

            if (respostaBD.rows.length > 0) {
                console.info(`Produto cadastrado com sucesso! ID: ${respostaBD.rows[0].id_produto}`);
                return true;
            }

            return false;
        } catch (erro) {
            console.log(`Erro na consulta ao banco de dados ${erro}`);
            return false;
        }
    }

    static async listarProduto(id_produto: number): Promise<Produto | null> {
        try {
            // MODIFICADO: Adicionado filtro de ativo
            const querySelectProduto = `SELECT
                                        id_produto,
                                        id_categoria,
                                        nome,
                                        codigo,
                                        descricao,
                                        preco_unitario,
                                        quantidade_disponivel,
                                        quantidade_minima,
                                        ativo,
                                        data_cadastro
                                        FROM produtos;`;
            const respostaBD = await database.query(querySelectProduto, [id_produto]);

            if (respostaBD.rowCount != 0) {
                const produto: Produto = new Produto(
                    respostaBD.rows[0].id_categoria,
                    respostaBD.rows[0].nome,
                    respostaBD.rows[0].codigo,
                    respostaBD.rows[0].descricao,
                    respostaBD.rows[0].preco_unitario,
                    respostaBD.rows[0].quantidade_disponivel,
                    respostaBD.rows[0].quantidade_minima,
                    respostaBD.rows[0].ativo,
                    respostaBD.rows[0].data_cadastro
                );

                produto.setIdProduto(respostaBD.rows[0].id_produto);
                return produto;
            }
            return null;
        } catch (error) {
            console.log(`Erro ao buscar o Produto no banco de dados. ${error}`);
            return null;
        }
    }

    /**
     * NOVO MÉTODO: Busca produto por ID mesmo se estiver inativo
     */
    static async listarProdutoCompleto(id_produto: number): Promise<Produto | null> {
        try {
            const querySelectProduto = `SELECT * FROM produto WHERE id_produto=$1;`;
            const respostaBD = await database.query(querySelectProduto, [id_produto]);

            if (respostaBD.rowCount != 0) {
                const produto: Produto = new Produto(
                    respostaBD.rows[0].id_categoria,
                    respostaBD.rows[0].nome,
                    respostaBD.rows[0].codigo,
                    respostaBD.rows[0].descricao,
                    respostaBD.rows[0].preco_unitario,
                    respostaBD.rows[0].quantidade_disponivel,
                    respostaBD.rows[0].quantidade_minima,
                    respostaBD.rows[0].ativo,
                    respostaBD.rows[0].data_cadastro
                );

                produto.setIdProduto(respostaBD.rows[0].id_produto);
                return produto;
            }
            return null;
        } catch (error) {
            console.log(`Erro ao buscar o Produto no banco de dados. ${error}`);
            return null;
        }
    }

    /**
     * NOVO MÉTODO: Atualiza o status 'ativo' do produto
     */
    static async atualizarAtivo(id_produto: number, ativo: boolean): Promise<boolean> {
        try {
            const queryUpdateAtivo = `UPDATE produto SET ativo = $1 WHERE id_produto = $2;`;
            const respostaBD = await database.query(queryUpdateAtivo, [ativo, id_produto]);

            if (respostaBD.rowCount != 0) {
                console.info(`Produto ${id_produto} ${ativo ? 'ativado' : 'desativado'} com sucesso!`);
                return true;
            }
            return false;
        } catch (error) {
            console.log(`Erro ao atualizar status do produto. ${error}`);
            return false;
        }
    }

    /**
     * NOVO MÉTODO: Lista produtos por status de ativo
     */
    static async listarProdutosPorAtivo(ativo: boolean): Promise<Array<Produto> | null> {
        try {
            let listaDeProdutos: Array<Produto> = [];

            const querySelectProdutos = `SELECT * FROM produto WHERE ativo = $1 ORDER BY id_produto;`;
            const respostaBD = await database.query(querySelectProdutos, [ativo]);

            respostaBD.rows.forEach((produtoBD: any) => {
                const novoProduto: Produto = new Produto(
                    produtoBD.id_categoria,
                    produtoBD.nome,
                    produtoBD.codigo,
                    produtoBD.descricao,
                    produtoBD.preco_unitario,
                    produtoBD.quantidade_disponivel,
                    produtoBD.quantidade_minima,
                    produtoBD.ativo,
                    produtoBD.data_cadastro
                );

                novoProduto.setIdProduto(produtoBD.id_produto);
                listaDeProdutos.push(novoProduto);
            });

            return listaDeProdutos;
        } catch (error) {
            console.error(`Erro na consulta ao banco de dados. ${error}`);
            return null;
        }
    }
    // Controller para buscar detalhes do produto
    static async getDetalhesProduto(id_produto: number) {
    try {
        // Busca o produto pelo ID (inclui inativos para admin)
        const produto = await Produto.listarProdutoCompleto(id_produto);
        
        if (produto) {
            // Retorna os detalhes completos
            return {
                id_produto: produto.getIdProduto(),
                nome: produto.getNomeProduto(),
                codigo: produto.getCodigoProduto(),
                descricao: produto.getDescricao(),
                preco_unitario: produto.getPrecoUnitario(),
                quantidade_disponivel: produto.getQuantidadeDisponivel(),
                quantidade_minima: produto.getQuantidadeMinima(),
                id_categoria: produto.getIdCategoria(),
                ativo: produto.getAtivo(),
                data_cadastro: produto.getDataCadastro()
            };
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar detalhes do produto:', error);
        return null;
    }
}
}

export default Produto;