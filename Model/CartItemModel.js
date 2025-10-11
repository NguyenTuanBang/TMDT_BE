import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    cartStore_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CartStore',
        required: true
    },
    variant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariants',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unitPrice: {
        type: Number,
    },
    //giá trị sau khi đã giảm hết
    finalPrice: {
        type: Number
    },
    is_chosen:{
        type: Boolean,
        default: false
    },
    is_out_of_stock: {
        type: Boolean,
        default: false
    },
    //giá trị được giảm
    discountValue: { type: Number, default: 0 }
});

// cartItemSchema.pre("save", async function (next) {
//     this.finalPrice = this.unitPrice*this.quantity
//     next()
// });
// cartItemSchema.pre("save", async function(next) {
//     this.finalPrice = this.unitPrice * this.quantity;
//     await updateCartStoreAndCart(this.cartStore_id);
//     next();
// });

// cartItemSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
//     await updateCartStoreAndCart(this.cartStore_id);
//     next();
// });

// // Helper
// async function updateCartStoreAndCart(cartStoreId) {
//     const CartStore = mongoose.model("CartStore");
//     const Cart = mongoose.model("Cart");

//     if (cartStoreId) {
//         const cartStore = await CartStore.findById(cartStoreId);
//         if (cartStore) {
//             await cartStore.save();
//             const cart = await Cart.findById(cartStore.cart_id);
//             if (cart) {
//                 await cart.save();
//             }
//         }
//     }
// }

cartItemSchema.pre("save", async function (next) {
    // cập nhật finalPrice trước
    this.finalPrice = this.unitPrice * this.quantity;

    // chỉ chạy lại nếu item thay đổi các field ảnh hưởng đến tổng
    if (
        this.isModified("is_chosen") ||
        this.isModified("quantity") ||
        this.isModified("unitPrice")
    ) {
        try {
            const CartStore = mongoose.model("CartStore");
            const store = await CartStore.findById(this.cartStoreId);
            if (store && store.cart_id) {
                await applyPromotionsToItems(store.cart_id, store._id);
            }
            next();
        } catch (err) {
            console.error("❌ Lỗi khi cập nhật promotion:", err);
        }
    }
    next()
});

cartItemSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        const CartStore = mongoose.model("CartStore");
        const CartItem = mongoose.model("CartItem");
        const store = await CartStore.findById(this.cartStoreId);

        if (store && store.cart_id) {
            // Kiểm tra còn item nào thuộc store này không
            const remainingItems = await CartItem.countDocuments({
                cartStoreId: store._id,
                is_chosen: true
            });

            if (remainingItems === 0) {
                // Không còn item nào được chọn → store “chết”
                store.onDeploy = false;
                store.subTotal = 0;
                store.finalTotal = 0;
                await store.save({ validateBeforeSave: false });
            }

            // Gọi lại logic tính tổng + promotion
            await applyPromotionsToItems(store.cart_id, store._id);
        }
        next();
    } catch (err) {
        console.error("❌ Lỗi khi cập nhật sau khi xóa item:", err);
    }
});


const CartItemModel = mongoose.model("CartItem", cartItemSchema);
export default CartItemModel;
