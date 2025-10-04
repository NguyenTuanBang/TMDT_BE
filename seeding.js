import mongoose from "mongoose";
import multer from "multer";
import cloudinary from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Import Models
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

cloudinary.v2.config({
  cloud_name: "dm8ydkx0k",
  api_key: process.env.CloudinaryKey,
  api_secret: process.env.CloudinarySecretKey,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadImage = async (file) => {
  const filePath = path.join(__dirname, "img", file);
  const result = await cloudinary.v2.uploader.upload(filePath, {
    folder: "ecommerce_seed",
  });
  return result.secure_url;
};

async function seed() {
  try {
    await mongoose.connect(process.env.DB);
    console.log("✅ Kết nối MongoDB thành công");

    // Clear all collections
    await Promise.all([
      UserModel.deleteMany({}),
      StoreModel.deleteMany({}),
      ProductModel.deleteMany({}),
      ProductVariantsModel.deleteMany({}),
      ImageModel.deleteMany({}),
      SizeModel.deleteMany({}),
      TagModel.deleteMany({}),
      ProductTagsModel.deleteMany({}),
      PromotionModel.deleteMany({}),
      CartModel.deleteMany({}),
      CartItemModel.deleteMany({}),
      CartStoreModel.deleteMany({}),
      OrderModel.deleteMany({}),
      OrderItemModel.deleteMany({}),
      OrderStoreModel.deleteMany({}),
      AddressModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
    ]);

    // Upload images
    const avatarUrl = await uploadImage("avt.jfif");
    const shirtUrl = await uploadImage("images.jpg");

    // --- USERS ---
    const users = await UserModel.insertMany([
      {
        username: "user01",
        email: "user01@example.com",
        password: "User@1234",
        fullname: "Nguyễn Tuấn User",
        phone: "0909123001",
        avatar: avatarUrl,
        role: "user",
        rank: "bronze",
      },
      {
        username: "seller01",
        email: "seller01@example.com",
        password: "Seller@123",
        fullname: "Nguyễn Văn Seller",
        phone: "0912345001",
        avatar: avatarUrl,
        role: "seller",
        rank: "silver",
      },
      {
        username: "admin01",
        email: "admin01@example.com",
        password: "Admin@1234",
        fullname: "Admin Chính",
        phone: "0999999999",
        role: "admin",
        rank: "gold",
      },
    ]);

    const user = users[0];
    const seller = users[1];
    const admin = users[2];

    // --- ADDRESS ---
    const addr1 = await AddressModel.create({
      user: user._id,
      name: "Nguyễn Tuấn User",
      phone: "0909123001",
      province: "Hà Nội",
      district: "Ba Đình",
      ward: "Phúc Xá",
      detail: "123 Đường Hoàng Hoa Thám",
      isDefault: true,
    });

    user.address.push(addr1._id);
    await user.save();

    // --- STORE ---
    const store1 = await StoreModel.create({
      user: seller._id,
      address: "123 Phố X, Hà Nội",
      name: "Shop Quần Áo",
      phone: "0912345001",
      status: "Approval",
      SKU_code: "STORE001",
      citizenCode: "0123456789",
      citizenImageFront: avatarUrl,
      citizenImageBack: avatarUrl,
    });

    // --- SIZE ---
    const sizes = await SizeModel.insertMany([
      { size_standard: "EU", size_value: "M" },
      { size_standard: "EU", size_value: "L" },
      { size_standard: "EU", size_value: "XL" },
      { size_standard: "EU", size_value: "XXL" },
    ]);

    // --- TAGS ---
    const tags = await TagModel.insertMany([
      { nameTag: "Áo" },
      { nameTag: "Quần" },
      { nameTag: "Thời trang nam" },
      { nameTag: "Áo khoác" },
      { nameTag: "Jeans" },
    ]);

    // --- IMAGE ---
    const img1 = await ImageModel.create({ url: shirtUrl, color: "Đỏ" });
    const img2 = await ImageModel.create({ url: shirtUrl, color: "Xanh" });

    // Function tạo product + variants + tags
    const createProductWithVariants = async (
      name,
      desc,
      basePrice,
      skuPrefix,
      tagIds
    ) => {
      const product = await ProductModel.create({
        name,
        store_id: store1._id,
        description: desc,
        totalRating: 20,
        countRating: 5,
        tradedCount: 10,
        
      });

      const variants = await ProductVariantsModel.insertMany([
        {
          product_id: product._id,
          image: img1._id,
          size: sizes[0]._id,
          quantity: 50,
          price: basePrice,
          SKU_code: `${skuPrefix}01`,
        },
        {
          product_id: product._id,
          image: img1._id,
          size: sizes[1]._id,
          quantity: 60,
          price: basePrice + 10000,
          SKU_code: `${skuPrefix}02`,
        },
        {
          product_id: product._id,
          image: img2._id,
          size: sizes[2]._id,
          quantity: 40,
          price: basePrice + 20000,
          SKU_code: `${skuPrefix}03`,
        },
        {
          product_id: product._id,
          image: img2._id,
          size: sizes[3]._id,
          quantity: 30,
          price: basePrice + 30000,
          SKU_code: `${skuPrefix}04`,
        },
      ]);

      await ProductTagsModel.insertMany(
        tagIds.map((t) => ({ product_id: product._id, tag_id: t }))
      );

      return { product, variants };
    };

    // --- PRODUCTS ---
    const { product: product1, variants: variants1 } =
      await createProductWithVariants("Áo thun nam basic", "Áo cotton co giãn", 120000, "TSHIRT", [
        tags[0]._id,
        tags[2]._id,
      ]);

    const { product: product2, variants: variants2 } =
      await createProductWithVariants("Quần jeans nam", "Quần jeans xanh trẻ trung", 250000, "JEANS", [
        tags[1]._id,
        tags[2]._id,
        tags[4]._id,
      ]);

    const { product: product3, variants: variants3 } =
      await createProductWithVariants("Áo khoác hoodie", "Hoodie nỉ ấm áp", 300000, "HOODIE", [
        tags[0]._id,
        tags[2]._id,
        tags[3]._id,
      ]);

    // --- PROMOTION ---
    const promo1 = await PromotionModel.create({
      description: "Sale 20%",
      store: store1._id,
      name: "Giảm giá khai trương",
      scope: "store",
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      discount_type: "percentage",
      discount_value: 20,
      quantity: 100,
    });

    // --- CART & CARTSTORE ---
    const cart = await CartModel.create({
      user: user._id,
      promotion: promo1._id,
    });
    const cartStore = await CartStoreModel.create({
      cart_id: cart._id,
      store_id: store1._id,
      promotion: promo1._id,
    });

    await CartItemModel.create({
      cartStore_id: cartStore._id,
      variant_id: variants1[0]._id,
      quantity: 2,
      unitPrice: 120000,
    });

    // --- ORDER ---
    const order = await OrderModel.create({
      contact: addr1._id,
      total_amount: 240000,
      final_amount: 200000,
      promotion: promo1._id,
      shippingFee: 20000,
    });

    await OrderStoreModel.create({
      order_id: order._id,
      store: store1._id,
      shippingFee: 20000,
      promotion: promo1._id,
      subTotal: 240000,
      finalTotal: 200000,
    });

    await OrderItemModel.create({
      store: store1._id,
      variant_id: variants1[0]._id,
      quantity: 2,
      unitPrice: 120000,
      finalPrice: 200000,
      status: "CONFIRMED",
    });

    // --- AUDIT LOG ---
    await AuditLogModel.create({
      entity_type: "Product",
      entity_id: product1._id,
      action: "create",
      changes: {
        field: "name",
        oldValue: null,
        newValue: "Áo thun nam basic",
      },
      performedBy: admin._id,
    });

    console.log("🎉 Seed dữ liệu thành công với 3 sản phẩm!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi seed:", err);
    process.exit(1);
  }
}

seed();
