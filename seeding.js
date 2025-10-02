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
import OrderModel from "./Model/OrderModel.js";
import OrderItemModel from "./Model/OrderItemModel.js";
import AddressModel from "./Model/AddressModel.js";




dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const MONGO_URI = process.env.DB

cloudinary.v2.config({
  cloud_name: 'dm8ydkx0k',
  api_key: '459493556211974',
  api_secret: '0Js-GZ7rBCTntz7Gl1jcCmmwNUI'
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadImage = async (file) => {
  const filePath = path.join(__dirname, "img", file);
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "ecommerce_seed", // Cloudinary folder
  });
  return result.secure_url; // Trả về URL của ảnh đã upload
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công");

    // Xóa dữ liệu cũ
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
      OrderModel.deleteMany({}),
      OrderItemModel.deleteMany({}),
      AddressModel.deleteMany({}),
    ]);

    // --- USERS ---
    const avatarUrl = await uploadImage("avt.jfif");
    const shirtUrl = await uploadImage("images.jpg");

    // users.js (dữ liệu mẫu)
    const usersdata = [
      {
        username: "bang123",
        email: "bang@example.com",
        password: "Bang@1234", // sẽ được hash tự động nhờ pre("save")
        fullname: "Nguyễn Tuấn Bằng",
        phone: "0909123456",
        avatar: avatarUrl,
        rank: "silver",
        role: "user",
        isActive: true,
      },
      {
        username: "seller01",
        email: "seller@example.com",
        password: "Seller@123",
        fullname: "Nguyễn Văn Seller",
        phone: "0912345678",
        avatar: avatarUrl,
        rank: "gold",
        role: "seller",
        isActive: true,
      },
      {
        username: "admin1",
        email: "admin1@example.com",
        password: "Password@123",
        fullname: "Quản Trị Viên",
        phone: "0900000003",
        role: "admin",
        // 📌 Admin cũng không có address
      },
    ];

    for (const u of usersdata) {
      const user = new UserModel(u);
      await user.save(); // sẽ kích hoạt pre("save") và hash password
    }
    

    const user1 = await UserModel.findOne({role:"user"})
    const seller1 = await UserModel.findOne({role:"seller"})
    const admin1 = await UserModel.findOne({role:"admin"})

    // addresses.js (dữ liệu mẫu)
    const addresses = [
      {
        user: user1._id,
        name: "Nguyễn Tuấn Bằng",
        phone: "0909123456",
        province: "Hà Nội",
        district: "Ba Đình",
        ward: "Phúc Xá",
        detail: "123 Đường Hoàng Hoa Thám",
        isDefault: true,
      },
      {
        user: user1._id,
        name: "Nguyễn Tuấn Bằng2",
        phone: "0909153645",
        province: "Hà Nội",
        district: "Cầu Giấy",
        ward: "Phúc Xá",
        detail: "123 Đường Hoàng Hoa Thám",
        isDefault: false,
      },

    ];

    const address1 = await AddressModel.create(addresses[0]);
    const address2 = await AddressModel.create(addresses[1]);

    user1.address.push(address1._id)
    user1.address.push(address2._id)
    user1.save()
    // --- STORE ---
    const store1 = await StoreModel.create({
      user: seller1._id,
      address: "123 Phố X, Hà Nội",
      name: "Cửa hàng Thời Trang",
      status: "active",
    });

    // --- SIZE ---
    const [sizeM, sizeL] = await SizeModel.insertMany([
      { name: "M" },
      { name: "L" },
    ]);

    // --- TAGS ---
    const [tagAo, tagQuan] = await TagModel.insertMany([
      { nameTag: "Áo" },
      { nameTag: "Quần" },
    ]);

    // --- IMAGE ---
    const img1 = await ImageModel.create({
      url: shirtUrl, // 📌 url ảnh sản phẩm
      color: "Đỏ",
    });

    // --- PRODUCT ---
    const product1 = await ProductModel.create({
      name: "Áo thun nam",
      store_id: store1._id,
      description: "Áo thun cotton thoáng mát",
      totalRating: 10,
      countRating: 2,
      tradedCount: 5,
    });

    // --- PRODUCT VARIANT ---
    const variant1 = await ProductVariantsModel.create({
      product_id: product1._id,
      image: img1._id,
      size: sizeM._id,
      quantity: 100,
      price: 150000,
    });

    // --- PRODUCT TAG ---
    await ProductTagsModel.insertMany([
      { product_id: product1._id, tag_id: tagAo._id },
    ]);

    // --- PROMOTION ---
    const promo1 = await PromotionModel.create({
      description: "Giảm giá khai trương",
      store: store1._id,
      name: "Sale 10%",
      scope: "product",
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      discount_type: "percentage",
      discount_value: 10,
      is_active: true,
    });

    // --- CART ---
    const cart1 = await CartModel.create({ user: user1._id });
    await CartItemModel.create({
      cart_id: cart1._id,
      variant_id: variant1._id,
      quantity: 2,
      unitPrice: 150000,
    });

    // --- ORDER ---
    const order1 = await OrderModel.create({
      user: user1._id,
      phone: user1.phone,
      address: user1.address[0],
      total_amount: 300000,
      final_amount: 270000,
      promotion: promo1._id,
      status: "PENDING",
    });

    await OrderItemModel.create({
      order_id: order1._id,
      variant_id: variant1._id,
      quantity: 2,
      unitPrice: 150000,
      finalPrice: 270000,
    });

    console.log("🎉 Seed dữ liệu thành công!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi seed dữ liệu:", err);
    process.exit(1);
  }
}

seed();
