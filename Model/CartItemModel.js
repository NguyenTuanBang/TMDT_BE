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

cartItemSchema.post("save", async function (next) {
    this.finalPrice = this.unitPrice*this.quantity
    next()
});
cartItemSchema.post(["save", "deleteOne"], async function (next) {
    const CartStore = mongoose.model("CartStore");
    try {
        if (this.store_id) {
            // tìm cartStore tương ứng
            const cartStore = await CartStore.findOne({ store_id: this.store_id });
            if (cartStore) {
                await cartStore.save(); 
                const Cart = mongoose.model("Cart");
                const cart = await Cart.findById(cartStore.cart_id);
                if (cart) {
                    await cart.save(); 
                }
            }
        }
        next()
    } catch (err) {
        console.error("Error updating cart totals:", err);
    }
});


const CartItemModel = mongoose.model("CartItem", cartItemSchema);
export default CartItemModel;
