import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    base_price: { type: Number, required: true },
    tags_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag'
        }
    ],
    store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    sizes_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Size'
        }
    ],
    description: { type: String, required: true },
    totalRating: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    traded: { type: Number, default: 0 },
}, {
    timestamps: true
});

productSchema.virtual('averageRating').get(function() {
    if (this.numOfReviews === 0) return 0;
    return this.totalRating / this.numOfReviews;
});
productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });    



const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;
