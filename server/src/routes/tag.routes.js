import Router from "express";
import protect from "../middlewares/auth.middleware.js";
import { getAllTags, getTag, getTagByName, updateTag, createTag, deleteTag, addTagToDocument, removeTagFromDocument, addTagToImage, removeTagFromImage } from "../controllers/tag.controller.js";

const router = Router();

router.route("/").get(
    protect,
    getAllTags
)

router.route("/:id").get(
    protect,
    getTag
)
router.route("/name/:name").get(
    protect,
    getTagByName
)

router.route("/").post(
    protect,
    createTag
)
router.route("/:id").patch(
    protect,
    updateTag
)
router.route("/:id").delete(
    protect,
    deleteTag
)
router.route("/document/:documentId/:tagId").post(
    protect,
    addTagToDocument
)
router.route("/document/:documentId/:tagId").delete(
    protect,
    removeTagFromDocument
)

router.route("/image/:imageId/:tagId").post(
    protect,
    addTagToImage
)
router.route("/image/:imageId/:tagId").delete(
    protect,
    removeTagFromImage
)

export default router;