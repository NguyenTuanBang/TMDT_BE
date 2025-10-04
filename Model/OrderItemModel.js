import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
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
        enum: ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    }
});

const OrderItemModel = mongoose.model("OrderItem", OrderItemSchema);
export default OrderItemModel;
