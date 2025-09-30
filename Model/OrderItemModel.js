import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    variant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariants',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const OrderItemModel = mongoose.model("OrderItem", OrderItemSchema);
export default OrderItemModel;
