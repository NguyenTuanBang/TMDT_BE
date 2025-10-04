import mongoose from "mongoose";

const CartStoreSchema = new mongoose.Schema({
    cart_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart"
    },
    store_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store"
    },
    promotion:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Promotion"
    },
    shippingFee:{
        type: Number,
        required: true
    },
    subTotal:{
        type: Number
    },
    finalTotal: {
        type: Number
    }
},{
    timestamps: true
})

//subTotal ở đây là tổng tiền hàng ứng với cửa hàng
CartStoreSchema.pre("save", async function(next) {
    try {
        const CartItem = mongoose.model("CartItem");

        const result = await CartItem.aggregate([
            { $match: { store: this.store, is_chosen: true } },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$finalPrice" } // cộng finalPrice
                }
            }
        ]);

        this.subTotal = result.length > 0 ? result[0].total : 0;

        next();
    } catch (err) {
        next(err);
    }
});

// finalTotal ứng với subTotal và promotion
CartStoreSchema.pre("save", async function(next) {
    try {
        const Promotion = mongoose.model("Promotion");

        let discount = 0;

        if (this.promotion) {
            const promo = await Promotion.findById(this.promotion);

            if (promo) {
                if (promo.discount_type === "fixed") {
                    discount = promo.discount_value;
                } else if (promo.discount_type === "percentage") {
                    // giới hạn mức giảm tối đa nếu có
                    if (promo.max_discount_value) {
                        discount = Math.min(
                            this.subTotal * (promo.discount_value / 100),
                            promo.max_discount_value
                        );
                    } else {
                        discount = this.subTotal * (promo.discount_value / 100);
                    }
                }
            }
        }

        // Không để âm tiền
        this.finalTotal = Math.max(0, this.subTotal - discount);

        next();
    } catch (err) {
        next(err);
    }
});
const CartStoreModel = mongoose.model("CartStore", CartStoreSchema)
export default CartStoreModel