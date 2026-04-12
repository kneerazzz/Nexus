import { Router } from "express";
import { getAllDocuments, getDocument, updateDocument, uploadDocument, deleteDocument, getVersions, uploadVersion, searchDocuments } from "../controllers/document.controller.js";
import protect from "../middlewares/auth.middleware.js";
import { uploadDocument as uploadMiddleware } from "../middlewares/upload.middleware.js"


const router = Router();

router.route("/").get(protect, getAllDocuments);
router.route("/search").get(protect, searchDocuments);
router.route("/").post(
    uploadMiddleware.single('file'),
    protect,
    uploadDocument
)
router.route("/:id").get(
    protect,
    getDocument
)
router.route("/:id").patch(
    protect,
    updateDocument
)
router.route("/:id").delete(
    protect,
    deleteDocument
)
router.route("/:id/versions").get(
    protect,
    getVersions
)
router.route("/:id/versions").post(
    uploadMiddleware.single('file'),
    protect,
    uploadVersion
)

export default router;

