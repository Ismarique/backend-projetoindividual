import { Router } from "express";
import type { Request, Response } from "express";
import ProdutoController from "./controller/ProdutoController.js";
import MovimentacaoController from "./controller/MovimentacaoController.js";
import CategoriaController from "./controller/CategoriaController.js";
import { Auth } from "./model/Auth.js";
const router = Router();

router.get("/api", (req: Request, res: Response) => {
    res.status(200).json({ mensagem: "Olá seja bem-vindo!"});
});

router.get('/api/produtos', ProdutoController.todos);
router.post('/api/produtos', ProdutoController.novo);
router.patch('/api/produtos/:idProduto', async (req: Request, res: Response) => {
    const atualizado = await ProdutoController.atualizarProduto(
        Number(req.params.idProduto),
        req.body
    ); 

    res.status(200).json(atualizado);
});
router.get('/api/produtos/:idProduto', Auth.verifyToken,  ProdutoController.produtoDetalhado);
router.get('/api/categorias', Auth.verifyToken, CategoriaController.todas);
router.post('/api/categorias', Auth.verifyToken, CategoriaController.nova);
router.patch('/api/categorias/:idCategoria', Auth.verifyToken, CategoriaController.atualizarCategoria);
router.get('/api/movimentacao', Auth.verifyToken, MovimentacaoController.todas);
router.post('/api/movimentacao', Auth.verifyToken, MovimentacaoController.nova);
router.get('/api/movimentacoes/:idMovimentacao', Auth.verifyToken, MovimentacaoController.movimentacaoDetalhada);

export {router};