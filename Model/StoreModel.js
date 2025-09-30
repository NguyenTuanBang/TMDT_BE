import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    address: { type: String, required: true },
    name: { type: String, required: true },
    area: { type: mongoose.Schema.Types.ObjectId, ref: 'Area' },
    status: { type: String},
}, {
    timestamps: true
})

const StoreModel = mongoose.model('Store', storeSchema);
export default StoreModel;