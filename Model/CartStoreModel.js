import mongoose from "mongoose";
import CartModel from "./CartModel.js";

const CartStoreSchema = new mongoose.Schema({
    cart_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart"
    },
    store_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store"
    },
    promotion:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Promotion"
    },
    shippingFee:{
        type: Number,
        required: true,
        default: 0
    },
    subTotal:{
        type: Number,
        default: 0
    },
    finalTotal: {
        type: Number,
        default: 0
    },
    onDeploy: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
})

// //subTotal ở đây là tổng tiền hàng ứng với cửa hàng, gọi lại cart để cập nhật dữ liệu mới
// CartStoreSchema.pre("save", async function(next) {
//     try {
//         const CartItem = mongoose.model("CartItem");
//         const Cart = mongoose.model("Cart")
//         const result = await CartItem.aggregate([
//             { $match: { cartStore_id: this._id, is_chosen: true} },
//             {
//                 $group: {
//                     _id: null,
//                     total: { $sum: "$finalPrice" } // cộng finalPrice
//                 }
//             }
//         ]);
//         if(!result){
//             this.subTotal=0
//             this.shippingFee=0
//             this.onDeploy=false
//         }else{
//             this.subTotal = result.length > 0 ? result[0].total : 0;
//             this.onDeploy=true
//         }
//         const cart = await Cart.findById(this.cart_id)
//         await cart.save()

//         next();
//     } catch (err) {
//         next(err);
//     }
// });

// // finalTotal ứng với subTotal và promotion
// CartStoreSchema.pre("save", async function(next) {
//     try {
//         const Promotion = mongoose.model("Promotion");

//         let discount = 0;

//         if (this.promotion) {
//             const promo = await Promotion.findById(this.promotion);

//             if (promo) {
//                 if (promo.discount_type === "fixed") {
//                     discount = promo.discount_value;
//                 } else if (promo.discount_type === "percentage") {
//                     // giới hạn mức giảm tối đa nếu có
//                     if (promo.max_discount_value) {
//                         discount = Math.min(
//                             this.subTotal * (promo.discount_value / 100),
//                             promo.max_discount_value
//                         );
//                     } else {
//                         discount = this.subTotal * (promo.discount_value / 100);
//                     }
//                 }
//             }
//         }

//         // Không để âm tiền
//         this.finalTotal = Math.max(0, this.subTotal - discount);

//         next();
//     } catch (err) {
//         next(err);
//     }
// });

// // mỗi lần thay đổi cartStore thì phải trigger CartModel để lưu thay đổi
// CartStoreSchema.pre("save", async function (next) {
//     const cart = await CartModel.findById(this.cart_id)
//     await cart.save()
//     next()    
// })

CartStoreSchema.pre("save", async function (next) {
    // Nếu chỉ thay đổi promotion hoặc phí ship, ta trigger lại tính toán
    if (this.isModified("promotion") || this.isModified("shippingFee")) {
        await applyPromotionsToItems(this.cart_id, this._id);
    }
    next();
});

const CartStoreModel = mongoose.model("CartStore", CartStoreSchema)
export default CartStoreModel