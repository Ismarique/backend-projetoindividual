// src/model/Produto.ts
import type { ProdutoDTO } from "../interface/ProdutoDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Produto {
    private idProduto: number = 0;
    private idCategoria: number;
    private nomeProduto: string;
    private codigoProduto: number;
    private descricao: string;
    private preco: number;
    private quantidadeEstoque: number;
    private quantidadeMinima: number;
    private status: string;
    private ativo: boolean;  // NOVO ATRIBUTO
    private dataCadastro: Date;

    constructor(
        _idCategoria: number,
        _nomeProduto: string,
        _codigoProduto: number,
        _descricao: string,
        _preco: number,
        _quantidadeEstoque: number,
        _quantidadeMinima: number,
        _status: string,
        _ativo: boolean = true,  // NOVO PARÂMETRO COM VALOR PADRÃO
        _dataCadastro: Date = new Date()
    ) {
        this.idCategoria = _idCategoria;
        this.nomeProduto = _nomeProduto;
        this.codigoProduto = _codigoProduto;
        this.descricao = _descricao;
        this.preco = _preco;
        this.quantidadeEstoque = _quantidadeEstoque;
        this.quantidadeMinima = _quantidadeMinima;
        this.status = _status;
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

    public setNomeProduto(_nomeProduto: string): void {
        this.nomeProduto = _nomeProduto;
    }

    public getNomeProduto(): string {
        return this.nomeProduto;
    }

    public setCodigoProduto(_codigoProduto: number): void {
        this.codigoProduto = _codigoProduto;
    }

    public getCodigoProduto(): number {
        return this.codigoProduto;
    }

    public setDescricao(_descricao: string): void {
        this.descricao = _descricao;
    }

    public getDescricao(): string {
        return this.descricao;
    }

    public setPreco(_preco: number): void {
        this.preco = _preco;
    }

    public getPreco(): number {
        return this.preco;
    }

    public setQuantidadeEstoque(_quantidadeEstoque: number): void {
        this.quantidadeEstoque = _quantidadeEstoque;
    }

    public getQuantidadeEstoque(): number {
        return this.quantidadeEstoque;
    }

    public setQuantidadeMinima(_quantidadeMinima: number): void {
        this.quantidadeMinima = _quantidadeMinima;
    }

    public getQuantidadeMinima(): number {
        return this.quantidadeMinima;
    }

    public setStatus(_status: string): void {
        this.status = _status;
    }

    public getStatus(): string {
        return this.status;
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
                    produtoBD.status ?? (produtoBD.ativo ? "ATIVO" : "INATIVO"),
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
                    produtoBD.status ?? (produtoBD.ativo ? "ATIVO" : "INATIVO"),
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
                produto.codigo,
                produto.descricao.toUpperCase(),
                produto.preco_unitario,
                produto.quantidade_disponivel,
                produto.quantidade_minima,
                produto.ativo !== undefined ? produto.ativo : true
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
                                        status,
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
                    respostaBD.rows[0].status,
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
                    respostaBD.rows[0].preco,
                    respostaBD.rows[0].quantidade_disponivel,
                    respostaBD.rows[0].quantidade_minima,
                    respostaBD.rows[0].status,
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
                    produtoBD.status,
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
}

export default Produto;