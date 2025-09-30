import e from "express";
import CartModel from "../Model/CartModel.js";
import CartItemModel from "../Model/CartItemModel.js";
import ProductVariantsModel from "../Model/product_variantsModel.js";

const CartController = {
    getCart: async (req, res) => {
        try {
            const user = req.user;
            const cart = await CartModel.aggregate([
                { $match: { user: user._id } },
                {
                    $lookup: {
                        from: "cartitems", 
                        let: { cid: "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$cart", "$$cid"] } } },
                            {
                                $lookup: {
                                    from: "products",
                                    localField: "product_id",
                                    foreignField: "_id",
                                    as: "product"
                                }
                            },
                            { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
                            {
                                $lookup: {
                                    from: "productvariants",
                                    let: { pvid: "$variant_id" },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ["$_id", "$$pvid"] } } },
                                        {
                                            $lookup: {
                                                from: "colors",
                                                localField: "color",
                                                foreignField: "_id",
                                                as: "color"
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: "sizes",
                                                localField: "size",
                                                foreignField: "_id",
                                                as: "size"
                                            }
                                        }
                                    ]
                                }
                            },
                            { $unwind: { path: "$variant", preserveNullAndEmptyArrays: true } }
                        ],
                        as: "items"
                    }
                }
            ]);
            res.status(200).send(cart[0]);
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: error.message });
        }
    },
    addToCart: async (req, res) => {
        try {
            const user = req.user;
            const { productId, color, quantity, size } = req.body;

            // Validate input
            if (!productId || !color || !quantity || !size) {
                return res.status(400).send({ message: "Missing required fields" });
            }

            // Find or create cart for user
            let cart = await CartModel.findOne({ user: user._id });
            if (!cart) {
                cart = await CartModel.create({ user: user._id });
            }
            const variant = await ProductVariantsModel.create({productId, color, size, quantity});
            // Add item to cart
            const cartItem = {
                cart: cart._id,
                variant_id: variant._id,
                product_id: productId
            };
            await CartItemModel.create(cartItem);

            res.status(200).send({ message: "Item added to cart", cart });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: error.message });
        }
    },
    removeFromCart: async (req, res) => {
        try {
            const user = req.user;
            const { cartItemId } = req.body;
            if (!cartItemId) {
                return res.status(400).send({ message: "Missing cartItemId" });
            }
            await CartItemModel.deleteOne({ _id: cartItemId });
            res.status(200).send({ message: "Item removed from cart" });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: error.message });
        }
    }
};

export default CartController;