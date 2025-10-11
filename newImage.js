import mongoose from "mongoose";
import multer from "multer";
import cloudinary from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import UserModel from "./Model/UserModel.js";
import StoreModel from "./Model/StoreModel.js";
import ProductModel from "./Model/ProductModel.js";
import ProductVariantsModel from "./Model/product_variantsModel.js";
import ImageModel from "./Model/imageModel.js";
import SizeModel from "./Model/sizeModel.js";
import TagModel from "./Model/TagModel.js";
import ProductTagsModel from "./Model/ProductTagsModel.js";
import PromotionModel from "./Model/PromotionModel.js";
import CartModel from "./Model/CartModel.js";
import CartItemModel from "./Model/CartItemModel.js";
import CartStoreModel from "./Model/CartStoreModel.js";
import OrderModel from "./Model/OrderModel.js";
import OrderItemModel from "./Model/OrderItemModel.js";
import OrderStoreModel from "./Model/OrderStoreModel.js";
import AddressModel from "./Model/AddressModel.js";
import AuditLogModel from "./Model/AuditLogModel.js";


dotenv.config();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
cloudinary.v2.config({ cloud_name: "dm8ydkx0k", api_key: process.env.CloudinaryKey, api_secret: process.env.CloudinarySecretKey, });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadImage = async (file) => {
    const filePath = path.join(__dirname, "img", file);
    const result = await cloudinary.v2.uploader.upload(filePath, { folder: "ecommerce_seed", });
    return result.secure_url;
};

const avatarUrl = await uploadImage("avt.jfif");
const avatarUrl2 = await uploadImage("blue.jfif");


console.log(avatarUrl)
console.log(avatarUrl2)