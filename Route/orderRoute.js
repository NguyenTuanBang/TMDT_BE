import express from "express"
import authController from "../Controller/authController.js";
import OrderController from "../Controller/orderController.js";



const route = express.Router();

route.post("/", authController.protect, OrderController.createOrder)
route.post("/cancel", authController.protect, OrderController.cancelOrder)

export default route