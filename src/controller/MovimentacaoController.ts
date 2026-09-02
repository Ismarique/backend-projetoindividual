import type { Request, Response } from "express";
import type { MovimentacaoDTO } from "../interface/MovimentacaoDTO.js";
import Movimentacao from "../model/Movimentacao.js";

class MovimentacaoController {
	static async nova(req: Request, res: Response): Promise<Response> {
		try {
			const dados = req.body as Partial<MovimentacaoDTO>;
			const tipo = typeof dados.tipo === "string" ? dados.tipo.toUpperCase() : "";

			if (!dados.id_produto || !dados.motivo || !dados.observacao || !dados.quantidade || !tipo) {
				return res.status(400).json({
					mensagem: "Informe id_produto, tipo, motivo, quantidade e observacao."
				});
			}

			if (!['ENTRADA', 'SAIDA'].includes(tipo)) {
				return res.status(400).json({ mensagem: "O tipo deve ser ENTRADA ou SAIDA." });
			}

			if (dados.quantidade <= 0) {
				return res.status(400).json({ mensagem: "A quantidade deve ser maior que zero." });
			}

			if (dados.preco_unitario_praticado !== undefined && dados.preco_unitario_praticado < 0) {
				return res.status(400).json({ mensagem: "O preço unitário não pode ser negativo." });
			}

			const movimentacao: MovimentacaoDTO = {
				id_produto: dados.id_produto,
				tipo,
				motivo: dados.motivo,
				quantidade: dados.quantidade,
				observacao: dados.observacao
			};

			if (dados.id_movimentacao_origem !== undefined) {
				movimentacao.id_movimentacao_origem = dados.id_movimentacao_origem;
			}

			if (dados.preco_unitario_praticado !== undefined) {
				movimentacao.preco_unitario_praticado = dados.preco_unitario_praticado;
			}

			if (dados.valor_total !== undefined) {
				movimentacao.valor_total = dados.valor_total;
			}

			const cadastrada = await Movimentacao.cadastrarMovimentacao(movimentacao);

			if (cadastrada === null) {
				return res.status(404).json({ mensagem: "Produto não encontrado." });
			}

			return res.status(201).json(cadastrada);
		} catch (error) {
			if (error instanceof Error && error.message.includes("estoque disponível")) {
				return res.status(400).json({ mensagem: error.message });
			}

			console.error(`Erro ao cadastrar movimentação. ${error}`);
			return res.status(500).json({ mensagem: "Não foi possível cadastrar a movimentação." });
		}
	}

	static async todas(req: Request, res: Response): Promise<Response> {
		try {
			const idProduto = req.params.idProduto;
			const id = idProduto === undefined ? undefined : Number(idProduto);

			if (id !== undefined && (!Number.isInteger(id) || id <= 0)) {
				return res.status(400).json({ mensagem: "ID do produto inválido." }); 
			}

			const movimentacoes = await Movimentacao.listarMovimentacoes(id);
			return res.status(200).json(movimentacoes);
		} catch (error) {
			console.error(`Erro ao listar movimentações. ${error}`);
			return res.status(500).json({ mensagem: "Não foi possível listar as movimentações." });
		}
	}
}

export default MovimentacaoController;
