import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

const CartModel = mongoose.model("Cart", cartSchema);
export default CartModel;
