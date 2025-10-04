import express from "express";
import authController from "../Controller/authController.js";
import CartController from "../Controller/cartController.js";
const router = express.Router();

router.get("/", authController.protect, CartController.getCart);
router.post("/increase", authController.protect, CartController.addToCart);
router.post("/reduce", authController.protect, CartController.reduceFromCart);
router.post("/remove", authController.protect, CartController.removeFromCart)
router.post("/change", authController.protect, CartController.changeCartItemState)

export default router;

