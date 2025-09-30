import express from "express";
import authController from "../Controller/authController.js";
import CartController from "../Controller/cartController.js";
const router = express.Router();

router.get("/", authController.protect, CartController.getCart);
router.post("/", authController.protect, CartController.addToCart);
router.delete("/", authController.protect, CartController.removeFromCart);

export default router;

