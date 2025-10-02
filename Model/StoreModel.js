import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    address: { type: String, required: true },
    name: { type: String, required: true },
    status: { 
        type: String,
        enum: ["Pending", "Approval", "Reject"],
        default: "Pending"
    },
}, {
    timestamps: true
})

const StoreModel = mongoose.model('Store', storeSchema);
export default StoreModel;