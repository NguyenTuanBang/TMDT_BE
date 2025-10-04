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
        min: 1
    },
    unitPrice: {
        type: Number,
    },
    finalPrice: {
        type: Number
    },
    is_chosen:{
        type: Boolean,
        default: false
    }
});

cartItemSchema.post(["save", "findOneAndUpdate"], async function (doc) {
    const CartStore = mongoose.model("CartStore");
    try {
        if (doc.store_id) {
            // tìm cartStore tương ứng
            const cartStore = await CartStore.findOne({ store_id: doc.store_id });
            if (cartStore) {
                await cartStore.save(); 
                const Cart = mongoose.model("Cart");
                const cart = await Cart.findById(cartStore.cart_id);
                if (cart) {
                    await cart.save(); 
                }
            }
        }
    } catch (err) {
        console.error("Error updating cart totals:", err);
    }
});


const CartItemModel = mongoose.model("CartItem", cartItemSchema);
export default CartItemModel;
