import type { Request, Response } from "express";
import type { CategoriaDTO } from "../interface/CategoriaDTO.js";
import Categoria from "../model/Categoria.js";

class CategoriaController {
	static async todas(req: Request, res: Response): Promise<Response> {
		try {
			const categorias = await Categoria.listarCategorias();

			if (categorias === null) {
				return res.status(500).json({ mensagem: "Não foi possível listar as categorias." });
			}

			return res.status(200).json(categorias);
		} catch (error) {
			console.error(`Erro ao listar categorias. ${error}`);
			return res.status(500).json({ mensagem: "Não foi possível listar as categorias." });
		}
	}

	static async nova(req: Request, res: Response): Promise<Response> {
		try {
			const dados = req.body as Partial<CategoriaDTO>;

			if (typeof dados.nome !== "string" || dados.nome.trim() === "") {
				return res.status(400).json({ mensagem: "Informe o nome da categoria." });
			}

			const categoria = await Categoria.cadastrarCategoria({ nome: dados.nome });

			if (categoria === null) {
				return res.status(400).json({ mensagem: "Não foi possível cadastrar a categoria." });
			}

			return res.status(201).json(categoria);
		} catch (error) {
			console.error(`Erro ao cadastrar categoria. ${error}`);
			return res.status(500).json({ mensagem: "Não foi possível cadastrar a categoria." });
		}
	}
}

export default CategoriaController;
