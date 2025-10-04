import e from "express";
import CartModel from "../Model/CartModel.js";
import CartItemModel from "../Model/CartItemModel.js";
import ProductVariantsModel from "../Model/product_variantsModel.js";
import CartStoreModel from "../Model/CartStoreModel.js";

const CartController = {
    getCart: async (req, res) => {
        try {
            const user = req.user;
            const cart = await CartModel.aggregate([
                { $match: { user: user._id } },
                {
                    $lookup: {
                        from: "cartstores",
                        let: { cid: "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$cart_id", "$$cid"] } } },

                            {
                                $lookup: {
                                    from: "cartitems",
                                    let: { csid: "$_id" },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ["$cartStore_id", "$$csid"] } } },

                                        {
                                            $lookup: {
                                                from: "productvariants",
                                                let: { pvid: "$variant_id" },
                                                pipeline: [
                                                    { $match: { $expr: { $eq: ["$_id", "$$pvid"] } } },

                                                    {
                                                        $lookup: {
                                                            from: "products",
                                                            localField: "product_id",
                                                            foreignField: "_id",
                                                            as: "product_id"
                                                        }
                                                    },
                                                    { $unwind: { path: "$product_id", preserveNullAndEmptyArrays: true } },

                                                    {
                                                        $lookup: {
                                                            from: "images",
                                                            localField: "image",
                                                            foreignField: "_id",
                                                            as: "image"
                                                        }
                                                    },
                                                    { $unwind: { path: "$image", preserveNullAndEmptyArrays: true } },

                                                    {
                                                        $lookup: {
                                                            from: "sizes",
                                                            localField: "size",
                                                            foreignField: "_id",
                                                            as: "size"
                                                        }
                                                    },
                                                    { $unwind: { path: "$size", preserveNullAndEmptyArrays: true } }
                                                ],
                                                as: "variant_id"
                                            }
                                        },
                                        { $unwind: { path: "$variant_id", preserveNullAndEmptyArrays: true } },

                                        // format lại item
                                        {
                                            $project: {
                                                _id: 1,
                                                cartStore_id: 1,
                                                quantity: 1,
                                                variant_id: {
                                                    _id: "$variant_id._id",
                                                    product_id: "$variant_id.product_id",
                                                    image: "$variant_id.image",
                                                    size: "$variant_id.size",
                                                    price: "$variant_id.price"
                                                },
                                                is_chosen: 1,
                                                unitPrice: 1,
                                                finalPrice: 1
                                            }
                                        }
                                    ],
                                    as: "Item"
                                }
                            },
                            {
                                $lookup: {
                                    from: "promotions",
                                    localField: "promotion",
                                    foreignField: "_id",
                                    as: "promotion"
                                }
                            },
                            { $unwind: { path: "$promotion", preserveNullAndEmptyArrays: true } },

                            // project lại store
                            {
                                $project: {
                                    _id: 1,
                                    cart_id: 1,
                                    store_id: 1,
                                    subTotal: 1,
                                    finalTotal: 1,
                                    shippingFee: 1,

                                    Item: 1
                                }
                            }
                        ],
                        as: "Store"
                    }
                },
                {
                    $lookup: {
                        from: "promotions",
                        localField: "promotion",
                        foreignField: "_id",
                        as: "promotion"
                    }
                },
                { $unwind: { path: "$promotion", preserveNullAndEmptyArrays: true } },

                // cuối cùng format cart
                {
                    $project: {
                        _id: 1,
                        user: 1,
                        subTotal: 1,
                        shippingFee: 1,
                        finalTotal: 1,

                        Store: 1
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
            const { variant_id, quantity } = req.body;

            // Validate input
            if (!variant_id || quantity < 1) {
                return res.status(400).send({ message: "Missing required fields" });
            }
            let product = await ProductVariantsModel.findOne({
                _id: variant_id,
                onDeploy: true
            }).populate({ path: "product_id", select: "store_id" })
            if (!product) return res.status(404).send({ message: "Product not found!" })
            // Find or create cart for user
            let cart = await CartModel.findOne({ user: user._id });
            if (!cart) {
                cart = await CartModel.create({ user: user._id });
            }
            let cart_store = await CartStoreModel.findOne({
                cart_id: cart._id,
                store_id: product.product_id.store_id
            })
            if (!cart_store) {
                cart_store = await CartStoreModel.create({
                    cart_id: cart._id,
                    store_id: product.product_id.store_id
                })
            }

            let cart_item = await CartItemModel.findOne({
                cartStore_id: cart_store._id,
                variant_id: variant_id
            })
            if (cart_item) {
                cart_item.quantity = Math.min(cart_item.quantity + quantity, product.quantity)
                await cart_item.save()
            } else {
                cart_item = await CartItemModel.create({ store_id: cart_store._id, variant_id: variant_id, quantity: quantity, unitPrice: product.price })
            }

            await cart.save()
            res.status(200).send({ message: "Item added to cart", cart });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: error.message });
        }
    },
    reduceFromCart: async (req, res) => {
        try {
            const user = req.user;
            const { cartItemId } = req.body;
            if (!cartItemId) {
                return res.status(400).send({ message: "Missing cartItemId" });
            }
            const cartItem = await CartItemModel.findById(cartItemId)
            cartItem.quantity--
            await cartItem.save()
            res.status(200).send({ message: "Item removed from cart" });
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
            const cartItem = await CartItemModel.deleteOne(cartItemId)
            res.status(200).send({ message: "Item removed from cart" });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: error.message });
        }
    },
    changeCartItemState: async (req, res)=>{
        try {
            const user = req.user;
            const { cartItemId } = req.body;
            if (!cartItemId) {
                return res.status(400).send({ message: "Missing cartItemId" });
            }
            const cartItem = await CartItemModel.findById(cartItemId)
            cartItem.is_chosen = !cartItem.is_chosen
            await cartItem.save()
            res.status(200).send({ message: "Success" });
        } catch (error) {
            res.status(500).send({message: error.message})
        }
    }
};

export default CartController;