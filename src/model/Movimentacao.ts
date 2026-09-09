import type { MovimentacaoDTO } from "../interface/MovimentacaoDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Movimentacao {
	private idMovimentacao: number = 0;
	private id_produto: number;
	private idMovimentacaoOrigem: number | undefined;
	private tipo: string;
	private motivo: string;
	private quantidade: number;
	private precoUnitarioPraticado: number | undefined;
	private valorTotal: number | undefined;
	private observacao: string;
	private dataMovimentacao: Date;

	constructor(
		_id_produto: number,
		_tipo: string,
		_motivo: string,
		_quantidade: number,
		_observacao: string,
		_idMovimentacaoOrigem?: number,
		_precoUnitarioPraticado?: number,
		_valorTotal?: number,
		_dataMovimentacao: Date = new Date()
	) {
		this.id_produto = _id_produto;
		this.tipo = _tipo;
		this.motivo = _motivo;
		this.quantidade = _quantidade;
		this.observacao = _observacao;
		this.idMovimentacaoOrigem = _idMovimentacaoOrigem;
		this.precoUnitarioPraticado = _precoUnitarioPraticado;
		this.valorTotal = _valorTotal;
		this.dataMovimentacao = _dataMovimentacao;
	}

	public setIdMovimentacao(_idMovimentacao: number): void {
		this.idMovimentacao = _idMovimentacao;
	}

	public getIdMovimentacao(): number {
		return this.idMovimentacao;
	}

	public setId_produto(_id_produto: number): void {
		this.id_produto = _id_produto;
	}

	public getId_produto(): number {
		return this.id_produto;
	}

	public setIdMovimentacaoOrigem(_idMovimentacaoOrigem: number | undefined): void {
		this.idMovimentacaoOrigem = _idMovimentacaoOrigem;
	}

	public getIdMovimentacaoOrigem(): number | undefined {
		return this.idMovimentacaoOrigem;
	}

	public setTipo(_tipo: string): void {
		this.tipo = _tipo;
	}

	public getTipo(): string {
		return this.tipo;
	}

	public setMotivo(_motivo: string): void {
		this.motivo = _motivo;
	}

	public getMotivo(): string {
		return this.motivo;
	}

	public setQuantidade(_quantidade: number): void {
		this.quantidade = _quantidade;
	}

	public getQuantidade(): number {
		return this.quantidade;
	}

	public setPrecoUnitarioPraticado(_precoUnitarioPraticado: number | undefined): void {
		this.precoUnitarioPraticado = _precoUnitarioPraticado;
	}

	public getPrecoUnitarioPraticado(): number | undefined {
		return this.precoUnitarioPraticado;
	}

	public setValorTotal(_valorTotal: number | undefined): void {
		this.valorTotal = _valorTotal;
	}

	public getValorTotal(): number | undefined {
		return this.valorTotal;
	}

	public setObservacao(_observacao: string): void {
		this.observacao = _observacao;
	}

	public getObservacao(): string {
		return this.observacao;
	}

	public setDataMovimentacao(_dataMovimentacao: Date): void {
		this.dataMovimentacao = _dataMovimentacao;
	}

	public getDataMovimentacao(): Date {
		return this.dataMovimentacao;
	}

	static async cadastrarMovimentacao(movimentacao: MovimentacaoDTO): Promise<MovimentacaoDTO | null> {
		const client = await database.connect();

		try {
			await client.query("BEGIN");

			const produto = await client.query(
				`SELECT id_produto, quantidade_disponivel, preco_unitario
				 FROM produto
				 WHERE id_produto = $1
				 FOR UPDATE;`,
				[movimentacao.id_produto]
			);

			if (produto.rowCount === 0) {
				await client.query("ROLLBACK");
				return null;
			}

			const quantidadeAtual = produto.rows[0].quantidade_disponivel;
			const quantidadeMovimentada = movimentacao.tipo === "ENTRADA"
				? movimentacao.quantidade
				: -movimentacao.quantidade;
			const novaQuantidade = quantidadeAtual + quantidadeMovimentada;

			if (novaQuantidade < 0) {
				await client.query("ROLLBACK");
				throw new Error("A saída não pode ser maior que o estoque disponível.");
			}

			const preco = movimentacao.preco_unitario_praticado
				?? produto.rows[0].preco_unitario;
			const valorTotal = movimentacao.valor_total ?? preco * movimentacao.quantidade;

			const insercao = await client.query(
				`INSERT INTO movimentacao (
										    id_produto,
										    tipo,
										    motivo,
										    quantidade,
										    observacao
										)
				 VALUES ($1, $2, $3, $4, $5)
				 RETURNING id_movimentacao, id_produto, id_movimentacao_origem,
						   tipo, motivo, quantidade, preco_unitario_praticado,
						   valor_total, observacao, data_movimentacao;`,
				[
					movimentacao.id_produto,
					movimentacao.tipo,
					movimentacao.motivo,
					movimentacao.quantidade,
					movimentacao.observacao
				]
			);

			await client.query(
				`UPDATE produto
				 SET quantidade_disponivel = $1
				 WHERE id_produto = $2;`,
				[novaQuantidade, movimentacao.id_produto]
			);

			await client.query("COMMIT");
			return insercao.rows[0] as MovimentacaoDTO;
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	

	static async getDetalhesMovimentacao(id_movimentacao: number): Promise<MovimentacaoDTO | null> {
		try {
			const respostaBD = await database.query(
				`SELECT m.id_movimentacao, m.id_produto, m.id_movimentacao_origem,
						m.tipo, m.motivo, m.quantidade, m.preco_unitario_praticado,
						m.valor_total, m.observacao, m.data_movimentacao,
						p.nome AS nome_produto
				 FROM movimentacao m
				 INNER JOIN produto p ON p.id_produto = m.id_produto
				 WHERE m.id_movimentacao = $1;`,
				[id_movimentacao]
			);

			if (respostaBD.rowCount === 0) {
				return null;
			}

			return respostaBD.rows[0] as MovimentacaoDTO;
		} catch (error) {
			console.error(`Erro ao buscar detalhes da movimentação. ${error}`);
			return null;
		}
	}

	static async listarMovimentacoes(id_produto?: number): Promise<Array<MovimentacaoDTO>> {
		const parametros: number[] = [];
		let filtro = "";

		if (id_produto !== undefined) {
			parametros.push(id_produto);
			filtro = "WHERE m.id_produto = $1";
		}

		const resposta = await database.query(
			`SELECT m.id_movimentacao, m.id_produto, m.id_movimentacao_origem,
					m.tipo, m.motivo, m.quantidade, m.preco_unitario_praticado,
					m.valor_total, m.observacao, m.data_movimentacao,
					p.nome AS nome_produto
			 FROM movimentacao m
			 INNER JOIN produto p ON p.id_produto = m.id_produto
			 ${filtro}
			 ORDER BY m.data_movimentacao DESC, m.id_movimentacao DESC;`,
			parametros
		);

		return resposta.rows as Array<MovimentacaoDTO>;
	}
}

export default Movimentacao;
