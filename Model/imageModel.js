import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    color:{
        type: String,
        required: true
    }
});

const ImageModel = mongoose.model("Image", imageSchema);
export default ImageModel;
