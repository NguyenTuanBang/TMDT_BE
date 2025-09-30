import mongoose from "mongoose";

const productVariantsSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    image_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
        required: true
    },
    size: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Size',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
}, {
    timestamps: true
});

const ProductVariantsModel = mongoose.model("ProductVariants", productVariantsSchema);
export default ProductVariantsModel;
