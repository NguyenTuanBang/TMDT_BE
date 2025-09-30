import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
    name: { type: String, required: true },
});

const SizeModel = mongoose.model("Size", sizeSchema);
export default SizeModel;
