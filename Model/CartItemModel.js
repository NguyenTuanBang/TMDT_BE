import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    cart_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    },

    variant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariants',
        required: true
    }
});

const CartItemModel = mongoose.model("CartItem", cartItemSchema);
export default CartItemModel;
