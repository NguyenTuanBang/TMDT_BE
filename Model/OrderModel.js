import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    total_amount:{
        type: Number,
        required: true
    },
    final_amount:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    }
}, { timestamps: true });

const OrderModel = mongoose.model("Order", OrderSchema);
export default OrderModel;
