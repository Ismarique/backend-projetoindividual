import type { CategoriaDTO } from "../interface/CategoriaDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Categoria {
	private idCategoria: number = 0;
	private nomeCategoria: string;

	constructor(_nomeCategoria: string) {
		this.nomeCategoria = _nomeCategoria;
	}

	public setIdCategoria(_idCategoria: number): void {
		this.idCategoria = _idCategoria;
	}

	public getIdCategoria(): number {
		return this.idCategoria;
	}

	public setNomeCategoria(_nomeCategoria: string): void {
		this.nomeCategoria = _nomeCategoria;
	}

	public getNomeCategoria(): string {
		return this.nomeCategoria;
	}

	static async listarCategorias(): Promise<Array<Categoria> | null> {
		try {
			const respostaBD = await database.query(
				`SELECT id_categoria, nome
				 FROM categoria
				 ORDER BY id_categoria;`
			);

			const listaDeCategorias: Array<Categoria> = [];
			respostaBD.rows.forEach((categoriaBD: any) => {
				const categoria = new Categoria(categoriaBD.nome);
				categoria.setIdCategoria(categoriaBD.id_categoria);
				listaDeCategorias.push(categoria);
			});

			return listaDeCategorias;
		} catch (error) {
			console.error(`Erro ao consultar categorias. ${error}`);
			return null;
		}
	}

	static async cadastrarCategoria(categoria: CategoriaDTO): Promise<Categoria | null> {
		try {
			const respostaBD = await database.query(
				`INSERT INTO categoria (nome)
				 VALUES ($1)
				 RETURNING id_categoria, nome;`,
				[categoria.nome.toUpperCase()]
			);

			if (respostaBD.rowCount === 0) {
				return null;
			}

			const categoriaCadastrada = new Categoria(respostaBD.rows[0].nome);
			categoriaCadastrada.setIdCategoria(respostaBD.rows[0].id_categoria);
			return categoriaCadastrada;
		} catch (error) {
			console.error(`Erro ao cadastrar categoria. ${error}`);
			return null;
		}
	}
}

export default Categoria;
