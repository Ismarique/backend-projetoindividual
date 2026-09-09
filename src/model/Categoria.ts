import type { CategoriaDTO } from "../interface/CategoriaDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Categoria {
	private idCategoria: number = 0;
	private nome: string;

	constructor(_nome: string) {
		this.nome = _nome;
	}

	public setIdCategoria(_idCategoria: number): void {
		this.idCategoria = _idCategoria;
	}

	public getIdCategoria(): number {
		return this.idCategoria;
	}

	public setNome(_nome: string): void {
		this.nome = _nome;
	}

	public getNome(): string {
		return this.nome;
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
				[categoria.nome]
			);

			if (respostaBD.rowCount === 0) {
				return null;
			}

			const categoriaAtualizada = new Categoria(respostaBD.rows[0].nome);
			categoriaAtualizada.setIdCategoria(respostaBD.rows[0].id_categoria);
			return categoriaAtualizada;
		} catch (error) {
			console.error(`Erro ao cadastrar categoria. ${error}`);
			return null;
		}
	}

	static async atualizarCategoria(id_categoria: number, categoria: CategoriaDTO): Promise<boolean> {
		try {
			const respostaBD = await database.query(
				`UPDATE categoria
				 SET nome = $1
				 WHERE id_categoria = $2;`,
				[categoria.nome.toUpperCase(), id_categoria]
			);

			if (respostaBD.rowCount === 0) {
				return false;
			}

			console.info(`Categoria ${id_categoria} atualizada com sucesso!`);
			return true;
		} catch (error) {
			console.error(`Erro ao atualizar categoria. ${error}`);
			return false;
		}
	}



}

export default Categoria;
