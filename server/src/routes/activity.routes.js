import protect from "../middlewares/auth.middleware.js";
import { getActivityLogs } from "../controllers/activity.controller.js";
import Router from 'express';

const router = Router();

router.route("/").get(
    protect,
    getActivityLogs
)

export default router;