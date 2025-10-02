import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
    description: String,
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',   
        required: true
    },
    name: { type: String, required: true },
    scope: { type: String, enum: ['store', 'global'], required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    discount_type: { type: String, enum: ['percentage', 'fixed'], required: true },
    discount_value: { type: Number, required: true },
    is_active: { type: Boolean, default: true }
}, {
    timestamps: true
})

const PromotionModel = mongoose.model("Promotion", promotionSchema);
export default PromotionModel;