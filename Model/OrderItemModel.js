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
    unitPrice: {
        type: Number,
        required: true
    },
    finalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    },
    promotion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Promotion",
    }

});

const OrderItemModel = mongoose.model("OrderItem", OrderItemSchema);
export default OrderItemModel;
