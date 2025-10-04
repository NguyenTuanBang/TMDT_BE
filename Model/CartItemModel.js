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
    }
});

cartItemSchema.pre("save", async function (next) {
    this.finalPrice = this.unitPrice*this.quantity
    next()
});
cartItemSchema.pre("save", async function(next) {
    this.finalPrice = this.unitPrice * this.quantity;
    await updateCartStoreAndCart(this.cartStore_id);
    next();
});

cartItemSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
    await updateCartStoreAndCart(this.cartStore_id);
    next();
});

// Helper
async function updateCartStoreAndCart(cartStoreId) {
    const CartStore = mongoose.model("CartStore");
    const Cart = mongoose.model("Cart");

    if (cartStoreId) {
        const cartStore = await CartStore.findById(cartStoreId);
        if (cartStore) {
            await cartStore.save();
            const cart = await Cart.findById(cartStore.cart_id);
            if (cart) {
                await cart.save();
            }
        }
    }
}



const CartItemModel = mongoose.model("CartItem", cartItemSchema);
export default CartItemModel;
