import mongoose from "mongoose";
import AreaModel from "./Model/AreaModel.js";
import UserModel from "./Model/UserModel.js";
import StoreModel from "./Model/StoreModel.js";
import TagModel from "./Model/TagModel.js";
import ProductModel from "./Model/ProductModel.js";
import CartModel from "./Model/CartModel.js";
import BillModel from "./Model/BillModel.js";

const MONGO_URI = "mongodb+srv://bangpham10062002_db_user:1fLMzRmFTlIRMywT@tmdt.gz10ys9.mongodb.net/?retryWrites=true&w=majority&appName=TMDT"; // đổi yourDB theo tên DB của bạn

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Xóa dữ liệu cũ
  await Promise.all([
    AreaModel.deleteMany(),
    UserModel.deleteMany(),
    StoreModel.deleteMany(),
    TagModel.deleteMany(),
    ProductModel.deleteMany(),
    CartModel.deleteMany(),
    BillModel.deleteMany(),
  ]);

  // 1. Tạo Area
  const areas = await AreaModel.insertMany([
    { name: "Hà Nội" },
    { name: "Hồ Chí Minh" },
  ]);

  // 2. Tạo User
  const users = await UserModel.insertMany([
    { username: "alice", email: "alice@example.com", password: "Pass@1234", role: "user" },
    { username: "bob", email: "bob@example.com", password: "Pass@1234", role: "seller" },
    { username: "charlie", email: "charlie@example.com", password: "Pass@1234", role: "shipper" },
  ]);

  // 3. Tạo Store
  const stores = await StoreModel.insertMany([
    { onwner: users[1]._id, address: "123 Nguyễn Huệ", storeName: "Bob Mart", area: areas[0]._id },
    { onwner: users[1]._id, address: "456 Lý Thường Kiệt", storeName: "Bob Electronics", area: areas[1]._id },
  ]);

  // 4. Tạo Tag
  const tags = await TagModel.insertMany([
    { nameTag: "Thời trang" },
    { nameTag: "Điện tử" },
    { nameTag: "Gia dụng" },
  ]);

  // 5. Tạo Product
  const products = await ProductModel.insertMany([
    { productName: "Áo thun", price: 150000, img: ["ao.jpg"], tags: [tags[0]._id], quantity: 100, store: stores[0]._id, description: "Áo thun cotton mát mẻ" },
    { productName: "Tai nghe", price: 500000, img: ["tainghe.jpg"], tags: [tags[1]._id], quantity: 50, store: stores[1]._id, description: "Tai nghe Bluetooth 5.0" },
    { productName: "Nồi cơm điện", price: 700000, img: ["noicom.jpg"], tags: [tags[2]._id], quantity: 30, store: stores[1]._id, description: "Nồi cơm điện 1.8L" },
  ]);

  // 6. Tạo Cart (cho Alice)
  await CartModel.create({
    user: users[0]._id,
    items: [
      { product: products[0]._id, quantity: 2 },
      { product: products[1]._id, quantity: 1 },
    ],
    totalPrice: 150000 * 2 + 500000,
  });

  // 7. Tạo Bill (Alice mua hàng từ store 1)
  await BillModel.create({
    buyer: users[0]._id,
    store: stores[0]._id,
    deliveryAddress: "123 Trần Phú, Hà Nội",
    products: [
      { product: products[0]._id, quantity: 2, price: 150000 },
    ],
    totalPrice: 300000,
    status: "pending",
    deliveryMan: users[2]._id,
  });

  console.log("Seeding completed!");
  mongoose.connection.close();
}

seed().catch(err => console.error(err));
