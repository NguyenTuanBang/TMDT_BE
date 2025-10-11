import express from "express"
import authController from "../Controller/authController.js"
import PromotionController from "../Controller/promotionController.js"

const route = express.Router()

route.get("/global", authController.protect, PromotionController.getGlobalPromotion)
route.get("/store", authController.protect, PromotionController.getStorePromotion)

export default route