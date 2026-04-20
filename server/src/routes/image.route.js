import { Router } from "express";
import { getAllImages, getImage, uploadImage, updateImage, deleteImage } from "../controllers/image.controller.js";
import protect from "../middlewares/auth.middleware.js";
import { uploadImage as uploadMiddleware } from "../middlewares/upload.middleware.js"
const router = Router();

router.route("/").get(protect, getAllImages);
router.route("/:id").get(protect, getImage);
router.route("/").post(
    uploadMiddleware.single('file'),
    protect,
    uploadImage
)
router.route("/:id").patch(
    protect,
    updateImage
)
router.route("/:id").delete(
    protect,
    deleteImage
)

export default router;