import Router from 'express';
import protect from '../middlewares/auth.middleware.js';
import { getRelations, createRelation, deleteRelation } from '../controllers/relation.controller.js';

const router = Router();

router.route("/:type/:id").get(
    protect,
    getRelations
)

router.route("/").post(
    protect,
    createRelation
)
router.route("/:id").delete(
    protect,
    deleteRelation
)

export default router;
