import CartItemModel from "../Model/CartItemModel.js";
import CartModel from "../Model/CartModel.js";
import CartStoreModel from "../Model/CartStoreModel.js";


export async function applyPromotionsToItems(cartId, storeId = null) {
    const cart = await CartItemModel.findById(cartId).populate("promotion");
    const stores = storeId
        ? await CartStoreModel.find({ _id: storeId }).populate("promotion")
        : await CartStoreModel.find({ cart_id: cartId, onDeploy: true }).populate("promotion");

    let cartTotal = 0;
    const storeTotals = {};

    for (const store of stores) {
        const items = await CartItemModel.find({ cartStoreId: store._id, is_chosen: true });
        const storeTotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
        storeTotals[store._id] = { items, storeTotal };
        cartTotal += storeTotal;
    }

    // Tính global discount
    let globalDiscount = 0;
    if (cart.promotion) {
        const promo = cart.promotion;
        if (promo.discount_type === "fixed") globalDiscount = promo.discount_value;
        else if (promo.discount_type === "percentage") {
            globalDiscount = cartTotal * promo.discount_value / 100;
            if (promo.max_discount_value)
                globalDiscount = Math.min(globalDiscount, promo.max_discount_value);
        }
    }

    // Áp khuyến mãi xuống từng item
    for (const store of stores) {
        const { items, storeTotal } = storeTotals[store._id];
        if (storeTotal === 0) continue;

        // Discount cấp store
        let storeDiscount = 0;
        if (store.promotion) {
            const promo = store.promotion;
            if (promo.discount_type === "fixed") storeDiscount = promo.discount_value;
            else if (promo.discount_type === "percentage") {
                storeDiscount = storeTotal * promo.discount_value / 100;
                if (promo.max_discount_value)
                    storeDiscount = Math.min(storeDiscount, promo.max_discount_value);
            }
        }

        // Discount global phân bổ cho store này
        const globalForStore = (storeTotal / cartTotal) * globalDiscount;

        // Phân bổ xuống từng item
        for (const item of items) {
            const itemTotal = item.unitPrice * item.quantity;
            const storePart = (itemTotal / storeTotal) * storeDiscount;
            const globalPart = (itemTotal / storeTotal) * globalForStore;

            const totalDiscount = storePart + globalPart;
            const final = itemTotal - totalDiscount;

            await CartItemModel.findByIdAndUpdate(item._id, {
                finalPrice: final,
                discountValue: totalDiscount
            });
        }

        // Cập nhật lại subtotal của store
        const storeItems = await CartItemModel.find({ cartStoreId: store._id, is_chosen: true });
        const subTotal = storeItems.reduce((sum, i) => sum + i.finalPrice, 0);
        store.subTotal = subTotal;
        store.finalTotal = subTotal + (store.shippingFee || 0);
        await store.save({ validateBeforeSave: false });
    }

    // Cập nhật lại tổng Cart
    const updatedStores = await CartStoreModel.find({ cart_id: cartId });
    const cartSub = updatedStores.reduce((sum, s) => sum + s.subTotal, 0);
    const shippingTotal = updatedStores.reduce((sum, s) => sum + (s.shippingFee || 0), 0);

    cart.subTotal = cartSub;
    cart.finalTotal = cartSub + shippingTotal;
    await cart.save({ validateBeforeSave: false });
}
