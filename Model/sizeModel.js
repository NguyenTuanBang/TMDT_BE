import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
    size_standard: {
        type: String,
        enum: ["EU", "UK", "US", "CM", "INCH"], 
        required: true
    },
    size_value: {
        type: String, 
        required: true
    },
});

const SizeModel = mongoose.model("Size", sizeSchema);
export default SizeModel;
