import type { ProdutoDTO } from "../interface/ProdutoDTO.js";
import Produto from "../model/Produto.js";
import type { Request, Response } from "express";

class ProdutoController extends Produto {

    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            // MODIFICADO: Agora lista apenas produtos ativos
            const listaProdutos: Array<Produto> | null = await Produto.listarProdutos();

            if (listaProdutos === null) {
                return res.status(500).json({ mensagem: "Erro ao buscar produtos." });
            }

            return res.status(200).json(listaProdutos);
        } catch (error) {
            console.error(`Erro ao consultar modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível acessar a lista de Produtos." });
        }
    }

    /**
     * NOVO MÉTODO: Lista todos os produtos (inclusive inativos) - para administração
     */
    static async todosCompletos(req: Request, res: Response): Promise<Response> {
        try {
            const listaProdutos: Array<Produto> | null = await Produto.listarTodosProdutos();

            if (listaProdutos === null) {
                return res.status(500).json({ mensagem: "Erro ao buscar produtos." });
            }

            return res.status(200).json(listaProdutos);
        } catch (error) {
            console.error(`Erro ao consultar modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível acessar a lista de Produtos." });
        }
    }

    static async novo(req: Request, res: Response): Promise<Response> {
        try {
            const dadosRecebidosProduto = req.body;

            
            // Validação de preço
            if (dadosRecebidosProduto.preco_unitario <= 0) {
                return res.status(400).json({ 
                    mensagem: "O preço deve ser maior que zero." 
                });
            }

            // Validação de quantidade
            if (dadosRecebidosProduto.quantidade_disponivel < 0) {
                return res.status(400).json({ 
                    mensagem: "A quantidade em estoque não pode ser negativa." 
                });
            }

            if (dadosRecebidosProduto.quantidade_minima < 0) {
                return res.status(400).json({ 
                    mensagem: "A quantidade mínima não pode ser negativa." 
                });
            }

            // NOVO: Se não veio o campo ativo, define como true (padrão)
            if (dadosRecebidosProduto.ativo === undefined) {
                dadosRecebidosProduto.ativo = true;
            }

            const respostaModelo = await Produto.cadastrarProduto(dadosRecebidosProduto);

            if (respostaModelo) {
                return res.status(201).json({ mensagem: "Produto cadastrado com sucesso." });
            } else {
                return res.status(400).json({ mensagem: "Erro ao cadastrar Produto." });
            }
        } catch (error) {
            console.error(`Erro no modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível inserir o Produto" });
        }
    }

    static async produto(req: Request, res: Response): Promise<Response> {
        try {
            const idProduto: number = parseInt(req.params.idProduto as string);

            if (isNaN(idProduto) || idProduto <= 0) {
                return res.status(400).json({ mensagem: "ID inválido." });
            }

            const respostaModelo = await Produto.listarProduto(idProduto);

            if (respostaModelo === null) {
                return res.status(200).json({ mensagem: "Nenhum Produto ativo encontrado com o ID fornecido." });
            }
            
            return res.status(200).json(respostaModelo);
        } catch (error) {
            console.error(`Erro ao acessar o modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível recuperar o Produto." });
        }
    }

    /**
     * NOVO MÉTODO: Busca produto por ID (inclusive inativos)
     */
    static async produtoCompleto(req: Request, res: Response): Promise<Response> {
        try {
            const idProduto: number = parseInt(req.params.idProduto as string);

            if (isNaN(idProduto) || idProduto <= 0) {
                return res.status(400).json({ mensagem: "ID inválido." });
            }

            const respostaModelo = await Produto.listarProdutoCompleto(idProduto);

            if (respostaModelo === null) {
                return res.status(404).json({ mensagem: "Produto não encontrado." });
            }
            
            return res.status(200).json(respostaModelo);
        } catch (error) {
            console.error(`Erro ao acessar o modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível recuperar o Produto." });
        }
    }



    static async produtosPorCategoria(req: Request, res: Response): Promise<Response> {
        try {
            const idCategoria: number = parseInt(req.params.idCategoria as string);

            if (isNaN(idCategoria) || idCategoria <= 0) {
                return res.status(400).json({ mensagem: "ID da categoria inválido." });
            }

            const listaProdutos = await Produto.listarProdutos(); // Já filtra apenas ativos
            
            if (listaProdutos === null) {
                return res.status(500).json({ mensagem: "Erro ao buscar produtos." });
            }

            const produtosFiltrados = listaProdutos.filter(
                (produto: Produto) => produto.getIdCategoria() === idCategoria
            );

            if (produtosFiltrados.length === 0) {
                return res.status(200).json({ 
                    mensagem: "Nenhum produto ativo encontrado para a categoria informada.",
                    dados: []
                });
            }

            return res.status(200).json(produtosFiltrados);
        } catch (error) {
            console.error(`Erro ao acessar o modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível recuperar os produtos da categoria." });
        }
    }

    
    static async produtosEstoqueBaixo(req: Request, res: Response): Promise<Response> {
        try {
            const listaProdutos = await Produto.listarProdutos(); // Já filtra apenas ativos
            
            if (listaProdutos === null) {
                return res.status(500).json({ mensagem: "Erro ao buscar produtos." });
            }

            const produtosEstoqueBaixo = listaProdutos.filter(
                (produto: Produto) => produto.getQuantidadeDisponivel() <= produto.getQuantidadeMinima()
            );

            if (produtosEstoqueBaixo.length === 0) {
                return res.status(200).json({ 
                    mensagem: "Nenhum produto ativo com estoque abaixo do mínimo.",
                    dados: []
                });
            }

            return res.status(200).json(produtosEstoqueBaixo);
        } catch (error) {
            console.error(`Erro ao acessar o modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível recuperar os produtos com estoque baixo." });
        }
    }

    static async resumoProdutos(req: Request, res: Response): Promise<Response> {
        try {
            const listaProdutos: Array<Produto> | null = await Produto.listarProdutos(); // Apenas ativos

            if (listaProdutos === null) {
                return res.status(500).json({ mensagem: "Não foi possível gerar o resumo dos produtos." });
            }

            let totalProdutos = listaProdutos.length;
            let totalEstoque = 0;
            let valorTotalEstoque = 0;
            let produtosAtivos = 0;
            let produtosInativos = 0;
            let produtosEmFalta = 0;
            let produtosDescontinuados = 0;
            let produtosEstoqueBaixo = 0;

            listaProdutos.forEach((produto: Produto) => {
                const quantidade = produto.getQuantidadeDisponivel();
                const preco_unitario = produto.getPreco();

                totalEstoque += quantidade;
                valorTotalEstoque += quantidade * preco_unitario;


                if (quantidade <= produto.getQuantidadeMinima()) {
                    produtosEstoqueBaixo++;
                }
            });

            const resumo = {
                total_produtos_ativos: totalProdutos,
                total_estoque: totalEstoque,
                valor_total_estoque: valorTotalEstoque.toFixed(2),
                produtos_ativos: produtosAtivos,
                produtos_inativos: produtosInativos,
                produtos_em_falta: produtosEmFalta,
                produtos_descontinuados: produtosDescontinuados,
                produtos_estoque_baixo: produtosEstoqueBaixo
            };

            return res.status(200).json(resumo);
        } catch (error) {
            console.error(`Erro ao acessar o modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível gerar o resumo dos produtos." });
        }
    }
}

export default ProdutoController;