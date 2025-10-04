import mongoose from "mongoose"; import multer from "multer"; import cloudinary from "cloudinary"; import path from "path"; import { fileURLToPath } from "url"; import dotenv from "dotenv";  import UserModel from "./Model/UserModel.js"; import StoreModel from "./Model/StoreModel.js"; import ProductModel from "./Model/ProductModel.js"; import ProductVariantsModel from "./Model/product_variantsModel.js"; import ImageModel from "./Model/imageModel.js"; import SizeModel from "./Model/sizeModel.js"; import TagModel from "./Model/TagModel.js"; import ProductTagsModel from "./Model/ProductTagsModel.js"; import PromotionModel from "./Model/PromotionModel.js"; import CartModel from "./Model/CartModel.js"; import CartItemModel from "./Model/CartItemModel.js"; import CartStoreModel from "./Model/CartStoreModel.js"; import OrderModel from "./Model/OrderModel.js"; import OrderItemModel from "./Model/OrderItemModel.js"; import OrderStoreModel from "./Model/OrderStoreModel.js"; import AddressModel from "./Model/AddressModel.js"; import AuditLogModel from "./Model/AuditLogModel.js"; dotenv.config(); const storage = multer.memoryStorage(); const upload = multer({ storage: storage }); cloudinary.v2.config({ cloud_name: "dm8ydkx0k", api_key: process.env.CloudinaryKey, api_secret: process.env.CloudinarySecretKey, }); const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename); const uploadImage = async (file) => { const filePath = path.join(__dirname, "img", file); const result = await cloudinary.v2.uploader.upload(filePath, { folder: "ecommerce_seed", }); return result.secure_url; };

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
    const user = new UserModel({
      username: "user01",
      email: "user01@example.com",
      password: "User@1234",
      fullname: "Nguyễn Tuấn User",
      phone: "0909123001",
      avatar: avatarUrl,
      role: "user",
      rank: "bronze",
    });
    const seller = new UserModel({
      username: "seller01",
      email: "seller01@example.com",
      password: "Seller@123",
      fullname: "Nguyễn Văn Seller",
      phone: "0912345001",
      avatar: avatarUrl,
      role: "seller",
      rank: "silver",
    });
    const admin = new UserModel({
      username: "admin01",
      email: "admin01@example.com",
      password: "Admin@1234",
      fullname: "Admin Chính",
      phone: "0999999999",
      role: "admin",
      rank: "gold",
    });
    await Promise.all([user.save(), seller.save(), admin.save()]);

    // --- ADDRESS ---
    const addr1 = new AddressModel({
      user: user._id,
      name: "Nguyễn Tuấn User",
      phone: "0909123001",
      province: "Hà Nội",
      district: "Ba Đình",
      ward: "Phúc Xá",
      detail: "123 Đường Hoàng Hoa Thám",
      isDefault: true,
    });
    await addr1.save();

    user.address.push(addr1._id);
    await user.save();

    // --- STORE ---
    const store1 = new StoreModel({
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
    await store1.save();

    // --- SIZE ---
    const sizes = [];
    for (let s of ["M", "L", "XL", "XXL"]) {
      const size = new SizeModel({ size_standard: "EU", size_value: s });
      await size.save();
      sizes.push(size);
    }

    // --- TAGS ---
    const tagNames = ["Áo", "Quần", "Thời trang nam", "Áo khoác", "Jeans"];
    const tags = [];
    for (let t of tagNames) {
      const tag = new TagModel({ nameTag: t });
      await tag.save();
      tags.push(tag);
    }

    // --- IMAGE ---
    const img1 = new ImageModel({ url: shirtUrl, color: "Đỏ" });
    const img2 = new ImageModel({ url: shirtUrl, color: "Xanh" });
    await Promise.all([img1.save(), img2.save()]);

    // Hàm tạo product + variants + tags
    const createProductWithVariants = async (name, desc, basePrice, skuPrefix, tagIds) => {
      const product = new ProductModel({
        name,
        store_id: store1._id,
        description: desc,
        totalRating: 20,
        countRating: 5,
        tradedCount: 10,
      });
      await product.save();

      const variants = [];
      const variantData = [
        { image: img1, size: sizes[0], quantity: 50, price: basePrice, sku: `${skuPrefix}01` },
        { image: img1, size: sizes[1], quantity: 60, price: basePrice + 10000, sku: `${skuPrefix}02` },
        { image: img2, size: sizes[2], quantity: 40, price: basePrice + 20000, sku: `${skuPrefix}03` },
        { image: img2, size: sizes[3], quantity: 30, price: basePrice + 30000, sku: `${skuPrefix}04` },
      ];

      for (let v of variantData) {
        const variant = new ProductVariantsModel({
          product_id: product._id,
          image: v.image._id,
          size: v.size._id,
          quantity: v.quantity,
          price: v.price,
          SKU_code: v.sku,
        });
        await variant.save();
        variants.push(variant);
      }

      for (let tid of tagIds) {
        const pt = new ProductTagsModel({ product_id: product._id, tag_id: tid });
        await pt.save();
      }

      return { product, variants };
    };

    // --- PRODUCTS ---
    const { product: product1, variants: variants1 } =
      await createProductWithVariants("Áo thun nam basic", "Áo cotton co giãn", 120000, "TSHIRT", [
        tags[0]._id, tags[2]._id,
      ]);

    const { product: product2, variants: variants2 } =
      await createProductWithVariants("Quần jeans nam", "Quần jeans xanh trẻ trung", 250000, "JEANS", [
        tags[1]._id, tags[2]._id, tags[4]._id,
      ]);

    const { product: product3, variants: variants3 } =
      await createProductWithVariants("Áo khoác hoodie", "Hoodie nỉ ấm áp", 300000, "HOODIE", [
        tags[0]._id, tags[2]._id, tags[3]._id,
      ]);

    // --- PROMOTION ---
    const promo1 = new PromotionModel({
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
    await promo1.save();

    // --- CART & CARTSTORE ---
    const cart = new CartModel({ user: user._id, promotion: promo1._id });
    await cart.save();

    const cartStore = new CartStoreModel({
      cart_id: cart._id,
      store_id: store1._id,
      promotion: promo1._id,
    });
    await cartStore.save();

    const cartItem = new CartItemModel({
      cartStore_id: cartStore._id,
      variant_id: variants1[0]._id,
      quantity: 2,
      unitPrice: 120000,
    });
    await cartItem.save();

    // --- ORDER ---
    const order = new OrderModel({
      contact: addr1._id,
      total_amount: 240000,
      final_amount: 200000,
      promotion: promo1._id,
      shippingFee: 20000,
    });
    await order.save();

    const orderStore = new OrderStoreModel({
      order_id: order._id,
      store: store1._id,
      shippingFee: 20000,
      promotion: promo1._id,
      subTotal: 240000,
      finalTotal: 200000,
    });
    await orderStore.save();

    const orderItem = new OrderItemModel({
      store: store1._id,
      variant_id: variants1[0]._id,
      quantity: 2,
      unitPrice: 120000,
      finalPrice: 200000,
      status: "CONFIRMED",
    });
    await orderItem.save();

    // --- AUDIT LOG ---
    const log = new AuditLogModel({
      entity_type: "Product",
      entity_id: product1._id,
      action: "create",
      changes: { field: "name", oldValue: null, newValue: "Áo thun nam basic" },
      performedBy: admin._id,
    });
    await log.save();

    console.log("🎉 Seed dữ liệu thành công với 3 sản phẩm (dùng save thay cho insertMany)!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi seed:", err);
    process.exit(1);
  }
}

seed();
