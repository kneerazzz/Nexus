import { Router } from "express";
import { register, login, logout, getUserDetails, updateUserDetails, updatePassword, deleteUser } from "../controllers/user.controller.js";
import protect from "../middlewares/auth.middleware.js";
const router = Router();


router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(protect, logout);
router.route("/me").get(protect, getUserDetails);
router.route("/me").patch(protect, updateUserDetails);
router.route("/password").patch(protect, updatePassword);
router.route("/me").delete(protect, deleteUser);


export default router;


