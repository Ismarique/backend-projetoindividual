import { Router } from "express";
import type { Request, Response } from "express";
import ProdutoController from "./controller/ProdutoController.js";
import MovimentacaoController from "./controller/MovimentacaoController.js";
import CategoriaController from "./controller/CategoriaController.js";

const router = Router();

router.get("/api", (req: Request, res: Response) => {
    res.status(200).json({ mensagem: "Olá seja bem-vindo!"});
});

router.get('/api/produtos', ProdutoController.todos);
router.post('/api/produtos', ProdutoController.novo);
router.get('/api/categorias', CategoriaController.todas);
router.post('/api/categorias', CategoriaController.nova);
router.get('/api/movimentacoes', MovimentacaoController.todas);
router.post('/api/movimentacoes', MovimentacaoController.nova);
//router.get('/api/produtos/:idProduto/movimentacoes', MovimentacaoController.todas);
//router.get('/produtos/:idProduto', ProdutoController.produto);
//router.put('/produtos/:idProduto', ProdutoController.atualizarProduto);
//router.delete('/produtos/:idProduto', ProdutoController.removerProduto);
//router.get('/produtos/categoria/:idCategoria', ProdutoController.produtosPorCategoria);
//router.get('/produtos/status/:status', ProdutoController.produtosPorStatus);
//router.get('/produtos/estoque-baixo', ProdutoController.produtosEstoqueBaixo);
//router.get('/produtos/resumo', ProdutoController.resumoProdutos);



export {router};